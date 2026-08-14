import Database from 'better-sqlite3';

export const SCHEMA_SQL = `
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Datasets table (for isolating different codebase knowledge graphs)
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  root_path TEXT,
  files_count INTEGER DEFAULT 0,
  symbols_count INTEGER DEFAULT 0,
  edges_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, name)
);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);

-- Episodes (immutable observations)
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  observation TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  idempotency_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_episodes_project ON episodes(project_id);
CREATE INDEX IF NOT EXISTS idx_episodes_idempotency ON episodes(project_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_episodes_kind ON episodes(project_id, kind);

-- Memories (durable conclusions)
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'active',
  origin_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  idempotency_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_memories_project_status ON memories(project_id, status);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(project_id, type);
CREATE INDEX IF NOT EXISTS idx_memories_idempotency ON memories(project_id, idempotency_key);

-- Memory episode references
CREATE TABLE IF NOT EXISTS memory_references (
  memory_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  PRIMARY KEY (memory_id, episode_id, purpose),
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_feedback_memory ON feedback(memory_id);

-- Codebase Symbols (scoped by project_id and dataset_id)
CREATE TABLE IF NOT EXISTS symbols (
  key TEXT NOT NULL,
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  package_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  signature TEXT NOT NULL DEFAULT '',
  docstring TEXT NOT NULL DEFAULT '',
  calls TEXT NOT NULL DEFAULT '[]',
  degree INTEGER NOT NULL DEFAULT 0,
  pagerank REAL NOT NULL DEFAULT 0.0,
  community_id INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (project_id, dataset_id, key)
);
CREATE INDEX IF NOT EXISTS idx_symbols_dataset ON symbols(project_id, dataset_id);
CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(project_id, dataset_id, name);
CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(project_id, dataset_id, file_path);
CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(project_id, dataset_id, kind);

-- Codebase Call Graph Edges (scoped by project_id and dataset_id)
CREATE TABLE IF NOT EXISTS symbol_edges (
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL DEFAULT 'default',
  source_key TEXT NOT NULL,
  target_key TEXT NOT NULL,
  PRIMARY KEY (project_id, dataset_id, source_key, target_key)
);
CREATE INDEX IF NOT EXISTS idx_edges_source ON symbol_edges(project_id, dataset_id, source_key);
CREATE INDEX IF NOT EXISTS idx_edges_target ON symbol_edges(project_id, dataset_id, target_key);

-- Full-Text Search for Memories
CREATE VIRTUAL TABLE IF NOT EXISTS fts_memories USING fts5(
  memory_id UNINDEXED,
  project_id UNINDEXED,
  content_text,
  tokenize = 'porter unicode61'
);

-- Full-Text Search for Symbols
CREATE VIRTUAL TABLE IF NOT EXISTS fts_symbols USING fts5(
  symbol_key UNINDEXED,
  project_id UNINDEXED,
  dataset_id UNINDEXED,
  name,
  file_path,
  signature,
  docstring,
  tokenize = 'porter unicode61'
);
`;

export function runMigrations(db: Database.Database): void {
  // Ensure foreign keys & WAL mode
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // 1. Check & upgrade legacy symbols table
  try {
    const tableInfo = db.prepare("PRAGMA table_info(symbols)").all() as any[];
    if (tableInfo.length > 0) {
      const dsCol = tableInfo.find((col) => col.name === 'dataset_id');
      if (!dsCol || dsCol.pk === 0) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS symbols_temp (
            key TEXT NOT NULL,
            project_id TEXT NOT NULL,
            dataset_id TEXT NOT NULL DEFAULT 'default',
            name TEXT NOT NULL,
            kind TEXT NOT NULL,
            package_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            start_line INTEGER NOT NULL,
            end_line INTEGER NOT NULL,
            signature TEXT NOT NULL DEFAULT '',
            docstring TEXT NOT NULL DEFAULT '',
            calls TEXT NOT NULL DEFAULT '[]',
            degree INTEGER NOT NULL DEFAULT 0,
            pagerank REAL NOT NULL DEFAULT 0.0,
            community_id INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (project_id, dataset_id, key)
          );
          INSERT OR IGNORE INTO symbols_temp (key, project_id, dataset_id, name, kind, package_name, file_path, start_line, end_line, signature, docstring, calls, degree, pagerank, community_id, updated_at)
          SELECT key, project_id, COALESCE(dataset_id, 'default'), name, kind, package_name, file_path, start_line, end_line, signature, docstring, calls, degree, pagerank, community_id, updated_at FROM symbols;
          DROP TABLE symbols;
          ALTER TABLE symbols_temp RENAME TO symbols;
        `);
      }
    }
  } catch (e) {
    console.warn('[OGM-Slim] Warning during symbols table migration:', e);
  }

  // 2. Check & upgrade legacy symbol_edges table
  try {
    const edgeTableInfo = db.prepare("PRAGMA table_info(symbol_edges)").all() as any[];
    if (edgeTableInfo.length > 0) {
      const edgeDsCol = edgeTableInfo.find((col) => col.name === 'dataset_id');
      if (!edgeDsCol || edgeDsCol.pk === 0) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS symbol_edges_temp (
            project_id TEXT NOT NULL,
            dataset_id TEXT NOT NULL DEFAULT 'default',
            source_key TEXT NOT NULL,
            target_key TEXT NOT NULL,
            PRIMARY KEY (project_id, dataset_id, source_key, target_key)
          );
          INSERT OR IGNORE INTO symbol_edges_temp (project_id, dataset_id, source_key, target_key)
          SELECT project_id, COALESCE(dataset_id, 'default'), source_key, target_key FROM symbol_edges;
          DROP TABLE symbol_edges;
          ALTER TABLE symbol_edges_temp RENAME TO symbol_edges;
        `);
      }
    }
  } catch (e) {
    console.warn('[OGM-Slim] Warning during symbol_edges table migration:', e);
  }

  // 3. Execute full schema
  db.exec(SCHEMA_SQL);
}
