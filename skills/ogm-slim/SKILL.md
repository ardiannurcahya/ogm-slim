---
name: ogm-slim
description: OpenGraphMemory Slim (OGM-Slim) persistent agent memory and codebase AST knowledge graph. Use to recall past bug fixes, search codebase symbols, inspect call graphs, and commit durable observations.
---

# OGM-Slim: Agent Operational Memory & AST Codebase Graph

OGM-Slim is a zero-latency, SQLite-backed operational memory service and AST codebase knowledge graph designed for AI coding agents.

---

## 🎯 Agent Decision Tree & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Agent Lifecycle & Workflow                        │
└────────────────────────────────────────────────────────────────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
[1. Codebase & Architecture]                            [2. Operational Memory]
       │                                                       │
  ├── Locate functions/classes                            ├── Check past fixes/decisions
  │   └── codebase_find_symbol                            │   └── memory_recall
  │                                                       │
  ├── High-density file summary                           ├── Save raw intermediate evidence
  │   └── codebase_file_summary                           │   └── memory_observe (get episode_id)
  │                                                       │
  ├── Trace callers & callees (1-3 hops)                  ├── Commit durable verified conclusion
  │   └── codebase_call_graph                             │   └── memory_commit (cite episode_id)
  │                                                       │
  ├── Check blast radius & affected files                 ├── Confirm/correct existing memory
  │   └── codebase_impact_analysis                        │   └── memory_feedback
  │                                                       │
  └── Multi-repo partitions                               └── Audit provenance & citation chain
      └── codebase_list_datasets                              └── memory_inspect
```

---

## 🧠 Part 1: Agent Operational Memory Lifecycle

OGM-Slim separates **raw evidence** (*Episodes*) from **durable conclusions** (*Memories*) with immutable provenance citations.

### 1. `memory_recall` (Call at Start of Any Task)
Search past agent solutions, bugfixes, architectural decisions, and preferences before writing code.
* **When to use**: Whenever starting a task, encountering an error, or making architectural decisions.
* **Parameters**:
  - `text` *(string)*: Natural language search query (e.g. `"sqlite database lock issue"`, `"jwt token refresh logic"`).
  - `exact` *(object, optional)*: Key-value metadata filter (e.g. `{"file": "src/db.ts"}`).
  - `entity_key` *(string, optional)*: Specific symbol or component key.
  - `limit` *(integer, default 10)*: Maximum memories to return.

### 2. `memory_observe` (Capture Raw Evidence Episodes)
Record raw, immutable evidence episodes during problem investigation (e.g. compiler errors, command outputs, diffs).
* **When to use**: Immediately after running a command, getting an error trace, or inspecting key diffs.
* **Parameters**:
  - `kind` *(string, required)*: `observation` | `command_output` | `error` | `file` | `code` | `tool_result` | `message`
  - `observation` *(any, required)*: Raw text, log output, or JSON payload.
  - `metadata` *(object, optional)*: Context like `{"repository": "my-app", "file": "src/auth.ts", "command": "npm test"}`.
  - `idempotency_key` *(string, optional)*: Unique key to prevent duplicate episodes.
* **Returns**: `{ episode: { id: "ep_..." } }` ➔ **Save this `id` for citations in `memory_commit`!**

### 3. `memory_commit` (Commit Permanent Typed Solution)
Commit a structured conclusion backed by cited observation episodes.
* **When to use**: After successfully fixing a bug, making an architectural decision, or completing a verified procedure.
* **Parameters**:
  - `type` *(string, required)*:
    - `bugfix`: Root cause, fix, and verification.
    - `decision`: Architectural choice, rationale, and alternatives considered.
    - `procedure`: Step-by-step verified workflow or runbook.
    - `research`: Findings, benchmarks, and external references.
    - `preference`: Project conventions or coding guidelines.
    - `learning`: Key insight or API quirk discovered.
  - `content` *(object, required)*: Structured payload. Examples:
    ```json
    // Bugfix payload
    {
      "summary": "Fixed SQLite busy lock with WAL mode",
      "root_cause": "Concurrent writes blocked in DELETE journal mode",
      "fix": "Set PRAGMA journal_mode = WAL and busy timeout = 5000ms",
      "verification": "All 16 unit tests passed without deadlock"
    }
    ```
    ```json
    // Decision payload
    {
      "decision": "Use Hono for ultra-lightweight REST endpoints",
      "rationale": "Zero external dependencies, fast startup, small memory footprint (<50MB)",
      "alternatives_considered": ["Express", "Fastify"]
    }
    ```
  - `confidence` *(number, 0.0 - 1.0)*: Confidence level (default 1.0).
  - `episodes` *(array of objects)*: Cited supporting episodes:
    ```json
    [{ "episode_id": "ep_123abc", "purpose": "evidence" }]
    ```

### 4. `memory_feedback` (Maintain Memory Quality)
Confirm, update, or stale existing memories as codebase evolves.
* **When to use**: When a past memory worked well, or when code changes render an old memory obsolete.
* **Parameters**:
  - `memory_id` *(string, required)*: Target memory ID (`mem_...`).
  - `kind` *(string, required)*: `confirm` | `reject` | `correct` | `supersede` | `stale` | `verified`
  - `detail` *(object, optional)*: Notes explaining the feedback.

### 5. `memory_inspect` (Deep Provenance Audit)
Inspect complete memory history, cited episodes, feedback, and audit timeline.
* **Parameters**: `memory_id` *(string)*

### 6. `memory_forget` (Archive / Invalidate)
Archive or invalidate outdated memories so they no longer appear in future recall searches.
* **Parameters**:
  - `memory_id` *(string, required)*
  - `mode` *(string, default "archive")*: `archive` | `invalidate` | `hard_delete`

---

## 🌳 Part 2: Codebase AST Knowledge Graph

Search, inspect, and analyze codebase structure without consuming excessive LLM token context.

| Tool | Purpose | Primary Parameters |
|:---|:---|:---|
| `codebase_list_datasets` | List indexed repositories/modules | (none) |
| `codebase_index` | Scan & index repository into AST graph | `path`, `dataset`, `incremental` |
| `codebase_find_symbol` | Search functions, classes, structs, interfaces | `query`, `kind`, `file`, `limit` |
| `codebase_call_graph` | Trace callers & callees (1–3 hops) | `symbol_key`, `direction`, `depth` |
| `codebase_impact_analysis` | Downstream blast radius & affected files | `symbol_key` |
| `codebase_file_summary` | Structural symbol & signature summary of a file | `file` |

---

## 🌐 Web Dashboard & Interactive Graph Canvas

Access the visual web dashboard at `http://127.0.0.1:8765/admin`:
* **Mode 1 — 🌳 Codebase Graph**: Interactive ForceAtlas2 physics canvas, Symbol Explorer, and Contract Inspector.
* **Mode 2 — 🧠 Agent Memory Graph**: Visual map connecting durable typed memories to cited evidence episodes with clickable provenance navigation chips.
