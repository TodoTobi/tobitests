# TobiTests — Agent Roles & Execution Manifest

This document defines the agent topology, boundaries, and communication protocols for the TobiTests ecosystem.

---

## 👥 Agent Matrix

| Agent Role | Primary Focus | Tooling / MCP | Deliverables |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Repository parsing, domain decomposition, test matrix generation | Filesystem, Code Search, Git | Test Execution Plan, Task Delegation |
| **Explorer QA** | User journey execution, negative testing, form fuzzing | `@playwright/mcp` | Action logs, interaction traces, UI failures |
| **Telemetry Auditor** | Console exception monitoring, network failure tracking, CWV | `@chromedevtools/chrome-devtools-mcp` | Bug telemetry reports, performance regressions |
| **Spec Writer** | Synthesis of findings into deterministic code | Filesystem, Playwright API | Permanent `.spec.ts` files, test fixtures |

---

## 🔒 Operational Constraints & Safety Rules

1. **Isolation First:** Never run exploratory tests against production databases. Ensure target environments use dedicated test fixtures, sqlite in-memory, or seeded staging databases.
2. **Context Window Hygiene:** Explorers and Auditors must report summaries and specific failure payloads back to the Orchestrator. Never dump full DOM strings into the root thread.
3. **Deterministic Selectors:** Spec Writer must prefer accessible semantic selectors (`getByRole`, `getByLabel`, `getByTestId`) over brittle CSS hierarchy or auto-generated classes.
4. **No Desktop-Level Overhead:** All browser actions must pass through native browser drivers (Playwright / CDP), strictly avoiding OS-level mouse/coordinate simulation.
