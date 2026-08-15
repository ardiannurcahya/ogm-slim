import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseManager } from '../src/db/database.js';
import { MemoryRepository } from '../src/db/repositories/memory.repo.js';
import { MemoryService } from '../src/services/memory.service.js';

describe('OGM-Slim Hybrid Memory Ranking & Direct Symbol Linking', () => {
  let tempDir: string;
  let dbManager: DatabaseManager;
  let memoryService: MemoryService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-hybrid-test-'));
    const dbPath = path.join(tempDir, 'test_hybrid.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('hybrid-proj', 'secret');
    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    memoryService = new MemoryService(memoryRepo);
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should link memory directly to a symbol key', () => {
    const mem = memoryService.commit(
      'hybrid-proj',
      'bugfix',
      {
        summary: 'Fixed JWT token expired claim',
        fix: 'Add 60s clock skew allowance in verifyToken',
      },
      1.0,
      [],
      undefined,
      'src/auth/jwt.ts:verifyToken'
    );

    assert.equal(mem.memory.target_symbol_key, 'src/auth/jwt.ts:verifyToken');

    const recalled = memoryService.recall({
      project_id: 'hybrid-proj',
      target_symbol_key: 'src/auth/jwt.ts:verifyToken',
    });

    assert.equal(recalled.length, 1);
    assert.equal(recalled[0].id, mem.memory.id);
    assert.equal(recalled[0].target_symbol_key, 'src/auth/jwt.ts:verifyToken');
  });

  test('should rank memories using composite hybrid score (BM25 + Confidence + Recency)', () => {
    const mem1 = memoryService.commit(
      'hybrid-proj',
      'decision',
      { summary: 'Use PostgreSQL for database storage', text: 'Database engine choice' },
      0.5
    );

    const mem2 = memoryService.commit(
      'hybrid-proj',
      'bugfix',
      { summary: 'Use SQLite WAL mode for high concurrency database engine', text: 'Database engine lock fix' },
      1.0
    );

    const results = memoryService.recall({
      project_id: 'hybrid-proj',
      query: 'Database engine SQLite',
    });

    assert.ok(results.length >= 2);
    // Mem2 should rank higher due to higher confidence (1.0 vs 0.5) and closer BM25 match
    assert.equal(results[0].id, mem2.memory.id);
    assert.ok(results[0].score > results[1].score);
  });

  test('should auto-supersede previous memory when supersedes_id is provided', () => {
    const oldMem = memoryService.commit('hybrid-proj', 'decision', { summary: 'Use REST API v1' }, 0.8);
    assert.equal(oldMem.memory.status, 'active');

    const newMem = memoryService.commit(
      'hybrid-proj',
      'decision',
      { summary: 'Use GraphQL and Hono REST API v2', supersedes_id: oldMem.memory.id },
      1.0
    );

    // Verify old memory status changed to invalidated
    const oldDetail = memoryService.inspect('hybrid-proj', oldMem.memory.id);
    assert.ok(oldDetail);
    assert.equal(oldDetail.memory.status, 'invalidated');
    assert.equal(oldDetail.feedback.length, 1);
    assert.equal(oldDetail.feedback[0].kind, 'superseded');

    // Recall should only return the new active memory
    const activeMems = memoryService.recall({ project_id: 'hybrid-proj', query: 'REST API' });
    assert.equal(activeMems.length, 1);
    assert.equal(activeMems[0].id, newMem.memory.id);
  });

  test('should export and import memories and episodes with fidelity', () => {
    const ep = memoryService.observe('hybrid-proj', 'error', 'Network timeout');
    const mem = memoryService.commit('hybrid-proj', 'bugfix', { summary: 'Set HTTP timeout to 30s' }, 0.95, [
      { episode_id: ep.episode.id, purpose: 'evidence' },
    ]);

    const exported = memoryService.exportData('hybrid-proj');
    assert.equal(exported.memories.length, 1);
    assert.equal(exported.episodes.length, 1);
    assert.equal(exported.references.length, 1);

    // Import into a new project
    dbManager.ensureDefaultProject('imported-proj', 'key');
    const importRes = memoryService.importData('imported-proj', exported);
    assert.equal(importRes.importedMemories, 1);
    assert.equal(importRes.importedEpisodes, 1);

    const importedMems = memoryService.recall({ project_id: 'imported-proj', text: 'HTTP timeout' });
    assert.equal(importedMems.length, 1);
    assert.equal(importedMems[0].content.summary, 'Set HTTP timeout to 30s');
    assert.equal(importedMems[0].confidence, 0.95);
  });
});
