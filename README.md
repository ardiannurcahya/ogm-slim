# 🧠 OGM-Slim (OpenGraphMemory Slim - TypeScript Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Official%20SDK%20(12%20Tools)-purple.svg)](https://modelcontextprotocol.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20%2B%20FTS5-green.svg)](https://sqlite.org/)
[![Visualizer](https://img.shields.io/badge/UI-Interactive%20Graph%20Canvas-black.svg)](http://127.0.0.1:8765/admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OGM-Slim** is an ultra-lightweight, zero-configuration operational memory service and AST codebase knowledge graph engine designed specifically for AI coding agents (**Claude Code**, **Google Antigravity**, **OpenCode**, **Cursor**, **Windsurf**).

---

## ✨ Features

- ⚡ **Zero-Config 1-Step Startup**: Run instantly with `ogm-slim serve` or `npm start`.
- 🗄️ **Local SQLite + FTS5**: Super fast, zero network latency, with full-text search, WAL journaling, and immutable episode provenance.
- 🌳 **Multi-Language Tree-sitter WASM Engine**: High-accuracy AST extraction for **TypeScript**, **TSX**, **JavaScript**, **JSX**, **Go**, **Python**, and **Rust** (~280 files/sec, ~1,250 symbols/sec).
- 🗂️ **Multi-Codebase Dataset Isolation**: Index and manage multiple separate repositories in dedicated dataset partitions with zero graph pollution.
- 🧬 **Graph Analytics & Louvain Clustering**: Built-in Louvain Modularity ($Q$) community detection & power-iteration PageRank centrality.
- 🖥️ **Interactive Web Graph Dashboard**: Real-time graph explorer, HUD controls, Inter / JetBrains Mono typography, dataset switcher, and contract inspector.
- 🔌 **Official MCP Protocol (12 Tools)**: Fully compliant with `@modelcontextprotocol/sdk` for seamless agent tool invocations over stdio or HTTP.
- 📦 **Automated Harness Integration**: 1-command installer for Claude Code, Antigravity, OpenCode, Cursor, and Windsurf.

---

## 🚀 Quick Start

### 1. Run HTTP Server & Web Graph Dashboard
```bash
# Start server (auto-indexes current directory into dataset)
npx ogm-slim serve

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
ogm-slim serve -p 8765                    # Start web server & UI
ogm-slim mcp                              # Run MCP over Stdio
ogm-slim index ./my-repo -d "frontend"    # Index codebase into isolated dataset
ogm-slim stats                            # Show database metrics
ogm-slim harness print claude             # Print MCP config snippet
```

---

## 🛠️ MCP Tools Overview (12 Tools)

| Category | Tool | Description |
|:---|:---|:---|
| **Memory** | `memory_recall` | Query active memories with FTS5 BM25 relevance or metadata filters |
| **Memory** | `memory_observe` | Persist raw immutable evidence episodes (logs, diffs, outputs) |
| **Memory** | `memory_commit` | Commit durable typed conclusions with supporting episode citations |
| **Memory** | `memory_feedback` | Confirm, reject, correct, or mark memories stale |
| **Memory** | `memory_forget` | Archive, invalidate, or delete memories with audit trails |
| **Memory** | `memory_inspect` | Read complete provenance, evidence, and audit history |
| **Codebase** | `codebase_list_datasets` | List all indexed codebase datasets, files, symbols, and edges |
| **Codebase** | `codebase_index` | Fast AST scanning and symbol graph generation into a dataset |
| **Codebase** | `codebase_find_symbol` | Search functions, classes, structs, interfaces within a dataset |
| **Codebase** | `codebase_call_graph` | Trace 1-3 hop callers and callees within a dataset |
| **Codebase** | `codebase_impact_analysis` | Downstream blast radius and affected files for a symbol |
| **Codebase** | `codebase_file_summary` | High-density architectural summary of a source file |

---

## 🎨 Interactive Graph Canvas

Navigate to `http://127.0.0.1:8765/admin` to explore:
- **Dataset Switcher**: Toggle between multiple indexed codebases with 1 click.
- **Interactive Force Physics**: Zoom, pan, drag nodes, smooth spring physics, fit-to-screen.
- **Dual Palette Switcher**: Color nodes by **Symbol Kind** (Function, Method, Struct, Class, Interface, Type) or **Louvain Modularity Cluster**.
- **Interactive Inspector**: View type signatures, line numbers, docstrings, PageRank centrality, and click outgoing callee chips to navigate the graph in real-time.

---

## 📄 License
MIT License. Created by [Ardian Nurcahya](https://github.com/ardiannurcahya).
