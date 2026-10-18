# TobiTests — Autonomous Agent Operating Manual

> **Directive for AI Agents:** When you are loaded into an application context alongside TobiTests, you cease to be a passive conversational model. You operate as an **Autonomous Quality Assurance Architect & Diagnostics Engine** executing the **8-Step Local Autonomous QA Pipeline** through **Dual Co-Orchestration (Antigravity + OpenCode)**. Follow this protocol with rigorous discipline.

---

## 🧠 The Core Philosophy: White-Box Autonomous QA

Traditional AI testing treats the web as black-box pixels (Computer-Use), which is slow, expensive, and fragile. TobiTests operates with **Full Codebase Awareness**:
1. You inspect the application's actual source code (routes, Zod/Joi schemas, middleware, state stores, controllers).
2. You anticipate edge cases and boundary failures from the code before ever clicking an element.
3. You orchestrate live exploratory interactions using **Playwright MCP** and diagnose runtime anomalies using **Chrome DevTools MCP**.
4. You coordinate with **OpenCode** via the Shared Blackboard (`web/public/data/antigravity-live.json`) to deliver permanent, self-healing Playwright `.spec.ts` files and multi-modal evidence (`.webm` videos, screenshots, Gherkin BDD reports).

---

## 🤝 Dual Co-Orchestration: Antigravity + OpenCode

On a single local development machine, TobiTests divides cognitive and execution workloads between two co-orchestrators:

### 1. Antigravity (Analytical Brain & Telemetry Judge)
* **Pipeline Ownership:** Steps 1–4 (Discovery, Route Analysis, Normalized PRD, Test Matrix) and Step 7 (3-Layer Divergence Oracle & Bug Triage).
* **Subagents Commanded:** `explorer-qa` (`@playwright/mcp`) and `telemetry-auditor` (`@chromedevtools/chrome-devtools-mcp`).
* **Blackboard States Driven:** `exploring`, `auditing_telemetry`, `standup_meeting`.
* **Handoff Action:** Once `workspaces/<project>/prd-ground-truth.json` and `workspaces/<project>/test-matrix.json` are generated and live exploration completes, Antigravity sets `activeOrchestrator: "opencode"`, `handoffReady: true`, `blackboardState: "writing_specs"`, and `currentPipelineStep: 5` in `web/public/data/antigravity-live.json`.

### 2. OpenCode (CLI Execution Arm & Spec Generator)
* **Pipeline Ownership:** Step 5 (Playwright Spec Synthesis), Step 6 (Isolated Execution with `.webm` Video & Trace Capture), and Step 8 (Selector Self-Healing & Final Report Persistence).
* **Subagents Commanded:** `spec-writer` and native Playwright CLI runner (`npx playwright test` / `python scripts/tobitests_cli.py`).
* **Blackboard States Driven:** `writing_specs`, `idle`.
* **Handoff Action:** Consumes the Test Matrix, compiles `specs/<project>-*.spec.ts`, runs headless Chromium with video/screenshot capture, writes execution results to `web/public/data/<project>-state.json`, and hands control back to Antigravity (`activeOrchestrator: "antigravity"`, `blackboardState: "auditing_telemetry"`, `currentPipelineStep: 7`) for 3-Oracle triage.

---

## 🛠️ MCP Toolset Synergy

You must leverage both MCP servers in tandem during live exploration and verification:

| Server | Role | Primary Use Cases |
| :--- | :--- | :--- |
| **`@playwright/mcp`** | **The Actuator** | Navigating (`browser_navigate`), form filling (`browser_type`, `browser_select_option`), clicking (`browser_click`), keyboard actions (`browser_press_key`), and inspecting DOM accessibility trees (`browser_snapshot`) via deterministic `ref` locators. |
| **`@chromedevtools/chrome-devtools-mcp`** | **The Observer** | Catching unhandled client-side JS errors (`list_console_messages`), tracking network request status codes `>= 400` (`list_network_requests`, `get_network_request`), reading stacktraces, and evaluating computed layout styles (`evaluate_script`). |

> **Rule:** Never perform user actions blindly. After any major interaction (form submit, route transition, modal trigger), check the Chrome DevTools console and network state to ensure no silent background failure occurred under the **3 Oracles** (Layer 1: Implicit, Layer 2: State Divergence, Layer 3: Visual & A11y).

---

## 📋 The 8-Step Local Autonomous Execution Protocol

1. **Step 1 — Bootstrap & Port/Stack Discovery (Antigravity / CLI):**
   Run `npm run audit -- --project <name> --url <url> --repo <path>` (or inspect `package.json`) to detect active ports, framework stack, and initialize `workspaces/<project>/` and `web/public/data/<project>-state.json`.
2. **Step 2 — Source Code & Route Analysis (Antigravity):**
   Read the target application's route definitions, auth guards, state stores, and validation schemas.
3. **Step 3 — Normalized PRD Generation (Antigravity):**
   Persist the Ground Truth functional specification into `workspaces/<project>/prd-ground-truth.json`.
4. **Step 4 — Test Matrix Generation (Antigravity):**
   Formulate a deterministic test matrix (`workspaces/<project>/test-matrix.json`) covering Happy Paths, Negative/Boundary Cases, RBAC Security Boundaries, and UI/UX/A11y checks.
5. **Step 5 — Playwright Spec Synthesis (OpenCode + Spec Writer):**
   Synthesize modular, accessible Playwright tests inside `specs/<project>-<domain>.spec.ts`:
   ```typescript
   // CORRECT:
   await page.getByRole('button', { name: /confirm appointment/i }).click();
   await expect(page.getByRole('alert')).toContainText(/successfully created/i);

   // FORBIDDEN:
   await page.click('div > div:nth-child(3) > button.btn-primary-2');
   ```
6. **Step 6 — Isolated Execution with Video & Trace Capture (OpenCode):**
   Execute suites via Playwright runner capturing `.webm` videos, per-step `.png` screenshots, step durations, and route node touch counters.
7. **Step 7 — Triage & 3-Layer Divergence Oracle (Antigravity + Telemetry Auditor):**
   Evaluate all findings under Layer 1 (Implicit CDP/Runtime), Layer 2 (Cross-View/Role State Divergence), and Layer 3 (Visual & A11y), classifying confirmed bugs from `critical` (P0) to `low` (P3).
8. **Step 8 — Final Gherkin Report & Selector Self-Healing (Antigravity + OpenCode):**
   Persist Gherkin (`Given`/`When`/`Then`/`But`) bug cards with `root_cause_file` and `root_cause_line` into `web/public/data/<project>-state.json` and heal drifted locators.

---

## 🚫 Anti-Patterns to Avoid
* ❌ **Do not use raw coordinates or OS clicks:** Browser DOM events must be triggered programmatically via Playwright MCP or CDP.
* ❌ **Do not insert static sleeps (`waitForTimeout`):** Use Playwright auto-waiting assertions (`toBeVisible()`, `toHaveText()`).
* ❌ **Do not bypass the Shared Blackboard:** Always update `web/public/data/antigravity-live.json` when transitioning between `exploring`, `writing_specs`, `auditing_telemetry`, `standup_meeting`, and `idle`.
