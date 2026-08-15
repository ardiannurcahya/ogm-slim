import { Context, Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { MemoryService } from '../../services/memory.service.js';
import { CodebaseService } from '../../services/codebase.service.js';
import { AppConfig } from '../../types/config.js';
import { renderGraphPage } from '../views/graph.view.js';

function isAuthenticated(c: Context, config: AppConfig): boolean {
  if (!config.auth.enabled) return true;

  const authHeader = c.req.header('Authorization');
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token === config.auth.api_key || (config.auth.admin_password && token === config.auth.admin_password)) {
        return true;
      }
    }
  }

  const apiKeyHeader = c.req.header('X-API-Key') || c.req.header('x-api-key');
  if (apiKeyHeader && (apiKeyHeader === config.auth.api_key || (config.auth.admin_password && apiKeyHeader === config.auth.admin_password))) {
    return true;
  }

  const cookieToken = getCookie(c, 'ogm_auth_token');
  if (cookieToken && (cookieToken === config.auth.api_key || (config.auth.admin_password && cookieToken === config.auth.admin_password))) {
    return true;
  }

  const queryToken = c.req.query('key') || c.req.query('token');
  if (queryToken && (queryToken === config.auth.api_key || (config.auth.admin_password && queryToken === config.auth.admin_password))) {
    return true;
  }

  return false;
}

export function registerApiRoutes(
  app: Hono,
  memoryService: MemoryService,
  codebaseService: CodebaseService,
  config: AppConfig
): void {
  // System Health (Public)
  app.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'ogm-slim', version: '1.0.0', auth_enabled: !!config.auth.enabled });
  });

  // Auth Status & Login / Logout
  app.get('/api/auth/status', (c) => {
    return c.json({
      auth_enabled: !!config.auth.enabled,
      authenticated: isAuthenticated(c, config),
    });
  });

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const key = body.key || body.api_key || body.password;

    const validKey = config.auth.api_key;
    const validPass = config.auth.admin_password;

    if (key && (key === validKey || (validPass && key === validPass))) {
      setCookie(c, 'ogm_auth_token', key, {
        path: '/',
        httpOnly: false,
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return c.json({ success: true, token: key });
    }

    return c.json({ success: false, error: 'Invalid API key or password' }, 401);
  });

  app.post('/api/auth/logout', (c) => {
    deleteCookie(c, 'ogm_auth_token', { path: '/' });
    return c.json({ success: true });
  });

  // Admin Web UI
  app.get('/admin', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphPage(projectId, !!config.auth.enabled));
  });

  app.get('/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    return c.html(renderGraphPage(projectId, !!config.auth.enabled));
  });

  // API Middleware for protected routes
  app.use('/api/*', async (c, next) => {
    const path = c.req.path;
    if (path === '/api/auth/login' || path === '/api/auth/status' || path === '/api/auth/logout') {
      return next();
    }

    if (!isAuthenticated(c, config)) {
      return c.json({ error: 'Unauthorized. Please provide valid API key or login.' }, 401);
    }

    await next();
  });

  // Datasets List
  app.get('/api/datasets', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const datasets = codebaseService.listDatasets(projectId);
    return c.json(datasets);
  });

  // Codebase Graph Data
  app.get('/api/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const dataset = c.req.query('dataset');
    const data = codebaseService.getGraphData(projectId, dataset);
    return c.json(data);
  });

  // Agent Memory Graph Data (New Feature)
  app.get('/api/memory/graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const data = memoryService.getMemoryGraph(projectId);
    return c.json(data);
  });

  // Memory & Codebase Stats
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
    const datasetName = body.dataset || body.dataset_name;
    const stats = await codebaseService.indexDirectory(dirPath, projectId, datasetName, body.ignore);
    return c.json(stats);
  });

  // Codebase Symbols
  app.get('/api/codebase/symbols', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const dataset = c.req.query('dataset');
    const query = c.req.query('q');
    const kind = c.req.query('kind') as any;
    const file = c.req.query('file');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const symbols = codebaseService.findSymbols(projectId, dataset, query, kind, file, limit);
    return c.json({ count: symbols.length, symbols });
  });

  // Codebase Call Graph
  app.get('/api/codebase/call-graph', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const key = c.req.query('key');
    const dataset = c.req.query('dataset');
    if (!key) return c.json({ error: 'Missing key parameter' }, 400);

    const direction = (c.req.query('dir') as any) || 'both';
    const depth = c.req.query('depth') ? parseInt(c.req.query('depth')!, 10) : 1;
    const result = codebaseService.getCallGraph(projectId, key, dataset, direction, depth);
    return c.json(result || { error: 'Symbol not found' }, result ? 200 : 404);
  });

  // Codebase Impact Analysis
  app.get('/api/codebase/impact', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const key = c.req.query('key');
    const dataset = c.req.query('dataset');
    if (!key) return c.json({ error: 'Missing key parameter' }, 400);

    const impact = codebaseService.getImpactAnalysis(projectId, key, dataset);
    return c.json(impact);
  });

  // Codebase File Summary
  app.get('/api/codebase/file', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const path = c.req.query('path');
    const dataset = c.req.query('dataset');
    if (!path) return c.json({ error: 'Missing path parameter' }, 400);

    const summary = codebaseService.getFileSummary(projectId, path, dataset);
    return c.json(summary);
  });

  // Memory Observe
  app.post('/api/memory/observe', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const obsContent = body.observation !== undefined ? body.observation : body.content;
    const result = memoryService.observe(
      projectId,
      body.kind || 'observation',
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
    const result = memoryService.commit(
      projectId,
      body.type || 'learning',
      body.content,
      body.confidence !== undefined ? body.confidence : 1.0,
      body.episodes,
      body.idempotency_key
    );
    return c.json(result);
  });

  // Memory Recall (Support both POST and GET)
  app.post('/api/memory/recall', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const results = memoryService.recall({
      project_id: projectId,
      query: body.text || body.query,
      type: body.type,
      exact: body.exact,
      entity_key: body.entity_key,
      as_of: body.as_of,
      limit: body.limit,
    });
    return c.json(results);
  });

  app.get('/api/memory/recall', (c) => {
    const projectId = c.req.query('project') || config.auth.default_project_id;
    const query = c.req.query('q') || c.req.query('query') || c.req.query('text');
    const type = c.req.query('type') as any;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const results = memoryService.recall({
      project_id: projectId,
      query,
      type,
      limit,
    });
    return c.json(results);
  });

  // Memory Detail / Inspection
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
    const success = memoryService.feedback(projectId, body.memory_id, body.kind, body.detail);
    return c.json({ success });
  });

  // Memory Forget
  app.post('/api/memory/forget', async (c) => {
    const body = await c.req.json();
    const projectId = body.project_id || config.auth.default_project_id;
    const success = memoryService.forget(projectId, body.memory_id, body.mode);
    return c.json({ success });
  });
}
