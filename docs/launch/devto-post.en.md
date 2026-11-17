---
title: "TobiTests: I built an autonomous E2E QA framework with Playwright MCP + Chrome DevTools MCP — here's a real bug it found"
published: true
tags: webdev, testing, playwright, ai, mcp
cover_image: https://raw.githubusercontent.com/TodoTobi/tobitests/main/docs/assets/tobitests-demo.gif
canonical_url: https://github.com/TodoTobi/tobitests
---

# TobiTests: I built an autonomous E2E QA framework with Playwright MCP + Chrome DevTools MCP — here's a real bug it found

Testing modern web applications has reached an awkward inflection point. On one hand, we have traditional Playwright suites: fast, deterministic, but painfully brittle to author and maintain. On the other hand, we have autonomous "computer-use" AI agents that click on pixel coordinates from screenshots: fascinating technology, but slow, expensive, and blind to the actual application state under the hood.

I wanted something fundamentally better: **an autonomous QA framework that runs entirely locally, understands your source code white-box, inspects runtime telemetry through Model Context Protocol (MCP) servers, and outputs durable, self-healing Playwright tests**.

That project is **[TobiTests](https://github.com/TodoTobi/tobitests)**. In this post, I want to share how it works, how it combines `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp`, and walk through a **real cross-view state divergence bug** it caught in a production veterinary telemedicine app.

---

## The Core Problem: Why "Computer-Use" Pixel Agents Fall Short for QA

When vision-based agents interact with web pages via OS mouse coordinates, they suffer from three major blind spots:
1. **Zero White-Box Context:** They don't know what routes exist, what React Query cache keys are in memory, or what Zod schemas validate your forms.
2. **Brittle Bug Oracles:** If a button doesn't trigger an error toast or crash the layout visually, a pixel agent assumes everything succeeded — even if the backend returned a silent HTTP 500 or state silently diverged.
3. **Vision Token Burn:** Streaming 1080p screenshots back and forth to frontier LLMs costs dollars per test run and takes minutes per user journey.

TobiTests takes the opposite approach: **Local-first white-box multi-agent orchestration**.

---

## The 3-Layer Bug Detection Oracle

Instead of relying on human engineers to hand-write hundreds of brittle assertions, TobiTests equips specialized subagents with a **3-Layer Bug Detection Oracle**:

```
+------------------------------------------------------------------+
|                   3-LAYER BUG DETECTION ORACLE                   |
+------------------------------------------------------------------+
|  Layer 1: Implicit Oracle (Chrome DevTools MCP & CDP Listeners)  |
|  - Uncaught page errors & window.onerror                         |
|  - console.error() & console.warn() telemetry                    |
|  - HTTP >= 400 status codes & stalled network requests (> 3000ms)|
+------------------------------------------------------------------+
|  Layer 2: State Divergence Oracle (Playwright MCP + Source AST)  |
|  - Compares deduced state machine against live DOM after actions |
|  - Cross-view/cross-role synchronization mismatches              |
|  - Cache invalidation misses (e.g. TanStack Query / Zustand)     |
+------------------------------------------------------------------+
|  Layer 3: Visual & Accessibility Oracle (DOM Snapshot & Styles)  |
|  - Blocked interactive controls (pointer-events: none)           |
|  - Horizontal layout clipping (scrollWidth > clientWidth)        |
|  - Modal dismissal traps (Escape key / backdrop click failure)   |
|  - WCAG 2.1 AA contrast & ARIA role violations (Axe-core)        |
+------------------------------------------------------------------+
```

When an agent explores an application, all three layers run concurrently. If any layer detects a defect, the system captures runtime traces, `.webm` video replays, and step-level screenshots.

---

## A Real Bug Found: BUG-01 in VetConnect

To stress-test TobiTests, we pointed it at **VetConnect** (a full-stack veterinary appointment and telemedicine platform built with React 18, Vite, and TypeScript).

During an autonomous exploration run across client appointments and pet management journeys, **Layer 2 (State Divergence Oracle)** flagged a high-severity desynchronization bug:

### The Bug Report (Gherkin / BDD Specification)

```gherkin
Feature: Appointment Cancellation State Synchronization
  As a pet owner
  I want my pet's upcoming appointment badge to immediately reflect cancellations
  So that I do not see outdated medical schedules

  Scenario: Inconsistency when cancelling appointment between Appointments and Pet list
    Given the pet owner has an active appointment ("In Progress" or "Pending") for a registered pet
    When the user navigates to "/client/appointments" and cancels the active appointment
    Then the mutation cancels the appointment in the backend via HTTP DELETE
    But when navigating to "My Pets" (/client/pets), the upcoming appointment badge
    erroneously displays the cancelled appointment instead of "No upcoming appointment"
```

### The White-Box Root Cause Diagnostic

Because TobiTests analyzes the codebase AST, the **Telemetry Auditor** didn't just report that the UI looked wrong — it pinned the exact line of code:

- **Root Cause File:** `web/src/pages/ClientApp.tsx:1243`
- **Mechanism:** The `cancelMutation` in `AppointmentsPage` updated the local appointments list via React Query, but omitted cache invalidation for the pets query:
  ```typescript
  // Missing cache invalidation identified by TobiTests:
  queryClient.invalidateQueries({ queryKey: ['pets', 'mine'] });
  ```
- **Triage Classification:** `High` severity (P1 — Cross-view state divergence without full page reload).

This is a classic bug that unit tests and black-box screenshot agents routinely miss: the API call succeeds (HTTP 200), the cancellation modal closes cleanly, but user state across views becomes corrupted.

---

## The 8-Step Local Autonomous QA Pipeline

TobiTests executes an 8-phase pipeline from clean workspace to reproducible test suite:

1. **Bootstrap & Discovery:** Detects ports, framework stack, and router patterns.
2. **Source Code & Route Analysis:** Scans router definitions, auth guards, and validation schemas.
3. **Normalized PRD (`prd-ground-truth.json`):** Generates an authoritative machine-readable ground truth specification.
4. **Test Matrix (`test-matrix.json`):** Partitions flows across Happy Paths, Negative Fuzzing, RBAC, and A11y.
5. **Playwright Spec Synthesis:** Emits deterministic, zero-sleep specs using semantic locators (`getByRole`, `getByLabel`).
6. **Isolated Execution:** Runs tests headless or headed, capturing `.webm` videos, traces, and route touches.
7. **3-Layer Oracle Triage:** Classifies failures as `PRODUCT_BUG`, `SELECTOR_FRAGILITY`, or `ENV_DRIFT`.
8. **Gherkin Cards & Self-Healing:** Generates standardized bug cards and automatically heals locator drift.

---

## ⚡ 60-Second Quickstart

You can run TobiTests against any web app running on localhost in three commands:

```bash
# 1. Clone & install dependencies
git clone https://github.com/TodoTobi/tobitests.git && cd tobitests && npm install

# 2. Launch the visual observability dashboard (runs on http://localhost:5180)
npm run dev:web

# 3. Audit your app (point to your local dev URL)
python scripts/tobitests_cli.py --project my-app --url http://localhost:3000
```

Open `http://localhost:5180` to see your route journey map, watch your autonomous agent team in the 2.5D isometric "La Oficina" view, and inspect generated bug cards with video replays.

---

## Native Model Context Protocol (MCP) Server

TobiTests includes a native stdio MCP server (`tobitests-mcp`). You can wire it directly into **Claude Code, Cursor, Windsurf, or Antigravity** via your `.mcp.json`:

```json
{
  "mcpServers": {
    "tobitests": {
      "command": "python",
      "args": ["scripts/tobitests_mcp.py"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@chromedevtools/chrome-devtools-mcp@latest"]
    }
  }
}
```

This exposes 5 high-level autonomous tools to your LLM:
* `tobitests_bootstrap`: Scans routes, schemas, and synthesizes test matrices.
* `tobitests_run_audit`: Executes test runs and classifies failures with CDP telemetry.
* `tobitests_get_digest`: Delivers a compact, token-efficient summary (< 90% token reduction).
* `tobitests_heal_selectors`: Self-heals drifted locators in existing `.spec.ts` files.
* `tobitests_blackboard_sync`: Coordinates multi-agent collaboration across pipeline phases.

---

## Join Us & Contribute!

TobiTests is 100% open source under the **MIT License**. We've just shipped **v1.0.0** and we are looking for contributors!

* ⭐️ **GitHub Repo:** [https://github.com/TodoTobi/tobitests](https://github.com/TodoTobi/tobitests)
* 🏷️ **Good First Issues:**
  * **[Issue #1](https://github.com/TodoTobi/tobitests/issues/1):** Add Vue 3 / Nuxt route discovery support
  * **[Issue #2](https://github.com/TodoTobi/tobitests/issues/2):** Export test run summary as JUnit XML
  * **[Issue #3](https://github.com/TodoTobi/tobitests/issues/3):** Add Svelte / SvelteKit route discovery
* 📦 **Release:** Check out the [v1.0.0 Release Notes](https://github.com/TodoTobi/tobitests/releases/tag/v1.0.0)

If you're building autonomous testing workflows or experimenting with MCP, give TobiTests a spin on your local projects and let us know what bugs it catches!
