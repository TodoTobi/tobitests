# Reddit r/Playwright Draft — TobiTests

**Subreddit:** `r/Playwright`  
**Flair:** Tools & Frameworks / Showoff  
**Title:** I built an autonomous 8-step pipeline that scans codebases, writes semantic Playwright specs, and auto-heals locators (TobiTests)

---

Hey r/Playwright,

Writing and maintaining Playwright specs is one of the highest-leverage things in frontend development, but generating realistic test coverage across complex routes and keeping selectors up to date after redesigns is a massive time sink.

Over the last few months, I built **[TobiTests](https://github.com/TodoTobi/tobitests)** — an open-source, local-first framework that automates the entire Playwright lifecycle: from AST route scanning to spec generation, isolated execution, CDP triage, and selector self-healing.

### The 8-Step Autonomous QA Pipeline

Rather than asking an LLM to hallucinate random tests, TobiTests follows an 8-phase deterministic pipeline:

```
[1. Bootstrap & Discovery] -> [2. Source Code & Route Analysis]
                              -> [3. Normalized PRD Ground Truth]
                              -> [4. Test Matrix Partitioning]
                              -> [5. Semantic Spec Synthesis (.spec.ts)]
                              -> [6. Isolated Playwright Execution]
                              -> [7. 3-Layer Divergence Oracle]
                              -> [8. Gherkin Cards & AST Self-Healing]
```

1. **Stack & Route Discovery:** Detects ports, frontend framework (`React + Vite`, `Next.js`), and extracts router paths from source code.
2. **White-Box AST Scan:** Reads router definitions, auth guards, state management (`React Query`, `Zustand`), and Zod validation schemas.
3. **Normalized PRD (`prd-ground-truth.json`):** Formulates an authoritative state contract of your application.
4. **Test Matrix Partitioning (`test-matrix.json`):** Splits tests into Happy Paths, Boundary Fuzzing, Role-Based Access Control (RBAC), and Accessibility flows.
5. **Semantic Spec Synthesis:** Emits pure TypeScript Playwright specs. **No arbitrary sleeps (`page.waitForTimeout`)** — it strictly relies on Playwright's built-in web-first assertions and accessibility locators (`page.getByRole`, `page.getByLabel`, `page.getByTestId`).
6. **Isolated Execution:** Runs tests via `npx playwright test` in isolated contexts, capturing `.webm` video recordings, per-step `.png` snapshots, and Playwright traces.
7. **3-Layer Oracle Triage:** Combines Chrome DevTools CDP listeners (Layer 1), DOM vs. AST state divergence checks (Layer 2), and Axe-core accessibility audits (Layer 3).
8. **Selector Self-Healing:** When non-bug DOM refactors occur, TobiTests compares the failed locator against current DOM snapshots and patches the `.spec.ts` file with resilient semantic selectors automatically.

### Running it via CLI

You can point TobiTests to any local web app:

```bash
# Clone & install
git clone https://github.com/TodoTobi/tobitests.git && cd tobitests && npm install

# Launch the visual dashboard
npm run dev:web

# Run the 8-step autonomous pipeline against your app
python scripts/tobitests_cli.py --project my-app --url http://localhost:3000 --run-pipeline
```

### Terminal Output & Agent Digest

When the pipeline runs, it outputs real-time progression across all steps and generates a compact `workspaces/<project>/agent-digest.json`:

```text
[TobiTests CLI] Pipeline step 1/8: Bootstrap & Stack Discovery
[TobiTests CLI] Discovered routes: [/login, /register, /dashboard, /appointments, /pets]
[TobiTests CLI] Synthesizing specs: specs/appointments.spec.ts, specs/pets.spec.ts
[TobiTests CLI] Running Playwright suite (headed=false, video=on, traces=on)...
[TobiTests CLI] Running 3-Layer Oracle triage...
[TobiTests CLI] Results: 14 passed, 1 product bug detected (P1 - Cross-view divergence)
[TobiTests CLI] Digest saved to workspaces/vetconnect/agent-digest.json
```

### Visual Observability Dashboard

TobiTests also ships with a local Vite dashboard (`web/` running at `http://localhost:5180`):
* **Journey Map Canvas:** Bezier-curved route navigation graph showing exact test touches and failure hotspots.
* **La Oficina (2.5D):** An isometric visualization of subagents coordinating in real time.
* **Bug Tracker & Replay Studio:** Interactive bug cards with embedded `.webm` video replays, Gherkin reproduction steps, and root-cause file/line markers.

### Open Source & Community

TobiTests is 100% open source (MIT license) and includes a native Model Context Protocol (MCP) server so you can drive it through Claude Code, Cursor, or OpenCode.

* **GitHub:** [https://github.com/TodoTobi/tobitests](https://github.com/TodoTobi/tobitests)
* **Release:** [v1.0.0](https://github.com/TodoTobi/tobitests/releases/tag/v1.0.0)

We have good first issues open for adding route discovery in Vue 3 / Nuxt (#1), JUnit XML exports (#2), and SvelteKit (#3). PRs and feedback are very welcome!
