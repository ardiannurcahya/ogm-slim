# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-17

### Added
- **Automatic Virtualenv & Build Cache Exclusions**: Codebase indexer now automatically excludes:
  - Python virtual environments: `.venv`, `venv`, `env`, `.env`
  - Python test & bytecode caches: `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.tox`, `.ruff_cache`
  - Modern web framework build outputs: `.turbo`, `.nuxt`, `.output`, `.svelte-kit`
  - Rust target build artifacts: `target`
- **Dynamic Configuration Wiring**: Passed `config.codebase.exclude_patterns` into `codebaseService.indexDirectory()` for both CLI `serve` auto-indexing and CLI `index` commands.
- **Unit Tests**: Added automated tests verifying clean exclusion of virtualenv/cache/target directories while ensuring legitimate source files with matching substrings (e.g. `environment.ts`, `target_service.ts`) are correctly indexed.

### Fixed
- **Exact Ignore Pattern Matcher**: Replaced substring-based pattern matching in `walkFiles` with strict name equality and wildcard extension matching (`*.min.js`), preventing accidental omission of valid application source files.

---

## [1.0.0] - 2026-08-14

### Added
- Initial release of **OGM-Slim** (OpenGraphMemory Slim - TypeScript Edition).
- High-speed Tree-Sitter AST parsing for TypeScript, JavaScript, Python, Go, and Rust.
- Persistent operational memory engine with SQLite WAL + FTS5 full-text search.
- Official Model Context Protocol (MCP 1.5) server with 12 tools for AI coding agents.
- Interactive Web Graph Visualizer (Sigma.js & Graphology) for Codebase & Agent Memory Graphs.
- Multi-dataset repository partitioning with zero graph pollution.
- Graph analytics algorithms: Louvain Modularity Community Detection & PageRank Centrality.
