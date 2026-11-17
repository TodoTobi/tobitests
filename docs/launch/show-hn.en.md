# Show HN: TobiTests – open-source autonomous E2E QA with Playwright MCP + Chrome DevTools MCP

**URL:** https://github.com/TodoTobi/tobitests  
**Title:** Show HN: TobiTests – open-source autonomous E2E QA with Playwright MCP + Chrome DevTools MCP

---

### Body:

Hi HN,

I built TobiTests (https://github.com/TodoTobi/tobitests), an open-source, local-first framework for autonomous end-to-end web testing.

Most AI testing tools today take a black-box "computer-use" approach: taking 1080p desktop screenshots, burning expensive vision tokens, and guessing mouse coordinates. But real bugs often don't crash layouts — they silently desynchronize state or throw unhandled exceptions in the background.

TobiTests takes a white-box, local-first approach:
1. **White-Box AST Discovery:** Scans your repo's router definitions, auth guards, React Query / Zustand stores, and Zod schemas to construct an authoritative state contract (`prd-ground-truth.json`).
2. **Semantic Playwright Synthesis:** Generates pure TypeScript Playwright specs using accessible locators (`getByRole`, `getByLabel`) with zero arbitrary sleeps.
3. **3-Layer Oracle:** Evaluates runs across Chrome DevTools CDP telemetry (Layer 1: console errors, HTTP >= 400, hung requests), State Divergence (Layer 2: DOM state vs. white-box state machine), and Accessibility/Layout (Layer 3: Axe-core and computed styles).
4. **Local Observability:** Ships with a local React/Vite dashboard (`http://localhost:5180`) featuring an interactive route journey map and a 2.5D isometric view of agent telemetry.
5. **Native MCP Server:** Implements stdio Model Context Protocol so you can trigger audits or self-healing directly from Claude Code, Cursor, or Antigravity.

### 60-Second Quickstart:

```bash
git clone https://github.com/TodoTobi/tobitests.git && cd tobitests && npm install
npm run dev:web
python scripts/tobitests_cli.py --project my-app --url http://localhost:3000
```

Code is MIT licensed: https://github.com/TodoTobi/tobitests  
Release: https://github.com/TodoTobi/tobitests/releases/tag/v1.0.0

I'd love to hear your thoughts, feedback, and edge cases from your own testing workflows!
