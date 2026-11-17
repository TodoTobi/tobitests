# Reddit r/ClaudeAI Draft — TobiTests

**Subreddit:** `r/ClaudeAI`  
**Flair:** Project / Tool / Resource  
**Title:** Combining Playwright MCP + Chrome DevTools MCP for local, zero-vision-token autonomous web QA (TobiTests v1.0.0)

---

Hey r/ClaudeAI,

Like many of you, I've spent the past few months experimenting with Claude's Model Context Protocol (MCP) and Anthropic's computer-use demos. While streaming screenshots and mouse clicks to Claude is mind-blowing, running end-to-end QA with computer-use in real production codebases hits two painful walls: **massive vision-token burn** and **zero visibility into runtime state**.

To solve this, I built **[TobiTests](https://github.com/TodoTobi/tobitests)** — an open-source, local-first multi-agent E2E testing framework that combines `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` with a native orchestrator MCP server.

### Why combine Playwright MCP + Chrome DevTools MCP?

Claude doesn't need to guess where a button is on a 1080p canvas if it can inspect the live DOM and runtime network stream directly:

1. **`@playwright/mcp` for Semantic Execution:** Claude drives user journeys via semantic accessibility locators (`getByRole`, `getByLabel`), fills forms, executes clicks, and snapshots DOM states deterministically.
2. **`@chromedevtools/chrome-devtools-mcp` for Implicit Bug Telemetry:** In parallel, Chrome CDP listeners stream runtime telemetry directly to Claude: `console.error` traces, unhandled exceptions, HTTP `>= 400` responses, and hung requests (>3000ms).
3. **`tobitests-mcp` for State & Pipeline Coordination:** Our native server provides high-level tools to scan route ASTs, generate ground-truth PRDs, run suites, heal drifted selectors, and emit compact agent digests (saving >90% of token context).

### Quick Setup (`.mcp.json`)

You can plug TobiTests into Claude Desktop, Claude Code, or any MCP-compatible environment with this configuration:

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

### The 3-Layer Oracle: Catching what unit tests miss

With this setup, Claude operates as an autonomous QA engineer using a **3-Layer Oracle**:
* **Layer 1 (CDP Telemetry):** Catches uncaught runtime exceptions and network errors.
* **Layer 2 (State Divergence):** Catches desynchronization between views (e.g. cancelling an appointment in one view while another view continues to display it because React Query cache wasn't invalidated).
* **Layer 3 (A11y & Visual):** Uses Axe-core and computed layout metrics to spot clipped text, missing modal dismissals, and WCAG AA violations.

### Real Example: A cross-view state bug caught in seconds

Running Claude against a full-stack veterinary app (`VetConnect`), TobiTests detected that cancelling a consultation at `/client/appointments` successfully mutated the database, but navigating to `/client/pets` still rendered the old badge. Claude's telemetry auditor pinned the exact line in source code (`web/src/pages/ClientApp.tsx:1243`) where `queryClient.invalidateQueries({ queryKey: ['pets', 'mine'] })` was missing.

### 60-Second Quickstart

```bash
git clone https://github.com/TodoTobi/tobitests.git && cd tobitests && npm install
npm run dev:web
python scripts/tobitests_cli.py --project my-app --url http://localhost:3000
```

The repo also includes an interactive visual dashboard with a route journey canvas and a 2.5D isometric "Office" view showing agent activity in real time.

* **GitHub:** https://github.com/TodoTobi/tobitests
* **Release:** v1.0.0 (MIT License)

Would love your thoughts and feedback on the MCP tool architecture! What other telemetry streams would you want Claude to listen to during E2E audits?
