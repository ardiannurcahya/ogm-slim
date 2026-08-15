# 🧠 OGM-Slim (OpenGraphMemory Slim)

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/ogm-slim.svg?color=blue)](https://www.npmjs.com/package/ogm-slim)
[![CI Status](https://github.com/ardiannurcahya/ogm-slim/actions/workflows/ci.yml/badge.svg)](https://github.com/ardiannurcahya/ogm-slim/actions)
[![GitHub Pages](https://img.shields.io/badge/Docs%20%26%20Demo-GitHub%20Pages-0284c7.svg)](https://ardiannurcahya.github.io/ogm-slim/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Official%20SDK%20(12%20Tools)-purple.svg)](https://modelcontextprotocol.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20%2B%20FTS5-green.svg)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Persistent Operational Memory & AST Codebase Knowledge Graph Engine for AI Coding Agents**

[Website & Live Demo](https://ardiannurcahya.github.io/ogm-slim/) &bull; [NPM Package](https://www.npmjs.com/package/ogm-slim) &bull; [MCP Specification](https://modelcontextprotocol.io/)

</div>

---

## 📖 Overview

**OGM-Slim** is an ultra-lightweight, zero-configuration local service that equips AI coding agents (**Claude Desktop**, **Claude Code**, **Google Antigravity**, **Cursor**, **Windsurf**, **OpenCode**) with **permanent operational memory** and a **cross-file AST knowledge graph**.

### Why OGM-Slim?
- 🧠 **Eliminate AI Amnesia**: Traditional AI agents forget bug fixes, architectural decisions, and runbooks when the chat session ends. OGM-Slim persists both raw execution episodes and distilled solutions in a local SQLite database.
- 🕸️ **Deterministic Code Understanding**: Vector RAG chunks loose text without understanding call hierarchies. OGM-Slim builds a deterministic call graph (functions, methods, structs, interfaces, callers/callees) using Tree-Sitter.
- ⚡ **100% Local & Fast**: Zero external cloud vector databases, zero API keys required. Single-file SQLite Write-Ahead-Logging (WAL) with sub-5ms query and search latency.

---

## ✨ Key Features

- ⚡ **Zero-Config Startup**: Run instantly via `npx ogm-slim serve` or install globally via `npm install -g ogm-slim`.
- 🚀 **Parallel Tree-Sitter AST Parsing**: High-speed worker thread pool parsing (~1,500+ symbols/sec) with automatic WASM memory deallocation.
- 📁 **Incremental File Hash Caching**: SQLite `codebase_files` table with SHA-1 content hashing & `mtime` change detection for instantaneous incremental updates.
- 🎯 **Hybrid Retrieval Ranking**: Multi-factor ranking combining **BM25 text relevance ($60\%$)**, **Agent confidence ($25\%$)**, and **Exponential recency decay ($15\%$)**.
- 🔗 **Direct Symbol-Memory Anchoring**: Link durable solutions directly to code symbol keys (`file_path:symbol_name`) with auto-supersede versioning.
- 🗂️ **Multi-Dataset Isolation**: Index and manage multiple separate repositories in dedicated dataset partitions with zero graph pollution.
- 🧬 **Graph Analytics**: Built-in **Louvain Modularity Community Detection** & **PageRank Centrality** to identify core architectural hubs.
- 🖥️ **Interactive Web Visualizer**:
  - **🌳 Codebase Graph View**: Call hierarchy, community clusters, signatures, and blast radius.
  - **🧠 Agent Memory Graph View**: Durable memories, provenance citation edges, and raw observation evidence panels.
- 🔌 **Official Model Context Protocol (12 Tools)**: Standard MCP 1.5 compliance for Claude Desktop, Cursor, Roo-Code, and Antigravity over stdio or HTTP.
- 📱 **Fully Responsive UI**: Optimized for Mobile, Tablet, and Desktop with clean edge-chevron sidebar handles.

---

## 🚀 Quick Start

### 1. Global Installation
```bash
npm install -g ogm-slim
```

### 2. Start the Server & Web Visualizer
```bash
# Start server with live file watcher on port 8765
ogm-slim serve --port 8765 --watch

# Open Web Dashboard in your browser:
# http://localhost:8765/admin
```

### 3. Connect to Claude Desktop

Add OGM-Slim to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ogm-slim": {
      "command": "npx",
      "args": ["-y", "ogm-slim", "mcp"]
    }
  }
}
```

### 4. Connect to Cursor / Windsurf

In **Cursor Settings** &gt; **Features** &gt; **MCP Servers** &gt; **Add New MCP Server**:
- **Name**: `ogm-slim`
- **Type**: `command`
- **Command**: `npx -y ogm-slim mcp`

---

## 💻 CLI Commands

```bash
# Start HTTP Server & Graph Visualizer
ogm-slim serve -p 8765 --watch

# Run MCP Server over Stdio
ogm-slim mcp

# Index local codebase into a named dataset
ogm-slim index ./my-project -d "frontend"

# Export memories and episodes to a JSON backup
ogm-slim export -o backup.json

# Import memories and episodes from a JSON backup
ogm-slim import backup.json

# View database metrics & stats
ogm-slim stats

# Auto-configure MCP harnesses
ogm-slim harness install claude-code --apply
ogm-slim harness install antigravity --apply
ogm-slim harness print claude
```

---

## 🛠️ 12 Native MCP Tools

| Category | Tool Name | Description |
|:---|:---|:---|
| **Memory** | `memory_recall` | Hybrid search (BM25 + Confidence + Recency) or direct symbol lookup |
| **Memory** | `memory_observe` | Persist immutable raw evidence episodes (logs, diffs, outputs) |
| **Memory** | `memory_commit` | Commit durable conclusions with supporting episode citations |
| **Memory** | `memory_feedback` | Confirm, reject, correct, supersede, or mark memories stale |
| **Memory** | `memory_forget` | Archive, invalidate, or delete memories with audit trails |
| **Memory** | `memory_inspect` | Read complete provenance, evidence, and citation history |
| **Codebase** | `codebase_list_datasets`| List all indexed codebase datasets, symbols, and edges |
| **Codebase** | `codebase_index` | Parallel AST scanning and symbol graph generation |
| **Codebase** | `codebase_find_symbol` | Search functions, classes, structs, interfaces within a dataset |
| **Codebase** | `codebase_call_graph` | Trace 1-3 hop callers and callees within a dataset |
| **Codebase** | `codebase_impact_analysis` | Downstream blast radius, affected files, and related memories |
| **Codebase** | `codebase_file_summary` | High-density architectural summary and linked memories of a file |

---

## 🏗️ Architecture & Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Coding Agent                          │
│        (Claude Desktop / Cursor / Antigravity)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ MCP Protocol (12 Tools)
┌──────────────────────────────▼──────────────────────────────┐
│                    OGM-Slim Engine                          │
├──────────────────────────────┬──────────────────────────────┤
│    AST Codebase Graph        │    Bi-Temporal Memory Engine │
│  - Tree-Sitter WASM          │  - Immutable Episodes        │
│  - Cross-File Call Graph     │  - Distilled Memories        │
│  - Louvain Community ($Q$)   │  - Symbol-Anchored Links     │
│  - PageRank Centrality       │  - Hybrid BM25 Ranking       │
├──────────────────────────────┴──────────────────────────────┤
│               Embedded SQLite (WAL + FTS5)                  │
└─────────────────────────────────────────────────────────────┘
```

### Bi-Temporal Memory Schema
- **Episodes (`episodes`)**: Immutable historical evidence logs with raw command outputs, git diffs, and timestamps.
- **Memories (`memories`)**: Distilled architectural conclusions, bug fixes, and runbooks citing specific parent episodes.
- **Symbol Links (`symbol_memories`)**: Links between durable memories and concrete AST symbol keys (`file_path:symbol_name`).
- **FTS5 Index (`fts_memories`)**: Full-text search index powering composite BM25 retrieval.

---

## 📊 Performance Benchmark

| Metric | Value |
|:---|:---|
| **Idle Memory (Node.js + SQLite)** | ~40 MB – 60 MB RSS |
| **Active Indexing Memory** | ~120 MB – 180 MB peak (WASM memory cleared immediately) |
| **AST Indexing Speed** | ~1,500+ symbols / sec across multi-core workers |
| **Search / Recall Latency** | < 2 ms (SQLite FTS5 + in-memory ranking) |
| **System Footprint** | Single portable database file (`~/.ogm/ogm.db`) |

---

## 🧪 Running Tests

```bash
# Run 23 unit tests
npm test

# Build production bundle & TypeScript types
npm run build
```

---

## 📄 License

MIT License &copy; 2026 [Ardian Nurcahya](https://github.com/ardiannurcahya).
