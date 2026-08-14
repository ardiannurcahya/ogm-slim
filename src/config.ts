import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OgmLwConfig } from './types/config.js';

export function getDefaultConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg && xdg.trim()) {
    return path.join(xdg, 'ogm-slim');
  }
  return path.join(os.homedir(), '.config', 'ogm-slim');
}

export function getDefaultDbPath(): string {
  const cfgDir = getDefaultConfigDir();
  return path.join(cfgDir, 'memory.db');
}

export function getDefaultConfig(): OgmLwConfig {
  const dbPath = getDefaultDbPath();
  return {
    server: {
      host: '127.0.0.1',
      port: 8080,
      cors_origins: ['*'],
    },
    database: {
      path: dbPath,
      auto_migrate: true,
    },
    auth: {
      default_project_id: 'default',
      api_key: 'ogm-slim-admin-secret-key-local',
      admin_email: 'admin@local',
      admin_password: 'admin-password-local',
    },
    codebase: {
      auto_index: true,
      watch_changes: false,
      exclude_patterns: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/*.min.js',
      ],
    },
    log_level: 'info',
  };
}

export function loadConfig(customConfigPath?: string): OgmLwConfig {
  const config = getDefaultConfig();

  // Try custom path or default file
  const candidates = [
    customConfigPath,
    process.env.OGM_CONFIG_FILE,
    process.env.MEMORY_CONFIG_FILE,
    path.join(getDefaultConfigDir(), 'config.json'),
    path.join(process.cwd(), 'ogm-slim.config.json'),
  ].filter(Boolean) as string[];

  for (const configPath of candidates) {
    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed.server) Object.assign(config.server, parsed.server);
        if (parsed.database) Object.assign(config.database, parsed.database);
        if (parsed.auth) Object.assign(config.auth, parsed.auth);
        if (parsed.codebase) Object.assign(config.codebase, parsed.codebase);
        if (parsed.log_level) config.log_level = parsed.log_level;
        break;
      } catch (err) {
        console.warn(`[OGM-Slim] Failed to parse config file at ${configPath}:`, err);
      }
    }
  }

  // Environment Variable Overrides
  if (process.env.PORT) config.server.port = parseInt(process.env.PORT, 10);
  if (process.env.OGM_PORT) config.server.port = parseInt(process.env.OGM_PORT, 10);
  if (process.env.HOST) config.server.host = process.env.HOST;
  if (process.env.OGM_HOST) config.server.host = process.env.OGM_HOST;

  if (process.env.OGM_DB_PATH) config.database.path = process.env.OGM_DB_PATH;
  if (process.env.MEMORY_DB_PATH) config.database.path = process.env.MEMORY_DB_PATH;

  if (process.env.OGM_PROJECT_ID) config.auth.default_project_id = process.env.OGM_PROJECT_ID;
  if (process.env.MEMORY_MCP_PROJECT_ID) config.auth.default_project_id = process.env.MEMORY_MCP_PROJECT_ID;

  if (process.env.OGM_API_KEY) config.auth.api_key = process.env.OGM_API_KEY;
  if (process.env.MEMORY_MCP_CREDENTIAL) config.auth.api_key = process.env.MEMORY_MCP_CREDENTIAL;

  // Ensure DB parent directory exists
  const dbDir = path.dirname(config.database.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return config;
}
