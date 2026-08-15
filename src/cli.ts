#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
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
  .option('-p, --port <number>', 'Port number to listen on', '8765')
  .option('-h, --host <string>', 'Host address to bind to', '127.0.0.1')
  .option('-w, --watch', 'Live watch directory and auto re-index on change')
  .option('-c, --config <string>', 'Path to config JSON file')
  .option('--project <string>', 'Default project ID', 'default')
  .option('--dataset <string>', 'Dataset name to auto-index', 'ogm-slim')
  .option('--auth', 'Enable simple authentication for Webview & REST API')
  .option('--no-auth', 'Disable authentication (direct open access without login)')
  .option('--api-key <string>', 'Set API key for authentication')
  .option('--password <string>', 'Set admin password for Webview login')
  .action(async (options) => {
    const config = loadConfig(options.config);
    if (options.port) config.server.port = parseInt(options.port, 10);
    if (options.host) config.server.host = options.host;
    if (options.project) config.auth.default_project_id = options.project;
    if (options.apiKey) config.auth.api_key = options.apiKey;
    if (options.password) config.auth.admin_password = options.password;
    if (options.auth === true) config.auth.enabled = true;
    if (options.auth === false) config.auth.enabled = false;

    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const rawDb = dbManager.getRawDb();
    dbManager.ensureDefaultProject(config.auth.default_project_id, config.auth.api_key);

    const memoryRepo = new MemoryRepository(rawDb);
    const codebaseRepo = new CodebaseRepository(rawDb);

    const memoryService = new MemoryService(memoryRepo);
    const codebaseService = new CodebaseService(codebaseRepo);

    // Auto-index current directory if enabled
    const dsName = options.dataset || 'ogm-slim';
    if (config.codebase.auto_index) {
      try {
        console.log(`[OGM-Slim] ⚡ Auto-indexing repository at ${process.cwd()} into dataset "${dsName}"...`);
        const stats = await codebaseService.indexDirectory(process.cwd(), config.auth.default_project_id, dsName);
        console.log(
          `[OGM-Slim] ✅ Indexed dataset "${stats.datasetName}" (${stats.filesIndexed} files, ${stats.symbolsCount} symbols, ${stats.edgesCount} relations) in ${stats.durationMs}ms.`
        );
      } catch (err) {
        console.warn(`[OGM-Slim] ⚠️ Auto-index failed:`, err);
      }
    }

    // Live file watcher mode
    if (options.watch) {
      console.log(`[OGM-Slim] 👁️ Live Watch Mode active on ${process.cwd()}...`);
      let debounceTimer: NodeJS.Timeout | null = null;
      try {
        fs.watch(process.cwd(), { recursive: true }, (eventType: string, filename: string | null) => {
          if (!filename) return;
          const fn = String(filename);
          if (fn.includes('node_modules') || fn.includes('.git') || fn.includes('dist') || fn.includes('build') || fn.includes('.cache')) {
            return;
          }
          if (['.ts', '.tsx', '.js', '.jsx', '.go', '.py', '.rs'].some((ext) => fn.endsWith(ext))) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
              try {
                const reStats = await codebaseService.indexDirectory(process.cwd(), config.auth.default_project_id, dsName);
                console.log(`[OGM-Slim] 🔄 Re-indexed on file change (${fn}): ${reStats.symbolsCount} symbols in ${reStats.durationMs}ms`);
              } catch (e) {
                console.warn('[OGM-Slim] Watch re-index error:', e);
              }
            }, 500);
          }
        });
      } catch (e) {
        console.warn('[OGM-Slim] Warning setting up file watcher:', e);
      }
    }

    const app = createWebServer(memoryService, codebaseService, config);

    console.log(`
===============================================================
  🧠 OGM-Slim (OpenGraphMemory Slim - TypeScript Engine)
===============================================================
  HTTP Server:     http://${config.server.host}:${config.server.port}
  Graph Dashboard: http://${config.server.host}:${config.server.port}/admin
  Auth Protection: ${config.auth.enabled ? '🔒 ENABLED (API Key / Password required)' : '🔓 DISABLED (Direct open access)'}
  Watch Mode:      ${options.watch ? '👁️ ACTIVE (Auto-syncs on file changes)' : 'OFF'}
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
  .description('Index a codebase directory into a dedicated dataset knowledge graph')
  .option('-p, --project <string>', 'Project ID', 'default')
  .option('-d, --dataset <string>', 'Dataset name (e.g. frontend, backend, auth)', 'default')
  .option('-c, --config <string>', 'Path to config JSON file')
  .action(async (dirPath = '.', options) => {
    const config = loadConfig(options.config);
    const projectId = options.project || config.auth.default_project_id;
    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const rawDb = dbManager.getRawDb();

    const codebaseRepo = new CodebaseRepository(rawDb);
    const codebaseService = new CodebaseService(codebaseRepo);

    console.log(`[OGM-Slim] 🔍 Scanning and indexing ${dirPath} into dataset "${options.dataset}"...`);
    const stats = await codebaseService.indexDirectory(dirPath, projectId, options.dataset);
    console.log(
      `[OGM-Slim] ✅ Done! Indexed dataset "${stats.datasetName}" (${stats.filesIndexed} files, ${stats.symbolsCount} symbols, ${stats.edgesCount} call edges) in ${stats.durationMs}ms.`
    );
  });

// 4. Export Command
program
  .command('export')
  .description('Export agent memories and provenance evidence to a JSON backup file')
  .option('-o, --output <path>', 'Output JSON file path', 'ogm-memory-export.json')
  .option('-p, --project <string>', 'Project ID', 'default')
  .option('-c, --config <string>', 'Path to config JSON file')
  .action(async (options) => {
    const config = loadConfig(options.config);
    const projectId = options.project || config.auth.default_project_id;
    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    const memoryService = new MemoryService(memoryRepo);

    const exportData = memoryService.exportData(projectId);
    const outPath = path.resolve(options.output);
    fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`[OGM-Slim] 📦 Exported ${exportData.memories.length} memories & ${exportData.episodes.length} episodes to ${outPath}`);
  });

// 5. Import Command
program
  .command('import <filePath>')
  .description('Import agent memories from a JSON backup file')
  .option('-p, --project <string>', 'Target project ID', 'default')
  .option('-c, --config <string>', 'Path to config JSON file')
  .action(async (filePath, options) => {
    const config = loadConfig(options.config);
    const projectId = options.project || config.auth.default_project_id;
    const dbManager = new DatabaseManager(config.database.path, config.database.auto_migrate);
    const memoryRepo = new MemoryRepository(dbManager.getRawDb());
    const memoryService = new MemoryService(memoryRepo);

    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[OGM-Slim] ❌ File not found: ${fullPath}`);
      process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const result = memoryService.importData(projectId, raw);
    console.log(`[OGM-Slim] ✅ Successfully imported ${result.importedMemories} new memories and ${result.importedEpisodes} episodes into project "${projectId}"!`);
  });

// 6. Harness Commands
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

// 7. Stats Command
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

    console.log(`\n📊 [OGM-Slim] Project Metrics: "${projectId}"`);
    console.table([
      {
        'Project ID': stats.project_id,
        'Active Memories': stats.memories_count,
        'Evidence Episodes': stats.episodes_count,
        'Total Symbols': stats.symbols_count,
        'Total Datasets': stats.datasets.length,
      },
    ]);

    if (stats.datasets && stats.datasets.length > 0) {
      console.log(`\n🗂️ [OGM-Slim] Codebase Datasets Breakdown:`);
      console.table(stats.datasets);
    }
  });

program.parse(process.argv);
