import React, { useState, useRef, useMemo, useEffect } from "react";
import type { useTobiState } from "../hooks/useTobiState";
import "./journeyCanvas.css";

export interface JourneyNode {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  screenshot: string;
  x: number;
  y: number;
  width: number;
  height: number;
  testsCount: number;
  touches: number;
  failedCount: number;
  category: "auth" | "workspace" | "diagnostics" | "execution";
}

export interface JourneyEdge {
  id: string;
  from: string;
  to: string;
  agentName: string;
  agentRole: string;
  agentMcp: string;
  actionCode: string;
  humanExplanation: string;
  duration: string;
  status: "Passed" | "Failed";
  verb: string;
}

interface JourneyCanvasProps {
  tobi: ReturnType<typeof useTobiState>;
  navigate: (view: any) => void;
  onInspectTest?: (test: any) => void;
}

// ============================================================================
// TobiTests Spacious Hierarchical Node Layout (UX/UI Pro Max)
// ============================================================================
const NODE_WIDTH = 260;
const NODE_HEIGHT = 146;

const TOBI_NODES: JourneyNode[] = [
  // Columna 0: Origen / Entrada (Centrada verticalmente)
  {
    id: "landing",
    title: "/ Portada · Iniciar Sesión",
    subtitle: "Punto de entrada de la aplicación",
    route: "http://localhost:5173/",
    screenshot: "/evidence/runs/tobi-01-landing.png",
    x: 80,
    y: 310,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 84,
    touches: 84,
    failedCount: 0,
    category: "auth",
  },

  // Columna 1: Núcleos Principales de Navegación
  {
    id: "dashboard",
    title: "/dashboard · Panel de Calidad",
    subtitle: "Métricas consolidadas y actividad reciente",
    route: "/dashboard",
    screenshot: "/evidence/runs/tobi-02-dashboard.png",
    x: 480,
    y: 80,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 84,
    touches: 84,
    failedCount: 0,
    category: "workspace",
  },
  {
    id: "bug-tracker",
    title: "/bug-tracker · Incidentes",
    subtitle: "Registro de anomalías y severidad",
    route: "/bug-tracker",
    screenshot: "/evidence/runs/tobi-03-bug-tracker.png",
    x: 480,
    y: 310,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 16,
    touches: 16,
    failedCount: 1,
    category: "workspace",
  },
  {
    id: "office",
    title: "/office · La Oficina 2.5D",
    subtitle: "Simulación isométrica multi-agente",
    route: "/office",
    screenshot: "/evidence/runs/tobi-04-office.png",
    x: 480,
    y: 540,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 18,
    touches: 18,
    failedCount: 1,
    category: "workspace",
  },

  // Columna 2: Diagnósticos Profundos y Definiciones
  {
    id: "specs",
    title: "/specs · Test Specs Playwright",
    subtitle: "Editor y sintaxis TypeScript de pruebas",
    route: "/specs",
    screenshot: "/evidence/runs/tobi-05-specs.png",
    x: 880,
    y: 80,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 16,
    touches: 16,
    failedCount: 0,
    category: "diagnostics",
  },
  {
    id: "suites",
    title: "/suites · Suites E2E",
    subtitle: "Estructura modular de casos de prueba",
    route: "/suites",
    screenshot: "/evidence/runs/tobi-02-dashboard.png",
    x: 880,
    y: 310,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 84,
    touches: 84,
    failedCount: 0,
    category: "diagnostics",
  },
  {
    id: "bug-detail",
    title: "/bug-detail · BUG-01 Telemetría",
    subtitle: "Ficha de causa raíz y reproducción BDD",
    route: "/bug-detail",
    screenshot: "/evidence/bugs/tobi-bug-01-detail.png",
    x: 880,
    y: 540,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 1,
    touches: 1,
    failedCount: 1,
    category: "diagnostics",
  },

  // Columna 3: Ejecución en Vivo y Configuración
  {
    id: "live-run",
    title: "/live-run · Telemetría en Vivo",
    subtitle: "Inspección de pasos y consola reactiva",
    route: "/live-run",
    screenshot: "/evidence/runs/tobi-06-live-run.png",
    x: 1280,
    y: 180,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 84,
    touches: 84,
    failedCount: 0,
    category: "execution",
  },
  {
    id: "settings",
    title: "/settings · Servidores MCP",
    subtitle: "Servidores Playwright y Chrome CDP",
    route: "/settings",
    screenshot: "/evidence/runs/tobi-07-settings.png",
    x: 1280,
    y: 440,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 16,
    touches: 16,
    failedCount: 0,
    category: "execution",
  },
];

// Interactive Edges
const TOBI_EDGES: JourneyEdge[] = [
  {
    id: "e-landing-dashboard",
    from: "landing",
    to: "dashboard",
    verb: "Click",
    agentName: "Explorer QA",
    agentRole: "Explorador de Navegación",
    agentMcp: "@playwright/mcp",
    actionCode: "page.locator('button:has-text(\"Entrar al workspace\")').click()",
    humanExplanation: "Hizo clic en el botón principal de la portada para entrar al workspace y cargar el Dashboard de calidad.",
    duration: "120ms",
    status: "Passed",
  },
  {
    id: "e-dashboard-bugtracker",
    from: "dashboard",
    to: "bug-tracker",
    verb: "Navegar",
    agentName: "Explorer QA",
    agentRole: "Explorador de Navegación",
    agentMcp: "@playwright/mcp",
    actionCode: "page.locator('aside.sidebar nav button:has-text(\"Bug Tracker\")').click()",
    humanExplanation: "Abrió la sección de Bug Tracker desde la barra lateral para auditar el listado de incidentes reportados.",
    duration: "65ms",
    status: "Passed",
  },
  {
    id: "e-dashboard-office",
    from: "dashboard",
    to: "office",
    verb: "Inspeccionar",
    agentName: "Explorer QA",
    agentRole: "Auditor Visual",
    agentMcp: "@playwright/mcp",
    actionCode: "page.locator('aside.sidebar nav button:has-text(\"La Oficina\")').click()",
    humanExplanation: "Ingresó al estudio isométrico 2.5D para comprobar el movimiento y las estaciones de trabajo de los agentes.",
    duration: "95ms",
    status: "Passed",
  },
  {
    id: "e-bugtracker-bugdetail",
    from: "bug-tracker",
    to: "bug-detail",
    verb: "Foco Bug",
    agentName: "Telemetry Auditor",
    agentRole: "Inspector de Incidentes",
    agentMcp: "chrome-devtools-mcp",
    actionCode: "page.locator('.table tbody tr.clickable').first.click()",
    humanExplanation: "Seleccionó el primer incidente del listado para inspeccionar su causa raíz, escenario BDD y evidencia en video.",
    duration: "80ms",
    status: "Failed",
  },
  {
    id: "e-office-bugdetail",
    from: "office",
    to: "bug-detail",
    verb: "Alerta CDP",
    agentName: "Telemetry Auditor",
    agentRole: "Vigilante de Consola & Red",
    agentMcp: "chrome-devtools-mcp",
    actionCode: "devtools.on('console.warn', ({ text }) => trackDivergence(text))",
    humanExplanation: "Capturó una divergencia de estado en los filtros de telemetría de La Oficina y generó el ticket técnico BUG-01.",
    duration: "45ms",
    status: "Failed",
  },
  {
    id: "e-dashboard-specs",
    from: "dashboard",
    to: "specs",
    verb: "Sintetizar",
    agentName: "Spec Writer",
    agentRole: "Generador de Código",
    agentMcp: "playwright-test",
    actionCode: "page.locator('aside.sidebar nav button:has-text(\"Test Specs\")').click()",
    humanExplanation: "Abrió el editor de specs para validar los 84 tests generados con selectores semánticos y aserciones limpias.",
    duration: "70ms",
    status: "Passed",
  },
  {
    id: "e-dashboard-suites",
    from: "dashboard",
    to: "suites",
    verb: "Mapear",
    agentName: "Orchestrator",
    agentRole: "Coordinador de Calidad",
    agentMcp: "Antigravity Core",
    actionCode: "orchestrator.decomposeProject({ suites: 5, coverage: 'E2E' })",
    humanExplanation: "Descompuso el mapa de pruebas en 5 suites funcionales (Shell, Oficina, Bugs, Specs y Settings).",
    duration: "110ms",
    status: "Passed",
  },
  {
    id: "e-specs-liverun",
    from: "specs",
    to: "live-run",
    verb: "Ejecutar",
    agentName: "Orchestrator",
    agentRole: "Despachador de Pruebas",
    agentMcp: "@playwright/mcp",
    actionCode: "page.locator('button:has-text(\"Ejecutar\")').click()",
    humanExplanation: "Lanzó la suite de pruebas automatizadas sobre Chromium y activó el visor de telemetría en tiempo real.",
    duration: "150ms",
    status: "Passed",
  },
  {
    id: "e-suites-liverun",
    from: "suites",
    to: "live-run",
    verb: "Disparar",
    agentName: "Explorer QA",
    agentRole: "Ejecutor E2E",
    agentMcp: "@playwright/mcp",
    actionCode: "runner.runSuite({ id: 'self-audit', headless: true })",
    humanExplanation: "Sincronizó los 84 casos de prueba con el visor en vivo para registrar tiempos de respuesta y capturas.",
    duration: "140ms",
    status: "Passed",
  },
  {
    id: "e-dashboard-settings",
    from: "dashboard",
    to: "settings",
    verb: "Auditar MCP",
    agentName: "Orchestrator",
    agentRole: "Coordinador de Infraestructura",
    agentMcp: "Antigravity Core",
    actionCode: "page.locator('.sidebar-foot button:has-text(\"Settings\")').click()",
    humanExplanation: "Comprobó la conectividad de los servidores MCP (@playwright/mcp, Chrome CDP y OpenCode nativo).",
    duration: "40ms",
    status: "Passed",
  },
];

function getTestTouchedNodeIds(test: any): string[] {
  const spec = (test.spec || "").toLowerCase();
  const name = (test.name || "").toLowerCase();

  if (spec.includes("office") || name.includes("oficina")) {
    if (test.status === "Failed" || name.includes("divergencia")) {
      return ["landing", "dashboard", "office", "bug-detail"];
    }
    return ["landing", "dashboard", "office"];
  }
  if (spec.includes("bugs") || name.includes("bug")) {
    return ["landing", "dashboard", "bug-tracker", "bug-detail"];
  }
  if (spec.includes("specs") || name.includes("spec")) {
    return ["landing", "dashboard", "specs", "live-run"];
  }
  if (spec.includes("settings") || name.includes("setting")) {
    return ["landing", "dashboard", "settings"];
  }
  return ["landing", "dashboard", "suites", "live-run"];
}

export function JourneyCanvas({ tobi, navigate, onInspectTest }: JourneyCanvasProps) {
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(0.75);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom states requested by user:
  const [wheelZoomEnabled, setWheelZoomEnabled] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Interactive edge and hover states
  const [selectedEdge, setSelectedEdge] = useState<JourneyEdge | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [hoveredTestId, setHoveredTestId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterFailureOnly, setFilterFailureOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const run = tobi.state.runs[0] || {
    id: "#RUN-SELF-01",
    date: "16/10/2026 14:50",
    passed: 83,
    failed: 1,
    total: 84,
    tests: [],
  };

  const testsList = useMemo(() => (run.tests || []) as any[], [run.tests]);

  const activeTest = useMemo(() => {
    if (!hoveredTestId) return null;
    return testsList.find((t) => t.name === hoveredTestId) || null;
  }, [hoveredTestId, testsList]);

  const highlightedNodeIds = useMemo(() => {
    if (activeTest) {
      return new Set(getTestTouchedNodeIds(activeTest));
    }
    if (selectedEdge) {
      return new Set([selectedEdge.from, selectedEdge.to]);
    }
    if (selectedNodeId) {
      return new Set([selectedNodeId]);
    }
    return null;
  }, [activeTest, selectedEdge, selectedNodeId]);

  const nodeMap = useMemo(() => {
    const map: Record<string, JourneyNode> = {};
    TOBI_NODES.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, []);

  // Native Non-Passive Wheel Event Listener for smooth zooming centered at cursor
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if (!wheelZoomEnabled) return;
      e.preventDefault();

      const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(2.2, Math.max(0.3, prevZoom * zoomFactor));
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
          y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
        }));

        return nextZoom;
      });
    };

    el.addEventListener("wheel", handleWheelEvent, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheelEvent);
    };
  }, [wheelZoomEnabled]);

  // Handle Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".journey-node-card") ||
      (e.target as HTMLElement).closest(".edge-interactive-hit") ||
      (e.target as HTMLElement).closest(".edge-pill-tag") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    setSelectedEdge(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom((z) => Math.min(2.2, z + 0.12));
  const zoomOut = () => setZoom((z) => Math.max(0.3, z - 0.12));
  const resetView = () => {
    setZoom(0.75);
    setPan({ x: 20, y: 20 });
    setSelectedEdge(null);
    setSelectedNodeId(null);
    setHoveredTestId(null);
  };

  const groupedSuites = useMemo(() => {
    const groups: Record<string, any[]> = {};
    testsList.forEach((t) => {
      const suiteName = t.spec || "General";
      if (!groups[suiteName]) groups[suiteName] = [];
      groups[suiteName].push(t);
    });
    return groups;
  }, [testsList]);

  const filteredTests = useMemo(() => {
    return testsList.filter((t) => {
      if (filterFailureOnly && t.status !== "Failed") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.spec?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [testsList, filterFailureOnly, searchQuery]);

  return (
    <div className="journey-page">
      {/* Top Bar / Header */}
      <header className="journey-topbar">
        <div className="journey-topbar-left">
          <div className="journey-breadcrumbs">
            <span>{tobi.state.project.url}</span>
            <span className="sep">›</span>
            <span>Test Runs</span>
            <span className="sep">›</span>
            <span className="current-run-id">{run.id}</span>
          </div>

          <div className="journey-title-row">
            <h1 className="journey-title">Execution: {run.date || "2026-10-16 14:50"}</h1>
            <span className="journey-target-badge">
              {testsList.length} tests · {tobi.state.project.name} (rama {tobi.state.project.branch})
            </span>
          </div>

          {/* Progress bar */}
          <div className="journey-progress-container">
            <div className="journey-progress-status">
              <span className="status-live-dot" />
              <strong>Ejecución completada</strong>
              <span className="reading-snapshots">
                Árbol de navegación Playwright · {testsList.length}/{testsList.length} capturas
              </span>
            </div>

            <div className="journey-progress-bar-wrap">
              <div
                className="journey-progress-seg passed"
                style={{ width: `${((run.passed || 83) / (run.total || 84)) * 100}%` }}
                title={`${run.passed || 83} Aprobados`}
              />
              <div
                className="journey-progress-seg failed"
                style={{ width: `${((run.failed || 1) / (run.total || 84)) * 100}%` }}
                title={`${run.failed || 1} Con Incidente`}
              />
            </div>

            <div className="journey-progress-meta">
              <span className="meta-counts">
                <strong className="text-success">{run.passed || 83}</strong> aprobados ·{" "}
                <strong className="text-danger">{run.failed || 1}</strong> incidente
              </span>
              <span className="meta-time">Tiempo total: {run.duration || "12.4s"}</span>
            </div>
          </div>
        </div>

        <div className="journey-topbar-actions">
          {/* Toggle Sidebar to maximize canvas */}
          <button
            type="button"
            className={`btn-toggle-sidebar ${!sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Ocultar panel de tests para maximizar el tablero" : "Mostrar panel de tests"}
          >
            {sidebarOpen ? "⮞ Maximizar Tablero" : "⮜ Ver Tests (84)"}
          </button>

          <button
            type="button"
            className={`btn-filter-fail ${filterFailureOnly ? "active" : ""}`}
            onClick={() => setFilterFailureOnly(!filterFailureOnly)}
          >
            <span className="fail-dot" />
            {filterFailureOnly ? "Mostrando fallas (1)" : "Filtrar solo incidentes"}
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => navigate("test-runs")}
          >
            Ver Test Runs
          </button>
        </div>
      </header>

      {/* Main Layout: Canvas + Right Sidebar */}
      <div className="journey-layout">
        {/* Canvas Board */}
        <div
          ref={viewportRef}
          className={`journey-canvas-viewport ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Active Hover Path Banner */}
          {activeTest && (
            <div className="journey-path-banner">
              <span className="path-icon">🎯</span>
              <div className="path-info">
                <strong>Ruta del test: {activeTest.name}</strong>
                <span className="path-steps-text">
                  Trayectoria: {getTestTouchedNodeIds(activeTest).map((id) => {
                    const n = nodeMap[id];
                    return n ? n.title.split("·")[0].trim() : id;
                  }).join(" ➔ ")}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Edge Action Popover */}
          {selectedEdge && (
            <div
              className={`edge-action-popover ${selectedEdge.status === "Failed" ? "popover-failed" : ""}`}
              style={{
                position: "absolute",
                left: `${(nodeMap[selectedEdge.from]?.x || 0) * zoom + pan.x + 230 * zoom}px`,
                top: `${(nodeMap[selectedEdge.from]?.y || 0) * zoom + pan.y + 70 * zoom}px`,
                zIndex: 40,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popover-header">
                <div className="popover-agent-badge">
                  <span className="agent-avatar-mini">🤖</span>
                  <strong>{selectedEdge.agentName}</strong>
                  <span className="mcp-tag">{selectedEdge.agentMcp}</span>
                </div>
                <button
                  type="button"
                  className="popover-close-btn"
                  onClick={() => setSelectedEdge(null)}
                  aria-label="Cerrar detalle de acción"
                >
                  ✕
                </button>
              </div>

              <div className="popover-body">
                <div className="popover-explanation">
                  <span className="popover-verb-pill">{selectedEdge.verb}</span>
                  <p>{selectedEdge.humanExplanation}</p>
                </div>

                <div className="popover-code-box">
                  <div className="code-label">Acción ejecutada en el navegador:</div>
                  <code>{selectedEdge.actionCode}</code>
                </div>

                <div className="popover-footer">
                  <span className={`popover-status-tag ${selectedEdge.status === "Failed" ? "failed" : "passed"}`}>
                    {selectedEdge.status === "Failed" ? "Fallo detectado" : "Paso completado"}
                  </span>
                  <span className="popover-timing">⏱ {selectedEdge.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Canvas coordinate layer (Extensive 3400x2000 virtual stage) */}
          <div
            className="journey-canvas-stage"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {/* SVG Connecting Bezier Curves */}
            <svg
              className="journey-svg-layer"
              width="2800"
              height="1600"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="edgeNormalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="edgeFailureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {TOBI_EDGES.map((edge) => {
                const source = nodeMap[edge.from];
                const target = nodeMap[edge.to];
                if (!source || !target) return null;

                const x1 = source.x + source.width;
                const y1 = source.y + source.height / 2;
                const x2 = target.x;
                const y2 = target.y + target.height / 2;

                const dx = Math.abs(x2 - x1) * 0.52;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                const isEdgeHighlighted =
                  highlightedNodeIds &&
                  highlightedNodeIds.has(edge.from) &&
                  highlightedNodeIds.has(edge.to);

                const isEdgeSelected = selectedEdge?.id === edge.id;
                const isEdgeHovered = hoveredEdgeId === edge.id;
                const isActive = isEdgeHighlighted || isEdgeSelected || isEdgeHovered;
                const isFailing = edge.status === "Failed";

                return (
                  <g
                    key={edge.id}
                    className="journey-edge-group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdge(edge);
                    }}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Invisible thick hover hit-area */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={28}
                      className="edge-interactive-hit"
                    />

                    {/* Shadow / Glow track */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        isActive
                          ? isFailing
                            ? "rgba(239, 68, 68, 0.45)"
                            : "rgba(16, 185, 129, 0.45)"
                          : "rgba(255, 255, 255, 0.03)"
                      }
                      strokeWidth={isActive ? 10 : 4}
                      strokeLinecap="round"
                    />

                    {/* Main path curve */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        isActive
                          ? isFailing
                            ? "url(#edgeFailureGrad)"
                            : "url(#edgeActiveGrad)"
                          : isFailing
                          ? "rgba(239, 68, 68, 0.6)"
                          : "url(#edgeNormalGrad)"
                      }
                      strokeWidth={isActive ? 3.5 : 2}
                      strokeDasharray={isActive ? "8 4" : undefined}
                      className={isActive ? "animated-edge-dash" : undefined}
                      strokeLinecap="round"
                    />

                    {/* Interactive Midpoint Pill on Curve */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-12"
                        width="76"
                        height="24"
                        rx="12"
                        fill={isActive ? (isFailing ? "#ef4444" : "#10b981") : "#1e293b"}
                        stroke={isActive ? "#fff" : "#475569"}
                        strokeWidth="1.5"
                        className="edge-pill-tag"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="var(--font-mono, monospace)"
                        pointerEvents="none"
                      >
                        {edge.verb}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Nodes DOM Elements (TestSprite rm-frame) */}
            {TOBI_NODES.map((node) => {
              const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(node.id) : false;
              const isDimmed = highlightedNodeIds ? !highlightedNodeIds.has(node.id) : false;
              const hasFailure = node.failedCount > 0;

              return (
                <div
                  key={node.id}
                  className={`journey-node-card rm-frame ${isHighlighted ? "highlighted rm-hi" : ""} ${
                    isDimmed ? "dimmed" : ""
                  } ${hasFailure ? "has-failure rm-has-fail" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                  onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                >
                  {/* Top Label (rm-wl rm-lab) */}
                  <div className="rm-node-label" title={node.title}>
                    <span className="rm-label-globe">🌐</span>
                    <span className="rm-label-text">{node.title}</span>
                    {hasFailure ? (
                      <span className="rm-label-badge danger">1 falla</span>
                    ) : (
                      <span className="rm-label-badge ok">OK</span>
                    )}
                  </div>

                  {/* Thumbnail Wrap (rm-thumb) */}
                  <div className="rm-thumb-wrap">
                    <div className="mini-browser-bar">
                      <div className="mini-browser-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="mini-browser-pill" title={node.route}>
                        {node.route}
                      </div>
                    </div>
                    <img
                      src={node.screenshot}
                      alt={node.title}
                      className="node-screenshot-img"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      className="btn-quick-open"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (node.id === "office") navigate("office");
                        else if (node.id === "bug-tracker") navigate("bug-tracker");
                        else if (node.id === "bug-detail") navigate("bug-detail");
                        else if (node.id === "specs") navigate("specs");
                        else if (node.id === "suites") navigate("suites");
                        else if (node.id === "live-run") navigate("live-run");
                        else if (node.id === "settings") navigate("settings");
                        else navigate("dashboard");
                      }}
                      title="Abrir vista en el workspace"
                    >
                      Abrir ↗
                    </button>
                  </div>

                  {/* Bottom Metadata (rm-wl rm-meta) */}
                  <div className="rm-node-meta">
                    {hasFailure ? (
                      <>
                        <span className="rm-fail-count">{node.failedCount} failed here</span> · {node.touches} touches
                      </>
                    ) : (
                      <>
                        <span className="rm-pass-count">{node.testsCount} tests</span> · {node.touches} touches
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Controls at Bottom Left (rm-hud rm-tools) */}
          <div className="journey-canvas-controls rm-hud-tools">
            <button
              type="button"
              className="rm-btn-follow"
              onClick={resetView}
              title="Centrar y enfocar el flujo de ejecución actual"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="7" />
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
              </svg>
              <span>Follow run</span>
            </button>

            <div className="rm-zoom-group">
              <button type="button" className="rm-zoom-btn" onClick={zoomOut} title="Alejar (-)">
                －
              </button>
              <button
                type="button"
                className="rm-zoom-btn"
                onClick={resetView}
                title="Restablecer escala al 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" className="rm-zoom-btn" onClick={zoomIn} title="Acercar (+)">
                ＋
              </button>
              <button
                type="button"
                className={`rm-zoom-btn wheel-toggle ${wheelZoomEnabled ? "active" : ""}`}
                onClick={() => setWheelZoomEnabled(!wheelZoomEnabled)}
                title={wheelZoomEnabled ? "Zoom con la rueda del mouse: ACTIVADO" : "Zoom con la rueda: DESACTIVADO"}
              >
                🖱️ {wheelZoomEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Floating Bottom Status Pill (rm-hud rm-foot) */}
          <div className="journey-bottom-pill rm-hud-foot">
            <span className="rm-foot-spinner">⢌⣉⢎⣉</span>
            <span>
              Reading page snapshots · 84/84 capturas · 83 aprobados · 1 incidente
            </span>
          </div>
        </div>

        {/* Right Sidebar: Tests List (Collapsible to maximize board) */}
        {sidebarOpen && (
          <aside className="journey-tests-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <h2 className="sidebar-title">Tests</h2>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="sidebar-count-badge">{filteredTests.length}</span>
                  <button
                    type="button"
                    className="btn-collapse-sidebar-x"
                    onClick={() => setSidebarOpen(false)}
                    title="Ocultar panel para ver todo el tablero"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="sidebar-subtext">
                Pasá el mouse por un test para iluminar su ruta de izquierda a derecha.
              </p>

              {/* Quick search input */}
              <div className="test-search-box">
                <input
                  type="text"
                  placeholder="Buscar casos de prueba..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="test-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="sidebar-tests-scroll">
              {Object.entries(groupedSuites).map(([suite, tests]) => {
                const visibleTests = (tests as any[]).filter((t) => {
                  if (filterFailureOnly && t.status !== "Failed") return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return t.name.toLowerCase().includes(q) || t.spec?.toLowerCase().includes(q);
                  }
                  return true;
                });

                if (visibleTests.length === 0) return null;

                return (
                  <div key={suite} className="suite-group">
                    <div className="suite-group-title">
                      <span className="suite-icon">📁</span>
                      <span className="suite-name">{suite.replace(".spec.ts", "")}</span>
                      <span className="suite-count">{visibleTests.length}</span>
                    </div>

                    <div className="suite-tests-list">
                      {visibleTests.map((t: any) => {
                        const isHovered = hoveredTestId === t.name;
                        const isFailed = t.status === "Failed";
                        const touchedCount = getTestTouchedNodeIds(t).length;

                        return (
                          <div
                            key={t.name}
                            className={`journey-test-item ${isHovered ? "hovered" : ""} ${
                              isFailed ? "failed" : ""
                            }`}
                            onMouseEnter={() => setHoveredTestId(t.name)}
                            onMouseLeave={() => setHoveredTestId(null)}
                            onClick={() => onInspectTest && onInspectTest(t)}
                          >
                            <span className={`test-dot ${isFailed ? "failed" : "passed"}`} />
                            <div className="test-item-info">
                              <div className="test-item-title" title={t.name}>
                                {t.name}
                              </div>
                              <div className="test-item-meta">
                                <span className="touch-pill">{touchedCount} pantallas</span>
                                <span className="duration-pill">{t.duration || "0.2s"}</span>
                              </div>
                            </div>
                            <span className="test-arrow">→</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredTests.length === 0 && (
                <div className="no-tests-match">
                  <p>No se encontraron pruebas con ese criterio.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
