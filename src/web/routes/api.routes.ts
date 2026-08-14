import { Hono } from 'hono';
import { MemoryService } from '../../services/memory.service.js';
import { CodebaseService } from '../../services/codebase.service.js';
import { AppConfig } from '../../types/config.js';
import { renderGraphPage } from '../views/graph.view.js';

export function registerApiRoutes(
  app: Hono,
  memoryService: MemoryService,
  codebaseService: CodebaseService,
  config: AppConfig
): void {
  // System Health
  app.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'ogm-slim', version: '1.0.0' });
  });

  // Admin Web UI
  app.get('/admin', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphPage(projectId));
  });

  app.get('/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphPage(projectId));
  });

  // Graph Data
  app.get('/api/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const data = codebaseService.getGraphData(projectId);
    return c.json(data);
  });

  // Memory Stats
  app.get('/api/stats', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const stats = memoryService.getStats(projectId);
    return c.json(stats);
  });

  // Codebase Indexing
  app.post('/api/codebase/index', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const dirPath = body.path || '.';
    const projectId = body.project_id || config.auth.default_project_id;
    const stats = await codebaseService.indexDirectory(dirPath, projectId, body.ignore);
    return c.json(stats);
  });

  // Codebase Symbols
  app.get('/api/codebase/symbols', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const query = c.req.query('q');
    const kind = c.req.query('kind') as any;
    const file = c.req.query('file');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const symbols = codebaseService.findSymbols(projectId, query, kind, file, limit);
    return c.json({ count: symbols.length, symbols });
  });

  // Codebase Call Graph
  app.get('/api/codebase/call-graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const key = c.req.query('key');
    if (!key) return c.json({ error: 'Missing key parameter' }, 400);

    const direction = (c.req.query('dir') as any) || 'both';
    const depth = c.req.query('depth') ? parseInt(c.req.query('depth')!, 10) : 1;
    const result = codebaseService.getCallGraph(projectId, key, direction, depth);
    return c.json(result || { error: 'Symbol not found' }, result ? 200 : 404);
  });

  // Codebase Impact Analysis
  app.get('/api/codebase/impact', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const key = c.req.query('key');
    if (!key) return c.json({ error: 'Missing key parameter' }, 400);

    const impact = codebaseService.getImpactAnalysis(projectId, key);
    return c.json(impact);
  });

  // Codebase File Summary
  app.get('/api/codebase/file', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const path = c.req.query('path');
    if (!path) return c.json({ error: 'Missing path parameter' }, 400);

    const summary = codebaseService.getFileSummary(projectId, path);
    return c.json(summary);
  });

  // Memory Observe
  app.post('/api/memory/observe', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const obsContent = body.observation !== undefined ? body.observation : body.content;
    const result = memoryService.observe(
      projectId,
      body.kind || 'interaction',
      obsContent,
      body.metadata,
      body.observed_at,
      body.idempotency_key
    );
    return c.json(result);
  });

  // Memory Commit
  app.post('/api/memory/commit', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const refs = body.episodes || body.references || [];
    const result = memoryService.commit(
      projectId,
      body.type,
      body.content,
      body.confidence ?? 1.0,
      refs,
      body.idempotency_key
    );
    return c.json(result);
  });

  // Memory Recall (Supports both GET query and POST body)
  const handleRecall = async (c: any) => {
    const projectId = c.req.query('project') || (c.req.method === 'POST' ? (await c.req.json().catch(() => ({}))).project_id : null) || config.auth.default_project_id;
    let query = c.req.query('q') || c.req.query('query') || '';
    let type = c.req.query('type') as any;
    let limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;

    if (c.req.method === 'POST') {
      const body = await c.req.json().catch(() => ({}));
      query = body.text || body.query || body.q || query;
      type = body.type || type;
      limit = body.limit || limit;
    }

    const capsules = memoryService.recall({
      project_id: projectId,
      query,
      type,
      limit,
    });
    return c.json(capsules);
  };

  app.get('/api/memory/recall', handleRecall);
  app.post('/api/memory/recall', handleRecall);

  // Memory Detail & Provenance
  app.get('/api/memory/inspect', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const memoryId = c.req.query('id');
    if (!memoryId) return c.json({ error: 'Missing id parameter' }, 400);

    const detail = memoryService.inspect(projectId, memoryId);
    return c.json(detail || { error: 'Memory not found' }, detail ? 200 : 404);
  });

  // Memory Feedback
  app.post('/api/memory/feedback', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const success = memoryService.feedback(projectId, body.id || body.memory_id, body.kind || 'useful', body.detail);
    return c.json({ success });
  });

  // Memory Invalidation / Archive
  app.post('/api/memory/forget', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const mode = body.hard ? 'hard_delete' : body.mode || 'archive';
    const success = memoryService.forget(projectId, body.id || body.memory_id, mode);
    return c.json({ success });
  });
}
