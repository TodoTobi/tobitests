# TobiTests — Daily Operational Manual (Frontend, Full-Stack & Pure Backend/API)

This guide provides the end-to-end operational manual for auditing any **Frontend Web Application**, **Full-Stack System**, or **Pure Backend / REST API / Microservice** using **TobiTests** under the **Dual Co-Orchestration Protocol** (**Antigravity** + **OpenCode**).

---

## ⚡ Quick Reference: Core CLI Commands

| Command | Pipeline Steps | Description |
| :--- | :--- | :--- |
| `npm run audit:init -- --project <slug> --repo <path> --url <url> --scope <frontend\|backend\|fullstack>` | **Steps 1–4** | Scans target repository according to `--scope` (default: `fullstack`), generates or incrementally merges `workspaces/<slug>/prd-ground-truth.json` & `test-matrix.json`, and updates `web/public/data/<slug>-state.json`. |
| `npm run audit:run -- --project <slug> --scope <frontend\|backend\|fullstack> --run-playwright` | **Steps 6–7** | Runs Playwright (`test-results/report.json`), copies screenshots/`.webm` videos to `web/public/evidence/`, incrementally merges test results into `web/public/data/<slug>-state.json`, and syncs `antigravity-live.json`. |
| `python scripts/ingest_playwright_results.py --project <slug> --scope <scope>` | **Step 7** | Incrementally merges an existing `test-results/report.json` into the active project's UI JSON state and updates the shared blackboard. |
| `npm run dev:all` | **Live UI + Sync** | Starts the Vite React dashboard (`http://localhost:5173`) concurrently with the live spec file watcher (`scripts/sync_specs.py --watch`). |
| `npm run build:web` | **Static Export** | Builds the self-contained production bundle (`web/dist`) ready for Vercel or GitHub Pages deployment. |

---

## 🎯 Dynamic Audit Scope (`frontend` | `backend` | `fullstack`) & Incremental Merge

TobiTests allows you to choose and switch the audit scope **both when creating/linking a project AND dynamically after tests have already run**, preserving and merging suites across scopes without losing prior results:

1. **Initial Selection in UI (`+ Agregar Proyecto` Modal) or CLI (`--scope`):**
   - **🖥️ `frontend` (UI & DOM E2E):** Audits visual routes, accessibility tree locators, screenshots, and `.webm` videos via `@playwright/mcp` and `{ page }` fixtures.
   - **⚙️ `backend` (API & HTTP Contracts):** Audits pure REST/GraphQL endpoints, HTTP status codes (`2xx`/`4xx`/`5xx`), latency SLAs (`< 500ms` / `< 3000ms`), RBAC/JWT boundaries, and JSON schemas via Playwright's `APIRequestContext` (`{ request }`) without launching a browser.
   - **🔗 `fullstack` (UI + API Combined — Default):** Audits both frontend user journeys and backend API contracts simultaneously.
2. **Post-Test Hot-Switch (`Scope Switcher` & `⚡ Re-auditar alcance`):**
   - Every view in the web platform (`JourneyCanvas`, `AppHeader`, `Dashboard`, `Suites`, `Test Runs`, `Bug Tracker`, and `Test Specs`) includes the **Segmented Scope Switcher** (`🖥️ Frontend` | `⚙️ Backend API` | `🔗 Full-Stack`) and the **`⚡ Re-auditar alcance`** action button.
   - Switching the scope immediately filters the Journey Canvas nodes/edges, suites, specs, and test drawers, and defaults `TestDetailModal` to **"Traza HTTP / JSON"** when inspecting backend tests or **"Captura"** when inspecting frontend tests.
   - Clicking **`⚡ Re-auditar alcance`** (or running `python scripts/tobitests_cli.py --project <slug> --scope <new_scope>`) **incrementally merges** the newly audited scope into `workspaces/<slug>/prd-ground-truth.json`, `test-matrix.json`, and `web/public/data/<slug>-state.json`—preserving all previously generated UI or API suites.

```bash
# Example: Audit Frontend first, then incrementally add Backend API suites to the same workspace
python scripts/tobitests_cli.py --project my-saas --url http://localhost:3000 --scope frontend
python scripts/tobitests_cli.py --project my-saas --url http://localhost:3000 --scope backend
```

---

## 🤖 Bring Your Own Agent (BYOA) & Dynamic Orchestrator Roster

TobiTests is not locked to a single AI tool. It features a complete **"Bring Your Own Agent" (BYOA)** architecture that lets you choose and combine any agent engines you prefer:

### 1. Supported Agent Catalog (`SUPPORTED_AGENT_ENGINES`)
* **Antigravity (`antigravity`):** Deep analytical brain, live Playwright/CDP MCP actuator, and 3-oracle judge.
* **OpenCode (`opencode`):** Fast CLI deterministic code synthesizer, Playwright test runner, and AST self-healer.
* **Claude Code (`claude-code`):** High-speed terminal agent from Anthropic with native tool-calling and subagent support.
* **Cursor (`cursor`):** Agentic IDE with Composer, deep codebase indexing, and multi-file editing.
* **Codex (`codex`):** OpenAI Codex / CLI automation agent for spec generation and execution.
* **Windsurf (`windsurf`):** Agentic IDE with Cascade multi-step flows and local MCP servers.
* **Custom Agent (`custom`):** Any custom LLM agent or CI runner connected to `antigravity-live.json`.

### 2. Orchestration Modes: Dual Engine vs. Solo Mode
* **Dual Engine Mode (`dual` — Default):** Divides the 8-step pipeline between a **Primary Lead** (Steps 1–4, 7) and a **Secondary Runner** (Steps 5, 6, 8) with lock-free handoffs through `antigravity-live.json`.
* **Solo Mode (`single`):** Perfect if you only have one agent installed (or want a streamlined run). The Primary Agent executes **all 8 steps end-to-end** without waiting for peer handoffs. The secondary agent enters a standby state (`OFFLINE / STANDBY`) in the office lounge.

### 3. Dynamic Role Switching & Swapping
* **From the Web UI ("La Oficina" Bar):**
  - Use the dropdowns in the top bar of "La Oficina" to change the Primary Lead or Secondary Runner on the fly.
  - Click **`⇄ Invert Roles`** to swap Primary and Secondary in 1 click (e.g. promote OpenCode to Primary and Antigravity to Secondary).
  - Click the **`Dual Engine` / `Solo Mode`** toggle pill to activate or deactivate the secondary agent in real time.
* **From the CLI (`scripts/tobitests_cli.py`):**
  ```bash
  # Appoint Claude Code as Primary Lead with OpenCode as Runner
  python scripts/tobitests_cli.py --primary claude-code --secondary opencode

  # Appoint Cursor as Primary Lead in Solo Mode (executes Steps 1–8)
  python scripts/tobitests_cli.py --primary cursor --mode single

  # Invert roles between Primary and Secondary
  python scripts/tobitests_cli.py --swap-agents
  ```

---

## 🌐 Workflow A: Auditing a Frontend or Full-Stack Web App from Scratch

Use this workflow when auditing a React, Next.js, Vue, Nuxt, Angular, or Svelte web application running locally or in a staging environment.

### Step 1 — Bootstrap & Workspace Initialization (Pipeline Steps 1–4)
Run the repository-agnostic initializer pointing to the target repository, its local dev URL, and desired `--scope` (`frontend` or `fullstack`):
```bash
npm run audit:init -- --project my-saas --repo ../my-saas --url http://localhost:3000 --scope fullstack
```
**What happens automatically:**
1. `scripts/tobitests_cli.py` inspects `package.json` and scans source files for frontend routes (`path="/..."`, `to="/..."`) and backend endpoints (`/api/...`).
2. Creates `workspaces/my-saas/prd-ground-truth.json` (Step 3) and `workspaces/my-saas/test-matrix.json` (Step 4).
3. Generates `web/public/data/my-saas-state.json` with `auditScope` persisted.
4. Sets `web/public/data/antigravity-live.json` to `blackboardState: "exploring"` (`activeOrchestrator: "antigravity"`, `auditScope: "fullstack"`).

### Step 2 — Live Exploration & Telemetry Probing (Antigravity + MCPs)
Launch the TobiTests dashboard to watch the 2.5D Office and E2E Journey Canvas in real time:
```bash
npm run dev:all
```
In **Antigravity IDE**, instruct the **Orchestrator** to dispatch **Explorer QA** (`@playwright/mcp`) and **Telemetry Auditor** (`@chromedevtools/chrome-devtools-mcp`) across the routes defined in `workspaces/my-saas/prd-ground-truth.json`. Once exploration finishes, Antigravity sets `handoffReady: true` and `blackboardState: "writing_specs"`.

### Step 3 — Deterministic Spec Synthesis & Execution (OpenCode Steps 5–6)
**OpenCode** (`opencode.json`) reads `workspaces/my-saas/test-matrix.json` and synthesizes permanent `.spec.ts` files inside `specs/` (or `workspaces/my-saas/specs/`). Then execute the suite and automatically bridge the results into the UI:
```bash
npm run audit:run -- --project my-saas --run-playwright
```

### Step 4 — 3-Oracle Triage & Selector Self-Healing (Steps 7–8)
Open `http://localhost:5173`, select **My SaaS** in the top project switcher, and inspect:
- **Mapa de Flujos (`JourneyCanvas.tsx`):** View tri-state node counters (`failed here`, `blocked here`, `tests · touches`), Cubic Bézier flow paths, the live braille HUD (`rm-cap-think`), and the **Scope Switcher** (`🖥️ Frontend` | `⚙️ Backend API` | `🔗 Full-Stack`).
- **Diagnostic Studio (`TestDetailModal.tsx`):** Replay `.webm` videos, inspect step-by-step screenshots or HTTP/JSON traces, and copy the **Plantillas BDD & Cerco de Seguridad** prompt to apply a zero-regression fix.

---

## 🔌 Workflow B: Auditing a Pure Backend / REST API / Microservice

TobiTests natively audits pure Backend/API repositories (Express, Fastify, NestJS, Next.js Route Handlers, FastAPI, Go, etc.) without requiring a browser UI by passing `--scope backend` (or selecting **⚙️ Backend (API & Contratos HTTP)** in the UI modal), leveraging Playwright's `{ request }` (`APIRequestContext`) fixture and [`templates/sample-api.spec.ts`](../templates/sample-api.spec.ts).

### Step 1 — White-Box Controller & Schema Discovery
Initialize the backend workspace pointing `--repo` to the API repository, `--url` to the API base URL, and `--scope backend`:
```bash
npm run audit:init -- --project payments-api --repo ../payments-api --url http://localhost:4000 --scope backend
```
`scripts/tobitests_cli.py` automatically detects Express (`app.get`, `router.post`), Fastify, NestJS (`@Get`, `@Post`), and FastAPI (`@app.get`, `@router.post`) endpoints and marks each node with `category: "API"`.

### Step 2 — Synthesize `{ request }` API Suites (4 Mandatory Suites)
Using [`templates/sample-api.spec.ts`](../templates/sample-api.spec.ts) and [`.agents/spec-writer.md`](../.agents/spec-writer.md), generate `specs/<domain>-api.spec.ts` covering:
1. **Suite 1 — Health, Contract & Schema Validation (`2xx`):** Verifies status `200`/`201`, `content-type: application/json`, required JSON keys, and latency SLA (`< 500ms` health / `< 3000ms` CRUD).
2. **Suite 2 — Negative & Boundary Payload Fuzzing (`4xx`):** Sends malformed JSON, missing fields, negative numbers, and SQLi/XSS strings; asserts structured `400`/`422` validation errors and strictly `status < 500`.
3. **Suite 3 — RBAC, JWT & Security Boundaries (`401` / `403`):** Tests missing tokens, tampered Bearer JWTs, and horizontal/vertical privilege escalation across roles.
4. **Suite 4 — Idempotency & Concurrency / Race Conditions:** Fires parallel `Promise.all` mutations with shared `Idempotency-Key` headers to detect double-spend or race conditions.

### Step 3 — Execute API Suite & Inspect HTTP Traces in Diagnostic Studio
Run the API spec and bridge results into the UI:
```bash
npm run audit:run -- --project payments-api --run-playwright --spec specs/payments-api.spec.ts
```
In the TobiTests UI (`http://localhost:5173`):
- **Journey Canvas (`JourneyCanvas.tsx`):** Pure API nodes render the dark-themed **API Endpoint Telemetry Preview** inside `.rm-thumb` displaying HTTP method badges (`GET`, `POST`, `RBAC`), `application/json` contract status, and SLA latency.
- **Test Detail Modal (`TestDetailModal.tsx`):** Clicking an API test automatically opens the **"Traza HTTP / JSON"** view mode (`http-trace-inspector`), comparing Expected vs. Actual JSON contracts, HTTP status pills, `network_trace`, and `console_log`.

---

## 🚀 Workflow C: Deploying the Interactive Portfolio Report (Vercel / GitHub Pages)

Because TobiTests pre-compiles all run metrics, Gherkin bug cards (`web/public/data/*-state.json`), step screenshots (`web/public/evidence/runs/`), and `.webm` execution videos (`web/public/evidence/videos/`) into static assets, you can publish the entire interactive dashboard as a zero-backend portfolio showcase:

```bash
# 1. Ingest the latest Playwright run into web/public/data/
npm run audit:run -- --project tobitests

# 2. Build the production static bundle in web/dist/
npm run build:web

# 3. Preview locally or deploy web/dist to Vercel / Netlify / GitHub Pages
npx --prefix web vite preview
```
- **Vercel Configuration:** Set Root Directory to `web`, Build Command to `npm run build`, and Output Directory to `dist`.

---

## 📋 Ready-to-Use Copy-Paste Prompts (Antigravity & OpenCode)

### Prompt 1 — Full-Stack / Frontend Autonomous Audit (Paste into Antigravity)
```text
Act as the TobiTests Orchestrator following AGENT_INSTRUCTIONS.md, AGENTS.md, and docs/TESTING_PROTOCOL.md.
Target Project: <PROJECT_NAME>
Repository Path: <ABSOLUTE_REPO_PATH>
Local URL: <http://localhost:PORT>

1. Run `npm run audit:init -- --project <slug> --repo "<ABSOLUTE_REPO_PATH>" --url <http://localhost:PORT>` to generate `workspaces/<slug>/prd-ground-truth.json` and `test-matrix.json`.
2. Update `web/public/data/antigravity-live.json` (`blackboardState: "exploring"`, `currentPipelineStep: 2`).
3. Use `@playwright/mcp` (Explorer QA) and `@chromedevtools/chrome-devtools-mcp` (Telemetry Auditor) to traverse every discovered route, evaluating all interactions against the 3-Layer Bug Oracle (Layer 1: Implicit CDP exceptions/HTTP >= 400/timeouts > 3000ms; Layer 2: Cross-View & Cross-Role State Divergence; Layer 3: Visual overflow, blocked pointer-events, Escape modal dismissal, and ARIA/WCAG contrast).
4. Record all discovered bugs using the strict P0–P3 Gherkin + Evidence + White-Box Root Cause schema (`root_cause_file`, `root_cause_line`) in `web/public/data/<slug>-state.json`, and set `handoffReady: true` in `antigravity-live.json`.
```

### Prompt 2 — Pure Backend / REST API Audit (Paste into Antigravity or OpenCode)
```text
Act as the TobiTests Backend QA Architect following `.agents/explorer-qa.md`, `.agents/telemetry-auditor.md`, and `.agents/spec-writer.md` (Backend / Pure API Audit Mode).
Target API Repository: <ABSOLUTE_REPO_PATH>
API Base URL: <http://localhost:PORT>

1. Inspect all backend controllers, middleware, auth guards, and DTO/Zod/Pydantic/OpenAPI schemas in `<ABSOLUTE_REPO_PATH>`.
2. Map all endpoint groups with `category: "API"` in `workspaces/<slug>/prd-ground-truth.json`.
3. Synthesize a complete Playwright `{ request }` specification in `specs/<slug>-api.spec.ts` modeled on `templates/sample-api.spec.ts` covering:
   - Suite 1: 2xx Health, JSON Schema Contract & Latency SLA (< 500ms / < 3000ms)
   - Suite 2: 4xx Negative & Boundary Payload Fuzzing (SQLi, XSS, malformed JSON — strictly status < 500)
   - Suite 3: 401/403 RBAC, JWT Tampering & Horizontal/Vertical Privilege Escalation
   - Suite 4: Concurrency & Idempotency via parallel `Promise.all` mutations
4. Execute `npm run audit:run -- --project <slug> --run-playwright --spec specs/<slug>-api.spec.ts` so `web/public/data/<slug>-state.json` and the "Traza HTTP / JSON" inspector in `TestDetailModal.tsx` are updated.
```

### Prompt 3 — Co-Orchestration Spec Synthesis, Triage & Selector Self-Healing (Paste into OpenCode)
```text
Read `opencode.json`, `AGENTS.md`, and `web/public/data/antigravity-live.json`.
1. Verify `handoffReady: true` for project `<slug>`, claim the blackboard lock (`activeOrchestrator: "opencode"`, `blackboardState: "writing_specs"`, `currentPipelineStep: 5`), and read `workspaces/<slug>/prd-ground-truth.json` and `test-matrix.json`.
2. Synthesize deterministic Playwright `.spec.ts` suites using accessible semantic locators (`getByRole`, `getByLabel`, `getByTestId`) and zero arbitrary `waitForTimeout` sleeps.
3. Run `npm run audit:run -- --project <slug> --run-playwright` to capture `.webm` videos, screenshots, and `test-results/report.json`, automatically bridging results into `web/public/data/<slug>-state.json`.
4. If any locator failed due to a benign UI refactor (and not a product bug), self-heal the selector in `specs/*.spec.ts`, re-verify with `npx playwright test`, and transition `antigravity-live.json` to `blackboardState: "standup_meeting"` (`currentPipelineStep: 8`).
```
