import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseManager } from '../src/db/database.js';
import { CodebaseRepository } from '../src/db/repositories/codebase.repo.js';
import { CodebaseService } from '../src/services/codebase.service.js';

describe('OGM-Slim Codebase AST & Graph Operations', () => {
  let tempDir: string;
  let dbManager: DatabaseManager;
  let codebaseService: CodebaseService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-slim-codebase-'));
    const dbPath = path.join(tempDir, 'test_codebase.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('code-proj', 'secret');
    const codebaseRepo = new CodebaseRepository(dbManager.getRawDb());
    codebaseService = new CodebaseService(codebaseRepo);

    // Create sample codebase files for frontend & backend datasets
    const feDir = path.join(tempDir, 'frontend');
    const beDir = path.join(tempDir, 'backend');
    fs.mkdirSync(feDir, { recursive: true });
    fs.mkdirSync(beDir, { recursive: true });

    fs.writeFileSync(
      path.join(feDir, 'app.ts'),
      `
      export function renderApp(): void {
        fetchUser();
      }
      export function fetchUser(): void {}
      `
    );

    fs.writeFileSync(
      path.join(beDir, 'server.ts'),
      `
      export function startServer(): void {
        handleAuth();
      }
      export function handleAuth(): void {}
      `
    );
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should index directory and resolve cross-file call graph', async () => {
    const stats = await codebaseService.indexDirectory(path.join(tempDir, 'backend'), 'code-proj', 'backend');
    assert.equal(stats.filesIndexed, 1);
    assert.equal(stats.symbolsCount, 2);
    assert.equal(stats.edgesCount, 1);

    // Find symbols
    const symbols = codebaseService.findSymbols('code-proj', 'backend', 'handleAuth');
    assert.equal(symbols.length, 1);
    assert.equal(symbols[0].name, 'handleAuth');

    // Call graph for startServer
    const startSym = codebaseService.findSymbols('code-proj', 'backend', 'startServer')[0];
    const callGraph = codebaseService.getCallGraph('code-proj', startSym.key, 'backend', 'callees', 1);
    assert.ok(callGraph);
    assert.ok(callGraph.callees.includes('handleAuth'));
  });

  test('should isolate multiple datasets cleanly without graph pollution', async () => {
    // 1. Index Frontend dataset
    await codebaseService.indexDirectory(path.join(tempDir, 'frontend'), 'code-proj', 'frontend-app');

    // 2. Index Backend dataset
    await codebaseService.indexDirectory(path.join(tempDir, 'backend'), 'code-proj', 'backend-api');

    // 3. List datasets
    const datasets = codebaseService.listDatasets('code-proj');
    assert.equal(datasets.length, 2);
    assert.equal(datasets[0].name, 'backend-api');
    assert.equal(datasets[1].name, 'frontend-app');

    // 4. Verify isolated graph data for frontend
    const feGraph = codebaseService.getGraphData('code-proj', 'frontend-app');
    assert.equal(feGraph.nodes.length, 2);
    assert.ok(feGraph.nodes.some(n => n.label === 'renderApp'));
    assert.ok(!feGraph.nodes.some(n => n.label === 'startServer'));

    // 5. Verify isolated graph data for backend
    const beGraph = codebaseService.getGraphData('code-proj', 'backend-api');
    assert.equal(beGraph.nodes.length, 2);
    assert.ok(beGraph.nodes.some(n => n.label === 'startServer'));
    assert.ok(!beGraph.nodes.some(n => n.label === 'renderApp'));
  });

  test('should delete dataset cleanly and cascade remove symbols and edges', async () => {
    await codebaseService.indexDirectory(path.join(tempDir, 'frontend'), 'code-proj', 'frontend-app');
    await codebaseService.indexDirectory(path.join(tempDir, 'backend'), 'code-proj', 'backend-api');

    let datasets = codebaseService.listDatasets('code-proj');
    assert.equal(datasets.length, 2);

    const deleted = codebaseService.deleteDataset('code-proj', 'frontend-app');
    assert.equal(deleted, true);

    datasets = codebaseService.listDatasets('code-proj');
    assert.equal(datasets.length, 1);
    assert.equal(datasets[0].name, 'backend-api');

    const feSymbols = codebaseService.findSymbols('code-proj', 'frontend-app');
    assert.equal(feSymbols.length, 0);

    const feGraph = codebaseService.getGraphData('code-proj', 'frontend-app');
    assert.equal(feGraph.nodes.length, 0);
  });
});
