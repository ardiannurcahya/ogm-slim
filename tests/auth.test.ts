import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseManager } from '../src/db/database.js';
import { MemoryRepository } from '../src/db/repositories/memory.repo.js';
import { CodebaseRepository } from '../src/db/repositories/codebase.repo.js';
import { MemoryService } from '../src/services/memory.service.js';
import { CodebaseService } from '../src/services/codebase.service.js';
import { createWebServer } from '../src/web/app.js';
import { getDefaultConfig } from '../src/config.js';

describe('OGM-Slim Web Authentication & Memory Graph API', () => {
  let tempDir: string;
  let dbManager: DatabaseManager;
  let memoryService: MemoryService;
  let codebaseService: CodebaseService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-auth-test-'));
    const dbPath = path.join(tempDir, 'test_auth.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('auth-proj', 'test-secret-key');

    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    const codebaseRepo = new CodebaseRepository(dbManager.getRawDb());

    memoryService = new MemoryService(memoryRepo);
    codebaseService = new CodebaseService(codebaseRepo);
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should allow access when auth is disabled by default', async () => {
    const config = getDefaultConfig();
    config.auth.enabled = false;
    config.auth.default_project_id = 'auth-proj';

    const app = createWebServer(memoryService, codebaseService, config);
    const res = await app.request('/api/stats');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.project_id, 'auth-proj');
  });

  test('should reject unauthorized requests when auth is enabled', async () => {
    const config = getDefaultConfig();
    config.auth.enabled = true;
    config.auth.api_key = 'super-secret-key-123';
    config.auth.default_project_id = 'auth-proj';

    const app = createWebServer(memoryService, codebaseService, config);

    // 1. Without credentials -> 401
    const resUnauthorized = await app.request('/api/stats');
    assert.equal(resUnauthorized.status, 401);

    // 2. Health check remains public -> 200
    const resHealth = await app.request('/health');
    assert.equal(resHealth.status, 200);

    // 3. With Bearer token -> 200
    const resBearer = await app.request('/api/stats', {
      headers: { Authorization: 'Bearer super-secret-key-123' },
    });
    assert.equal(resBearer.status, 200);

    // 4. With X-API-Key header -> 200
    const resHeader = await app.request('/api/stats', {
      headers: { 'X-API-Key': 'super-secret-key-123' },
    });
    assert.equal(resHeader.status, 200);
  });

  test('should support login endpoint and set cookie when valid credentials provided', async () => {
    const config = getDefaultConfig();
    config.auth.enabled = true;
    config.auth.api_key = 'api-key-abc';
    config.auth.admin_password = 'vps-password-xyz';

    const app = createWebServer(memoryService, codebaseService, config);

    // Login with wrong password
    const failRes = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });
    assert.equal(failRes.status, 401);

    // Login with correct password
    const passRes = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'vps-password-xyz' }),
    });
    assert.equal(passRes.status, 200);
    const passData = await passRes.json();
    assert.equal(passData.success, true);
  });

  test('should return agent memory graph data via /api/memory/graph', async () => {
    const config = getDefaultConfig();
    config.auth.enabled = false;
    config.auth.default_project_id = 'auth-proj';

    const ep = memoryService.observe('auth-proj', 'error', 'Database deadlock');
    memoryService.commit('auth-proj', 'bugfix', { summary: 'Use transactions with retry' }, 1.0, [
      { episode_id: ep.episode.id, purpose: 'evidence' },
    ]);

    const app = createWebServer(memoryService, codebaseService, config);
    const res = await app.request('/api/memory/graph?project=auth-proj');
    assert.equal(res.status, 200);

    const graph = await res.json();
    assert.ok(graph.nodes.length >= 2);
    assert.ok(graph.edges.length >= 1);
  });
});
