import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MemoryService } from '../services/memory.service.js';
import { CodebaseService } from '../services/codebase.service.js';
import { OgmLwConfig } from '../types/config.js';
import { renderGraphHtml } from './views/graph.html.js';

export function createWebServer(
  memoryService: MemoryService,
  codebaseService: CodebaseService,
  config: OgmLwConfig
): Hono {
  const app = new Hono();

  // Middleware
  app.use('*', cors({ origin: '*' }));

  // Health
  app.get('/health', (c) => c.json({ status: 'ok', service: 'ogm-slim', version: '1.0.0' }));
  app.get('/ready', (c) => c.json({ status: 'ready' }));

  // Web UI Views
  app.get('/', (c) => c.redirect('/admin'));
  app.get('/admin', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphHtml(projectId));
  });
  app.get('/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphHtml(projectId));
  });

  // REST API Endpoints
  // 1. Graph Data (Sigma.js format)
  app.get('/api/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const graphData = codebaseService.getGraphData(projectId);
    return c.json(graphData);
  });

  // 2. Stats
  app.get('/api/stats', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const stats = memoryService.getStats(projectId);
    return c.json(stats);
  });

  // 3. Codebase Indexing
  app.post('/api/codebase/index', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const dirPath = body.path || '.';
    const projectId = body.project_id || config.auth.default_project_id;
    const stats = await codebaseService.indexDirectory(dirPath, projectId, body.ignore);
    return c.json(stats);
  });

  // 4. Codebase Symbols Search
  app.get('/api/codebase/symbols', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const query = c.req.query('q');
    const kind = c.req.query('kind') as any;
    const file = c.req.query('file');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : 30;
    const symbols = codebaseService.findSymbols(projectId, query, kind, file, limit);
    return c.json(symbols);
  });

  // 5. Memory Recall
  app.post('/api/memory/recall', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const projectId = body.project_id || config.auth.default_project_id;
    const results = memoryService.recall({
      project_id: projectId,
      text: body.text,
      exact: body.exact,
      entity_key: body.entity_key,
      as_of: body.as_of,
      limit: body.limit,
    });
    return c.json(results);
  });

  // 6. Memory Observe
  app.post('/api/memory/observe', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const projectId = body.project_id || config.auth.default_project_id;
    const result = memoryService.observe(
      projectId,
      body.kind || 'observation',
      body.observation,
      body.metadata,
      body.observed_at,
      body.idempotency_key
    );
    return c.json(result);
  });

  // 7. Memory Commit
  app.post('/api/memory/commit', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const projectId = body.project_id || config.auth.default_project_id;
    const result = memoryService.commit(
      projectId,
      body.type || 'bugfix',
      body.content || {},
      body.confidence || 1.0,
      body.episodes || [],
      body.idempotency_key
    );
    return c.json(result);
  });

  return app;
}
