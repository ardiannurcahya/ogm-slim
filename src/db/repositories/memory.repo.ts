import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import {
  Episode,
  EpisodeKind,
  EpisodeMetadata,
  EpisodeReference,
  Memory,
  MemoryCapsule,
  MemoryDetail,
  MemoryStatus,
  MemoryType,
  RecallQuery,
} from '../../types/domain.js';

export class MemoryRepository {
  constructor(private db: Database.Database) {}

  public createEpisode(
    projectId: string,
    kind: EpisodeKind,
    observation: unknown,
    metadata: EpisodeMetadata = {},
    observedAt?: string,
    idempotencyKey?: string
  ): { episode: Episode; replayed: boolean } {
    const key = idempotencyKey || crypto.randomUUID();
    const existingStmt = this.db.prepare(
      'SELECT id, project_id, kind, observation, metadata, observed_at, created_at, idempotency_key FROM episodes WHERE project_id = ? AND idempotency_key = ?'
    );
    const existing = existingStmt.get(projectId, key) as any;
    if (existing) {
      return {
        episode: {
          id: existing.id,
          project_id: existing.project_id,
          kind: existing.kind as EpisodeKind,
          observation: JSON.parse(existing.observation),
          metadata: JSON.parse(existing.metadata),
          observed_at: existing.observed_at,
          created_at: existing.created_at,
          idempotency_key: existing.idempotency_key,
        },
        replayed: true,
      };
    }

    const id = `ep_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();
    const obsAt = observedAt || now;
    const obsStr = JSON.stringify(observation);
    const metaStr = JSON.stringify(metadata);

    const insert = this.db.prepare(
      'INSERT INTO episodes (id, project_id, kind, observation, metadata, observed_at, created_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insert.run(id, projectId, kind, obsStr, metaStr, obsAt, now, key);

    return {
      episode: {
        id,
        project_id: projectId,
        kind,
        observation,
        metadata,
        observed_at: obsAt,
        created_at: now,
        idempotency_key: key,
      },
      replayed: false,
    };
  }

  public commitMemory(
    projectId: string,
    type: MemoryType,
    content: Record<string, unknown>,
    confidence: number,
    references: EpisodeReference[] = [],
    idempotencyKey?: string
  ): { memory: Memory; replayed: boolean } {
    const key = idempotencyKey || crypto.randomUUID();
    const existingStmt = this.db.prepare(
      'SELECT id, project_id, type, content, confidence, status, origin_ids, created_at, updated_at, idempotency_key FROM memories WHERE project_id = ? AND idempotency_key = ?'
    );
    const existing = existingStmt.get(projectId, key) as any;
    if (existing) {
      return {
        memory: {
          id: existing.id,
          project_id: existing.project_id,
          type: existing.type as MemoryType,
          content: JSON.parse(existing.content),
          confidence: existing.confidence,
          status: existing.status as MemoryStatus,
          origin_ids: JSON.parse(existing.origin_ids),
          created_at: existing.created_at,
          updated_at: existing.updated_at,
          idempotency_key: existing.idempotency_key,
        },
        replayed: true,
      };
    }

    const id = `mem_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();
    const contentStr = JSON.stringify(content);
    const originIds = references.map((r) => r.episode_id);

    const tx = this.db.transaction(() => {
      const insert = this.db.prepare(
        'INSERT INTO memories (id, project_id, type, content, confidence, status, origin_ids, created_at, updated_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      insert.run(id, projectId, type, contentStr, confidence, 'active', JSON.stringify(originIds), now, now, key);

      // Insert references
      const refInsert = this.db.prepare(
        'INSERT OR IGNORE INTO memory_references (memory_id, episode_id, purpose) VALUES (?, ?, ?)'
      );
      for (const ref of references) {
        refInsert.run(id, ref.episode_id, ref.purpose);
      }

      // Index in FTS5
      const contentText = Object.entries(content)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' ');
      const ftsInsert = this.db.prepare(
        'INSERT INTO fts_memories (memory_id, project_id, content_text) VALUES (?, ?, ?)'
      );
      ftsInsert.run(id, projectId, contentText);
    });

    tx();

    return {
      memory: {
        id,
        project_id: projectId,
        type,
        content,
        confidence,
        status: 'active',
        origin_ids: originIds,
        created_at: now,
        updated_at: now,
        idempotency_key: key,
      },
      replayed: false,
    };
  }

  public recall(query: RecallQuery): MemoryCapsule[] {
    const limit = Math.min(query.limit || 10, 50);

    const searchText = query.text || query.query;
    if (searchText && searchText.trim()) {
      // Clean query text for FTS5
      const cleanFts = searchText
        .replace(/['"*^~]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 1)
        .map((w: string) => `"${w}"*`)
        .join(' OR ');

      if (cleanFts) {
        try {
          const stmt = this.db.prepare(`
            SELECT m.id, m.type, m.content, m.confidence, m.status, m.created_at, m.origin_ids,
                   rank as fts_rank
            FROM fts_memories f
            JOIN memories m ON m.id = f.memory_id
            WHERE f.project_id = ? AND m.status = 'active' AND fts_memories MATCH ?
            ORDER BY rank
            LIMIT ?
          `);
          const rows = stmt.all(query.project_id, cleanFts, limit) as any[];
          if (rows.length > 0) {
            return rows.map((r) => ({
              id: r.id,
              type: r.type as MemoryType,
              confidence: r.confidence,
              status: r.status as MemoryStatus,
              content: JSON.parse(r.content),
              score: Math.abs(1 / (1 + (r.fts_rank || 0))),
              created_at: r.created_at,
              citations: JSON.parse(r.origin_ids || '[]'),
            }));
          }
        } catch {
          // Fallback to LIKE query if FTS syntax error
        }
      }
    }

    // Fallback or exact query
    const stmt = this.db.prepare(`
      SELECT id, type, content, confidence, status, created_at, origin_ids
      FROM memories
      WHERE project_id = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const rows = stmt.all(query.project_id, limit) as any[];
    return rows.map((r) => ({
      id: r.id,
      type: r.type as MemoryType,
      confidence: r.confidence,
      status: r.status as MemoryStatus,
      content: JSON.parse(r.content),
      score: r.confidence,
      created_at: r.created_at,
      citations: JSON.parse(r.origin_ids || '[]'),
    }));
  }

  public getDetail(projectId: string, memoryId: string): MemoryDetail | null {
    const memStmt = this.db.prepare('SELECT * FROM memories WHERE project_id = ? AND id = ?');
    const row = memStmt.get(projectId, memoryId) as any;
    if (!row) return null;

    const memory: Memory = {
      id: row.id,
      project_id: row.project_id,
      type: row.type as MemoryType,
      content: JSON.parse(row.content),
      confidence: row.confidence,
      status: row.status as MemoryStatus,
      origin_ids: JSON.parse(row.origin_ids || '[]'),
      created_at: row.created_at,
      updated_at: row.updated_at,
      idempotency_key: row.idempotency_key,
    };

    // Linked episodes
    const epStmt = this.db.prepare(`
      SELECT e.* FROM episodes e
      JOIN memory_references mr ON mr.episode_id = e.id
      WHERE mr.memory_id = ?
    `);
    const epRows = epStmt.all(memoryId) as any[];
    const episodes: Episode[] = epRows.map((e) => ({
      id: e.id,
      project_id: e.project_id,
      kind: e.kind as EpisodeKind,
      observation: JSON.parse(e.observation),
      metadata: JSON.parse(e.metadata),
      observed_at: e.observed_at,
      created_at: e.created_at,
      idempotency_key: e.idempotency_key,
    }));

    // Feedback
    const fbStmt = this.db.prepare('SELECT kind, detail, created_at FROM feedback WHERE memory_id = ? ORDER BY created_at DESC');
    const feedback = (fbStmt.all(memoryId) as any[]).map((f) => ({
      kind: f.kind,
      detail: JSON.parse(f.detail),
      created_at: f.created_at,
    }));

    return {
      memory,
      episodes,
      evidence: episodes,
      feedback,
      history: [
        { action: 'created', occurred_at: memory.created_at, actor: 'agent' },
        ...(memory.updated_at !== memory.created_at
          ? [{ action: 'updated', occurred_at: memory.updated_at, actor: 'agent' }]
          : []),
      ],
    };
  }

  public setStatus(projectId: string, memoryId: string, status: MemoryStatus): boolean {
    const stmt = this.db.prepare(
      "UPDATE memories SET status = ?, updated_at = datetime('now') WHERE project_id = ? AND id = ?"
    );
    const res = stmt.run(status, projectId, memoryId);
    return res.changes > 0;
  }

  public addFeedback(projectId: string, memoryId: string, kind: string, detail: unknown = {}): boolean {
    const id = `fb_${crypto.randomBytes(8).toString('hex')}`;
    const stmt = this.db.prepare(
      'INSERT INTO feedback (id, project_id, memory_id, kind, detail) VALUES (?, ?, ?, ?, ?)'
    );
    const res = stmt.run(id, projectId, memoryId, kind, JSON.stringify(detail));
    return res.changes > 0;
  }

  public hardDelete(projectId: string, memoryId: string): boolean {
    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM fts_memories WHERE memory_id = ?').run(memoryId);
      this.db.prepare('DELETE FROM memory_references WHERE memory_id = ?').run(memoryId);
      this.db.prepare('DELETE FROM feedback WHERE memory_id = ?').run(memoryId);
      return this.db.prepare('DELETE FROM memories WHERE project_id = ? AND id = ?').run(projectId, memoryId).changes > 0;
    });
    return tx();
  }

  public getStats(projectId: string) {
    const memCount = (this.db.prepare('SELECT count(*) as c FROM memories WHERE project_id = ?').get(projectId) as any)?.c || 0;
    const epCount = (this.db.prepare('SELECT count(*) as c FROM episodes WHERE project_id = ?').get(projectId) as any)?.c || 0;
    const symCount = (this.db.prepare('SELECT count(*) as c FROM symbols WHERE project_id = ?').get(projectId) as any)?.c || 0;
    return {
      project_id: projectId,
      memories_count: memCount,
      episodes_count: epCount,
      symbols_count: symCount,
    };
  }
}
