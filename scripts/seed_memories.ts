import Database from 'better-sqlite3';

const db = new Database('/root/.config/ogm-slim/memory.db');
const projectId = 'default';

console.log('Seeding complex operational memory graph for project:', projectId);

// Clear old sample memories and episodes
db.prepare('DELETE FROM feedback WHERE project_id = ?').run(projectId);
db.prepare('DELETE FROM memory_references WHERE memory_id IN (SELECT id FROM memories WHERE project_id = ?)').run(projectId);
db.prepare('DELETE FROM fts_memories WHERE project_id = ?').run(projectId);
db.prepare('DELETE FROM memories WHERE project_id = ?').run(projectId);
db.prepare('DELETE FROM episodes WHERE project_id = ?').run(projectId);

function insertEpisode(id: string, kind: string, obs: any, meta: any, observedAt: string) {
  const obsStr = typeof obs === 'string' ? obs : JSON.stringify(obs);
  const metaStr = JSON.stringify(meta || {});
  const now = observedAt || new Date().toISOString();
  db.prepare('INSERT INTO episodes (id, project_id, kind, observation, metadata, observed_at, created_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, projectId, kind, obsStr, metaStr, now, now, 'idem_' + id
  );
  return id;
}

function insertMemory(id: string, type: string, content: any, confidence: number, targetSymbolKey: string | null, references: { episode_id: string; purpose?: string }[] = []) {
  const contentStr = JSON.stringify(content);
  const originIdsStr = JSON.stringify(references.map(r => r.episode_id));
  const now = new Date().toISOString();

  db.prepare('INSERT INTO memories (id, project_id, type, content, confidence, status, origin_ids, target_symbol_key, created_at, updated_at, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, projectId, type, contentStr, confidence, 'active', originIdsStr, targetSymbolKey || null, now, now, 'idem_' + id
  );

  const searchIndexText = type + ' ' + (content.title || '') + ' ' + (content.summary || '') + ' ' + (content.root_cause || '') + ' ' + (content.fix || '') + ' ' + (content.rationale || '') + ' ' + (content.formula || '') + ' ' + JSON.stringify(content);
  db.prepare('INSERT INTO fts_memories (memory_id, project_id, content_text) VALUES (?, ?, ?)').run(
    id, projectId, searchIndexText
  );

  for (const ref of references) {
    db.prepare('INSERT OR IGNORE INTO memory_references (memory_id, episode_id, purpose) VALUES (?, ?, ?)').run(
      id, ref.episode_id, ref.purpose || 'evidence'
    );
  }
}

// 1. Insert Episodes (Immutable Provenance Logs)
const ep1 = insertEpisode(
  'ep_wasm_leak_trace',
  'error',
  'V8 out-of-memory heap exhaustion after parsing 1,000 files without tree.delete(). Heap snapshot showed 1.4GB retained in WebAssembly linear memory allocations.',
  { file: 'src/codebase/extractor.ts', component: 'extractor', error_code: 'ERR_WORKER_OOM' },
  '2026-08-15T14:20:00Z'
);

const ep2 = insertEpisode(
  'ep_wasm_fix_diff',
  'diff',
  'Wrapped extractFileAsync AST traversal in try/finally block ensuring tree.delete() is called immediately after symbol extraction.',
  { file: 'src/codebase/extractor.ts', commit: '449dbef', author: 'agent_antigravity' },
  '2026-08-15T14:45:00Z'
);

const ep3 = insertEpisode(
  'ep_syntax_error_trace',
  'error',
  'Browser console threw Uncaught SyntaxError: Invalid or unexpected token on multi-line template literal in graph-app.client.ts when switching to memory tab.',
  { file: 'src/web/client/graph-app.client.ts', component: 'web_client' },
  '2026-08-15T16:10:00Z'
);

const ep4 = insertEpisode(
  'ep_syntax_fix_diff',
  'diff',
  'Replaced raw template string newlines with String.fromCharCode(10) array joins to ensure valid JavaScript output.',
  { file: 'src/web/client/graph-app.client.ts', commit: '1c8143b', status: 'verified' },
  '2026-08-15T16:25:00Z'
);

const ep5 = insertEpisode(
  'ep_bench_sqlite_wal',
  'command_output',
  'Executed benchmark: 10,000 FTS5 memory recall queries executed in 14.2ms (<1.42 microseconds per recall query). SQLite WAL write-ahead log eliminated concurrency locking.',
  { database: 'SQLite 3.45 WAL', mode: 'FTS5 + BM25', latency_p99: '1.8ms' },
  '2026-08-15T15:00:00Z'
);

const ep6 = insertEpisode(
  'ep_bench_parallel_ast',
  'tool_result',
  'Parallel batch pool with chunk size 16 parsed 1,257 files and extracted 25,869 symbols and 75,405 call edges in 18.6s (1,390 symbols/sec throughput).',
  { concurrency: 16, cpu_cores: 4, memory_peak: '184MB' },
  '2026-08-15T15:30:00Z'
);

const ep7 = insertEpisode(
  'ep_user_req_clean_ui',
  'observation',
  'User Directive: Do not use any emojis in the dashboard. Maintain clean minimalist typography and make sidebars collapsible using persistent edge arrow chevron handles.',
  { source: 'user_prompt', theme: 'minimalist', requested_at: '2026-08-16T00:58:00Z' },
  '2026-08-16T00:58:00Z'
);

const ep8 = insertEpisode(
  'ep_systemd_caddy_deploy',
  'command_output',
  'Systemd service ogm-slim.service running on port 8765 reverse proxied by Caddy on ogm-slim.svclabs.cloud with automatic Let\'s Encrypt TLS certificate.',
  { service: 'ogm-slim.service', domain: 'ogm-slim.svclabs.cloud', tls: 'Let\'s Encrypt ALPN' },
  '2026-08-15T16:30:00Z'
);

// 2. Insert Complex Memories with Direct Symbol Anchoring & Citations
insertMemory(
  'mem_wasm_lifecycle',
  'bugfix',
  {
    summary: 'Prevented WASM linear memory leaks by wrapping Tree-Sitter AST parsing in try/finally tree.delete()',
    root_cause: 'WebAssembly linear memory in Node.js runtime is allocated outside V8 heap and must be freed explicitly via tree.delete()',
    fix: 'Wrapped extractFileAsync body in try/finally with tree.delete() call',
    preventative_rule: 'Always invoke tree.delete() inside finally blocks on any WebAssembly syntax tree object'
  },
  1.0,
  'extractFileAsync',
  [
    { episode_id: ep1, purpose: 'root_cause_evidence' },
    { episode_id: ep2, purpose: 'fix_verification' }
  ]
);

insertMemory(
  'mem_client_template_safety',
  'bugfix',
  {
    summary: 'Eliminated client script syntax errors by using String.fromCharCode(10) for multi-line string interpolation',
    root_cause: 'Raw template literal string newlines in TypeScript emitted unescaped literal line breaks inside HTML script tags',
    fix: 'Replaced raw newlines with safe String.fromCharCode(10) and array joins',
    preventative_rule: 'Never embed raw multiline string literals in inline script templates; always use String.fromCharCode(10)'
  },
  1.0,
  'renderClientScript',
  [
    { episode_id: ep3, purpose: 'syntax_error_trace' },
    { episode_id: ep4, purpose: 'fix_diff' }
  ]
);

insertMemory(
  'mem_embedded_storage_decision',
  'decision',
  {
    title: 'Adopted Embedded SQLite WAL + FTS5 as Zero-Dependency Operational Storage',
    summary: 'Selected SQLite WAL + FTS5 as standalone embedded engine delivering <2ms recall latency',
    rationale: 'Eliminates external database dependencies (Postgres/Neo4j) while delivering <2ms recall latency and instant cross-platform zero-config startup',
    alternatives_evaluated: ['PostgreSQL + pgvector', 'Embedded DuckDB', 'ChromaDB + SQLite']
  },
  1.0,
  'DatabaseManager',
  [
    { episode_id: ep5, purpose: 'benchmark_evidence' }
  ]
);

insertMemory(
  'mem_parallel_chunking',
  'procedure',
  {
    title: 'Batch Concurrency Pool (16 Files/Chunk) for High-Throughput AST Parsing',
    summary: 'Implemented parallel AST parsing with batch concurrency chunks of 16 files',
    procedure_steps: [
      '1. Partition target codebase files into chunks of 16',
      '2. Execute extractFileAsync in parallel per chunk using Promise.all',
      '3. Collect symbol definitions and references into in-memory indices',
      '4. Resolve caller-callee edges and persist in batch transactions'
    ]
  },
  0.98,
  'resolveCodebaseCallGraph',
  [
    { episode_id: ep6, purpose: 'throughput_benchmark' }
  ]
);

insertMemory(
  'mem_hybrid_retrieval_formula',
  'learning',
  {
    title: 'Composite 3-Tier Hybrid Retrieval Score Ranking Formula',
    summary: 'Hybrid ranking formula combines 60% BM25, 25% confidence, and 15% recency decay',
    formula: 'Score = 0.60 * BM25 + 0.25 * Confidence + 0.15 * exp(-0.05 * DaysOld)',
    key_benefit: 'Balances exact keyword precision (BM25) with verified agent confidence and exponential freshness decay'
  },
  0.95,
  'MemoryRepository.recall',
  [
    { episode_id: ep5, purpose: 'recall_benchmark' }
  ]
);

insertMemory(
  'mem_ui_design_guidelines',
  'preference',
  {
    title: 'Strict Minimalist UI: No Emojis & Collapsible Chevron Handles',
    summary: 'Strict Minimalist UI: No emojis, typography-driven dark theme with collapsible chevron edge handles',
    guidelines: [
      '1. No emojis anywhere in webview or CLI output',
      '2. Clean typographic hierarchy with SF Pro / Inter and JetBrains Mono',
      '3. Persistent edge chevron handles (‹ and ›) for 1-click sidebar collapse/expand',
      '4. Anti-overlap force-directed physics with distinct glass cards for memories and capsules for episodes'
    ]
  },
  1.0,
  null,
  [
    { episode_id: ep7, purpose: 'user_directive' }
  ]
);

insertMemory(
  'mem_vps_deploy_pipeline',
  'procedure',
  {
    title: 'Systemd Daemon + Caddy Reverse Proxy Deployment Runbook',
    summary: 'Zero-downtime Systemd service upgrade & Caddy TLS reverse proxy reload workflow',
    runbook: [
      '1. Build production bundle: npm run build && npm link',
      '2. Start systemd service: systemctl restart ogm-slim',
      '3. Configure Caddyfile with reverse_proxy 127.0.0.1:8765',
      '4. Reload Caddy: systemctl reload caddy',
      '5. Verify HTTPS endpoint on ogm-slim.svclabs.cloud'
    ]
  },
  0.99,
  null,
  [
    { episode_id: ep8, purpose: 'deployment_verification' }
  ]
);

console.log('Seeding completed successfully!');
console.log('Total Memories:', (db.prepare('SELECT COUNT(*) as c FROM memories WHERE project_id = ?').get(projectId) as any).c);
console.log('Total Episodes:', (db.prepare('SELECT COUNT(*) as c FROM episodes WHERE project_id = ?').get(projectId) as any).c);
console.log('Total Citation Edges:', (db.prepare('SELECT COUNT(*) as c FROM memory_references').get() as any).c);
