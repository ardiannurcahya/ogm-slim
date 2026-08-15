---
name: ogm-slim
description: OpenGraphMemory Slim (OGM-Slim) persistent agent memory and codebase AST knowledge graph. Use to recall past bug fixes, search codebase symbols, inspect call graphs, and commit durable observations.
---

# OGM-Slim: OpenGraphMemory Slim (TypeScript Edition)

OGM-Slim is a zero-latency, SQLite-backed operational memory service and AST codebase knowledge graph designed for AI coding agents.

## 🎯 When to Use Which Tool

```
┌────────────────────────────────────────────────────────┐
│             Agent Decision Tree & Workflow             │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
[Codebase & Architecture]               [Memory & Solutions]
       │                                       │
  ├── Locate functions/classes            ├── Check past fixes/decisions
  │   └── codebase_find_symbol            │   └── memory_recall
  │                                       │
  ├── High-density file summary           ├── Save intermediate evidence
  │   └── codebase_file_summary           │   └── memory_observe
  │                                       │
  ├── Check callers & callees             ├── Commit verified solution
  │   └── codebase_call_graph             │   └── memory_commit
  │                                       │
  └── Blast radius & impacted files       └── Audit provenance
      └── codebase_impact_analysis            └── memory_inspect
```

---

## 🛠️ MCP Tools Reference (12 Tools)

### 1. `memory_recall`
Recall durable memory capsules using natural language semantic matching or exact metadata filters.
- **Parameters**:
  - `text` *(string, optional)*: Query string (e.g. `"sqlite database lock issue"`).
  - `exact` *(object, optional)*: Key-value filters (e.g. `{"file": "src/db.ts"}`).
  - `entity_key` *(string, optional)*: Specific symbol or entity key.
  - `limit` *(integer, default 10)*: Maximum memories to return.

### 2. `memory_observe`
Persist an immutable, redacted evidence episode (e.g. error trace, test failure output, git diff).
- **Parameters**:
  - `kind` *(string, required)*: `observation` | `command_output` | `error` | `file` | `code` | `tool_result` | `message`
  - `observation` *(any, required)*: Raw observation payload or text.
  - `metadata` *(object, optional)*: Context like `{"repository": "ogm-slim", "file": "src/cli.ts"}`.
  - `idempotency_key` *(string, optional)*: Deduplication key.

### 3. `memory_commit`
Commit a durable, typed conclusion backed by cited observation episodes.
- **Parameters**:
  - `type` *(string, required)*: `bugfix` | `decision` | `preference` | `procedure` | `research` | `learning` | `fact`
  - `content` *(object, required)*: Structured conclusion payload:
    ```json
    {
      "summary": "Fixed SQLite busy lock with WAL mode",
      "root_cause": "Concurrent writes blocked in DELETE mode",
      "fix": "Enabled WAL mode and timeout=5000",
      "verification": "npm test passed 100%"
    }
    ```
  - `confidence` *(number, 0.0 - 1.0)*: Confidence score.
  - `episodes` *(array, optional)*: Array of `[{ "episode_id": "ep_...", "purpose": "evidence" }]`.

### 4. `memory_feedback`
Confirm, reject, correct, or stale an existing memory.
- **Parameters**:
  - `memory_id` *(string, required)*: Target memory ID.
  - `kind` *(string, required)*: `confirm` | `reject` | `correct` | `supersede` | `stale` | `verified`
  - `detail` *(object, optional)*: Explanation.

### 5. `memory_forget`
Archive, invalidate, or permanently delete a memory.
- **Parameters**:
  - `memory_id` *(string, required)*: Target memory ID.
  - `mode` *(string, default "archive")*: `archive` | `invalidate` | `hard_delete`

### 6. `memory_inspect`
Read deep provenance, citation chain, feedback history, and audit log for a memory.
- **Parameters**:
  - `memory_id` *(string, required)*: Target memory ID.

### 7. `codebase_list_datasets`
List all indexed codebase datasets, their file counts, symbols, and relation metrics.
- **Parameters**:
  - *No required parameters*.

### 8. `codebase_index`
Scan and index a directory into the AST symbol graph.
- **Parameters**:
  - `path` *(string, default ".")*: Root directory to index.
  - `dataset` *(string, optional)*: Custom dataset name.
  - `incremental` *(boolean, default true)*: Run incrementally.

### 9. `codebase_find_symbol`
Find functions, methods, structs, interfaces, and classes without reading entire files.
- **Parameters**:
  - `query` *(string, optional)*: Symbol name or substring.
  - `kind` *(string, optional)*: `function` | `method` | `struct` | `interface` | `type` | `class`
  - `file` *(string, optional)*: File path substring.
  - `limit` *(integer, default 20)*: Max results.

### 10. `codebase_call_graph`
Trace 1 to 3 hops of callers and callees for any symbol.
- **Parameters**:
  - `symbol_key` *(string, required)*: Symbol name or key (e.g. `src/auth.ts:login`).
  - `direction` *(string, default "both")*: `callers` | `callees` | `both`
  - `depth` *(integer, default 1, max 3)*: Traversal depth.

### 11. `codebase_impact_analysis`
Calculate the downstream blast radius and affected files before making changes.
- **Parameters**:
  - `symbol_key` *(string, required)*: Symbol name or key.

### 12. `codebase_file_summary`
Get an instant structural summary of any file (symbols, line ranges, signatures).
- **Parameters**:
  - `file` *(string, required)*: Relative file path.

---

## 🌐 Interactive Web Graph Dashboard

View the interactive Sigma.js knowledge graph canvas in your browser:
- URL: `http://127.0.0.1:8080/admin` or `http://127.0.0.1:8080/graph`
- Features: Force layout physics, zoom/pan, kind badge filters, neighbor glow highlighting, and live contract inspector.
