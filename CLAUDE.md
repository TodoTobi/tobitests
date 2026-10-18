# TobiTests — Claude Code & Autonomous Agent Guidance

When working within this repository or utilizing TobiTests protocols to audit any external project:
- Follow `AGENT_INSTRUCTIONS.md` and `AGENTS.md` strictly for test generation, dual co-orchestration, and autonomous QA.
- Prefer `@playwright/mcp` for browser actuation and `@chromedevtools/chrome-devtools-mcp` for network/console diagnostics.
- Write permanent tests into `specs/` or `workspaces/<project>/specs/` using Playwright best practices (web-first assertions, semantic locators, zero arbitrary timeouts).

## Core CLI Commands (`package.json`)

- **Initialize & Scaffold a Target Project Workspace:**
  ```bash
  npm run audit:init -- --project <slug> --repo <path_to_repo> --url <http://localhost:PORT>
  ```
- **Run Playwright E2E Suite & Auto-Ingest Results into UI State:**
  ```bash
  npm run audit:run -- --project <slug> --run-playwright
  ```
- **Ingest Existing Playwright JSON Report (`test-results/report.json`) into Dashboard:**
  ```bash
  python scripts/ingest_playwright_results.py --project <slug>
  ```
- **Launch Full Dashboard + Live Spec Sync Daemon:**
  ```bash
  npm run dev:all
  ```
- **Appoint Claude Code as Primary Lead Orchestrator:**
  ```bash
  python scripts/tobitests_cli.py --primary claude-code --secondary opencode
  ```
- **Run in Single-Agent Solo Mode (Claude Code owns Steps 1–8):**
  ```bash
  python scripts/tobitests_cli.py --primary claude-code --mode single
  ```
- **Invert Roles (Swap Primary & Secondary):**
  ```bash
  python scripts/tobitests_cli.py --swap-agents
  ```

## Shared Blackboard Synchronization (`web/public/data/antigravity-live.json`)

Before and during every pipeline step (Steps 1–8), update `web/public/data/antigravity-live.json` (`activeOrchestrator`, `blackboardState`, `handoffReady`, `currentPipelineStep`, and `agents[].currentTask`) so the 2.5D Office View (`OfficeView.tsx`) and TestSprite Journey Canvas (`JourneyCanvas.tsx`) reflect real-time agent activity and braille progress spinners.
