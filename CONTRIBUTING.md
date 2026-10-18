# Contributing to TobiTests

Thank you for your interest in contributing to **TobiTests** — the Open-Source Autonomous Multi-Agent E2E & API QA Engine! This guide covers the repository architecture, how to integrate new AI coding agents, how to extend the 3-Layer Bug Detection Oracle, and our pull request workflow.

---

## 1. Repository Structure

```text
tobitests/
├── .agents/                    # Specialized AI subagent role prompts (Orchestrator, Explorer QA, Telemetry Auditor, Spec Writer)
├── docs/                       # Architecture specs, 8-step testing protocol, MCP setup, and operational manual
├── scripts/                    # Repository-agnostic CLI (tobitests_cli.py), Playwright result ingestion, and spec sync watcher
├── specs/                      # Permanent Playwright E2E ({ page }) and Backend API ({ request }) test suites
├── templates/                  # Reference templates for Frontend UI (sample.spec.ts) and Backend REST APIs (sample-api.spec.ts)
├── web/                        # React 18 + TypeScript + Vite Interactive Command Center (2.5D Office + Journey Canvas + Diagnostic Studio)
│   ├── public/data/            # Multi-project JSON state & shared antigravity-live.json blackboard
│   └── src/                    # UI components (JourneyCanvas, OfficeScene, TestDetailModal) & useTobiState hook
└── workspaces/                 # Per-project Normalized PRD ground truth (prd-ground-truth.json) & test matrices
```

---

## 2. Adding Support for New AI Coding Agents & IDEs

TobiTests coordinates multiple AI agents through a shared local blackboard (`web/public/data/antigravity-live.json`) and standard Model Context Protocol (MCP) servers (`@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp`).

To integrate a new AI Coding Agent or IDE (e.g., Cursor, Windsurf, Cline, Claude Code, or custom orchestrators):

1. **Connect MCP Servers:** Point your agent's MCP configuration to `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` (see [`docs/MCP_SETUP.md`](docs/MCP_SETUP.md)).
2. **Adopt the Blackboard Contract (`web/public/data/antigravity-live.json`):**
   - Read `activeProject`, `auditScope` (`"frontend"` | `"backend"` | `"fullstack"`), `currentPipelineStep` (`1`–`8`), and `blackboardState` (`"idle"` | `"exploring"` | `"auditing"` | `"writing_specs"` | `"executing_tests"` | `"triaging"` | `"standup_meeting"`).
   - Emit live agent status updates via `POST /api/antigravity/scope` or by updating `web/public/data/antigravity-live.json` so the 2.5D Isometric Office and Journey Canvas HUD reflect your agent's real-time progress.
3. **Register Agent Prompts:** Add or update role definitions inside `.agents/` and document the workflow in `AGENTS.md`.

---

## 3. Extending the 3-Layer Bug Detection Oracle

Every exploratory session and automated test run in TobiTests evaluates the target application against three complementary verification layers defined in [`docs/TESTING_PROTOCOL.md`](docs/TESTING_PROTOCOL.md):

- **Layer 1 — Implicit Oracle (Runtime & Network Telemetry):**
  - Captures uncaught exceptions (`pageerror`), `console.error`, HTTP status codes `>= 400`, CORS blocks, and requests exceeding latency SLAs (`> 500ms` health / `> 3000ms` CRUD).
  - *How to extend:* Add new CDP listeners or response header validators in `templates/sample.spec.ts`, `templates/sample-api.spec.ts`, and `.agents/telemetry-auditor.md`.
- **Layer 2 — State Divergence Oracle (White-Box vs. Live DOM/API):**
  - Compares the state machine extracted from source code (`workspaces/<project>/prd-ground-truth.json`) against actual cross-view and cross-role mutations.
  - *How to extend:* Enhance route and schema discovery in `scripts/tobitests_cli.py` to support additional frameworks (e.g., Django, Spring Boot, Laravel, GraphQL, gRPC).
- **Layer 3 — Visual & Accessibility Oracle (Layout & WCAG/ARIA):**
  - Detects horizontal/vertical overflow (`scrollWidth > clientWidth`), blocked interactive elements (`pointer-events: none`), broken modal focus traps (`Escape` dismissal), and ARIA/contrast violations.
  - *How to extend:* Contribute reusable DOM inspection assertions in `templates/sample.spec.ts` and `.agents/explorer-qa.md`.

---

## 4. Commit Convention & Pull Request Checklist

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature or agent capability (e.g., `feat: add GraphQL schema discovery to CLI`)
- `fix:` Bug fix or selector self-healing patch
- `docs:` Documentation or operational guide updates
- `test:` New or updated Playwright E2E / API specifications
- `refactor:` Code restructuring without changing external behavior

### Pull Request Checklist
Before submitting a Pull Request, please verify:
- [ ] `npm run build --prefix web` compiles cleanly with zero TypeScript or Vite bundling errors.
- [ ] All self-audit Playwright suites pass (`npx playwright test specs/tobitests-*.spec.ts`).
- [ ] No personal file paths (`<HOME_DIR>/...`), session UUIDs, or real credentials are included in any committed files.
- [ ] Documentation (`README.md`, `docs/USER_GUIDE.md`, or `docs/ARCHITECTURE.md`) is updated to reflect new CLI flags or UI controls.
