import Database from 'better-sqlite3';

export const SCHEMA_SQL = `
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

-- Codebase Symbols
CREATE TABLE IF NOT EXISTS symbols (
  key TEXT NOT NULL,
  project_id TEXT NOT NULL,
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
  PRIMARY KEY (project_id, key)
);
CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(project_id, name);
CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(project_id, file_path);
CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(project_id, kind);

-- Codebase Call Graph Edges
CREATE TABLE IF NOT EXISTS symbol_edges (
  project_id TEXT NOT NULL,
  source_key TEXT NOT NULL,
  target_key TEXT NOT NULL,
  PRIMARY KEY (project_id, source_key, target_key)
);
CREATE INDEX IF NOT EXISTS idx_edges_source ON symbol_edges(project_id, source_key);
CREATE INDEX IF NOT EXISTS idx_edges_target ON symbol_edges(project_id, target_key);

-- Full-Text Search for Memories
CREATE VIRTUAL TABLE IF NOT EXISTS fts_memories USING fts5(
  memory_id UNINDEXED,
  project_id UNINDEXED,
  content_text,
  tokenize = 'porter unicode61'
);

-- Full-Text Search for Code Symbols
CREATE VIRTUAL TABLE IF NOT EXISTS fts_symbols USING fts5(
  symbol_key UNINDEXED,
  project_id UNINDEXED,
  name,
  signature,
  docstring,
  file_path,
  tokenize = 'porter unicode61'
);
`;

export function runMigrations(db: Database.Database): void {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA temp_store = MEMORY;');
  db.exec('PRAGMA cache_size = -64000;'); // 64MB cache

  db.exec(SCHEMA_SQL);
}
