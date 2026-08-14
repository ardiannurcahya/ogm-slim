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
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-lw-codebase-'));
    const dbPath = path.join(tempDir, 'test_codebase.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('code-proj', 'secret');
    const codebaseRepo = new CodebaseRepository(dbManager.getRawDb());
    codebaseService = new CodebaseService(codebaseRepo);

    // Create sample codebase files
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, 'auth.ts'),
      `
      // Validate user token
      export function validateToken(token: string): boolean {
        return token.length > 0;
      }

      export function login(user: string, pass: string): boolean {
        return validateToken("token");
      }
      `
    );

    fs.writeFileSync(
      path.join(srcDir, 'server.ts'),
      `
      export function startServer(): void {
        login("admin", "pass");
      }
      `
    );
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should index directory and resolve cross-file call graph', async () => {
    const stats = await codebaseService.indexDirectory(tempDir, 'code-proj');
    assert.equal(stats.filesIndexed, 2);
    assert.ok(stats.symbolsCount >= 3);
    assert.ok(stats.edgesCount >= 2);

    // Find symbols
    const symbols = codebaseService.findSymbols('code-proj', 'login');
    assert.equal(symbols.length, 1);
    assert.equal(symbols[0].name, 'login');

    // Call graph for login
    const callGraph = codebaseService.getCallGraph('code-proj', symbols[0].key, 'both', 1);
    assert.ok(callGraph);
    assert.ok(callGraph.callees.includes('validateToken'));
    assert.ok(callGraph.callers.includes('startServer'));

    // Impact analysis for validateToken
    const valTokenSym = codebaseService.findSymbols('code-proj', 'validateToken')[0];
    const impact = codebaseService.getImpactAnalysis('code-proj', valTokenSym.key);
    assert.ok(impact.direct_callers.includes('login'));
    assert.ok(impact.transitive_callers.includes('startServer'));
    assert.ok(impact.blast_radius_score > 0);
  });

  test('should export full Sigma.js graph structure', async () => {
    await codebaseService.indexDirectory(tempDir, 'code-proj');
    const graphData = codebaseService.getGraphData('code-proj');
    assert.ok(graphData.nodes.length >= 3);
    assert.ok(graphData.edges.length >= 2);
  });
});
