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

  test('should automatically exclude .venv, venv, __pycache__, and target folders during indexing', async () => {
    const pyDir = path.join(tempDir, 'python-project');
    const venvDir = path.join(pyDir, '.venv', 'lib');
    const venv2Dir = path.join(pyDir, 'venv', 'lib');
    const pycacheDir = path.join(pyDir, '__pycache__');
    const targetDir = path.join(pyDir, 'target', 'debug');

    fs.mkdirSync(pyDir, { recursive: true });
    fs.mkdirSync(venvDir, { recursive: true });
    fs.mkdirSync(venv2Dir, { recursive: true });
    fs.mkdirSync(pycacheDir, { recursive: true });
    fs.mkdirSync(targetDir, { recursive: true });

    // Legitimate project source code (including files whose names contain "env", "target", "build")
    fs.writeFileSync(path.join(pyDir, 'main.py'), 'def calculate_metric():\n    return 42\n');
    fs.writeFileSync(path.join(pyDir, 'environment.ts'), 'export function getEnvironmentConfig(): string { return "prod"; }\n');
    fs.writeFileSync(path.join(pyDir, 'target_service.ts'), 'export function executeTargeting(): boolean { return true; }\n');
    fs.writeFileSync(path.join(pyDir, 'env.ts'), 'export function getEnvPort(): number { return 3000; }\n');

    // Virtualenv, cache, and target files that should be excluded
    fs.writeFileSync(path.join(venvDir, 'pip_dep.py'), 'def dependency_lib_fn():\n    pass\n');
    fs.writeFileSync(path.join(venv2Dir, 'site_pkg.py'), 'def site_packages_fn():\n    pass\n');
    fs.writeFileSync(path.join(pycacheDir, 'main.cpython-311.py'), 'def cached_bytecode_fn():\n    pass\n');
    fs.writeFileSync(path.join(targetDir, 'build_artifact.rs'), 'fn target_build_fn() {}\n');

    const stats = await codebaseService.indexDirectory(pyDir, 'code-proj', 'python-project');

    // 4 legitimate files: main.py, environment.ts, target_service.ts, env.ts
    assert.equal(stats.filesIndexed, 4);

    const projectSymbols = codebaseService.findSymbols('code-proj', 'python-project');
    assert.ok(projectSymbols.some((s) => s.name === 'calculate_metric'));
    assert.ok(projectSymbols.some((s) => s.name === 'getEnvironmentConfig'));
    assert.ok(projectSymbols.some((s) => s.name === 'executeTargeting'));
    assert.ok(projectSymbols.some((s) => s.name === 'getEnvPort'));

    // Excluded directory symbols must NOT exist
    const venvSymbols = codebaseService.findSymbols('code-proj', 'python-project', 'dependency_lib_fn');
    assert.equal(venvSymbols.length, 0);

    const pycacheSymbols = codebaseService.findSymbols('code-proj', 'python-project', 'cached_bytecode_fn');
    assert.equal(pycacheSymbols.length, 0);

    const targetSymbols = codebaseService.findSymbols('code-proj', 'python-project', 'target_build_fn');
    assert.equal(targetSymbols.length, 0);
  });
});
