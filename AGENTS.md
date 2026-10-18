# TobiTests — Agent Roles, Co-Orchestration & Execution Manifest

This document defines the agent topology, dual co-orchestration architecture, shared blackboard protocol, and operational boundaries for the TobiTests ecosystem.

---

## 🤝 Dual Co-Orchestration Architecture (Antigravity + OpenCode)

TobiTests operates on a single local machine through a cooperative **Dual Co-Orchestration Protocol** uniting two specialized engines that share state through a lock-free local blackboard (`web/public/data/antigravity-live.json`):

| Orchestrator Engine | Primary Role | Pipeline Steps Owned | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Antigravity** *(Analytical Brain & Telemetry Judge)* | White-Box Architect, Live MCP Actuator & 3-Oracle Judge | **Steps 1, 2, 3, 4, 7** | Leads repository introspection and route/schema extraction (Steps 1–3), builds the Normalized PRD and Test Matrix (Step 4), dispatches **Explorer QA** via `@playwright/mcp` and **Telemetry Auditor** via `@chromedevtools/chrome-devtools-mcp`, and evaluates traces under the **3 Oracles** to classify bugs (`P0`–`P3`) in Step 7. |
| **OpenCode** *(CLI Execution Arm & Spec Generator)* | Deterministic Code Synthesizer, Native Runner & Self-Healer | **Steps 5, 6, 8** | Consumes the Normalized PRD (`prd-ground-truth.json`) and Test Matrix (`test-matrix.json`) from `workspaces/<project>/`, drives **Spec Writer** to synthesize `.spec.ts` suites (Step 5), executes isolated Playwright runs with `.webm` video and trace capture (Step 6), and performs AST/locator **Selector Self-Healing** (Step 8). |

---

## 👥 Specialized Subagent Matrix

| Agent Role | ID in Office | Primary Focus | Tooling / MCP | Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Orchestrator (Antigravity)** | `orchestrator` | Repository parsing, domain decomposition, 3-Oracle triage & handoff coordination | Filesystem, Code Search, Git, Shared Blackboard | Normalized PRD (`prd-ground-truth.json`), Test Matrix, Task Delegation |
| **Explorer QA** | `explorer` | User journey execution, negative/boundary testing, cross-view state verification | `@playwright/mcp` | Action logs, DOM accessibility snapshots, Layer 2 & 3 divergence findings |
| **Telemetry Auditor** | `telemetry` | Console exception monitoring, network (`>= 400`) & timeout tracking, White-Box root cause | `@chromedevtools/chrome-devtools-mcp` | Layer 1 CDP telemetry reports, P0–P3 bug cards with `root_cause_file` & `root_cause_line` |
| **Spec Writer** | `writer` | Synthesis of validated journeys and bug reproductions into deterministic test code | Filesystem, Playwright Test API | Permanent `specs/<domain>.spec.ts` files, semantic locator fixtures |
| **OpenCode (DeepSeek / CLI)** | `opencode` | Batch spec compilation, CLI test runner execution, AST refactoring & selector self-healing | `@opencode/deepseek`, `npx playwright test`, `scripts/tobitests_cli.py` | Executed run artifacts (`.webm`, `.png`), self-healed locators, updated `<project>-state.json` |

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
* `activeOrchestrator`: `"antigravity" | "opencode"` — Indicates which orchestrator currently owns execution authority.
* `handoffReady`: `boolean` — Set to `true` when the active orchestrator completes its assigned pipeline phase and yields control to its peer.
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
| `npm run audit:run` (`scripts/ingest_playwright_results.py`) | **Steps 6–7**: Executes Playwright (`test-results/report.json`) and automatically updates `web/public/data/<project>-state.json` & `antigravity-live.json` | `npm run audit:run -- --project tobitests --run-playwright` |
| `scripts/run_deep_audit.py` | **Steps 4–7**: Deep multi-oracle audit runner and evidence synthesizer | `python scripts/run_deep_audit.py --project vetconnect --url http://localhost:5173` |
| `npm run dev:all` (`scripts/sync_specs.py --watch`) | **Live UI & Spec Watcher**: Runs the Vite React dashboard concurrently with real-time `.spec.ts` synchronization | `npm run dev:all` |

