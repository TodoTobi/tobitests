# TobiTests — Figma AI Design Brief & UI Specification

> **Prompt for Figma AI / UI Designer:** Generate a modern, developer-first, dark-themed SaaS web application interface called **TobiTests** (an autonomous, multi-agent E2E testing and diagnostics platform inspired by TestSprite). Follow this detailed design brief and component hierarchy.

---

## 🎨 Design System & Theme Directives
* **Aesthetic:** High-density, professional developer tool (similar to Linear, Vercel, Raycast, and TestSprite).
* **Color Palette:**
  * Backgrounds: Deep Slate / Obsidian (`#0B0F17`, `#111827`, `#1F2937`)
  * Surface & Cards: Elevated Charcoal (`#161E2E`, `#1E293B`) with subtle 1px border (`#334155`)
  * Accents: Electric Emerald / Neon Cyan for Passed/Live (`#10B981`, `#06B6D4`), Coral Crimson for Bugs/500s (`#EF4444`), Amber for In-Progress (`#F59E0B`), Indigo/Purple for AI Agents (`#6366F1`, `#8B5CF6`).
  * Typography: Inter or Geist for UI, JetBrains Mono or Fira Code for logs, telemetry, and code snippets.
* **Layout:** Left sidebar navigation, top application header with target selector and live status, main multi-view viewport, and collapsable right telemetry drawer.

---

## 📐 Core Navigation & Views

1. **Dashboard & Test Runs:** Overview of active targets (e.g. VetConnect), execution matrices, pass/fail rates, and live agent activity.
2. **Bug Tracker & Diagnostic Studio:** Comprehensive BDD/Gherkin bug cards, video replay, screenshots, network waterfalls, and console stack traces.
3. **The Office ("La Oficina"):** Gamified isometric/pixel-art virtual office representing the AI agent team in real time.
4. **Test Specs & Suites:** Generated Playwright `.spec.ts` files ready for copy, download, or CI sync.
5. **Settings & MCP Status:** Health indicators for `@playwright/mcp` and `@chromedevtools/chrome-devtools-mcp`.

---

## 🏢 Highlight Feature: "La Oficina" (Virtual Agent Office)

A visual, interactive command center representing the autonomous agent workforce as animated isometric/2D team members in an open-plan modern software office.

### Visual Elements & Layout:
* **Central Command Desk:** 
  * Character: **Central Orchestrator (Chief Architect)**.
  * Desk setup: Holographic blueprint or giant multi-monitor curved display.
* **Specialized Agent Desks:**
  * **Explorer QA Agent:** Equipped with multiple devices (desktop screen, tablet, mobile mockup).
  * **Telemetry Auditor:** Positioned near a server rack or matrix wall showing streaming green/red terminal logs.
  * **Spec Writer:** Focused desk with code editor visuals and glowing test passing badges.
* **Dynamic Agent States:**
  * **Idle State (No tests running):** Agents sit comfortably, sipping coffee, reading documentation, or in relaxing idle animation.
  * **Active State (Audit in progress):** 
    * Fast typing animations, screens lighting up with DOM trees and wireframes.
    * Walking between desks, whiteboards, or server racks to hand off findings.
    * **Floating Speech Balloons (Mini tooltips):** Ultra-concise status updates (maximum 3–5 words), e.g.:
      * *"Testing /login flow"*
      * *"Inspecting 500 error"*
      * *"Clicking 'Crear Mascota'"*
      * *"Writing auth.spec.ts"*
* **Interactive Behavior:** Clicking any agent character immediately zooms into their dedicated live terminal feed and MCP tool transcript.

---

## 🐛 Bug Tracker View & Standardized BDD/Gherkin Template

Every bug detected by TobiTests is rendered into a high-fidelity bug report card. The bug description **must strictly implement the following BDD/Gherkin structure**:

```text
Escenario:
Nombre y sección: [BUG-ID]: [Título descriptivo], sección: [Módulo afectado]

Pasos para reproducir:
Dado que [Contexto / datos iniciales del sistema].
Cuando [Acción exacta y secuencial que ejecuta el operador].
Entonces [Resultado real obtenido en el sistema] frente a [Resultado esperado que debería ocurrir].
```

### Real Example Card Layout in Figma:
* **Card Header:**
  * Tag: `BUG-01` (Badge: Critical / High)
  * Title: `Inconsistencia al cancelar consulta entre Mensajes y Mascotas`
  * Section: `Mensajes / Consultas`
  * Target: `VetConnect Web`
* **Card Body (BDD Details):**
  * **Dado que:** el operador tiene una consulta activa ("En consulta") registrada para una mascota.
  * **Cuando:** el operador accede a la sección "Mensajes" y presiona el botón "Cancelar".
  * **Entonces:** el mensaje es removido de la bandeja (resultado real obtenido), pero al navegar a "Mascotas -> Tus consultas", el registro de la consulta sigue figurando erróneamente en estado "En consulta" (resultado real obtenido) cuando debería figurar como cancelado o haber sido eliminado de forma sincronizada en ambas secciones (resultado esperado).
* **Media & Evidence Tabs:**
  * 📷 **Screenshots:** Side-by-side comparison of "Mensajes" vs "Mascotas".
  * 🎥 **Video Player:** Embedded replay showing the exact cursor movement and click sequence.
  * 🌐 **Network Trace:** HTTP `POST /api/appointments/cancel` response (e.g. `200 OK` but missing event dispatch to pets state).
  * 💻 **Console Log:** Telemetry captured by Chrome DevTools MCP.
* **Action Buttons:**
  * `[Copy BDD Markdown]` (One-click export)
  * `[Download Bug Report (.md)]`
  * `[Send to AI Architect to Fix]`

---

## 📊 Live Run View (The TestSprite Experience)

* **Split-Screen Layout:**
  * **Left Side (Browser Mirror):** Live or recorded stream of the browser executing steps via Playwright MCP with highlighted green/blue click halos and typed text markers.
  * **Right Side (Step Timeline):**
    * Numbered chronological action cards:
      * `01. NAVIGATE -> http://localhost:5173/login`
      * `02. TYPE -> input[name="email"] ("veterinario@vetconnect.com")`
      * `03. CLICK -> button[type="submit"]`
      * `04. VERIFY -> expect(url).toBe('/vet/dashboard')`
    * Each step shows execution time (e.g. `124ms`) and attached DevTools network payload inspection.

---

## 📥 Export & Integration
* Header bar button: **"Export Master Bug Report (.md)"** that aggregates all detected bugs formatted in the exact BDD schema, ready to feed into any AI coding model to generate fixes.
