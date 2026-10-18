# TobiTests — MCP & Dual Co-Orchestration Setup Guide (`docs/MCP_SETUP.md`)

TobiTests combines two Model Context Protocol (MCP) servers—**Playwright MCP** (`@playwright/mcp`) for browser actuation and accessibility tree snapshots, and **Chrome DevTools MCP** (`@chromedevtools/chrome-devtools-mcp`) for Layer 1 CDP runtime telemetry—coordinated across **Antigravity** and **OpenCode** via the shared local blackboard (`web/public/data/antigravity-live.json`).

---

## 🛠️ Prerequisites

1. **Node.js `>= 18.x`** and **npm `>= 9.x`**
2. **Python `>= 3.10`** (for the 4 core CLI & bridge scripts in `scripts/`)
3. **Chromium / Google Chrome** installed locally:
   ```bash
   npx playwright install chromium
   ```

---

## 1. Antigravity IDE Configuration (`mcp_config.json`)

Add the following `mcpServers` block to your Antigravity MCP configuration file (typically located at `~/.gemini/antigravity/mcp_config.json` or `./workspace`):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@chromedevtools/chrome-devtools-mcp@latest"
      ]
    }
  }
}
```

---

## 2. OpenCode CLI Configuration ([`opencode.json`](../opencode.json))

TobiTests includes a pre-configured [`opencode.json`](../opencode.json) at the root of the repository. It binds OpenCode to Pipeline Steps `5`, `6`, and `8`, registers the shared blackboard (`web/public/data/antigravity-live.json`), and wires both MCP servers:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "name": "tobitests-autonomous-qa-engine",
  "version": "3.0.0",
  "description": "Local-First Autonomous Multi-Agent QA & E2E Testing Engine (Antigravity + OpenCode Co-Orchestration)",
  "instructions": [
    "AGENT_INSTRUCTIONS.md",
    "AGENTS.md",
    "docs/ARCHITECTURE.md"
  ],
  "scripts": {
    "audit:init": "python scripts/tobitests_cli.py init",
    "audit:run": "python scripts/ingest_playwright_results.py",
    "audit:deep": "python scripts/run_deep_audit.py",
    "sync:watch": "python scripts/sync_specs.py --watch",
    "dev:all": "npm run dev:all"
  },
  "blackboard": {
    "path": "web/public/data/antigravity-live.json",
    "orchestratorId": "opencode",
    "ownedPipelineSteps": [5, 6, 8],
    "states": [
      "idle",
      "exploring",
      "writing_specs",
      "auditing_telemetry",
      "standup_meeting"
    ]
  },
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@chromedevtools/chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## 3. Cursor / Claude Desktop / Claude Code Configuration

- **Cursor:** Save to `.cursor/mcp.json` in the workspace root.
- **Claude Desktop / Claude Code:** Save to `claude_desktop_config.json` or `.mcp.json`.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--headless"
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@chromedevtools/chrome-devtools-mcp@latest",
        "--headless=true"
      ]
    }
  }
}
```

---

## 🔧 Troubleshooting & Operational Tips

### 1. Chrome DevTools Remote Debugging Port (`9222`) Contention
- **Symptom:** `@chromedevtools/chrome-devtools-mcp` fails to attach or reports `ECONNREFUSED 127.0.0.1:9222`.
- **Resolution:** Ensure no stale Chrome instance is holding port `9222`, or launch Chrome with `--remote-debugging-port=9222 --user-data-dir=./tmp-chrome-profile`. Under the Dual Co-Orchestration Protocol, **Antigravity** and **OpenCode** never open concurrent browser sessions at the same time—always check `blackboardState` and `activeOrchestrator` in `web/public/data/antigravity-live.json`.

### 2. Headless vs. Headed Mode
- For fast CI/local batch execution (Steps 5–6), run Playwright in headless mode (`npx playwright test`).
- For interactive visual debugging or WebRTC media stream inspection, pass `--headed` or remove `--headless` from `@playwright/mcp` args.

### 3. SSE / Polling Stream & `waitUntil: 'networkidle'`
- Applications with live Server-Sent Events (SSE) or periodic polling (like TobiTests' `/api/antigravity/stream`) keep network connections open indefinitely.
- Always use `waitUntil: 'domcontentloaded'` followed by explicit web-first assertions (`await expect(page.getByRole(...)).toBeVisible()`) instead of `waitUntil: 'networkidle'`.

### 4. Pure Backend / REST API Audits Require Zero Browser Instances
- When running pure backend/API audits via [`templates/sample-api.spec.ts`](../templates/sample-api.spec.ts), Playwright's `{ request }` (`APIRequestContext`) fixture executes HTTP calls directly over Node.js without launching Chromium, delivering sub-second execution and full compatibility with `scripts/ingest_playwright_results.py`.
