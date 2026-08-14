# 🧠 OGM-LW (OpenGraphMemory Lightweight - TypeScript Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Official%20SDK-purple.svg)](https://modelcontextprotocol.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20%2B%20FTS5-green.svg)](https://sqlite.org/)
[![Sigma.js](https://img.shields.io/badge/Visualizer-Sigma.js%20v3-orange.svg)](https://www.sigmajs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OGM-LW** is a lightweight, zero-configuration operational memory service and AST codebase knowledge graph designed specifically for AI coding agents (**Claude Code**, **Google Antigravity**, **OpenCode**, **Cursor**, **Windsurf**).

---

## ✨ Features

- ⚡ **Zero-Config 1-Step Startup**: Run with `npx ogm-lw serve` or `npm start`.
- 🗄️ **Local SQLite + FTS5**: Super fast, zero network latency, with full-text search and WAL journaling.
- 🌳 **Multi-Language AST Codebase Indexing**: Extracts functions, methods, structs, interfaces, and cross-file call graphs for **TypeScript**, **JavaScript**, **Go**, **Python**, and **Rust**.
- 🕸️ **Interactive Sigma.js v3 Graph**: Circular force-directed layout, degree-based node sizing, neighbor caller/callee glow highlighting, search filters, and symbol contract inspector.
- 🔌 **Official MCP Protocol (11 Tools)**: Fully compliant with `@modelcontextprotocol/sdk` for seamless agent tool invocations over stdio or HTTP.
- 📦 **Automated Harness Integration**: 1-command installer for Claude Code, Antigravity, OpenCode, and Cursor.

---

## 🚀 Quick Start

### 1. Run HTTP Server & Web Graph Dashboard
```bash
# Start server (auto-indexes current directory)
npx ogm-lw serve

# Open in browser:
# http://127.0.0.1:8080/admin
```

### 2. Configure MCP for Your AI Coding Agent
```bash
# Auto-configure for Google Antigravity / Gemini CLI
npx ogm-lw harness install antigravity --apply

# Auto-configure for Claude Code
npx ogm-lw harness install claude-code --apply

# Auto-configure for OpenCode
npx ogm-lw harness install opencode --apply
```

### 3. CLI Commands
```bash
ogm-lw serve -p 8080         # Start web server & UI
ogm-lw mcp                   # Run MCP over Stdio
ogm-lw index .               # Scan and index codebase
ogm-lw stats                 # Show database metrics
ogm-lw harness print claude  # Print MCP config snippet
```

---

## 🛠️ MCP Tools Overview

| Category | Tool | Description |
|:---|:---|:---|
| **Memory** | `memory_recall` | Query active memories with FTS5 or metadata filters |
| **Memory** | `memory_observe` | Persist raw immutable evidence episodes |
| **Memory** | `memory_commit` | Commit durable typed conclusions with citations |
| **Memory** | `memory_feedback` | Confirm, reject, correct, or stale memories |
| **Memory** | `memory_forget` | Archive, invalidate, or delete memories |
| **Memory** | `memory_inspect` | Read complete provenance, evidence, and audit logs |
| **Codebase** | `codebase_index` | Fast AST scanning and symbol graph generation |
| **Codebase** | `codebase_find_symbol` | Search functions, classes, structs, interfaces |
| **Codebase** | `codebase_call_graph` | Trace 1-3 hop callers and callees |
| **Codebase** | `codebase_impact_analysis` | Downstream blast radius and affected files |
| **Codebase** | `codebase_file_summary` | High-density architectural summary of a file |

---

## 🎨 Interactive Graph Canvas

Navigate to `http://127.0.0.1:8080/admin` to explore:
- **Interactive Force Physics**: Zoom, pan, drag nodes, relayout.
- **Color-Coded Kinds**: Green for functions, sky blue for methods, red for structs, purple for types, yellow for interfaces.
- **Neighbor Highlighting**: Clicking any node highlights direct callers and callees while dimming unrelated code.
- **Contract Inspector**: View type signatures, line numbers, docstrings, and outgoing calls in real-time.

---

## 📄 License
MIT License. Created by [Ardian Nurcahya](https://github.com/ardiannurcahya).
