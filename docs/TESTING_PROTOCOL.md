# TobiTests Testing Protocol & Bug Classification Standard

Follow this protocol whenever onboarding, auditing, or executing autonomous QA runs against a web application in TobiTests.

---

## Phase 1: Environment Readiness & Bootstrap
1. **Target App Running:** Verify the web application is running locally (e.g. `http://localhost:3000` or `http://localhost:5173`) or in a dedicated staging URL.
2. **Database Clean / Seeded:** Ensure the database has deterministic test fixtures loaded and a rollback / reset script available.
3. **MCP Tooling Active:** Verify that `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp` servers are connected and responsive.

---

## Phase 2: White-Box Domain Decomposition (Orchestrator)
1. Read the frontend route map (e.g., `App.tsx`, `routes.ts`, or Next.js `app/` router).
2. Read backend API routes, controllers, and entity validation schemas (Zod, Joi, Yup, TypeScript types).
3. Synthesize the Ground Truth Normalized PRD and produce a structured test matrix across four pillars:
   - **Domain 1:** Authentication, Session Lifecycle & RBAC Security Boundaries
   - **Domain 2:** Core Entities CRUD & Form Validation (Happy + Negative/Boundary Paths)
   - **Domain 3:** Critical Business Workflows & Cross-View/Cross-Role Synchronization
   - **Domain 4:** UI/UX, Responsive Layout, Modal Ergonomics & WCAG Accessibility

---

## Phase 3: Exploratory & Telemetry Execution (The 3 Oracles)

During both exploratory agent runs and automated Playwright executions, subagents (**Explorer QA** and **Telemetry Auditor**) must evaluate the application using the **3-Layer Detection Mechanism**:

### 1. Layer 1 — Implicit Oracle (Chrome DevTools MCP & Runtime Listeners)
Every test execution attaches runtime listeners and inspects CDP streams to catch silent or fatal technical errors even if the UI appears responsive:
- **Playwright Runtime Listeners:**
  - `page.on('pageerror', err => ...)` — Captures uncaught JavaScript exceptions and fatal render crashes.
  - `page.on('console', msg => ...)` — Captures `console.error` and critical React/runtime warnings.
  - `page.on('response', res => ...)` / `page.on('requestfailed', req => ...)` — Captures HTTP status codes `>= 400` and aborted/CORS-blocked requests.
- **Chrome DevTools MCP Tools:**
  - `list_console_messages` & `get_console_message` — Inspect full stack traces and console error payloads.
  - `list_network_requests` & `get_network_request` — Inspect request headers, response bodies, status codes (`>= 400`), and latency bottlenecks.
- **Real-Time & Async Timeout Detection:**
  - Flag any API request, WebSocket channel (`/socket.io`), SSE stream (`/api/stream`), or WebRTC peer connection that hangs beyond `3000ms` or fails to recover after a transient disconnect.

### 2. Layer 2 — State Divergence Oracle (Playwright MCP + Source Code)
Subagents compare the expected state machine deduced from the repository source code against the live DOM after every state-mutating action:
- **Playwright MCP Actuators & Snapshots:** Use `browser_navigate`, `browser_click`, `browser_type`, `browser_select_option`, and `browser_snapshot` to verify that mutations propagate across all dependent views.
- **Cross-View Synchronization:** When an entity is created, updated, or cancelled in View A (e.g., Messages inbox), navigate to View B (e.g., Pets/Consultations list or Dashboard KPIs) and verify via `browser_snapshot` that no stale cache or state divergence exists.
- **Cross-Role Synchronization:** Verify that mutations performed by Role A (e.g., Tutor/Client) are accurately reflected in Role B's portal (e.g., Veterinarian/Admin triage queue).

### 3. Layer 3 — Visual & Accessibility Oracle (DOM Snapshot & Computed Styles)
Subagents inspect the accessibility tree (`browser_snapshot` / `take_snapshot`) and computed DOM geometry (`browser_evaluate` / `evaluate_script`):
- **Blocked Interactive Controls:** Detect elements with `pointer-events: none`, zero width/height, or obscured by overlapping layers that prevent user interaction.
- **Layout Overflow & Responsive Breakage:** Check `scrollWidth > clientWidth` and bounding client rects to catch horizontal overflow, clipped cards, or overlapping text across desktop and mobile (`375px`) viewports.
- **Modal & Keyboard Ergonomics:** Verify that all modals, drawers, and popovers close cleanly via the `Escape` key (`browser_press_key`), backdrop click, and close button, and maintain visible focus indicators.
- **Accessibility (`a11y`) Compliance:** Flag missing semantic roles/labels, invalid ARIA state attributes, and WCAG contrast violations.

---

## Phase 4: Bug Severity & Impact Rubric (`critical` P0 to `low` P3)

All anomalies detected by any of the 3 Oracles must be classified using independent expert judgment under this strict rubric:

| Severity Level | Priority | Impact & Classification Criteria | Examples |
| :--- | :--- | :--- | :--- |
| **`critical`** | **P0 (Blocker)** | Application crash (white screen / unhandled `pageerror`), HTTP `500` in core flow (Auth, Checkout, Payments, Primary Booking), RBAC/security breach, or data loss/corruption. | Unauthenticated user accesses `/admin/dashboard`; `500 Internal Server Error` on login submit; React render crash on page load. |
| **`high`** | **P1 (Major)** | State divergence across views or roles, broken primary business flow without an obvious workaround, or timeout/freeze in key real-time services (WebRTC, WebSockets). | Cancelling a consultation in Messages leaves it `"En consulta"` in Pets; WebRTC video stream freezes permanently on ICE disconnect; telemetry buffer bleed across agents. |
| **`medium`** | **P2 (Minor)** | Missing form validations, mishandled loading/empty states in secondary components, stale context fields in modals, or UI failures with an easy workaround. | Digital prescription modal omits doctor's saved license number (`MN-PENDIENTE`); form submits without client-side format check. |
| **`low`** | **P3 (Trivial/UI)** | Localization/translation mix-ups, minor visual misalignment, non-blocking `console.warn` messages, or minor cosmetic/ergonomic friction. | Queue filter resets to `"All"` after returning from patient detail view; minor badge padding shift at `375px`. |

---

## Phase 5: Strict Bug Output Schema (Gherkin/BDD + Telemetry + Root Cause)

Every confirmed bug recorded in TobiTests state JSONs (`web/public/data/<project>-state.json`) MUST include:
1. **Structured Gherkin (`Given` / `When` / `Then` / `But`)** scenario (mapped to both structured `gherkin` fields and UI-compatible `dadoQue` / `cuando` / `entonces` fields).
2. **Linked Evidence:** Valid paths/arrays for `screenshot`, `video` (`videoUrl`), `console_log`, and `network_trace`.
3. **White-Box Root Cause:** Probable source code file (`root_cause_file`) and estimated line number (`root_cause_line`) alongside the `diagnostic` object (`observedFact`, `whiteBoxHypothesis`, `reproductionSpec`, `affectedFile`, `recommendedFix`, `scopeIn`, `scopeOut`).

### Canonical JSON Bug Contract
```json
{
  "id": "BUG-01",
  "title": "Inconsistencia al cancelar consulta entre Mensajes y Mascotas",
  "severity": "high",
  "priority": "P1",
  "oracle_layer": "Layer 2: State Divergence",
  "status": "Confirmed",
  "section": "Mensajes / Consultas",
  "runId": "#RUN-01",
  "agent": "Telemetry Auditor",
  "scenario": "BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas, seccion: Mensajes / Consultas",
  "gherkin": {
    "given": "el operador tiene una consulta activa ('En consulta') registrada para una mascota.",
    "when": "el operador accede a la sección 'Mensajes' y presiona el botón 'Cancelar'.",
    "then": "el registro de la consulta debería figurar como cancelado o ser eliminado de forma sincronizada en ambas secciones.",
    "but": "el mensaje es removido de la bandeja de Mensajes, pero al navegar a 'Mascotas -> Tus consultas' sigue figurando erróneamente en estado 'En consulta'."
  },
  "dadoQue": "el operador tiene una consulta activa (\"En consulta\") registrada para una mascota.",
  "cuando": "el operador accede a la sección \"Mensajes\" y presiona el botón \"Cancelar\".",
  "entonces": "el mensaje es removido de la bandeja (resultado real obtenido), pero al navegar a \"Mascotas → Tus consultas\", el registro de la consulta sigue figurando erróneamente en estado \"En consulta\" (resultado real obtenido) cuando debería figurar como cancelado o haber sido eliminado de forma sincronizada en ambas secciones (resultado esperado).",
  "screenshot": "/evidence/bugs/bug-01-divergence-evidence.png",
  "videoUrl": "/evidence/videos/bug-01-cancellation-replay.webm",
  "evidence": {
    "screenshot": "/evidence/bugs/bug-01-divergence-evidence.png",
    "video": "/evidence/videos/bug-01-cancellation-replay.webm",
    "console_log": [
      "[WARN] [QueryCache] Stale query key ['pets', 'consultations'] not invalidated after local state mutation"
    ],
    "network_trace": [
      "GET /api/pets/consultations -> 200 OK (cached stale payload: status='En consulta')"
    ]
  },
  "root_cause_file": "src/pages/client/MessagesPage.tsx",
  "root_cause_line": 142,
  "diagnostic": {
    "observedFact": "En VetConnect, al cancelar una consulta en la bandeja de Mensajes, el ítem se borra localmente en el componente MessageList pero en Mascotas → Tus consultas el registro permanece en 'En consulta'.",
    "whiteBoxHypothesis": "La función handleCancel en Mensajes solo muta el arreglo de mensajes del estado React local; no despacha la mutación API /api/consultations/:id/cancel ni invalida la query de React Query para la lista de mascotas.",
    "reproductionSpec": "specs/vetconnect-appointments.spec.ts (TC-MSG-11)",
    "affectedFile": "src/pages/client/MessagesPage.tsx:142",
    "recommendedFix": "Invocar la mutación apiClient.post(`/consultations/${id}/cancel`) y ejecutar queryClient.invalidateQueries(['consultations']) y queryClient.invalidateQueries(['pets']).",
    "impact": "409 SYNC DIVERGENCE",
    "badgeTone": "danger"
  }
}
```

---

## Phase 6: Spec Codification, Self-Healing & CI Verification
1. The **Spec Writer** generates or updates the corresponding `.spec.ts` inside `specs/<domain>.spec.ts` (using [`templates/sample.spec.ts`](../templates/sample.spec.ts) for UI flows with `{ page }` and [`templates/sample-api.spec.ts`](../templates/sample-api.spec.ts) for pure Backend/API flows with `{ request }`).
2. Execute the suite and automatically ingest results into `web/public/data/<project>-state.json` and `web/public/data/antigravity-live.json`:
   ```bash
   npm run audit:run -- --project <slug> --run-playwright
   ```
3. For **Pure Backend / REST API Audits**, verify all 4 mandatory suites in `specs/<domain>-api.spec.ts`:
   - **Suite 1 (`2xx`):** Health, JSON schema contract, and latency SLA (`< 500ms` / `< 3000ms`).
   - **Suite 2 (`4xx`):** Negative & boundary payload fuzzing (malformed JSON, SQLi/XSS — strictly `< 500`).
   - **Suite 3 (`401`/`403`):** RBAC, tampered JWT rejection, and horizontal/vertical privilege escalation.
   - **Suite 4 (Concurrency):** Parallel `Promise.all` mutations verifying idempotency and absence of race conditions.
4. If a UI selector fails due to a benign UI change (locator drift) rather than a functional bug under the 3 Oracles, apply **Selector Self-Healing** by inspecting the updated `browser_snapshot` and updating the locator in `specs/<domain>.spec.ts`.
5. See [`docs/USER_GUIDE.md`](USER_GUIDE.md) and [`docs/MCP_SETUP.md`](MCP_SETUP.md) for daily operational workflows and copy-paste prompts.

