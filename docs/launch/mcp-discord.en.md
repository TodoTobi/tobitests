# MCP Discord Announcement — TobiTests

**Channel:** `#projects` / `#show-and-tell`  
**Target Community:** Model Context Protocol Official Discord

---

Hey everyone! 👋 Excited to share **TobiTests v1.0.0** — an open-source, local-first multi-agent QA & visual telemetry framework designed natively around the **Model Context Protocol (MCP)**.

### What it does:
TobiTests pairs `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` with our custom `tobitests-mcp` server. Instead of burning vision tokens on screenshots, it performs white-box AST route scanning, generates semantic Playwright specs, runs isolated test journeys, and detects defects via a **3-Layer Oracle** (CDP error streams + cross-view state divergence + Axe-core A11y).

### Wire it up in your `.mcp.json`:
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

### Native Tools Exposed:
* `tobitests_bootstrap`: Scans routes, stores, schemas, and builds normalized ground-truth PRDs.
* `tobitests_run_audit`: Executes Playwright suites, ingests CDP telemetry, and classifies failures.
* `tobitests_get_digest`: Emits a compact, token-efficient JSON digest (<90% context reduction).
* `tobitests_heal_selectors`: Automatically updates drifted Playwright locators.
* `tobitests_blackboard_sync`: Coordinates multi-agent collaboration across pipeline steps.

Also includes a local React/Vite visual dashboard with route journey flow-maps and a 2.5D isometric agent office.

* 📦 **Release:** [v1.0.0 Release Notes](https://github.com/TodoTobi/tobitests/releases/tag/v1.0.0)
* 🐙 **GitHub:** https://github.com/TodoTobi/tobitests (MIT License)

Feel free to test it against your local web apps or integrate it with your Claude Desktop / Cursor / Antigravity setups. Feedback and contributions welcome! 🚀
