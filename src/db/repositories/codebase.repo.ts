import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import {
  CallGraphEdge,
  CallGraphNode,
  CallGraphResult,
  CodeSymbol,
  Dataset,
  FileSummary,
  ImpactAnalysis,
  MemoryCapsule,
  SymbolKind,
} from '../../types/domain.js';

export class CodebaseRepository {
  constructor(private db: Database.Database) {}

  public listDatasets(projectId: string): Dataset[] {
    const rows = this.db
      .prepare('SELECT * FROM datasets WHERE project_id = ? ORDER BY name ASC')
      .all(projectId) as any[];
    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      name: r.name,
      description: r.description,
      root_path: r.root_path,
      files_count: r.files_count || 0,
      symbols_count: r.symbols_count || 0,
      edges_count: r.edges_count || 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  public getOrCreateDataset(
    projectId: string,
    name: string,
    rootPath?: string,
    description?: string
  ): Dataset {
    const cleanName = (name || 'default').trim();
    const existing = this.db
      .prepare('SELECT * FROM datasets WHERE project_id = ? AND (name = ? OR id = ?)')
      .get(projectId, cleanName, cleanName) as any;

    if (existing) {
      if (rootPath && rootPath !== existing.root_path) {
        this.db
          .prepare(
            "UPDATE datasets SET root_path = ?, updated_at = datetime('now') WHERE project_id = ? AND id = ?"
          )
          .run(rootPath, projectId, existing.id);
        existing.root_path = rootPath;
      }
      return {
        id: existing.id,
        project_id: existing.project_id,
        name: existing.name,
        description: existing.description,
        root_path: existing.root_path,
        files_count: existing.files_count || 0,
        symbols_count: existing.symbols_count || 0,
        edges_count: existing.edges_count || 0,
        created_at: existing.created_at,
        updated_at: existing.updated_at,
      };
    }

    const id = `ds_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();
    this.db
      .prepare(
        'INSERT INTO datasets (id, project_id, name, description, root_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, projectId, cleanName, description || `Codebase ${cleanName}`, rootPath || '.', now, now);

    return {
      id,
      project_id: projectId,
      name: cleanName,
      description: description || `Codebase ${cleanName}`,
      root_path: rootPath || '.',
      files_count: 0,
      symbols_count: 0,
      edges_count: 0,
      created_at: now,
      updated_at: now,
    };
  }

  public deleteDataset(projectId: string, datasetIdOrName: string): boolean {
    const ds = this.db
      .prepare('SELECT id FROM datasets WHERE project_id = ? AND (id = ? OR name = ?)')
      .get(projectId, datasetIdOrName, datasetIdOrName) as any;
    if (!ds) return false;

    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM symbol_edges WHERE project_id = ? AND dataset_id = ?').run(projectId, ds.id);
      this.db.prepare('DELETE FROM symbols WHERE project_id = ? AND dataset_id = ?').run(projectId, ds.id);
      this.db.prepare('DELETE FROM codebase_files WHERE project_id = ? AND dataset_id = ?').run(projectId, ds.id);
      this.db.prepare('DELETE FROM datasets WHERE project_id = ? AND id = ?').run(projectId, ds.id);
    });

    tx();
    return true;
  }

  public saveSymbolsBatch(
    projectId: string,
    datasetId: string,
    symbols: CodeSymbol[],
    edges: Array<{ source: string; target: string }>,
    filesCount: number = 0,
    fileRecords?: Array<{ relativePath: string; hash: string; mtime: number; symbolsCount: number }>
  ): void {
    const cleanDatasetId = datasetId || 'default';

    const tx = this.db.transaction(() => {
      // Clear previous symbols and edges for this specific dataset to avoid stale zombie nodes
      this.db
        .prepare('DELETE FROM symbols WHERE project_id = ? AND dataset_id = ?')
        .run(projectId, cleanDatasetId);
      this.db
        .prepare('DELETE FROM symbol_edges WHERE project_id = ? AND dataset_id = ?')
        .run(projectId, cleanDatasetId);
      try {
        this.db.prepare('DELETE FROM fts_symbols WHERE project_id = ?').run(projectId);
      } catch {}

      // Upsert symbols with dataset_id
      const symStmt = this.db.prepare(`
        INSERT INTO symbols (
          key, project_id, dataset_id, name, kind, package_name, file_path, start_line, end_line,
          signature, docstring, calls, degree, pagerank, community_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(project_id, dataset_id, key) DO UPDATE SET
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

      for (const s of symbols) {
        symStmt.run(
          s.key,
          projectId,
          cleanDatasetId,
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
      }

      // Upsert edges with dataset_id
      const edgeStmt = this.db.prepare(`
        INSERT OR IGNORE INTO symbol_edges (project_id, dataset_id, source_key, target_key)
        VALUES (?, ?, ?, ?)
      `);

      for (const e of edges) {
        edgeStmt.run(projectId, cleanDatasetId, e.source, e.target);
      }

      // Upsert file hash records if provided
      if (fileRecords && fileRecords.length > 0) {
        const fileStmt = this.db.prepare(`
          INSERT INTO codebase_files (project_id, dataset_id, file_path, content_hash, mtime, symbols_count, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(project_id, dataset_id, file_path) DO UPDATE SET
            content_hash = excluded.content_hash,
            mtime = excluded.mtime,
            symbols_count = excluded.symbols_count,
            updated_at = datetime('now')
        `);

        for (const fr of fileRecords) {
          fileStmt.run(projectId, cleanDatasetId, fr.relativePath, fr.hash, fr.mtime, fr.symbolsCount);
        }
      }

      // Update dataset statistics
      this.db
        .prepare(`
          UPDATE datasets SET
            files_count = ?,
            symbols_count = ?,
            edges_count = ?,
            updated_at = datetime('now')
          WHERE project_id = ? AND id = ?
        `)
        .run(filesCount, symbols.length, edges.length, projectId, cleanDatasetId);
    });

    tx();
  }

  public getLinkedMemoriesForSymbol(
    projectId: string,
    symbolKey: string,
    filePath?: string
  ): MemoryCapsule[] {
    try {
      const sql = `
        SELECT id, type, content, confidence, status, origin_ids, target_symbol_key, created_at
        FROM memories
        WHERE project_id = ? AND status = 'active' AND (
          target_symbol_key = ?
          ${filePath ? 'OR target_symbol_key = ?' : ''}
        )
        ORDER BY created_at DESC LIMIT 10
      `;
      const params = filePath ? [projectId, symbolKey, filePath] : [projectId, symbolKey];
      const rows = this.db.prepare(sql).all(...params) as any[];
      return rows.map((r) => ({
        id: r.id,
        type: r.type,
        confidence: r.confidence,
        status: r.status,
        content: JSON.parse(r.content),
        target_symbol_key: r.target_symbol_key,
        score: 1.0,
        created_at: r.created_at,
        citations: JSON.parse(r.origin_ids || '[]'),
      }));
    } catch {
      return [];
    }
  }

  public findSymbols(
    projectId: string,
    datasetId?: string,
    query?: string,
    kind?: SymbolKind,
    file?: string,
    limit: number = 50
  ): CodeSymbol[] {
    let sql = 'SELECT * FROM symbols WHERE project_id = ?';
    const params: any[] = [projectId];

    if (datasetId) {
      sql += ' AND (dataset_id = ? OR dataset_id IN (SELECT id FROM datasets WHERE project_id = ? AND name = ?))';
      params.push(datasetId, projectId, datasetId);
    }

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
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY degree DESC, pagerank DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      key: r.key,
      project_id: r.project_id,
      dataset_id: r.dataset_id,
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

  public getSymbolByKey(
    projectId: string,
    symbolKey: string,
    datasetId?: string
  ): CodeSymbol | null {
    let sql = 'SELECT * FROM symbols WHERE project_id = ? AND (key = ? OR name = ?)';
    const params: any[] = [projectId, symbolKey, symbolKey];

    if (datasetId) {
      sql += ' AND (dataset_id = ? OR dataset_id IN (SELECT id FROM datasets WHERE project_id = ? AND name = ?))';
      params.push(datasetId, projectId, datasetId);
    }

    const r = this.db.prepare(sql).get(...params) as any;
    if (!r) return null;

    return {
      key: r.key,
      project_id: r.project_id,
      dataset_id: r.dataset_id,
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
    datasetId?: string,
    direction: 'callers' | 'callees' | 'both' = 'both',
    depth: number = 1
  ): CallGraphResult | null {
    const root = this.getSymbolByKey(projectId, symbolKey, datasetId);
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

      if (direction === 'callers' || direction === 'both') {
        let callerSql = 'SELECT source_key as caller FROM symbol_edges WHERE project_id = ? AND target_key = ?';
        const callerParams: any[] = [projectId, item.key];
        if (root.dataset_id) {
          callerSql += ' AND dataset_id = ?';
          callerParams.push(root.dataset_id);
        }

        const callerRows = this.db.prepare(callerSql).all(...callerParams) as any[];
        for (const row of callerRows) {
          edges.push({ source: row.caller, target: item.key, relation: 'calls' });
          if (!visitedNodes.has(row.caller)) {
            const sym = this.getSymbolByKey(projectId, row.caller, root.dataset_id);
            if (sym) {
              visitedNodes.set(row.caller, {
                key: sym.key,
                name: sym.name,
                kind: sym.kind,
                file: sym.file_path,
                line: sym.start_line,
                signature: sym.signature,
              });
              callers.push(sym.name);
              queue.push({ key: row.caller, currentDepth: item.currentDepth + 1 });
            }
          }
        }
      }

      if (direction === 'callees' || direction === 'both') {
        let calleeSql = 'SELECT target_key as callee FROM symbol_edges WHERE project_id = ? AND source_key = ?';
        const calleeParams: any[] = [projectId, item.key];
        if (root.dataset_id) {
          calleeSql += ' AND dataset_id = ?';
          calleeParams.push(root.dataset_id);
        }

        const calleeRows = this.db.prepare(calleeSql).all(...calleeParams) as any[];
        for (const row of calleeRows) {
          edges.push({ source: item.key, target: row.callee, relation: 'calls' });
          if (!visitedNodes.has(row.callee)) {
            const sym = this.getSymbolByKey(projectId, row.callee, root.dataset_id);
            if (sym) {
              visitedNodes.set(row.callee, {
                key: sym.key,
                name: sym.name,
                kind: sym.kind,
                file: sym.file_path,
                line: sym.start_line,
                signature: sym.signature,
              });
              callees.push(sym.name);
              queue.push({ key: row.callee, currentDepth: item.currentDepth + 1 });
            }
          }
        }
      }
    }

    return {
      symbol: root,
      nodes: Array.from(visitedNodes.values()),
      edges,
      callers: Array.from(new Set(callers)),
      callees: Array.from(new Set(callees)),
    };
  }

  public getImpactAnalysis(
    projectId: string,
    symbolKey: string,
    datasetId?: string
  ): ImpactAnalysis {
    const root = this.getSymbolByKey(projectId, symbolKey, datasetId);
    const callGraph = root ? this.getCallGraph(projectId, root.key, datasetId, 'callers', 2) : null;

    const directCallers = callGraph ? callGraph.callers : [];
    const transitiveCallers = callGraph
      ? callGraph.nodes.filter((n) => n.key !== root?.key).map((n) => n.name)
      : [];
    const affectedFiles = Array.from(
      new Set(callGraph ? callGraph.nodes.map((n) => n.file) : [])
    );

    const blastRadius = directCallers.length * 1.5 + (transitiveCallers.length - directCallers.length) * 0.8 + affectedFiles.length * 2.0;
    const relatedMemories = this.getLinkedMemoriesForSymbol(projectId, symbolKey, root?.file_path);

    return {
      symbol_key: symbolKey,
      symbol: root,
      direct_callers: directCallers,
      transitive_callers: transitiveCallers,
      affected_files: affectedFiles,
      blast_radius_score: parseFloat(blastRadius.toFixed(2)),
      related_memories: relatedMemories,
    };
  }

  public getFileSummary(
    projectId: string,
    filePath: string,
    datasetId?: string
  ): FileSummary {
    let sql = 'SELECT * FROM symbols WHERE project_id = ? AND file_path = ?';
    const params: any[] = [projectId, filePath];
    if (datasetId) {
      sql += ' AND (dataset_id = ? OR dataset_id IN (SELECT id FROM datasets WHERE project_id = ? AND name = ?))';
      params.push(datasetId, projectId, datasetId);
    }

    const symbols = this.db.prepare(sql).all(...params) as any[];

    const ext = filePath.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript (React)',
      js: 'JavaScript',
      jsx: 'JavaScript (React)',
      go: 'Go',
      py: 'Python',
      rs: 'Rust',
    };

    let maxLine = 0;
    symbols.forEach((s) => {
      if (s.end_line > maxLine) maxLine = s.end_line;
    });

    const linkedMemories = this.getLinkedMemoriesForSymbol(projectId, filePath, filePath);

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
      linked_memories: linkedMemories,
    };
  }

  public getAllGraphData(projectId: string, datasetId?: string) {
    let symSql = 'SELECT * FROM symbols WHERE project_id = ?';
    const symParams: any[] = [projectId];
    if (datasetId) {
      symSql += ' AND (dataset_id = ? OR dataset_id IN (SELECT id FROM datasets WHERE project_id = ? AND name = ?))';
      symParams.push(datasetId, projectId, datasetId);
    }
    symSql += ' ORDER BY degree DESC LIMIT 1000';

    let edgeSql = 'SELECT source_key as source, target_key as target FROM symbol_edges WHERE project_id = ?';
    const edgeParams: any[] = [projectId];
    if (datasetId) {
      edgeSql += ' AND (dataset_id = ? OR dataset_id IN (SELECT id FROM datasets WHERE project_id = ? AND name = ?))';
      edgeParams.push(datasetId, projectId, datasetId);
    }

    const symbols = this.db.prepare(symSql).all(...symParams) as any[];
    const edges = this.db.prepare(edgeSql).all(...edgeParams) as any[];

    return {
      nodes: symbols.map((s) => ({
        key: s.key,
        label: s.name,
        kind: s.kind,
        dataset_id: s.dataset_id,
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
