import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { MemoryService } from '../services/memory.service.js';
import { CodebaseService } from '../services/codebase.service.js';
import { AppConfig } from '../types/config.js';
import { registerApiRoutes } from './routes/api.routes.js';

/**
 * Creates and configures the Hono web application instance.
 */
export function createWebServer(
  memoryService: MemoryService,
  codebaseService: CodebaseService,
  config: AppConfig
): Hono {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Register REST API and View Routes
  registerApiRoutes(app, memoryService, codebaseService, config);

  return app;
}
