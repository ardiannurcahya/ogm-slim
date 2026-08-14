import Database from 'better-sqlite3';
import {
  CallGraphEdge,
  CallGraphNode,
  CallGraphResult,
  CodeSymbol,
  FileSummary,
  ImpactAnalysis,
  SymbolKind,
} from '../../types/domain.js';

export class CodebaseRepository {
  constructor(private db: Database.Database) {}

  public saveSymbolsBatch(projectId: string, symbols: CodeSymbol[], edges: Array<{ source: string; target: string }>): void {
    const tx = this.db.transaction(() => {
      // Upsert symbols
      const symStmt = this.db.prepare(`
        INSERT INTO symbols (
          key, project_id, name, kind, package_name, file_path, start_line, end_line,
          signature, docstring, calls, degree, pagerank, community_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(project_id, key) DO UPDATE SET
          name = excluded.name,
          kind = excluded.kind,
          package_name = excluded.package_name,
          file_path = excluded.file_path,
          start_line = excluded.start_line,
          end_line = excluded.end_line,
          signature = excluded.signature,
          docstring = excluded.docstring,
          calls = excluded.calls,
          degree = excluded.degree,
          pagerank = excluded.pagerank,
          community_id = excluded.community_id,
          updated_at = datetime('now')
      `);

      const ftsStmt = this.db.prepare(`
        INSERT INTO fts_symbols (symbol_key, project_id, name, signature, docstring, file_path)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const s of symbols) {
        symStmt.run(
          s.key,
          projectId,
          s.name,
          s.kind,
          s.package_name,
          s.file_path,
          s.start_line,
          s.end_line,
          s.signature || '',
          s.docstring || '',
          JSON.stringify(s.calls || []),
          s.degree || 0,
          s.pagerank || 0.0,
          s.community_id || 0
        );

        // Update FTS
        ftsStmt.run(s.key, projectId, s.name, s.signature || '', s.docstring || '', s.file_path);
      }

      // Upsert edges
      const edgeStmt = this.db.prepare(`
        INSERT OR IGNORE INTO symbol_edges (project_id, source_key, target_key)
        VALUES (?, ?, ?)
      `);

      for (const e of edges) {
        edgeStmt.run(projectId, e.source, e.target);
      }
    });

    tx();
  }

  public findSymbols(
    projectId: string,
    query?: string,
    kind?: SymbolKind,
    file?: string,
    limit: number = 30
  ): CodeSymbol[] {
    let sql = 'SELECT * FROM symbols WHERE project_id = ?';
    const params: any[] = [projectId];

    if (kind) {
      sql += ' AND kind = ?';
      params.push(kind);
    }

    if (file) {
      sql += ' AND file_path LIKE ?';
      params.push(`%${file}%`);
    }

    if (query && query.trim()) {
      sql += ' AND (name LIKE ? OR signature LIKE ? OR docstring LIKE ?)';
      const term = `%${query.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY degree DESC, start_line ASC LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map((r) => ({
      key: r.key,
      project_id: r.project_id,
      name: r.name,
      kind: r.kind as SymbolKind,
      package_name: r.package_name,
      file_path: r.file_path,
      start_line: r.start_line,
      end_line: r.end_line,
      signature: r.signature,
      docstring: r.docstring,
      calls: JSON.parse(r.calls || '[]'),
      degree: r.degree,
      pagerank: r.pagerank,
      community_id: r.community_id,
    }));
  }

  public getSymbolByKey(projectId: string, symbolKey: string): CodeSymbol | null {
    const stmt = this.db.prepare('SELECT * FROM symbols WHERE project_id = ? AND (key = ? OR name = ?)');
    const r = stmt.get(projectId, symbolKey, symbolKey) as any;
    if (!r) return null;

    return {
      key: r.key,
      project_id: r.project_id,
      name: r.name,
      kind: r.kind as SymbolKind,
      package_name: r.package_name,
      file_path: r.file_path,
      start_line: r.start_line,
      end_line: r.end_line,
      signature: r.signature,
      docstring: r.docstring,
      calls: JSON.parse(r.calls || '[]'),
      degree: r.degree,
      pagerank: r.pagerank,
      community_id: r.community_id,
    };
  }

  public getCallGraph(
    projectId: string,
    symbolKey: string,
    direction: 'callers' | 'callees' | 'both' = 'both',
    depth: number = 1
  ): CallGraphResult | null {
    const root = this.getSymbolByKey(projectId, symbolKey);
    if (!root) return null;

    const visitedNodes = new Map<string, CallGraphNode>();
    const edges: CallGraphEdge[] = [];
    const callers: string[] = [];
    const callees: string[] = [];

    visitedNodes.set(root.key, {
      key: root.key,
      name: root.name,
      kind: root.kind,
      file: root.file_path,
      line: root.start_line,
      signature: root.signature,
    });

    const queue: Array<{ key: string; currentDepth: number }> = [{ key: root.key, currentDepth: 0 }];

    while (queue.length > 0) {
      const item = queue.shift()!;
      if (item.currentDepth >= depth) continue;

      // 1. Callees (outgoing edges: source = item.key)
      if (direction === 'callees' || direction === 'both') {
        const calleeStmt = this.db.prepare(`
          SELECT s.key, s.name, s.kind, s.file_path, s.start_line, s.signature
          FROM symbol_edges e
          JOIN symbols s ON s.key = e.target_key AND s.project_id = e.project_id
          WHERE e.project_id = ? AND e.source_key = ?
        `);
        const rows = calleeStmt.all(projectId, item.key) as any[];
        for (const row of rows) {
          edges.push({ source: item.key, target: row.key, relation: 'calls' });
          if (!visitedNodes.has(row.key)) {
            visitedNodes.set(row.key, {
              key: row.key,
              name: row.name,
              kind: row.kind,
              file: row.file_path,
              line: row.start_line,
              signature: row.signature,
            });
            if (item.key === root.key) callees.push(row.name);
            queue.push({ key: row.key, currentDepth: item.currentDepth + 1 });
          }
        }
      }

      // 2. Callers (incoming edges: target = item.key)
      if (direction === 'callers' || direction === 'both') {
        const callerStmt = this.db.prepare(`
          SELECT s.key, s.name, s.kind, s.file_path, s.start_line, s.signature
          FROM symbol_edges e
          JOIN symbols s ON s.key = e.source_key AND s.project_id = e.project_id
          WHERE e.project_id = ? AND e.target_key = ?
        `);
        const rows = callerStmt.all(projectId, item.key) as any[];
        for (const row of rows) {
          edges.push({ source: row.key, target: item.key, relation: 'calls' });
          if (!visitedNodes.has(row.key)) {
            visitedNodes.set(row.key, {
              key: row.key,
              name: row.name,
              kind: row.kind,
              file: row.file_path,
              line: row.start_line,
              signature: row.signature,
            });
            if (item.key === root.key) callers.push(row.name);
            queue.push({ key: row.key, currentDepth: item.currentDepth + 1 });
          }
        }
      }
    }

    return {
      symbol: root,
      nodes: Array.from(visitedNodes.values()),
      edges,
      callers,
      callees,
    };
  }

  public getImpactAnalysis(projectId: string, symbolKey: string): ImpactAnalysis {
    const symbol = this.getSymbolByKey(projectId, symbolKey);
    if (!symbol) {
      return {
        symbol_key: symbolKey,
        symbol: null,
        direct_callers: [],
        transitive_callers: [],
        affected_files: [],
        blast_radius_score: 0,
        related_memories: [],
      };
    }

    // Direct callers
    const directRows = this.db.prepare(`
      SELECT s.key, s.name, s.file_path
      FROM symbol_edges e
      JOIN symbols s ON s.key = e.source_key AND s.project_id = e.project_id
      WHERE e.project_id = ? AND e.target_key = ?
    `).all(projectId, symbol.key) as any[];

    const directCallers = directRows.map((r) => r.name);
    const affectedFiles = new Set<string>([symbol.file_path]);
    directRows.forEach((r) => affectedFiles.add(r.file_path));

    // Transitive callers (2 hops)
    const transitiveCallers: string[] = [];
    for (const d of directRows) {
      const transRows = this.db.prepare(`
        SELECT s.name, s.file_path
        FROM symbol_edges e
        JOIN symbols s ON s.key = e.source_key AND s.project_id = e.project_id
        WHERE e.project_id = ? AND e.target_key = ? AND s.key != ?
      `).all(projectId, d.key, symbol.key) as any[];

      for (const t of transRows) {
        if (!directCallers.includes(t.name) && !transitiveCallers.includes(t.name)) {
          transitiveCallers.push(t.name);
          affectedFiles.add(t.file_path);
        }
      }
    }

    const blastRadius = Math.min(100, directCallers.length * 15 + transitiveCallers.length * 5 + affectedFiles.size * 10);

    return {
      symbol_key: symbol.key,
      symbol,
      direct_callers: directCallers,
      transitive_callers: transitiveCallers,
      affected_files: Array.from(affectedFiles),
      blast_radius_score: blastRadius,
      related_memories: [],
    };
  }

  public getFileSummary(projectId: string, filePath: string): FileSummary {
    const symbols = this.findSymbols(projectId, undefined, undefined, filePath, 100);
    const ext = filePath.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript-react',
      js: 'javascript',
      jsx: 'javascript-react',
      py: 'python',
      go: 'go',
      rs: 'rust',
      json: 'json',
      md: 'markdown',
    };

    let maxLine = 0;
    symbols.forEach((s) => {
      if (s.end_line > maxLine) maxLine = s.end_line;
    });

    return {
      file_path: filePath,
      language: langMap[ext] || ext,
      loc: Math.max(maxLine, symbols.length * 10),
      symbols: symbols.map((s) => ({
        name: s.name,
        kind: s.kind,
        line: s.start_line,
        signature: s.signature,
      })),
      imports: [],
      linked_memories: [],
    };
  }

  public getAllGraphData(projectId: string) {
    const symbols = this.db.prepare('SELECT * FROM symbols WHERE project_id = ? ORDER BY degree DESC LIMIT 1000').all(projectId) as any[];
    const edges = this.db.prepare('SELECT source_key as source, target_key as target FROM symbol_edges WHERE project_id = ?').all(projectId) as any[];

    return {
      nodes: symbols.map((s) => ({
        key: s.key,
        label: s.name,
        kind: s.kind,
        package: s.package_name,
        file: s.file_path,
        signature: s.signature,
        doc: s.docstring,
        calls: JSON.parse(s.calls || '[]'),
        degree: s.degree,
        pagerank: s.pagerank,
        community_id: s.community_id || 1,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
      })),
    };
  }
}
