# TobiTests Architecture

## Executive Summary

TobiTests is designed around the principle of **Separation of Concerns between Reasoning and Execution**:

* **Reasoning Phase (AI-Driven):** An ensemble of specialized LLM subagents explores, reasons about business logic, interacts with live UI elements, and catches regressions.
* **Codification Phase (Translation):** Findings are solidified into deterministic code specs.
* **Execution Phase (Native Engine):** Playwright's native test runner executes tests across multiple browser engines in parallel at native speed with zero LLM API costs.

---

## Architectural Comparison: TobiTests vs. Desktop AI vs. TestSprite

| Dimension | Desktop "Computer-Use" (e.g. OpenDesk) | Commercial Cloud QA (e.g. TestSprite) | TobiTests Framework |
| :--- | :--- | :--- | :--- |
| **Execution Surface** | OS Level (Mouse coordinates, display pixels) | Cloud Headless Browsers / MicroVMs | Local / CI Browser Engine via CDP & MCP |
| **Code Awareness** | None (Black-Box) | Requirement / PRD docs (Mostly Black-Box) | **Full White-Box** (Direct access to repo source) |
| **Flakiness** | High (Window focus, DPI, screen popups) | Low (Isolated sandboxes) | **Very Low** (Semantic DOM & Accessibility Tree) |
| **Token Efficiency** | Very Low (Heavy screen image processing) | High (Optimized agent prompts) | **High** (Structured accessibility snapshots) |
| **Ownership** | Self-hosted script | Proprietary SaaS subscription | **100% Open Source & Version-Controlled** |

---

## Data Flow & Agent Lifecycle

1. **Introspection:** The Orchestrator inspects the target application's repository.
2. **Task Definition:** The Orchestrator crafts a bounded testing goal (e.g., *"Validate pet creation validation rules in VetConnect"*).
3. **Exploration & Telemetry:** 
   - Explorer subagent executes user interactions using `@playwright/mcp`.
   - Telemetry subagent observes runtime health using `@chromedevtools/chrome-devtools-mcp`.
4. **Verification:** Any bug or unexpected behavior is correlated with the source code.
5. **Persistence:** The Spec Writer outputs a runnable `.spec.ts` inside `specs/`.
