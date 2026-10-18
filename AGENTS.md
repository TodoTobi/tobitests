# TobiTests — Agent Roles, Co-Orchestration & Execution Manifest

This document defines the agent topology, dual co-orchestration architecture, shared blackboard protocol, and operational boundaries for the TobiTests ecosystem.

---

## 🤝 Agnostic Agent Architecture & Dual Co-Orchestration Protocol

TobiTests features a **"Bring Your Own Agent" (BYOA)** architecture that operates seamlessly on a single local machine. While the default setup pairs **Antigravity** (as the Analytical Brain) with **OpenCode** (as the Deterministic Runner), the engine is **100% agent-agnostic**:

* **Supported Agent Engines:** `antigravity`, `opencode`, `claude-code`, `cursor`, `codex`, `windsurf`, and `custom` (any custom LLM agent or CI runner).
* **Dynamic Role Swapping:** Any agent can be appointed **Primary Lead** (Steps 1–4, 7) or **Secondary Runner** (Steps 5, 6, 8), and roles can be inverted in real time via the UI or CLI (`--swap-agents`).
* **Solo Mode (Single-Agent Autonomous Execution):** When running in `single` mode (`--mode single` or toggling the UI switch), the primary agent executes all 8 pipeline steps end-to-end without waiting for peer handoffs. The secondary agent enters a standby state (`OFFLINE / STANDBY`) in the office lounge.
* **Automatic Environment Detection:** TobiTests inspects your system PATH, home directory, and repository files (`.cursorrules`, `CLAUDE.md`, `opencode.json`, `CODEX.md`, `.windsurfrules`) to detect which agents are installed and marks them with `[✓ DETECTED]` in the UI and CLI.

| Pipeline Role | Default Agent | Supported Engines | Responsibilities across 8-Step Pipeline |
| :--- | :--- | :--- | :--- |
| **Primary Lead Orchestrator** *(Analytical Brain)* | **Antigravity** | `antigravity`, `claude-code`, `cursor`, `opencode`, `codex`, `windsurf`, `custom` | Leads repository introspection & route/schema extraction (Steps 1–2), builds Normalized PRD (`prd-ground-truth.json`) and Test Matrix (Steps 3–4), dispatches **Explorer QA** & **Telemetry Auditor**, and evaluates traces under the **3 Oracles** (`P0`–`P3`) in Step 7. *(In Solo Mode, also executes Steps 5, 6, 8).* |
| **Secondary Execution Arm** *(Spec Runner)* | **OpenCode** | `opencode`, `claude-code`, `antigravity`, `cursor`, `codex`, `windsurf`, `custom` | Consumes the PRD & Test Matrix, drives **Spec Writer** to compile `.spec.ts` suites (Step 5), executes Playwright with `.webm` video & screenshot capture (Step 6), and performs **Selector Self-Healing** (Step 8). *(In Solo Mode, placed in standby).* |

---

## 👥 Specialized Subagent Matrix

| Agent Role | ID in Office | Primary Focus | Tooling / MCP | Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Orchestrator** | `orchestrator` | Repository parsing, domain decomposition, 3-Oracle triage & handoff coordination | Filesystem, Code Search, Git, Shared Blackboard | Normalized PRD (`prd-ground-truth.json`), Test Matrix, Task Delegation |
| **Explorer QA** | `explorer` | User journey execution, negative/boundary testing, cross-view state verification | `@playwright/mcp` | Action logs, DOM accessibility snapshots, Layer 2 & 3 divergence findings |
| **Telemetry Auditor** | `telemetry` | Console exception monitoring, network (`>= 400`) & timeout tracking, White-Box root cause | `@chromedevtools/chrome-devtools-mcp` | Layer 1 CDP telemetry reports, P0–P3 bug cards with `root_cause_file` & `root_cause_line` |
| **Spec Writer** | `writer` | Synthesis of validated journeys and bug reproductions into deterministic test code | Filesystem, Playwright Test API | Permanent `specs/<domain>.spec.ts` files, semantic locator fixtures |
| **Execution Arm / Runner** | `opencode` | Batch spec compilation, CLI test runner execution, AST refactoring & selector self-healing | `@opencode/deepseek`, `npx playwright test`, `scripts/tobitests_cli.py` | Executed run artifacts (`.webm`, `.png`), self-healed locators, updated `<project>-state.json` |

---

## 📋 Shared Blackboard Synchronization Protocol (`antigravity-live.json`)

To prevent resource contention (such as simultaneous browser port binding or concurrent file writes) on a single machine, **Antigravity** and **OpenCode** synchronize via `web/public/data/antigravity-live.json`, which also drives the real-time 2.5D simulation in [`OfficeScene.tsx`](web/src/components/OfficeScene.tsx) and [`OfficeView.tsx`](web/src/components/OfficeView.tsx).

### 1. Blackboard State Machine (`blackboardState`)
* `idle`: All agents resting in standby / break room; no active browser or CLI lock held.
* `exploring`: **Antigravity** holds the lock; `explorer` and `telemetry` are actively navigating the target app via `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` (Steps 1–4).
* `writing_specs`: **OpenCode** holds the lock (`handoffReady: true` consumed); `writer` and `opencode` are synthesizing `.spec.ts` files and executing isolated Playwright CLI runs (Steps 5–6).
* `auditing_telemetry`: **Antigravity** and `telemetry` evaluate captured `.webm` videos, screenshots, console logs, and network traces against the **3 Oracles** (Step 7).
* `standup_meeting`: Co-orchestration sync in "La Oficina" where all 5 agents gather around the central command table to review P0–P3 bug verdicts and finalize selector self-healing (Step 8).

### 2. Handoff Lock Contract
* `activeOrchestrator`: `"antigravity" | "opencode" | "claude-code" | "cursor" | "codex" | "windsurf" | "custom"` — Indicates which orchestrator currently owns execution authority.
* `handoffReady`: `boolean` — Set to `true` when the active orchestrator completes its assigned pipeline phase and yields control to its peer (always `false` in Solo Mode).
* `currentPipelineStep`: `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8` — Tracks progress across the **8-Step Local Autonomous QA Pipeline**.

---

## 🔒 Operational Constraints & Safety Rules

1. **Isolation First:** Never run exploratory tests against production databases. Ensure target environments use dedicated test fixtures, sqlite in-memory, or seeded staging databases.
2. **Context Window Hygiene:** Explorers and Auditors must report structured summaries and specific failure payloads back to the Orchestrator. Never dump raw full-page HTML strings into the root thread.
3. **Deterministic Selectors:** Spec Writer and OpenCode must prefer accessible semantic selectors (`getByRole`, `getByLabel`, `getByTestId`) over brittle CSS hierarchy or auto-generated utility classes.
4. **No Desktop-Level Overhead:** All browser actions must pass through native browser drivers (Playwright / CDP), strictly avoiding OS-level mouse/coordinate simulation.

---

## 🛠️ Core CLI Commands & Repository-Agnostic Scripts (`scripts/`)

All project-specific artifacts live under `workspaces/<project-slug>/`, keeping root `scripts/` strictly limited to the 4 repository-agnostic core scripts:

| Script / Command | Role in Pipeline | Usage Example |
| :--- | :--- | :--- |
| `npm run audit:init` (`scripts/tobitests_cli.py`) | **Steps 1–4**: White-box codebase discovery, route extraction, `prd-ground-truth.json` & `test-matrix.json` generation, and `projects.json` registration | `npm run audit:init -- --project my-app --repo ../my-app --url http://localhost:3000` |
| `scripts/tobitests_cli.py` *(Agent Orchestration)* | **BYOA Controls**: Configure Primary Lead (`--primary`), Secondary Runner (`--secondary`), Solo Mode (`--mode single`), or Swap Roles (`--swap-agents`) | `python scripts/tobitests_cli.py --primary claude-code --secondary opencode --swap-agents` |
| `npm run audit:run` (`scripts/ingest_playwright_results.py`) | **Steps 6–7**: Executes Playwright (`test-results/report.json`) and automatically updates `web/public/data/<project>-state.json` & `antigravity-live.json` | `npm run audit:run -- --project tobitests --run-playwright` |
| `scripts/run_deep_audit.py` | **Steps 4–7**: Deep multi-oracle audit runner and evidence synthesizer | `python scripts/run_deep_audit.py --project vetconnect --url http://localhost:5173` |
| `npm run dev:all` (`scripts/sync_specs.py --watch`) | **Live UI & Spec Watcher**: Runs the Vite React dashboard concurrently with real-time `.spec.ts` synchronization | `npm run dev:all` |

