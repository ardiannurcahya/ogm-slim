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
    confidence: number = 1.0,
    references: EpisodeReference[] = [],
    idempotencyKey?: string,
    targetSymbolKey?: string
  ): { memory: Memory; replayed: boolean } {
    return this.commit(projectId, type, content, confidence, references, idempotencyKey, targetSymbolKey);
  }

  public commit(
    projectId: string,
    type: MemoryType,
    content: Record<string, unknown>,
    confidence: number = 1.0,
    references: EpisodeReference[] = [],
    idempotencyKey?: string,
    targetSymbolKey?: string
  ): { memory: Memory; replayed: boolean } {
    const key = idempotencyKey || crypto.randomUUID();
    const symKey = targetSymbolKey || (content.target_symbol_key as string) || (content.symbol_key as string);
    const existingStmt = this.db.prepare(
      'SELECT id, project_id, type, content, confidence, status, origin_ids, target_symbol_key, created_at, updated_at, idempotency_key FROM memories WHERE project_id = ? AND idempotency_key = ?'
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
          target_symbol_key: existing.target_symbol_key,
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
      // Auto-supersede previous memory if specified
      const supersedeId = (content.supersedes_id || content.supersedes) as string;
      if (supersedeId && typeof supersedeId === 'string') {
        this.db.prepare("UPDATE memories SET status = 'invalidated', updated_at = datetime('now') WHERE project_id = ? AND id = ?").run(projectId, supersedeId);
        const fbId = `fb_${crypto.randomBytes(8).toString('hex')}`;
        this.db.prepare('INSERT INTO feedback (id, project_id, memory_id, kind, detail) VALUES (?, ?, ?, ?, ?)').run(fbId, projectId, supersedeId, 'superseded', JSON.stringify({ superseded_by: id }));
      }

      const insert = this.db.prepare(
        'INSERT INTO memories (id, project_id, type, content, confidence, status, origin_ids, target_symbol_key, created_at, updated_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      insert.run(id, projectId, type, contentStr, confidence, 'active', JSON.stringify(originIds), symKey || null, now, now, key);

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
        target_symbol_key: symKey,
        created_at: now,
        updated_at: now,
        idempotency_key: key,
      },
      replayed: false,
    };
  }

  public recall(query: RecallQuery): MemoryCapsule[] {
    const limit = Math.min(query.limit || 10, 50);
    const nowMs = Date.now();

    const computeScore = (ftsRank: number | null, confidence: number, createdAt: string) => {
      const bm25Score = ftsRank !== null ? Math.abs(1 / (1 + Math.max(0, ftsRank))) : 0.5;
      const confScore = Math.max(0.1, Math.min(1.0, confidence || 1.0));
      const createdMs = new Date(createdAt).getTime() || nowMs;
      const daysAgo = Math.max(0, (nowMs - createdMs) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.exp(-0.05 * daysAgo); // 1.0 today -> ~0.74 at 6 days -> ~0.50 at 14 days
      return parseFloat((0.60 * bm25Score + 0.25 * confScore + 0.15 * recencyScore).toFixed(4));
    };

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
          let sql = `
            SELECT m.id, m.type, m.content, m.confidence, m.status, m.created_at, m.origin_ids, m.target_symbol_key,
                   rank as fts_rank
            FROM fts_memories f
            JOIN memories m ON m.id = f.memory_id
            WHERE f.project_id = ? AND m.status = 'active' AND fts_memories MATCH ?
          `;
          const params: any[] = [query.project_id, cleanFts];

          if (query.type) {
            sql += ' AND m.type = ?';
            params.push(query.type);
          }
          if (query.target_symbol_key) {
            sql += ' AND m.target_symbol_key = ?';
            params.push(query.target_symbol_key);
          }

          sql += ' ORDER BY rank LIMIT ?';
          params.push(limit * 2);

          const rows = this.db.prepare(sql).all(...params) as any[];
          if (rows.length > 0) {
            const results = rows.map((r) => ({
              id: r.id,
              type: r.type as MemoryType,
              confidence: r.confidence,
              status: r.status as MemoryStatus,
              content: JSON.parse(r.content),
              target_symbol_key: r.target_symbol_key,
              score: computeScore(r.fts_rank, r.confidence, r.created_at),
              created_at: r.created_at,
              citations: JSON.parse(r.origin_ids || '[]'),
            }));
            results.sort((a, b) => b.score - a.score);
            return results.slice(0, limit);
          }
        } catch {
          // Fallback to table scan
        }
      }
    }

    // Direct symbol query or fallback query
    let sql = `
      SELECT id, type, content, confidence, status, created_at, origin_ids, target_symbol_key
      FROM memories
      WHERE project_id = ? AND status = 'active'
    `;
    const params: any[] = [query.project_id];

    if (query.type) {
      sql += ' AND type = ?';
      params.push(query.type);
    }
    if (query.target_symbol_key) {
      sql += ' AND target_symbol_key = ?';
      params.push(query.target_symbol_key);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      type: r.type as MemoryType,
      confidence: r.confidence,
      status: r.status as MemoryStatus,
      content: JSON.parse(r.content),
      target_symbol_key: r.target_symbol_key,
      score: computeScore(null, r.confidence, r.created_at),
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
    const datasets = this.db.prepare('SELECT id, name, files_count, symbols_count, edges_count FROM datasets WHERE project_id = ?').all(projectId) as any[];
    return {
      project_id: projectId,
      memories_count: memCount,
      episodes_count: epCount,
      symbols_count: symCount,
      datasets: datasets.map((d) => ({
        name: d.name,
        files: d.files_count,
        symbols: d.symbols_count,
        edges: d.edges_count,
      })),
    };
  }

  public getMemoryGraphData(projectId: string) {
    const memories = this.db
      .prepare('SELECT id, type, content, confidence, status, origin_ids, created_at, updated_at FROM memories WHERE project_id = ? ORDER BY created_at DESC LIMIT 500')
      .all(projectId) as any[];

    const episodes = this.db
      .prepare('SELECT id, kind, observation, metadata, observed_at, created_at FROM episodes WHERE project_id = ? ORDER BY created_at DESC LIMIT 500')
      .all(projectId) as any[];

    const references = this.db
      .prepare(`
        SELECT mr.memory_id, mr.episode_id, mr.purpose
        FROM memory_references mr
        JOIN memories m ON m.id = mr.memory_id
        WHERE m.project_id = ?
      `)
      .all(projectId) as any[];

    const nodes = [
      ...memories.map((m) => {
        let parsedContent: any = {};
        try {
          parsedContent = JSON.parse(m.content);
        } catch {}

        const label =
          parsedContent.summary ||
          parsedContent.title ||
          parsedContent.decision ||
          parsedContent.name ||
          `${m.type}: ${m.id.slice(0, 10)}`;

        return {
          key: m.id,
          label: String(label).slice(0, 45),
          kind: m.type,
          node_type: 'memory',
          confidence: m.confidence,
          status: m.status,
          created_at: m.created_at,
          updated_at: m.updated_at,
          content: parsedContent,
          origin_ids: JSON.parse(m.origin_ids || '[]'),
          degree: 1,
        };
      }),
      ...episodes.map((e) => {
        let parsedObs: any = {};
        let parsedMeta: any = {};
        try {
          parsedObs = JSON.parse(e.observation);
        } catch {
          parsedObs = e.observation;
        }
        try {
          parsedMeta = JSON.parse(e.metadata);
        } catch {}

        let obsText = '';
        if (typeof parsedObs === 'string') {
          obsText = parsedObs;
        } else if (parsedObs && typeof parsedObs === 'object') {
          obsText = parsedObs.summary || parsedObs.command || parsedObs.stdout || parsedObs.error || JSON.stringify(parsedObs);
        }

        return {
          key: e.id,
          label: `${e.kind}: ${obsText.slice(0, 35)}`,
          kind: e.kind,
          node_type: 'episode',
          observed_at: e.observed_at,
          created_at: e.created_at,
          observation: parsedObs,
          metadata: parsedMeta,
          degree: 1,
        };
      }),
    ];

    const edges = references.map((r) => ({
      source: r.memory_id,
      target: r.episode_id,
      relation: r.purpose || 'evidence',
    }));

    return { nodes, edges };
  }

  public exportData(projectId: string) {
    const memories = this.db.prepare('SELECT * FROM memories WHERE project_id = ?').all(projectId);
    const episodes = this.db.prepare('SELECT * FROM episodes WHERE project_id = ?').all(projectId);
    const references = this.db.prepare(`
      SELECT mr.* FROM memory_references mr
      JOIN memories m ON m.id = mr.memory_id
      WHERE m.project_id = ?
    `).all(projectId);
    const feedback = this.db.prepare('SELECT * FROM feedback WHERE project_id = ?').all(projectId);

    return {
      version: '1.0',
      project_id: projectId,
      exported_at: new Date().toISOString(),
      memories: memories.map((m: any) => ({
        ...m,
        content: JSON.parse(m.content),
        origin_ids: JSON.parse(m.origin_ids || '[]'),
      })),
      episodes: episodes.map((e: any) => ({
        ...e,
        observation: JSON.parse(e.observation),
        metadata: JSON.parse(e.metadata || '{}'),
      })),
      references,
      feedback: feedback.map((f: any) => ({
        ...f,
        detail: JSON.parse(f.detail || '{}'),
      })),
    };
  }

  public importData(projectId: string, data: any): { importedMemories: number; importedEpisodes: number } {
    let importedMemories = 0;
    let importedEpisodes = 0;
    const epIdMap = new Map<string, string>();
    const memIdMap = new Map<string, string>();

    const tx = this.db.transaction(() => {
      if (Array.isArray(data.episodes)) {
        for (const ep of data.episodes) {
          const newEpId = `ep_${crypto.randomBytes(8).toString('hex')}`;
          epIdMap.set(ep.id, newEpId);

          const obsStr = typeof ep.observation === 'object' ? JSON.stringify(ep.observation) : String(ep.observation);
          const metaStr = typeof ep.metadata === 'object' ? JSON.stringify(ep.metadata) : '{}';
          const stmt = this.db.prepare(`
            INSERT INTO episodes (id, project_id, kind, observation, metadata, observed_at, created_at, idempotency_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(
            newEpId,
            projectId,
            ep.kind,
            obsStr,
            metaStr,
            ep.observed_at || new Date().toISOString(),
            ep.created_at || new Date().toISOString(),
            `imp_${ep.idempotency_key || ep.id}_${projectId}`
          );
          importedEpisodes++;
        }
      }

      if (Array.isArray(data.memories)) {
        for (const m of data.memories) {
          const newMemId = `mem_${crypto.randomBytes(12).toString('hex')}`;
          memIdMap.set(m.id, newMemId);

          const contentStr = JSON.stringify(m.content);
          const mappedOriginIds = (m.origin_ids || []).map((oldId: string) => epIdMap.get(oldId) || oldId);
          const symKey = m.target_symbol_key || null;

          const stmt = this.db.prepare(`
            INSERT INTO memories (id, project_id, type, content, confidence, status, origin_ids, target_symbol_key, created_at, updated_at, idempotency_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(
            newMemId,
            projectId,
            m.type,
            contentStr,
            m.confidence || 1.0,
            m.status || 'active',
            JSON.stringify(mappedOriginIds),
            symKey,
            m.created_at || new Date().toISOString(),
            m.updated_at || new Date().toISOString(),
            `imp_${m.idempotency_key || m.id}_${projectId}`
          );
          importedMemories++;

          // Index in FTS5
          const contentText = Object.entries(m.content || {})
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(' ');
          this.db
            .prepare('INSERT INTO fts_memories (memory_id, project_id, content_text) VALUES (?, ?, ?)')
            .run(newMemId, projectId, contentText);
        }
      }

      if (Array.isArray(data.references)) {
        const refStmt = this.db.prepare(`
          INSERT OR IGNORE INTO memory_references (memory_id, episode_id, purpose)
          VALUES (?, ?, ?)
        `);
        for (const r of data.references) {
          const targetMem = memIdMap.get(r.memory_id) || r.memory_id;
          const targetEp = epIdMap.get(r.episode_id) || r.episode_id;
          refStmt.run(targetMem, targetEp, r.purpose || 'evidence');
        }
      }
    });

    tx();
    return { importedMemories, importedEpisodes };
  }
}
