# Guía de Contribución a TobiTests

*Read this in [English](./CONTRIBUTING.md).*

¡Gracias por tu interés en contribuir a **TobiTests** — el motor open-source de QA E2E y APIs multiagente! Esta guía describe la estructura del repositorio, cómo integrar nuevos agentes de código, cómo extender el Oráculo de Detección de Errores de 3 Capas y el flujo para Pull Requests.

---

## 1. Estructura del Repositorio

```text
tobitests/
├── docs/                       # Especificación de arquitectura, protocolo de 8 pasos, guía MCP y manual operativo
├── scripts/                    # CLI agnóstico, servidor MCP, ingesta de resultados Playwright, deep audit y watcher (5 scripts)
├── specs/                      # Suites permanentes de Playwright E2E ({ page }) y API Backend ({ request })
├── templates/                  # Plantillas de referencia para UI Frontend (sample.spec.ts) y APIs REST (sample-api.spec.ts)
├── web/                        # Centro de Comando Interactivo React 18 + TypeScript + Vite (La Oficina 2.5D + Journey Canvas)
│   ├── public/data/            # Estados JSON por proyecto y pizarra compartida antigravity-live.json
│   └── src/                    # Componentes UI (JourneyCanvas, OfficeScene, TestDetailModal) y hook useTobiState
├── workspaces/                 # PRD normalizado (prd-ground-truth.json) y matrices de prueba por proyecto
├── AGENTS.md                   # Roles de agentes, topología de co-orquestación y contrato de Pizarra Compartida
├── AGENT_INSTRUCTIONS.md       # Manual de ejecución autónoma para agentes de IA
└── CLAUDE.md                   # Guía y referencia CLI para Claude Code
```

---

## 2. Agregar Soporte para Nuevos Agentes de IA e IDEs

TobiTests coordina múltiples agentes mediante una pizarra local compartida (`web/public/data/antigravity-live.json`) y servidores estándar Model Context Protocol (MCP) (`@playwright/mcp`, `@chromedevtools/chrome-devtools-mcp` y `tobitests-mcp`).

Para integrar un nuevo agente o IDE (por ejemplo, Cursor, Windsurf, Cline, Claude Code u orquestadores propios):

1. **Conectar los Servidores MCP:** Apunta la configuración MCP de tu agente a `@playwright/mcp` y `@chromedevtools/chrome-devtools-mcp` (consulta [`docs/MCP_SETUP.md`](docs/MCP_SETUP.md)) o utiliza [`.mcp.json`](.mcp.json).
2. **Adoptar el Contrato de Pizarra (`web/public/data/antigravity-live.json`):**
   - Lee `activeProject`, `auditScope` (`"frontend"` | `"backend"` | `"fullstack"`), `currentPipelineStep` (`1`–`8`) y `blackboardState` (`"idle"` | `"exploring"` | `"auditing"` | `"writing_specs"` | `"executing_tests"` | `"triaging"` | `"standup_meeting"`).
   - Emite actualizaciones de estado mediante `POST /api/antigravity/scope` o actualizando `web/public/data/antigravity-live.json` para que La Oficina 2.5D y el Journey Canvas reflejen el progreso en tiempo real.
3. **Registrar Roles y Motores:** Documenta nuevas integraciones de motores o instrucciones de rol en [`AGENTS.md`](AGENTS.md) y [`AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md), y registra su detección en `scripts/tobitests_cli.py`.

---

## 3. Extender el Oráculo de Detección de Errores de 3 Capas

Cada sesión exploratoria y ejecución automatizada evalúa la aplicación objetivo bajo tres capas complementarias definidas en [`docs/TESTING_PROTOCOL.md`](docs/TESTING_PROTOCOL.md):

- **Capa 1 — Oráculo Implícito (Telemetría de Red y Runtime):**
  - Captura excepciones no controladas (`pageerror`), `console.error`, códigos HTTP `>= 400`, bloqueos CORS y peticiones que superan los SLAs de latencia (`> 500ms` salud / `> 3000ms` CRUD).
  - *Cómo extender:* Agrega nuevos listeners CDP o validadores de cabeceras en `templates/sample.spec.ts`, `templates/sample-api.spec.ts` y `specs/fixtures/tobi.ts`.
- **Capa 2 — Oráculo de Divergencia de Estado (Caja Blanca vs. DOM/API en Vivo):**
  - Compara la máquina de estados extraída del código fuente (`workspaces/<proyecto>/prd-ground-truth.json`) frente a las mutaciones reales entre vistas y roles.
  - *Cómo extender:* Amplía el descubrimiento de rutas y esquemas en `scripts/tobitests_cli.py` para soportar nuevos frameworks (por ejemplo, Django, Spring Boot, Laravel, GraphQL, gRPC).
- **Capa 3 — Oráculo Visual y de Accesibilidad (Layout y WCAG/ARIA):**
  - Detecta desbordamientos (`scrollWidth > clientWidth`), controles interactivos bloqueados (`pointer-events: none`), fallos al cerrar modales (`Escape`) y violaciones ARIA/contraste.
  - *Cómo extender:* Aporta aserciones reutilizables de inspección DOM en `templates/sample.spec.ts` y documéntalas en [`docs/TESTING_PROTOCOL.md`](docs/TESTING_PROTOCOL.md).

---

## 4. Convención de Commits y Checklist de Pull Request

Seguimos la especificación [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad o capacidad de agente (ej. `feat: add Vue 3 route discovery`)
- `fix:` Corrección de error o auto-sanación de selector
- `docs:` Actualizaciones de documentación o manuales operativos
- `test:` Especificaciones Playwright E2E / API nuevas o actualizadas
- `refactor:` Reestructuración de código sin cambiar comportamiento externo

### Checklist antes de enviar un Pull Request
- [ ] `python -m pytest -q` pasa sin errores.
- [ ] `npm run typecheck:web` y `npm run build:web` compilan sin errores de TypeScript o Vite.
- [ ] Las suites de auto-auditoría pasan (`npx playwright test specs/tobitests-*.spec.ts` con `TOBI_NO_STATE_WRITE=1`).
- [ ] Ningún archivo incluido contiene rutas personales locales (`<HOME_DIR>/...`), UUIDs de sesión ni credenciales reales.
- [ ] La documentación (`README.md`, `README.es.md`, `docs/USER_GUIDE.md` o `docs/ARCHITECTURE.md`) está actualizada si se agregaron flags o controles nuevos.

---

*Consulta también el [Código de Conducta](./CODE_OF_CONDUCT.es.md), la [Política de Seguridad](./SECURITY.es.md) y el [README en Español](./README.es.md).*
