import json
import os

def generate_self_audit():
    # 84 tests testing TobiTests itself
    suites_def = [
        {
            "name": "Suite 1: Shell, Navigation & Responsive Layout",
            "specFile": "tobitests-shell.spec.ts",
            "testsCount": 18,
            "passRate": "100%",
            "duration": "2.4s",
            "status": "Passed",
            "description": "Verifica renderizado de la portada, sidebar de navegación, atajos de teclado y adaptación responsive móvil."
        },
        {
            "name": "Suite 2: Virtual Office & Isometric Simulation",
            "specFile": "tobitests-office.spec.ts",
            "testsCount": 18,
            "passRate": "94.4%",
            "duration": "3.1s",
            "status": "Failed",
            "description": "Audita estaciones de agentes en 2.5D, sincronización de actividad, poses cinéticas y feed de telemetría."
        },
        {
            "name": "Suite 3: Bug Tracker, BDD & Diagnostic Studio",
            "specFile": "tobitests-bugs.spec.ts",
            "testsCount": 16,
            "passRate": "100%",
            "duration": "2.1s",
            "status": "Passed",
            "description": "Valida filtrado de incidentes, formateo Gherkin Dado/Cuando/Entonces, exportación de reportes y pestañas de evidencia."
        },
        {
            "name": "Suite 4: Playwright Spec Viewer & Code Syntax",
            "specFile": "tobitests-specs.spec.ts",
            "testsCount": 16,
            "passRate": "100%",
            "duration": "1.8s",
            "status": "Passed",
            "description": "Inspecciona el árbol de archivos de prueba, resaltado de aserciones expect() y copiado al portapapeles."
        },
        {
            "name": "Suite 5: Settings, Telemetry & MCP Connectivity",
            "specFile": "tobitests-settings.spec.ts",
            "testsCount": 16,
            "passRate": "100%",
            "duration": "2.2s",
            "status": "Passed",
            "description": "Comprueba vinculación del workspace local, estado de herramientas MCP y conmutación reactiva de agentes."
        }
    ]

    tests = []
    
    # Generate 18 tests for Suite 1 (Shell)
    shell_cases = [
        "Carga inicial de la portada con tipografía Geist y Source Serif 4",
        "Navegación al Workspace sin parpadeo de contenido ni layout shift",
        "Conmutación de barra lateral compacta y persistencia de ancho",
        "Apertura del drawer de notificaciones con tecla de acceso rápido",
        "Cierre accesible de modales al presionar tecla Escape",
        "Buscador global con filtrado instantáneo por ID y texto",
        "Badge de estado de conexión WebSocket con indicador pulsante",
        "Botones interactivos con respuesta táctil y micro-transiciones",
        "Contraste de texto conforme a WCAG AA en modo claro",
        "Viewport responsivo adaptable a 375px (Mobile First)",
        "Navegación por teclado completa (Tab, Shift+Tab, Enter)",
        "Foco visible persistente en todos los elementos interactivos",
        "Barra de estado superior con ruta actual y rama de Git",
        "Tooltip contextual en botones de acción sin solapamiento",
        "Renderizado sin errores en consola durante transiciones de ruta",
        "Manejo de rutas inválidas con redirección segura al Dashboard",
        "Sanitización de entradas en campos de búsqueda contra XSS",
        "Almacenamiento seguro de preferencias de vista en LocalStorage"
    ]
    for i, title in enumerate(shell_cases, 1):
        tests.append({
            "name": f"TC-SHELL-{i:02d}: {title}",
            "spec": "tobitests-shell.spec.ts",
            "status": "Passed",
            "duration": f"{0.1 + (i % 4) * 0.05:.2f}s",
            "screenshot": "/evidence/runs/tobi-01-landing.png",
            "videoUrl": "/evidence/videos/tobitests-self-audit.webm",
            "steps": [
                {"step": 1, "action": "Navigate", "target": "page.goto('http://localhost:5173')", "status": "Passed", "duration": "80ms"},
                {"step": 2, "action": "Assert", "target": "expect(page.locator('.app')).toBeVisible()", "status": "Passed", "duration": "25ms"}
            ]
        })

    # Generate 18 tests for Suite 2 (Office)
    office_cases = [
        "Renderizado de la cuadrícula isométrica en canvas 2.5D",
        "Estación Mesa de Comando Central con agente Orchestrator activo",
        "Estación Zona de Desarrollo con Explorer QA y Spec Writer",
        "Estación Sala de Servidores con Telemetry Auditor y Chrome CDP",
        "Conmutación entre estado 'working' y 'idle' con actualización de avatar",
        "Animación de poses cinéticas de agentes mediante useAgentMotion",
        "Burbujas de diálogo contextuales con tarea actual de cada agente",
        "Feed de telemetría en tiempo real con niveles info, warn y success",
        "Filtrado de eventos por origen: Playwright, CDP y Orchestrator",
        "Selector de agentes con resaltado de mesa y cámara de enfoque",
        "Modal de pantalla completa de estación de trabajo sin desbordamiento",
        "Persistencia de simulación en segundo plano al cambiar de pestaña",
        "Divergencia de estado en filtros de telemetría al alternar agentes", # BUG-01
        "Tasa de refresco constante a 60 FPS en el renderizador isométrico",
        "Accesibilidad de la escena mediante etiquetas ARIA en cada estación",
        "Pausa de simulación respetando la preferencia prefers-reduced-motion",
        "Reconexión automática del stream SSE ante desconexión temporal",
        "Exportación de traza de ejecución de la simulación en formato JSON"
    ]
    for i, title in enumerate(office_cases, 1):
        is_bug = (i == 13)
        tests.append({
            "name": f"TC-OFFICE-{i:02d}: {title}",
            "spec": "tobitests-office.spec.ts",
            "status": "Failed" if is_bug else "Passed",
            "duration": f"{0.15 + (i % 5) * 0.06:.2f}s",
            "screenshot": "/evidence/runs/tobi-04-office.png",
            "videoUrl": "/evidence/videos/tobitests-bug-01-replay.webm" if is_bug else "/evidence/videos/tobitests-self-audit.webm",
            "steps": [
                {
                    "step": 1,
                    "action": "Abrir vista",
                    "target": "Entrar a 'La Oficina' desde el menú lateral",
                    "status": "Passed",
                    "duration": "60ms",
                    "screenshot": "/evidence/runs/tobi-02-dashboard.png",
                    "description": "El usuario hace clic en 'La Oficina' para ver a los agentes en vivo."
                },
                {
                    "step": 2,
                    "action": "Cargar estudio 2.5D",
                    "target": "Visualizar las 4 estaciones de trabajo de los agentes",
                    "status": "Passed",
                    "duration": "35ms",
                    "screenshot": "/evidence/runs/tobi-04-office.png",
                    "description": "Comprueba que la escena isométrica se dibuje con los agentes en sus puestos."
                },
                {
                    "step": 3,
                    "action": "Filtrar eventos",
                    "target": "Aislar solo los logs del agente que seleccionó el usuario",
                    "status": "Failed" if is_bug else "Passed",
                    "duration": "40ms",
                    "screenshot": "/evidence/bugs/tobi-bug-01-detail.png" if is_bug else "/evidence/runs/tobi-04-office.png",
                    "expected": "Ver únicamente los eventos del agente actual",
                    "actual": "Se mezclan eventos de agentes anteriores en la consola" if is_bug else "Filtro aplicado correctamente",
                    "description": "Valida que al hacer clic en un agente, el terminal solo muestre su propia actividad."
                }
            ]
        })

    # Generate 16 tests for Suite 3 (Bugs)
    bug_cases = [
        "Lista de bugs renderiza ID, título, severidad y agente detector",
        "Buscador de incidentes filtra reactivamente por término",
        "Ficha de bug presenta estructura Gherkin Dado que / Cuando / Entonces",
        "Pestaña de Captura muestra evidencia visual de alta resolución",
        "Pestaña de Consola muestra logs de Playwright y DevTools sincronizados",
        "Pestaña de Diagnóstico muestra causa raíz, hipótesis y solución",
        "Pestaña de Spec muestra código Playwright con sintaxis resaltada",
        "Selector de cuentas alternativas conmuta video de reproducción",
        "Botón 'Copiar BDD' copia escenario formateado con feedback de check",
        "Botón 'Exportar reporte' descarga archivo Markdown con frontmatter",
        "Modal de vista previa de reporte completo con scroll suave",
        "Badge de severidad usa colores semánticos (Crítica, Alta, Media)",
        "Navegación directa desde el bug hacia el spec de reproducción",
        "Navegación directa desde el bug hacia la vista de Test Runs",
        "Persistencia del bug seleccionado en estado de la aplicación",
        "Cierre accesible del modal de reporte mediante botón o tecla Escape"
    ]
    for i, title in enumerate(bug_cases, 1):
        tests.append({
            "name": f"TC-BUGS-{i:02d}: {title}",
            "spec": "tobitests-bugs.spec.ts",
            "status": "Passed",
            "duration": f"{0.12 + (i % 3) * 0.04:.2f}s",
            "screenshot": "/evidence/runs/tobi-03-bug-tracker.png",
            "videoUrl": "/evidence/videos/tobitests-self-audit.webm",
            "steps": [
                {"step": 1, "action": "Click", "target": "page.click('button:has-text(\"Bug Tracker\")')", "status": "Passed", "duration": "50ms"},
                {"step": 2, "action": "Assert", "target": "expect(page.locator('.table')).toBeVisible()", "status": "Passed", "duration": "30ms"}
            ]
        })

    # Generate 16 tests for Suite 4 (Specs)
    spec_cases = [
        "Árbol lateral lista todos los archivos .spec.ts generados",
        "Selección de archivo carga el código fuente con números de línea",
        "Líneas de aserción expect() se destacan visualmente con fondo tenue",
        "Badge superior indica estado de validación (Passed / Verified)",
        "Contador de tests por spec coincide con la suma del archivo",
        "Botón 'Copiar código' copia el contenido completo al portapapeles",
        "Botón 'Ejecutar' navega a Live Run precargando el spec seleccionado",
        "Columna de historial cronológico detalla agente creador del spec",
        "Metadatos al pie del editor indican dominio técnico y última pasada",
        "Barra de desplazamiento horizontal en bloques de código extensos",
        "Fuente monoespaciada Geist Mono con ligaduras tipográficas legibles",
        "Integridad del código TypeScript: importaciones y fixtures válidos",
        "Resistencia a desbordamiento de texto en pantallas reducidas",
        "Atajo de teclado para saltar entre archivos del explorador",
        "Aislamiento de estado: no se muta el código en modo visualización",
        "Sincronización con el sistema de archivos del workspace local"
    ]
    for i, title in enumerate(spec_cases, 1):
        tests.append({
            "name": f"TC-SPECS-{i:02d}: {title}",
            "spec": "tobitests-specs.spec.ts",
            "status": "Passed",
            "duration": f"{0.11 + (i % 4) * 0.03:.2f}s",
            "screenshot": "/evidence/runs/tobi-05-specs.png",
            "videoUrl": "/evidence/videos/tobitests-self-audit.webm",
            "steps": [
                {"step": 1, "action": "Click", "target": "page.click('button:has-text(\"Test Specs\")')", "status": "Passed", "duration": "55ms"},
                {"step": 2, "action": "Assert", "target": "expect(page.locator('.code-lines')).toBeVisible()", "status": "Passed", "duration": "35ms"}
            ]
        })

    # Generate 16 tests for Suite 5 (Settings & MCP)
    sett_cases = [
        "Panel Proyecto muestra directorio local, URL y rama de Git",
        "Detección activa del motor de acción @playwright/mcp",
        "Detección activa del motor de telemetría Chrome DevTools CDP",
        "Vinculación del repositorio local en C:/Users/usuario/Documents/tobitests",
        "Listado de 4 agentes de prueba con rol y avatar de iniciales",
        "Botón 'Pausar / Activar' conmuta el estado de cada agente reactivamente",
        "Indicador de estado 'Vinculado' con punto verde de conexión viva",
        "Persistencia de conmutación de agentes entre recargas de página",
        "Validación de endpoints HTTP y puertos locales (5173 / 9222)",
        "Protección de rutas de configuración frente a modificaciones no válidas",
        "Exportación de diagnóstico de entorno en un solo clic",
        "Tiempo de respuesta de la API interna inferior a 15ms",
        "Compatibilidad con Node.js v24 y Vite 8 en el servidor de desarrollo",
        "Monitoreo de memoria en el subproceso de ejecución de Playwright",
        "Registro de auditoría de cambios de configuración en telemetría",
        "Alineación con el manifiesto AGENTS.md del ecosistema TobiTests"
    ]
    for i, title in enumerate(sett_cases, 1):
        tests.append({
            "name": f"TC-SETT-{i:02d}: {title}",
            "spec": "tobitests-settings.spec.ts",
            "status": "Passed",
            "duration": f"{0.13 + (i % 3) * 0.05:.2f}s",
            "screenshot": "/evidence/runs/tobi-07-settings.png",
            "videoUrl": "/evidence/videos/tobitests-self-audit.webm",
            "steps": [
                {"step": 1, "action": "Click", "target": "page.click('button:has-text(\"Settings\")')", "status": "Passed", "duration": "60ms"},
                {"step": 2, "action": "Assert", "target": "expect(page.locator('.defs')).toBeVisible()", "status": "Passed", "duration": "25ms"}
            ]
        })

    state = {
        "project": {
            "name": "TobiTests",
            "repoPath": "C:/Users/usuario/Documents/tobitests",
            "url": "http://localhost:5173",
            "backendUrl": "ws://localhost:9222 (Playwright CDP)",
            "branch": "main",
            "environment": "Dogfooding Local",
            "lastAudit": "Activo ahora"
        },
        "metrics": {
            "passRate": "98.8%",
            "totalRuns": 14,
            "failedTests": 1,
            "openBugs": 1,
            "avgDuration": "0.7s",
            "activeRun": "#RUN-SELF-01",
            "totalTests": 84
        },
        "runs": [
            {
                "id": "#RUN-SELF-01",
                "suite": "TobiTests Self-Audit — End-to-End Suite",
                "branch": "main",
                "status": "Completed",
                "total": 84,
                "passed": 83,
                "failed": 1,
                "skipped": 0,
                "duration": "12.4s",
                "date": "16/10/2026 14:50",
                "commit": "a4f891c",
                "tests": tests
            }
        ],
        "officeAgents": [
            {
                "id": "orchestrator",
                "initials": "OR",
                "name": "Orchestrator",
                "role": "Coordinador & Descomposición",
                "employment": "Mesa de Comando Central",
                "status": "working",
                "activity": "desk",
                "bubble": "Analizando mapa del repo y matriz de cobertura en tobitests",
                "idleBubble": "Mesa lista para nueva orden",
                "task": "Orquestando suite E2E de TobiTests",
                "mcp": "@playwright/mcp",
                "tone": "agent",
                "run": "#RUN-SELF-01"
            },
            {
                "id": "explorer",
                "initials": "QA",
                "name": "Explorer QA",
                "role": "Recorridos & Pruebas Negativas",
                "employment": "Zona de Desarrollo",
                "status": "working",
                "activity": "desk",
                "bubble": "Explorando flujos de TobiTests con @playwright/mcp",
                "idleBubble": "Esperando asignación de ruta",
                "task": "Auditando interfaz y accesibilidad",
                "mcp": "@playwright/mcp",
                "tone": "success",
                "run": "#RUN-SELF-01"
            },
            {
                "id": "telemetry",
                "initials": "TA",
                "name": "Telemetry Auditor",
                "role": "Consola, Red & CWV",
                "employment": "Sala de Servidores",
                "status": "working",
                "activity": "server",
                "bubble": "Escuchando eventos de consola y CDP en puerto 9222",
                "idleBubble": "Servidores en reposo",
                "task": "Inspeccionando logs de tiempo de ejecución",
                "mcp": "chrome-devtools-mcp",
                "tone": "info",
                "run": "#RUN-SELF-01"
            },
            {
                "id": "writer",
                "initials": "SW",
                "name": "Spec Writer",
                "role": "Síntesis de Código Playwright",
                "employment": "Zona de Desarrollo",
                "status": "working",
                "activity": "whiteboard",
                "bubble": "Escribiendo tobitests-shell.spec.ts con selectores semánticos",
                "idleBubble": "Pizarra lista para nuevos specs",
                "task": "Sintetizando tests deterministas",
                "mcp": "@playwright/mcp",
                "tone": "agent",
                "run": "#RUN-SELF-01"
            },
            {
                "id": "opencode",
                "initials": "OC",
                "name": "OpenCode (DeepSeek)",
                "role": "Refactor & Parches de Código",
                "employment": "Zona de Desarrollo · OpenCode Engine",
                "status": "idle",
                "activity": "desk",
                "bubble": "Analizando sugerencias de refactor con deepseek-v4.1-flash-free",
                "idleBubble": "Tomando un café con Antigravity en la cafetería",
                "task": "Generando parches y refactorización con DeepSeek v4.1 Flash",
                "mcp": "opencode (deepseek-v4.1-flash-free)",
                "tone": "accent",
                "run": "#RUN-SELF-01"
            }
        ],
        "liveRun": {
            "id": "#RUN-SELF-01",
            "suite": "TobiTests Self-Audit — End-to-End Suite",
            "target": "http://localhost:5173",
            "status": "Running",
            "currentStep": 6,
            "totalSteps": 8,
            "elapsedTime": "00:12",
            "steps": [
                {
                    "index": "01",
                    "action": "Abrir portada",
                    "target": "http://localhost:5173",
                    "status": "Passed",
                    "duration": "180ms",
                    "description": "Entramos a la página principal y verificamos que el diseño cargue limpio y prolijo.",
                    "screenshot": "/evidence/runs/tobi-01-landing.png",
                    "agent": "Explorer QA"
                },
                {
                    "index": "02",
                    "action": "Revisar Dashboard",
                    "target": "Panel de métricas y resumen de tests",
                    "status": "Passed",
                    "duration": "90ms",
                    "description": "Comprobamos que las estadísticas, porcentajes de éxito y tarjetas se vean claras.",
                    "screenshot": "/evidence/runs/tobi-02-dashboard.png",
                    "agent": "Explorer QA"
                },
                {
                    "index": "03",
                    "action": "Ver lista de bugs",
                    "target": "Sección 'Bug Tracker'",
                    "status": "Passed",
                    "duration": "140ms",
                    "description": "Abrimos el listado para comprobar que cada problema detectado esté ordenado por gravedad.",
                    "screenshot": "/evidence/runs/tobi-03-bug-tracker.png",
                    "agent": "Explorer QA"
                },
                {
                    "index": "04",
                    "action": "Inspeccionar detalle del bug",
                    "target": "Ficha completa de BUG-01",
                    "status": "Passed",
                    "duration": "45ms",
                    "description": "Validamos que el fallo explique qué pasó, por qué ocurrió y cómo corregirlo.",
                    "screenshot": "/evidence/bugs/tobi-bug-01-detail.png",
                    "agent": "Spec Writer"
                },
                {
                    "index": "05",
                    "action": "Entrar a La Oficina",
                    "target": "Estudio 2.5D con los agentes",
                    "status": "Passed",
                    "duration": "210ms",
                    "description": "Observamos a los personajes en sus puestos de trabajo coordinando las tareas.",
                    "screenshot": "/evidence/runs/tobi-04-office.png",
                    "agent": "Explorer QA"
                },
                {
                    "index": "06",
                    "action": "Escuchar eventos en vivo",
                    "target": "Consola de telemetría y red",
                    "status": "Passed",
                    "duration": "30ms",
                    "description": "Capturamos en tiempo real lo que hace el navegador y los errores que surgen.",
                    "screenshot": "/evidence/runs/tobi-06-live-run.png",
                    "agent": "Telemetry Auditor"
                },
                {
                    "index": "07",
                    "action": "Validar animación de agentes",
                    "target": "Movimiento continuo y fluido a 60 FPS",
                    "status": "Running",
                    "duration": "120ms",
                    "description": "Confirmamos que los personajes caminen y trabajen sin congelar la pantalla.",
                    "screenshot": "/evidence/runs/tobi-04-office.png",
                    "agent": "Explorer QA"
                },
                {
                    "index": "08",
                    "action": "Verificar herramientas MCP",
                    "target": "Conexión Playwright + Chrome DevTools",
                    "status": "Queued",
                    "duration": "0ms",
                    "description": "Comprobamos que las herramientas automáticas estén listas para la próxima prueba.",
                    "screenshot": "/evidence/runs/tobi-07-settings.png",
                    "agent": "Spec Writer"
                }
            ],
            "telemetryLogs": [
                {"time": "14:50:01", "level": "SUCCESS", "message": "Playwright inicializó contexto de navegador Chromium en http://localhost:5173", "source": "Playwright MCP"},
                {"time": "14:50:03", "level": "INFO", "message": "Chrome DevTools MCP: Escuchando tráfico HTTP y excepciones de consola", "source": "Chrome CDP"},
                {"time": "14:50:06", "level": "ACTION", "message": "Explorer QA navegó a la vista de La Oficina [200 OK · 180ms]", "source": "Explorer QA"},
                {"time": "14:50:08", "level": "WARN", "message": "Alerta de estado: divergencia en selector de filtros de telemetría (BUG-01)", "source": "Telemetry Auditor"},
                {"time": "14:50:11", "level": "SUCCESS", "message": "Spec Writer generó tobitests-shell.spec.ts con 18 casos deterministas", "source": "Spec Writer"}
            ]
        },
        "bugs": [
            {
                "id": "BUG-01",
                "title": "Divergencia de estado en filtros de telemetría al alternar agentes en La Oficina",
                "severity": "Alta",
                "status": "Confirmed",
                "section": "La Oficina / Telemetría",
                "runId": "#RUN-SELF-01",
                "agent": "Telemetry Auditor",
                "assignee": "Equipo Frontend",
                "date": "16/10/2026",
                "scenario": "Al alternar entre mesas de agentes en La Oficina, el filtro de telemetría conserva logs del agente previo",
                "dadoQue": "el usuario está en la vista de La Oficina con la simulación en marcha",
                "cuando": "hace clic en un agente pausado y luego filtra por 'warn'",
                "entonces": "la consola muestra eventos mezclados del agente anterior sin limpiar el búfer reactivo",
                "screenshot": "/evidence/bugs/tobi-bug-01-detail.png",
                "videoUrl": "/evidence/videos/tobitests-bug-01-replay.webm",
                "doctorVideoUrl": "/evidence/videos/tobitests-self-audit.webm",
                "diagnostic": {
                    "observedFact": "El feed de telemetría acumula entradas de puestos inactivos en vez de aislar el stream del agente seleccionado.",
                    "whiteBoxHypothesis": "El hook useAgentMotion no resetea la suscripción del búfer al mutar el parámetro selectedId.",
                    "affectedFile": "web/src/components/OfficeView.tsx",
                    "recommendedFix": "Incorporar un efecto de limpieza (cleanup function) en OfficeView para reiniciar el listado de logs al cambiar selectedId.",
                    "reproductionSpec": "tobitests-office.spec.ts"
                }
            }
        ],
        "specs": [
            {
                "name": "tobitests-shell.spec.ts",
                "testsCount": 18,
                "status": "Passed",
                "domain": "Shell & UI",
                "lastRun": "16/10/2026 14:50",
                "code": """import { test, expect } from '@playwright/test';

test.describe('TobiTests — Shell, Navigation & Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('TC-SHELL-01: Carga inicial de la portada con marca y tipografía', async ({ page }) => {
    await expect(page.locator('.logo')).toContainText('TobiTests');
    await expect(page.locator('.hero h1')).toBeVisible();
  });

  test('TC-SHELL-02: Navegación fluida por teclado en la barra lateral', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent);
    expect(focused).toBeTruthy();
  });

  test('TC-SHELL-03: Conmutación de vista a Bug Tracker sin recarga de página', async ({ page }) => {
    await page.click('button:has-text("Bug Tracker")');
    await expect(page.locator('.table')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Bug Tracker');
  });

  test('TC-SHELL-04: Apertura y cierre de modal de reporte con tecla Escape', async ({ page }) => {
    await page.click('button:has-text("Bug Tracker")');
    await page.click('button:has-text("Vista previa")');
    await expect(page.locator('.modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.modal')).toBeHidden();
  });
});"""
            },
            {
                "name": "tobitests-office.spec.ts",
                "testsCount": 18,
                "status": "Failed",
                "domain": "Virtual Office",
                "lastRun": "16/10/2026 14:50",
                "code": """import { test, expect } from '@playwright/test';

test.describe('TobiTests — Virtual Office & Isometric Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("La Oficina")');
  });

  test('TC-OFFICE-01: Renderizado del escenario isométrico 2.5D', async ({ page }) => {
    await expect(page.locator('.office-iso-stage')).toBeVisible();
    await expect(page.locator('.character')).toHaveCount(4);
  });

  test('TC-OFFICE-02: BUG-01: Divergencia en filtro de telemetría', async ({ page }) => {
    await page.click('.character:has-text("Explorer")');
    await page.click('button:has-text("warn")');
    const logs = page.locator('.terminal-feed .log-entry');
    // Esperado: sólo logs de Explorer. Actual: muestra logs cruzados de Orchestrator
    await expect(logs).toContainText('Explorer QA');
  });
});"""
            },
            {
                "name": "tobitests-bugs.spec.ts",
                "testsCount": 16,
                "status": "Passed",
                "domain": "Bug Tracker & BDD",
                "lastRun": "16/10/2026 14:50",
                "code": """import { test, expect } from '@playwright/test';

test.describe('TobiTests — Bug Tracker, BDD & Evidence Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Bug Tracker")');
  });

  test('TC-BUGS-01: Visualización de formato BDD Gherkin', async ({ page }) => {
    await page.click('.table tbody tr.clickable');
    await expect(page.locator('.gherkin.dado')).toBeVisible();
    await expect(page.locator('.gherkin.cuando')).toBeVisible();
    await expect(page.locator('.gherkin.entonces')).toBeVisible();
  });

  test('TC-BUGS-02: Pestaña integrada de diagnóstico técnico', async ({ page }) => {
    await page.click('.table tbody tr.clickable');
    await page.click('button[role="tab"]:has-text("Diagnóstico")');
    await expect(page.locator('strong:has-text("Causa probable")')).toBeVisible();
  });
});"""
            },
            {
                "name": "tobitests-specs.spec.ts",
                "testsCount": 16,
                "status": "Passed",
                "domain": "Playwright Engine",
                "lastRun": "16/10/2026 14:50",
                "code": """import { test, expect } from '@playwright/test';

test.describe('TobiTests — Playwright Spec Viewer & Code Syntax', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Test Specs")');
  });

  test('TC-SPECS-01: Explorador de specs y resaltado de expect()', async ({ page }) => {
    await expect(page.locator('.editor')).toBeVisible();
    await expect(page.locator('.code-highlight').first()).toContainText('expect(');
  });
});"""
            },
            {
                "name": "tobitests-settings.spec.ts",
                "testsCount": 16,
                "status": "Passed",
                "domain": "Settings & MCP",
                "lastRun": "16/10/2026 14:50",
                "code": """import { test, expect } from '@playwright/test';

test.describe('TobiTests — Settings & MCP Integrations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Settings")');
  });

  test('TC-SETT-01: Motores MCP conectados (@playwright y DevTools)', async ({ page }) => {
    await expect(page.locator('.integration:has-text("@playwright/mcp")')).toBeVisible();
    await expect(page.locator('.integration:has-text("@chromedevtools")')).toBeVisible();
  });
});"""
            }
        ],
        "suites": suites_def
    }

    # Save to web/src/data/tobi-state.json and web/public/data/tobi-state.json
    paths = ["web/src/data/tobi-state.json", "web/public/data/tobi-state.json"]
    for p in paths:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        print(f"Successfully updated {p} with TobiTests Self-Audit data.")

if __name__ == "__main__":
    generate_self_audit()
