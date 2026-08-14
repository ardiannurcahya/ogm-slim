#!/usr/bin/env node

import { Command } from 'commander';
import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { DatabaseManager } from './db/database.js';
import { MemoryRepository } from './db/repositories/memory.repo.js';
import { CodebaseRepository } from './db/repositories/codebase.repo.js';
import { MemoryService } from './services/memory.service.js';
import { CodebaseService } from './services/codebase.service.js';
import { createWebServer } from './web/app.js';
import { runMcpStdio } from './mcp/stdio.js';
import { installHarnessConfig } from './harness/installer.js';

const program = new Command();

program
  .name('ogm-slim')
  .description('OpenGraphMemory Slim - Persistent Agent Memory & Codebase Knowledge Graph')
  .version('1.0.0');

// 1. Serve Command
program
  .command('serve')
  .description('Start the OGM-Slim HTTP Server and Sigma.js Graph Web Dashboard')
  .option('-p, --port <number>', 'Port number to listen on', '8080')
  .option('-h, --host <string>', 'Host address to bind to', '127.0.0.1')
  .option('-c, --config <string>', 'Path to config JSON file')
  .option('--project <string>', 'Default project ID', 'default')
  .action(async (options) => {
    const config = loadConfig(options.config);
    if (options.port) config.server.port = parseInt(options.port, 10);
    if (options.host) config.server.host = options.host;
    if (options.project) config.auth.default_project_id = options.project;

    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const rawDb = dbManager.getRawDb();
    dbManager.ensureDefaultProject(config.auth.default_project_id, config.auth.api_key);

    const memoryRepo = new MemoryRepository(rawDb);
    const codebaseRepo = new CodebaseRepository(rawDb);

    const memoryService = new MemoryService(memoryRepo);
    const codebaseService = new CodebaseService(codebaseRepo);

    // Auto-index current directory if enabled
    if (config.codebase.auto_index) {
      try {
        console.log(`[OGM-Slim] ⚡ Auto-indexing repository at ${process.cwd()}...`);
        const stats = codebaseService.indexDirectory(process.cwd(), config.auth.default_project_id);
        console.log(
          `[OGM-Slim] ✅ Indexed ${stats.filesIndexed} files, ${stats.symbolsCount} symbols, ${stats.edgesCount} relations in ${stats.durationMs}ms.`
        );
      } catch (err) {
        console.warn(`[OGM-Slim] ⚠️ Auto-index failed:`, err);
      }
    }

    const app = createWebServer(memoryService, codebaseService, config);

    console.log(`
===============================================================
  🧠 OGM-Slim (OpenGraphMemory Slim - TypeScript Engine)
===============================================================
  HTTP Server:     http://${config.server.host}:${config.server.port}
  Sigma.js Graph:  http://${config.server.host}:${config.server.port}/admin
  Database Path:   ${config.database.path}
  Project ID:      ${config.auth.default_project_id}
===============================================================
`);

    serve({
      fetch: app.fetch,
      port: config.server.port,
      hostname: config.server.host,
    });
  });

// 2. MCP Command
program
  .command('mcp')
  .description('Serve Model Context Protocol (MCP) over Stdio for AI Coding Agents')
  .option('-c, --config <string>', 'Path to config JSON file')
  .action(async (options) => {
    await runMcpStdio(options.config);
  });

// 3. Index Command
program
  .command('index [dirPath]')
  .description('Index a codebase directory into the symbol knowledge graph')
  .option('-p, --project <string>', 'Project ID', 'default')
  .option('-c, --config <string>', 'Path to config JSON file')
  .action(async (dirPath = '.', options) => {
    const config = loadConfig(options.config);
    const projectId = options.project || config.auth.default_project_id;
    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const rawDb = dbManager.getRawDb();

    const codebaseRepo = new CodebaseRepository(rawDb);
    const codebaseService = new CodebaseService(codebaseRepo);

    console.log(`[OGM-Slim] 🔍 Scanning and indexing ${dirPath}...`);
    const stats = codebaseService.indexDirectory(dirPath, projectId);
    console.log(
      `[OGM-Slim] ✅ Done! Indexed ${stats.filesIndexed} files, ${stats.symbolsCount} symbols, ${stats.edgesCount} call edges in ${stats.durationMs}ms.`
    );
  });

// 4. Harness Commands
const harnessCmd = program.command('harness').description('Manage AI agent harness integrations');

harnessCmd
  .command('install [harness]')
  .description('Install MCP server config and SKILL.md for claude-code, antigravity, opencode, cursor, or windsurf')
  .option('--apply', 'Write configuration directly to harness paths')
  .action((harness = 'claude-code', options) => {
    const config = loadConfig();
    const result = installHarnessConfig(harness as any, config, options.apply);
    if (options.apply) {
      console.log(`[OGM-Slim] ✅ Successfully configured ${harness}!`);
      if (result.configPath) console.log(`  Config written to: ${result.configPath}`);
      if (result.skillPath) console.log(`  Skill written to:  ${result.skillPath}`);
    } else {
      console.log(`[OGM-Slim] Preview for ${harness} (use --apply to write):\n`);
      console.log(result.snippet);
    }
  });

harnessCmd
  .command('print [harness]')
  .description('Print MCP configuration snippet for an AI agent harness')
  .action((harness = 'claude-code') => {
    const config = loadConfig();
    const result = installHarnessConfig(harness as any, config, false);
    console.log(result.snippet);
  });

// 5. Stats Command
program
  .command('stats')
  .description('View database metrics and entity counts')
  .option('-p, --project <string>', 'Project ID', 'default')
  .action((options) => {
    const config = loadConfig();
    const projectId = options.project || config.auth.default_project_id;
    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    const stats = memoryRepo.getStats(projectId);
    console.table(stats);
  });

program.parse(process.argv);
