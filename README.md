# 🧠 OGM-Slim (OpenGraphMemory Slim - TypeScript Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Official%20SDK%20(12%20Tools)-purple.svg)](https://modelcontextprotocol.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20%2B%20FTS5-green.svg)](https://sqlite.org/)
[![Visualizer](https://img.shields.io/badge/UI-Interactive%20Graph%20Canvas-black.svg)](http://127.0.0.1:8765/admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OGM-Slim** is an ultra-lightweight, zero-configuration operational memory service and AST codebase knowledge graph engine designed specifically for AI coding agents (**Claude Code**, **Google Antigravity**, **OpenCode**, **Cursor**, **Windsurf**).

---

## ✨ Key Features & Enhancements

- ⚡ **Zero-Config 1-Step Startup**: Run instantly with `ogm-slim serve` or `npm start` on customizable port `8765`.
- 🚀 **Parallel WASM AST Extraction**: Concurrent chunk pool parsing (~1,500+ symbols/sec) with automatic WASM memory deallocation (`tree.delete()`).
- 📁 **Incremental File Hash Caching**: SQLite `codebase_files` table with SHA-1 content hashing & `mtime` change detection for instantaneous incremental index updates.
- 🎯 **Hybrid Retrieval Ranking**: Multi-factor scoring combining BM25 relevance ($60\%$), agent confidence ($25\%$), and exponential recency decay ($15\%$).
- 🔗 **Direct Symbol-Memory Linking**: Anchor durable decisions and bugfixes directly to specific code symbols (`file_path:symbol_name`) with auto-supersede versioning.
- 👁️ **Live Codebase Watcher**: Zero-dependency real-time file watcher (`ogm-slim serve --watch`) that auto re-indexes modified files on save.
- 🗂️ **Multi-Codebase Dataset Isolation**: Index and manage multiple separate repositories in dedicated dataset partitions with zero graph pollution.
- 🧬 **Graph Analytics & Louvain Clustering**: Built-in Louvain Modularity ($Q$) community detection & power-iteration PageRank centrality.
- 🖥️ **Dual Interactive Web Visualizer**:
  - **🌳 Codebase Graph View**: Call hierarchy, community clusters, signatures, and blast radius.
  - **🧠 Agent Memory Graph View**: Durable memories, provenance citation edges, status badges, and raw observation inspect panels.
  - **📸 PNG Snapshot Export**: 1-click high-resolution visualizer export.
- 🔒 **Flexible Authentication**: Open access by default (`OGM_AUTH_ENABLED=false`) or protect with API Key & Session Cookie password for remote VPS deployments.
- 📦 **CLI Backup & Restore**: Seamless data portability with `ogm-slim export` and `ogm-slim import`.
- 🔌 **Official MCP Protocol (12 Tools)**: Fully compliant with `@modelcontextprotocol/sdk` for seamless agent tool invocations over stdio or HTTP.
- 🛠️ **Automated Harness Integration**: 1-command installer for Claude Code, Antigravity, OpenCode, Cursor, and Windsurf.

---

## 🚀 Quick Start

### 1. Run HTTP Server & Web Graph Dashboard
```bash
# Start server with live watcher (auto-indexes repository into dataset)
npx ogm-slim serve --watch

# Open in browser:
# http://127.0.0.1:8765/admin
```

### 2. Configure MCP for Your AI Coding Agent
```bash
# Auto-configure for Google Antigravity / Gemini CLI
npx ogm-slim harness install antigravity --apply

# Auto-configure for Claude Code
npx ogm-slim harness install claude-code --apply

# Auto-configure for OpenCode
npx ogm-slim harness install opencode --apply
```

### 3. CLI Commands
```bash
ogm-slim serve -p 8765 --watch            # Start web server with live file watcher
ogm-slim mcp                              # Run MCP over Stdio
ogm-slim index ./my-repo -d "frontend"    # Index codebase into isolated dataset
ogm-slim export -o backup.json            # Backup agent memories & episodes
ogm-slim import backup.json               # Restore agent memories & episodes
ogm-slim stats                            # Show database metrics
ogm-slim harness print claude             # Print MCP config snippet
```

---

## 🛠️ MCP Tools Overview (12 Tools)

| Category | Tool | Description |
|:---|:---|:---|
| **Memory** | `memory_recall` | Hybrid retrieval (BM25 + Confidence + Recency) or direct symbol lookup |
| **Memory** | `memory_observe` | Persist raw immutable evidence episodes (logs, diffs, outputs) |
| **Memory** | `memory_commit` | Commit durable typed conclusions with supporting episode citations & symbol links |
| **Memory** | `memory_feedback` | Confirm, reject, correct, supersede, or mark memories stale |
| **Memory** | `memory_forget` | Archive, invalidate, or delete memories with audit trails |
| **Memory** | `memory_inspect` | Read complete provenance, evidence, and audit history |
| **Codebase** | `codebase_list_datasets` | List all indexed codebase datasets, files, symbols, and edges |
| **Codebase** | `codebase_index` | Parallel AST scanning and symbol graph generation into a dataset |
| **Codebase** | `codebase_find_symbol` | Search functions, classes, structs, interfaces within a dataset |
| **Codebase** | `codebase_call_graph` | Trace 1-3 hop callers and callees within a dataset |
| **Codebase** | `codebase_impact_analysis` | Downstream blast radius, affected files, and related memories for a symbol |
| **Codebase** | `codebase_file_summary` | High-density architectural summary and linked agent memories of a file |

---

## 📊 Performance & Memory Footprint

| Metric | Measurement |
|:---|:---|
| **Idle Memory (Node.js + SQLite)** | ~40 MB – 65 MB RSS |
| **Indexing Active Memory** | ~120 MB – 180 MB peak (WASM memory garbage collected immediately) |
| **Indexing Speed** | ~1,500+ symbols / sec across multi-core parallel chunks |
| **Search / Recall Latency** | < 2 ms (SQLite FTS5 + in-memory ranking) |
| **Recommended Environment** | Runs smoothly on any 512MB–1GB RAM VPS (Linux, macOS, Windows) |

---

## 📄 License
MIT License. Created by [Ardian Nurcahya](https://github.com/ardiannurcahya).
