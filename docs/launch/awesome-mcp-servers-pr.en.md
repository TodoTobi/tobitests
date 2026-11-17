# Pull Request: Add TobiTests to awesome-mcp-servers

**Target Repository:** `punkpeye/awesome-mcp-servers`  
**Base Branch:** `main`  
**Head Branch:** `add-tobitests`  
**Category Section:** `Testing / QA` (or `Frameworks / Developer Tools`)

---

## PR Title
```text
Add tobitests to Testing / QA
```

---

## PR Body / Description

```markdown
### Summary
This PR adds **tobitests** to the `Testing / QA` section of the curated list of Model Context Protocol (MCP) servers.

### Entry Line
```markdown
- [tobitests](https://github.com/TodoTobi/tobitests) - Autonomous multi-agent E2E QA framework combining Playwright MCP and Chrome DevTools MCP. Generates, runs, and triages Playwright tests with a 3-Layer Bug Detection Oracle. MIT license.
```

### Checklist
- [x] The repository is public, open source, and actively maintained.
- [x] Includes an OSI-approved open source license (MIT).
- [x] The entry is placed in alphabetical order within the appropriate section (`Testing / QA`).
- [x] Format strictly follows `- [name](url) - Description ending with a period.`.
- [x] Does not include unnecessary promotional or hype language.
- [x] Native MCP server implemented (`scripts/tobitests_mcp.py` / `tobitests-mcp`) providing tools: `tobitests_bootstrap`, `tobitests_run_audit`, `tobitests_get_digest`, `tobitests_heal_selectors`, `tobitests_blackboard_sync`.
```

---

## Instructions for Opening the PR (Fase B)

1. Fork `https://github.com/punkpeye/awesome-mcp-servers` to your personal GitHub account (`@TodoTobi`).
2. Clone your fork locally or edit directly on GitHub:
   ```bash
   git clone https://github.com/TodoTobi/awesome-mcp-servers.git
   cd awesome-mcp-servers
   git checkout -b add-tobitests
   ```
3. Locate the `## Testing` or `## Testing / QA` heading in `README.md`.
4. Insert the entry in alphabetical order:
   ```markdown
   - [tobitests](https://github.com/TodoTobi/tobitests) - Autonomous multi-agent E2E QA framework combining Playwright MCP and Chrome DevTools MCP. Generates, runs, and triages Playwright tests with a 3-Layer Bug Detection Oracle. MIT license.
   ```
5. Commit and push:
   ```bash
   git add README.md
   git commit -m "Add tobitests to Testing / QA"
   git push origin add-tobitests
   ```
6. Open a Pull Request from `TodoTobi/awesome-mcp-servers:add-tobitests` to `punkpeye/awesome-mcp-servers:main` using the PR Title and Body provided above.
