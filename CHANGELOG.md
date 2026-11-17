# Changelog

All notable changes to TobiTests are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-11-17

### Added
- **Native MCP server** (`scripts/tobitests_mcp.py`): expose TobiTests tools over the Model Context Protocol for Antigravity, Claude Code, and any MCP-compatible agent
- **CLI entrypoint** (`scripts/tobitests_cli.py`): `tobitests --help` for workspace bootstrap and pipeline runs from any directory
- **Python packaging** (`pyproject.toml`): installable via `pip install tobitests`; exposes `tobitests` and `tobitests-mcp` console scripts
- **`.mcp.json`**: zero-config MCP registration for Playwright, Chrome DevTools, and the TobiTests server
- **Bilingual documentation**: `README.md` (English) and `README.es.md` (Spanish) with 60-second quickstart section
- **GitHub Actions CI** (`.github/workflows/test.yml`): Python pytest, TypeScript typecheck, Vite build, and Playwright E2E on every push
- **Issue templates**: bug report and feature request (`.github/ISSUE_TEMPLATE/`)
- **Pull request template** (`.github/PULL_REQUEST_TEMPLATE.md`)
- **Path normalization**: all workspace state files and test reports sanitize absolute local paths to relative equivalents before serialization
- **`tests/test_packaging_and_entrypoints.py`**: unit coverage for CLI/MCP bootstrap, path normalization, and pyproject contract
- **3-Layer Bug Detection Oracle**: runtime error classification (Console, Network, Visual) with Gherkin scenario output
- **Virtual Ghost Cursor** telemetry integration for human-realistic interaction simulation
- **2.5D Agent Office** web UI: real-time workspace dashboard rendered with Vite + React

### Changed
- Workspace `prd-ground-truth.json` files no longer store absolute local paths — `repoPath` is now relative (`"."` or `"../project-name"`)
- `ingest_playwright_results.py` sanitizes all absolute paths in ingested report JSON before writing state files

### Fixed
- `specs/tobitests-run-detail.spec.ts`: removed hardcoded personal local repository path
- `web/src/hooks/useTobiState.ts`: removed hardcoded personal local default path (uses relative `../vetconnect` fallback)
- `web/public/data/vetconnect-state.json`: sanitized all absolute paths in error messages and stack traces

[1.0.0]: https://github.com/TodoTobi/tobitests/releases/tag/v1.0.0
