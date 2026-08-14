import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseManager } from '../src/db/database.js';
import { MemoryRepository } from '../src/db/repositories/memory.repo.js';
import { MemoryService } from '../src/services/memory.service.js';

describe('OGM-LW Memory Operations', () => {
  let tempDir: string;
  let dbManager: DatabaseManager;
  let memoryService: MemoryService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-lw-test-'));
    const dbPath = path.join(tempDir, 'test_memory.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('test-proj', 'secret');
    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    memoryService = new MemoryService(memoryRepo);
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should observe immutable episode with idempotency', () => {
    const ep1 = memoryService.observe('test-proj', 'command_output', 'error: connection refused', { host: '127.0.0.1' }, undefined, 'idem-1');
    assert.equal(ep1.replayed, false);
    assert.ok(ep1.episode.id.startsWith('ep_'));

    // Replay idempotency
    const ep2 = memoryService.observe('test-proj', 'command_output', 'error: connection refused', { host: '127.0.0.1' }, undefined, 'idem-1');
    assert.equal(ep2.replayed, true);
    assert.equal(ep2.episode.id, ep1.episode.id);
  });

  test('should commit memory with episode references and recall via FTS5', () => {
    const ep = memoryService.observe('test-proj', 'error', 'database locked error on concurrent write');
    const mem = memoryService.commit(
      'test-proj',
      'bugfix',
      {
        summary: 'Resolved SQLite busy lock with WAL mode and busy timeout',
        fix: 'Set PRAGMA journal_mode=WAL and timeout=5000',
      },
      1.0,
      [{ episode_id: ep.episode.id, purpose: 'evidence' }]
    );

    assert.equal(mem.replayed, false);
    assert.ok(mem.memory.id.startsWith('mem_'));

    // Recall via full text search
    const results = memoryService.recall({
      project_id: 'test-proj',
      text: 'SQLite busy lock WAL mode',
    });

    assert.ok(results.length > 0);
    assert.equal(results[0].id, mem.memory.id);
    assert.deepEqual(results[0].citations, [ep.episode.id]);
  });

  test('should inspect memory detail with full provenance', () => {
    const ep = memoryService.observe('test-proj', 'code', 'function retry()');
    const mem = memoryService.commit('test-proj', 'procedure', { name: 'retry policy' }, 0.9, [
      { episode_id: ep.episode.id, purpose: 'source' },
    ]);

    memoryService.feedback('test-proj', mem.memory.id, 'confirm', { user: 'developer' });

    const detail = memoryService.inspect('test-proj', mem.memory.id);
    assert.ok(detail);
    assert.equal(detail.memory.id, mem.memory.id);
    assert.equal(detail.episodes.length, 1);
    assert.equal(detail.feedback.length, 1);
    assert.equal(detail.feedback[0].kind, 'confirm');
  });

  test('should archive or invalidate memory', () => {
    const mem = memoryService.commit('test-proj', 'preference', { theme: 'dark' });
    const success = memoryService.forget('test-proj', mem.memory.id, 'archive');
    assert.equal(success, true);

    const recalled = memoryService.recall({ project_id: 'test-proj', text: 'theme' });
    assert.equal(recalled.length, 0); // archived is filtered out
  });
});
