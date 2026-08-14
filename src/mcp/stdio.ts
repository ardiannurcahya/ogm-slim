import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';
import { MemoryService } from '../services/memory.service.js';
import { CodebaseService } from '../services/codebase.service.js';
import { loadConfig } from '../config.js';
import { DatabaseManager } from '../db/database.js';
import { MemoryRepository } from '../db/repositories/memory.repo.js';
import { CodebaseRepository } from '../db/repositories/codebase.repo.js';

export async function runMcpStdio(customConfigPath?: string): Promise<void> {
  const config = loadConfig(customConfigPath);
  const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
  const rawDb = dbManager.getRawDb();

  const memoryRepo = new MemoryRepository(rawDb);
  const codebaseRepo = new CodebaseRepository(rawDb);

  const memoryService = new MemoryService(memoryRepo);
  const codebaseService = new CodebaseService(codebaseRepo);

  const server = createMcpServer(memoryService, codebaseService, config.auth.default_project_id);
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error(`[OGM-LW MCP] Connected over stdio for project: ${config.auth.default_project_id}`);
}
