export interface OgmSlimConfig {
  server: {
    host: string;
    port: number;
    cors_origins: string[];
  };
  database: {
    path: string;
    auto_migrate: boolean;
  };
  auth: {
    default_project_id: string;
    api_key: string;
    admin_email?: string;
    admin_password?: string;
  };
  codebase: {
    auto_index: boolean;
    watch_changes: boolean;
    exclude_patterns: string[];
  };
  log_level: 'debug' | 'info' | 'warn' | 'error';
}

export type AppConfig = OgmSlimConfig;
export type OgmLwConfig = OgmSlimConfig;
