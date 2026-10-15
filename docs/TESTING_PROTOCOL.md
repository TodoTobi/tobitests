# TobiTests Testing Protocol

Follow this protocol whenever onboarding a new web application into TobiTests.

---

## Phase 1: Environment Readiness
1. **Target App Running:** Verify the web application is running locally (e.g. `http://localhost:3000` or `http://localhost:5173`) or in a dedicated staging URL.
2. **Database Clean / Seeded:** Ensure the database has test fixtures loaded and a rollback / reset script available.
3. **MCP Tooling Active:** Verify that `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` servers are connected.

---

## Phase 2: Domain Decomposition (Orchestrator)
1. Read the frontend route map (e.g., `App.tsx`, `routes.ts`, or Next.js `app/` router).
2. Read backend API routes and entity schemas.
3. Produce a structured test plan:
   - Domain 1: Authentication & Authorization
   - Domain 2: Core Entities CRUD
   - Domain 3: Critical Business Workflows
   - Domain 4: Edge Cases & Error Boundaries

---

## Phase 3: Exploratory & Telemetry Run
1. Dispatch the **Explorer QA** agent to walk the Happy Path.
2. The **Telemetry Auditor** monitors:
   - Failed network requests (`>= 400`)
   - Browser console exceptions or unhandled rejections
3. Execute Negative Testing:
   - Submit empty forms, oversized strings, boundary values.
   - Test unauthorized redirects.

---

## Phase 4: Spec Generation & CI Verification
1. The **Spec Writer** generates the corresponding `.spec.ts` inside `specs/`.
2. Run the test locally:
   ```bash
   npx playwright test specs/<domain>.spec.ts
   ```
3. Ensure 100% deterministic green pass before merging.
