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
import { createMcpServer } from '../src/mcp/server.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('OGM-Slim MCP Server', () => {
  let tempDir: string;
  let dbManager: DatabaseManager;
  let mcpServer: any;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogm-slim-mcp-'));
    const dbPath = path.join(tempDir, 'test_mcp.db');
    dbManager = new DatabaseManager(dbPath, true);
    dbManager.ensureDefaultProject('mcp-proj', 'secret');

    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    const codebaseRepo = new CodebaseRepository(dbManager.getRawDb());

    const memoryService = new MemoryService(memoryRepo);
    const codebaseService = new CodebaseService(codebaseRepo);

    mcpServer = createMcpServer(memoryService, codebaseService, 'mcp-proj');
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should list all 12 MCP tools including datasets', async () => {
    const handler = (mcpServer as any)._requestHandlers.get(ListToolsRequestSchema.shape.method.value);
    assert.ok(handler);
    const result = await handler({ method: 'tools/list', params: {} });
    assert.equal(result.tools.length, 12);

    const toolNames = result.tools.map((t: any) => t.name);
    assert.ok(toolNames.includes('memory_recall'));
    assert.ok(toolNames.includes('memory_observe'));
    assert.ok(toolNames.includes('memory_commit'));
    assert.ok(toolNames.includes('memory_feedback'));
    assert.ok(toolNames.includes('memory_forget'));
    assert.ok(toolNames.includes('memory_inspect'));
    assert.ok(toolNames.includes('codebase_list_datasets'));
    assert.ok(toolNames.includes('codebase_index'));
    assert.ok(toolNames.includes('codebase_find_symbol'));
    assert.ok(toolNames.includes('codebase_call_graph'));
    assert.ok(toolNames.includes('codebase_impact_analysis'));
    assert.ok(toolNames.includes('codebase_file_summary'));
  });

  test('should execute memory_observe and memory_commit via MCP callTool', async () => {
    const handler = (mcpServer as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    assert.ok(handler);

    // 1. Observe
    const obsRes = await handler({
      method: 'tools/call',
      params: {
        name: 'memory_observe',
        arguments: {
          kind: 'command_output',
          observation: { stdout: 'Tests passed 100%' },
          metadata: { file: 'src/main.ts' },
        },
      },
    });

    assert.ok(!obsRes.isError);
    const obsParsed = JSON.parse(obsRes.content[0].text);
    assert.ok(obsParsed.episode.id.startsWith('ep_'));

    // 2. Commit
    const commitRes = await handler({
      method: 'tools/call',
      params: {
        name: 'memory_commit',
        arguments: {
          type: 'procedure',
          content: { summary: 'Use npm test to run suites', command: 'npm test' },
          episodes: [{ episode_id: obsParsed.episode.id, purpose: 'evidence' }],
        },
      },
    });

    assert.ok(!commitRes.isError);
    const commitParsed = JSON.parse(commitRes.content[0].text);
    assert.ok(commitParsed.memory.id.startsWith('mem_'));

    // 3. Recall
    const recallRes = await handler({
      method: 'tools/call',
      params: {
        name: 'memory_recall',
        arguments: {
          text: 'npm test run suites',
        },
      },
    });

    assert.ok(!recallRes.isError);
    const recallParsed = JSON.parse(recallRes.content[0].text);
    assert.equal(recallParsed.length, 1);
    assert.equal(recallParsed[0].id, commitParsed.memory.id);
  });
});
