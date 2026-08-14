import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { runMigrations } from './migrations.js';
import { OgmLwConfig } from '../types/config.js';

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string, autoMigrate: boolean = true) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath, {
      fileMustExist: false,
      timeout: 5000,
    });

    if (autoMigrate) {
      runMigrations(this.db);
    }
  }

  public getRawDb(): Database.Database {
    return this.db;
  }

  public close(): void {
    if (this.db.open) {
      this.db.close();
    }
  }

  public transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  public ensureDefaultProject(projectId: string = 'default', apiKey: string = 'ogm-lw-admin-secret-key-local'): void {
    const stmt = this.db.prepare('SELECT id FROM projects WHERE id = ?');
    const existing = stmt.get(projectId);
    if (!existing) {
      const insert = this.db.prepare('INSERT INTO projects (id, name, api_key) VALUES (?, ?, ?)');
      insert.run(projectId, 'Default Project', apiKey);
    }
  }
}

export function initDatabase(config: OgmLwConfig): DatabaseManager {
  const manager = new DatabaseManager(config.database.path, config.database.auto_migrate);
  manager.ensureDefaultProject(config.auth.default_project_id, config.auth.api_key);
  return manager;
}
