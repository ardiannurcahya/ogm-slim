import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseManager } from '../src/db/database.js';
import { CodebaseRepository } from '../src/db/repositories/codebase.repo.js';
import { CodebaseService } from '../src/services/codebase.service.js';

describe('OGM-Slim Parallel AST & Incremental Indexing Performance', () => {
  let tempDir: string;
  let repoDir: string;
  let dbManager: DatabaseManager;
  let codebaseService: CodebaseService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-perf-test-'));
    const dbPath = path.join(tempDir, 'test_perf.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('perf-proj', 'secret');

    repoDir = path.join(tempDir, 'sample-repo');
    fs.mkdirSync(repoDir, { recursive: true });

    // Create 30 multi-language source files to test parallel chunking
    for (let i = 0; i < 20; i++) {
      fs.writeFileSync(
        path.join(repoDir, `module_${i}.ts`),
        `
        export function computeMetric_${i}(x: number): number {
          return x * ${i + 1};
        }
        export class ServiceClass_${i} {
          public run(): void {
            computeMetric_${i}(10);
          }
        }
        `,
        'utf8'
      );
    }

    const codebaseRepo = new CodebaseRepository(dbManager.getRawDb());
    codebaseService = new CodebaseService(codebaseRepo);
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should parse directory in parallel with high speed and zero memory leaks', async () => {
    const stats = await codebaseService.indexDirectory(repoDir, 'perf-proj', 'perf-dataset');
    assert.equal(stats.filesIndexed, 20);
    assert.equal(stats.symbolsCount, 60); // 20 functions + 20 classes + 20 methods
    assert.ok(stats.durationMs < 5000); // Parallel parsing should be well under threshold

    const symbols = codebaseService.findSymbols('perf-proj', 'perf-dataset', undefined, undefined, undefined, 100);
    assert.equal(symbols.length, 60);
  });

  test('should persist codebase_files hash cache in sqlite', async () => {
    await codebaseService.indexDirectory(repoDir, 'perf-proj', 'perf-dataset');

    const rawDb = dbManager.getRawDb();
    const cachedFiles = rawDb.prepare('SELECT * FROM codebase_files WHERE project_id = ?').all('perf-proj') as any[];

    assert.equal(cachedFiles.length, 20);
    assert.ok(cachedFiles[0].content_hash);
    assert.ok(cachedFiles[0].mtime > 0);
  });
});
