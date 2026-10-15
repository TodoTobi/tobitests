# TobiTests — Claude Code Guidance

When working within this repository or utilizing TobiTests protocols:
- Follow `AGENT_INSTRUCTIONS.md` strictly for test generation and autonomous QA.
- Prefer `@playwright/mcp` for browser actuation and `@chromedevtools/chrome-devtools-mcp` for network/console diagnostics.
- Write tests into `specs/` using Playwright best practices (web-first assertions, semantic locators, zero arbitrary timeouts).
- Run `npm test` to validate test specs deterministically.
