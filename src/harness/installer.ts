import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OgmLwConfig } from '../types/config.js';

export function getSkillContent(): string {
  return `---
name: ogm-slim
description: OpenGraphMemory Slim (OGM-Slim) persistent agent memory and codebase AST knowledge graph. Use to recall past bug fixes, search codebase symbols, inspect call graphs, and commit durable observations.
---

# OGM-Slim Agent Operational Memory & Codebase Graph

OGM-Slim provides persistent, project-scoped operational memory and fast AST codebase search for AI coding agents.

## 🎯 Decision Tree & Workflow

1. **Before Debugging or Refactoring**:
   - Call \`memory_recall\` with error signatures or task description to check if past agents solved similar issues.
   - Call \`codebase_find_symbol\` or \`codebase_file_summary\` to locate functions/classes before reading full files.
   - Call \`codebase_call_graph\` or \`codebase_impact_analysis\` to inspect blast radius before making breaking changes.

2. **During Non-Trivial Work**:
   - Call \`memory_observe\` to log key intermediate evidence (error logs, command outputs, specific diffs).
   - Keep the returned \`episode.id\` for provenance citations.

3. **After Completing a Bug Fix or Solution**:
   - Call \`memory_commit\` with typed content:
     - \`bugfix\`: \`{ summary, root_cause, fix, verification }\`
     - \`decision\`: \`{ decision, rationale, alternatives }\`
     - \`procedure\`: \`{ name, steps, prerequisites }\`
     - \`research\`: \`{ question, finding, sources }\`

## 🛠️ MCP Tools Reference (11 Tools)

| Tool | Purpose | Primary Arguments |
|:---|:---|:---|
| \`memory_recall\` | Recall durable memories by text/metadata | \`text\`, \`exact\`, \`entity_key\`, \`limit\` |
| \`memory_observe\` | Store immutable evidence episode | \`kind\`, \`observation\`, \`metadata\` |
| \`memory_commit\` | Commit permanent conclusion with citations | \`type\`, \`content\`, \`confidence\`, \`episodes\` |
| \`memory_feedback\` | Confirm/reject/supersede/stale memory | \`memory_id\`, \`kind\`, \`detail\` |
| \`memory_forget\` | Archive or invalidate memory | \`memory_id\`, \`mode\` |
| \`memory_inspect\` | Inspect provenance and history | \`memory_id\` |
| \`codebase_index\` | Scan and index repository directory | \`path\`, \`incremental\` |
| \`codebase_find_symbol\` | Find functions, structs, classes, types | \`query\`, \`kind\`, \`file\`, \`limit\` |
| \`codebase_call_graph\` | Trace 1-3 hop callers/callees | \`symbol_key\`, \`direction\`, \`depth\` |
| \`codebase_impact_analysis\` | Downstream blast radius analysis | \`symbol_key\` |
| \`codebase_file_summary\` | High-density file summary and symbols | \`file\` |

## 🌐 Web Visualization UI
Direct interactive Sigma.js graph visualization dashboard is live at:
\`http://127.0.0.1:8080/admin\` or \`http://127.0.0.1:8080/graph\`
`;
}

export function installHarnessConfig(
  harness: 'claude-code' | 'antigravity' | 'opencode' | 'cursor' | 'windsurf' | 'stdio',
  config: OgmLwConfig,
  apply: boolean = false
): { configPath: string; skillPath: string; snippet: string } {
  const home = os.homedir();
  let configPath = '';
  let skillPath = '';
  let snippet = '';

  const mcpServerConfig = {
    command: 'npx',
    args: ['-y', 'ogm-slim', 'mcp'],
    env: {
      OGM_PROJECT_ID: config.auth.default_project_id,
      OGM_API_KEY: config.auth.api_key,
      OGM_DB_PATH: config.database.path,
    },
  };

  switch (harness) {
    case 'claude-code': {
      configPath = path.join(home, '.claude', 'mcp.json');
      skillPath = path.join(home, '.claude', 'skills', 'ogm-slim', 'SKILL.md');
      snippet = JSON.stringify({ mcpServers: { 'ogm-slim': mcpServerConfig } }, null, 2);
      break;
    }
    case 'antigravity': {
      configPath = path.join(home, '.gemini', 'antigravity-cli', 'mcp', 'ogm-slim.json');
      skillPath = path.join(home, '.gemini', 'config', 'skills', 'ogm-slim', 'SKILL.md');
      snippet = JSON.stringify(mcpServerConfig, null, 2);
      break;
    }
    case 'cursor': {
      configPath = path.join(process.cwd(), '.cursor', 'mcp.json');
      skillPath = path.join(process.cwd(), 'SKILL.md');
      snippet = JSON.stringify({ mcpServers: { 'ogm-slim': mcpServerConfig } }, null, 2);
      break;
    }
    case 'opencode': {
      configPath = path.join(home, '.config', 'opencode', 'opencode.jsonc');
      skillPath = path.join(home, '.config', 'opencode', 'skills', 'ogm-slim', 'SKILL.md');
      snippet = JSON.stringify({ mcp: { 'ogm-slim': { type: 'local', ...mcpServerConfig, enabled: true } } }, null, 2);
      break;
    }
    case 'windsurf': {
      configPath = path.join(home, '.codeium', 'windsurf', 'mcp_config.json');
      skillPath = path.join(home, '.codeium', 'windsurf', 'skills', 'ogm-slim', 'SKILL.md');
      snippet = JSON.stringify({ mcpServers: { 'ogm-slim': mcpServerConfig } }, null, 2);
      break;
    }
    default: {
      snippet = JSON.stringify(mcpServerConfig, null, 2);
      break;
    }
  }

  if (apply) {
    if (configPath) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, snippet, 'utf8');
    }
    if (skillPath) {
      fs.mkdirSync(path.dirname(skillPath), { recursive: true });
      fs.writeFileSync(skillPath, getSkillContent(), 'utf8');
    }
  }

  return { configPath, skillPath, snippet };
}
