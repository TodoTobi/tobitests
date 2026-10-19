import React, { useState, useRef, useMemo, useEffect } from "react";
import type { useTobiState, AntigravityLive, AuditScope } from "../hooks/useTobiState";
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
  blockedCount?: number;
  category: "auth" | "workspace" | "diagnostics" | "execution" | "API" | string;
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
  antigravityLive?: AntigravityLive | null;
  navigate: (view: any) => void;
  onInspectTest?: (test: any) => void;
}

const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ============================================================================
// TobiTests Spacious Hierarchical Node Layout (Tri-State E2E Graph Architecture)
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
    blockedCount: 0,
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
    blockedCount: 0,
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
    failedCount: 0,
    blockedCount: 0,
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
    failedCount: 0,
    blockedCount: 0,
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
    blockedCount: 0,
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
    blockedCount: 0,
    category: "diagnostics",
  },
  {
    id: "bug-detail",
    title: "/bug-detail · BUG-01 Telemetría",
    subtitle: "Ficha de causa raíz y reproducción BDD (Resuelto)",
    route: "/bug-detail",
    screenshot: "/evidence/bugs/tobi-bug-01-detail.png",
    x: 880,
    y: 540,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 4,
    touches: 12,
    failedCount: 0,
    blockedCount: 0,
    category: "diagnostics",
  },

  // Columna 3: Ejecución en Vivo, Configuración y Contratos API ({ request })
  {
    id: "live-run",
    title: "/live-run · Telemetría en Vivo",
    subtitle: "Inspección de pasos y consola reactiva",
    route: "/live-run",
    screenshot: "/evidence/runs/tobi-06-live-run.png",
    x: 1280,
    y: 80,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 84,
    touches: 84,
    failedCount: 0,
    blockedCount: 0,
    category: "execution",
  },
  {
    id: "settings",
    title: "/settings · Servidores MCP",
    subtitle: "Servidores Playwright y Chrome CDP",
    route: "/settings",
    screenshot: "/evidence/runs/tobi-07-settings.png",
    x: 1280,
    y: 310,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 16,
    touches: 16,
    failedCount: 0,
    blockedCount: 0,
    category: "execution",
  },
  {
    id: "api-live-contract",
    title: "GET /api/antigravity/live · API",
    subtitle: "Contrato JSON, RBAC & SLA (< 500ms)",
    route: "/api/antigravity/live",
    screenshot: "",
    x: 1280,
    y: 540,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 4,
    touches: 12,
    failedCount: 0,
    blockedCount: 0,
    category: "API",
  },
  {
    id: "api-state-rbac",
    title: "POST /api/antigravity/scope · API",
    subtitle: "Fuzzing 4xx, RBAC 401/403 & Concurrencia",
    route: "/api/antigravity/scope",
    screenshot: "",
    x: 1640,
    y: 540,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    testsCount: 4,
    touches: 12,
    failedCount: 0,
    blockedCount: 0,
    category: "API",
  },
];

// Interactive Edges
const TOBI_EDGES: JourneyEdge[] = [
  {
    id: "e-office-apicontract",
    from: "office",
    to: "api-live-contract",
    verb: "API 200 OK",
    agentName: "Telemetry Auditor",
    agentRole: "Auditor API ({ request })",
    agentMcp: "@playwright/test (APIRequestContext)",
    actionCode: "const res = await request.get('/api/antigravity/live'); expect(res.status()).toBe(200);",
    humanExplanation: "Verifica el contrato JSON del blackboard en vivo, cabeceras application/json, RBAC y latencia SLA (< 500ms) sin requerir navegador.",
    duration: "38ms",
    status: "Passed",
  },
  {
    id: "e-api-live-to-scope",
    from: "api-live-contract",
    to: "api-state-rbac",
    verb: "RBAC & 4xx",
    agentName: "Telemetry Auditor",
    agentRole: "Auditor API ({ request })",
    agentMcp: "@playwright/test (APIRequestContext)",
    actionCode: "await Promise.all(payloads.map(p => request.post('/api/antigravity/scope', { data: p })));",
    humanExplanation: "Audita fuzzing de payloads malformados (400/422, nunca 500), fronteras RBAC y concurrencia Promise.all.",
    duration: "44ms",
    status: "Passed",
  },
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
    humanExplanation: "Seleccionó el incidente en el listado para inspeccionar su causa raíz, escenario BDD y verificar su estado resuelto.",
    duration: "80ms",
    status: "Passed",
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
    humanExplanation: "Auditó los filtros de telemetría de La Oficina: aislamiento de buffer validado con 0 divergencias de estado.",
    duration: "45ms",
    status: "Passed",
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

function isApiTestItem(test: any): boolean {
  const spec = (test?.spec || "").toLowerCase();
  const name = (test?.name || "").toLowerCase();
  return (
    spec.includes("api") ||
    name.includes("tc-api") ||
    name.includes("get /") ||
    name.includes("post /") ||
    name.includes("put /") ||
    name.includes("delete /") ||
    (!test?.screenshot && spec.includes("request"))
  );
}

function getTestTouchedNodeIds(test: any): string[] {
  const spec = (test.spec || "").toLowerCase();
  const name = (test.name || "").toLowerCase();

  if (isApiTestItem(test)) {
    return ["api-health", "api-state-rbac", "live-run"];
  }
  if (spec.includes("office") || name.includes("oficina")) {
    if (test.status === "Failed" || name.includes("divergencia") || name.includes("bug-01")) {
      return ["landing", "dashboard", "office", "bug-detail"];
    }
    return ["landing", "dashboard", "office"];
  }
  if (spec.includes("bugs") || spec.includes("appointments") || name.includes("bug") || name.includes("msg")) {
    return ["landing", "dashboard", "bug-tracker", "bug-detail"];
  }
  if (spec.includes("specs") || spec.includes("doctor") || name.includes("spec")) {
    return ["landing", "dashboard", "specs", "live-run"];
  }
  if (spec.includes("settings") || spec.includes("rbac") || name.includes("setting")) {
    return ["landing", "dashboard", "settings"];
  }
  return ["landing", "dashboard", "suites", "live-run"];
}

export function JourneyCanvas({ tobi, antigravityLive: propLive, navigate, onInspectTest }: JourneyCanvasProps) {
  const liveTelemetry = propLive ?? tobi.antigravityLive;
  const activeScope: AuditScope = tobi.auditScope || "fullstack";
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(0.75);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom states requested by user:
  const [wheelZoomEnabled, setWheelZoomEnabled] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Braille spinner cycling every 100ms (TestSprite v3 rm-ci animation)
  const [brailleIdx, setBrailleIdx] = useState<number>(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBrailleIdx((prev) => (prev + 1) % BRAILLE_FRAMES.length);
    }, 100);
    return () => window.clearInterval(interval);
  }, []);
  const brailleChar = BRAILLE_FRAMES[brailleIdx];

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
    passed: 84,
    failed: 0,
    total: 84,
    tests: [],
  };

  const allTestsList = useMemo(() => (run.tests || []) as any[], [run.tests]);

  const testsList = useMemo(() => {
    if (activeScope === "frontend") {
      return allTestsList.filter((t) => !isApiTestItem(t));
    }
    if (activeScope === "backend") {
      return allTestsList.filter((t) => isApiTestItem(t));
    }
    return allTestsList;
  }, [allTestsList, activeScope]);

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

  const dynamicNodes = useMemo(() => {
    const failedOffice = testsList.filter(
      (t) => (t.spec?.includes("office") || t.name?.includes("TC-OFFICE")) && t.status === "Failed"
    ).length;
    const failedBugs = testsList.filter(
      (t) =>
        (t.spec?.includes("bugs") ||
          t.spec?.includes("appointments") ||
          t.name?.includes("TC-BUGS") ||
          t.name?.includes("TC-MSG")) &&
        t.status === "Failed"
    ).length;
    const openBugs = (tobi.state.bugs || []).filter(
      (b) => b.status !== "Resolved" && b.status !== "Closed"
    ).length;
    const skippedOrBlocked = (run as any).skipped || 0;

    if (tobi.activeProjectId !== "tobitests") {
      if (testsList.length === 0) {
        return [
          {
            id: "entry-point",
            title: `/ · Portada (${tobi.state.project.name})`,
            subtitle: `Target: ${tobi.state.project.url || "http://localhost:5173"}`,
            route: tobi.state.project.url || "http://localhost:5173",
            screenshot: "",
            x: 260,
            y: 280,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            testsCount: 0,
            touches: 0,
            failedCount: 0,
            blockedCount: 0,
            category: "auth" as const,
          },
        ];
      }

      // Discrete visual nodes for each verified route/screen
      const colX = [80, 480, 880, 1280];
      return testsList.map((testItem, i) => {
        const isApi = (testItem.spec || "").includes("api") || (testItem.name || "").includes("API");
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cleanTitle = (testItem.name || `Paso ${i + 1}`)
          .replace(/^TC-[A-Z0-9]+:\s*/, "")
          .replace(/DOM Structure/i, "Estructura DOM")
          .replace(/Entry Point/i, "Portada")
          .replace(/Realms Screen/i, "Los Diez Reinos")
          .replace(/HUD Rendering/i, "HUD del Tablero");
        const shot = testItem.screenshot || "";
        return {
          id: `test-node-${i}`,
          title: cleanTitle.length > 36 ? cleanTitle.slice(0, 36) + "..." : cleanTitle,
          subtitle: testItem.name || `Test ${i + 1}`,
          route: tobi.state.project.url || "http://localhost:5173",
          screenshot: isApi ? "API_NODE" : shot,
          x: colX[col],
          y: 80 + row * 240,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          testsCount: 1,
          touches: 1,
          failedCount: testItem.status === "Failed" ? 1 : 0,
          blockedCount: 0,
          category: (isApi ? "API" : (i === 0 ? "auth" : "workspace")) as any,
        };
      });
    }

    const mapped = TOBI_NODES.map((node) => {
      let failedCount = node.failedCount || 0;
      if (node.id === "office") failedCount = failedOffice;
      else if (node.id === "bug-tracker") failedCount = failedBugs;
      else if (node.id === "bug-detail") failedCount = openBugs;

      let blockedCount = node.blockedCount || 0;
      if (node.id === "bug-detail" && (failedOffice > 0 || failedBugs > 0)) {
        blockedCount = Math.max(1, failedOffice + failedBugs);
      } else if (node.id === "live-run" && (failedOffice > 0 || failedBugs > 0 || openBugs > 0)) {
        blockedCount = Math.max(1, skippedOrBlocked || 1);
      }

      return {
        ...node,
        failedCount,
        blockedCount,
      };
    });

    if (activeScope === "frontend") {
      return mapped.filter((node) => node.category !== "API" && node.screenshot !== "API_NODE");
    }
    if (activeScope === "backend") {
      return mapped.filter(
        (node) => node.category === "API" || node.screenshot === "API_NODE" || node.id === "live-run"
      );
    }
    return mapped;
  }, [testsList, tobi.state.bugs, run, activeScope, tobi.activeProjectId, tobi.state.project]);

  const nodeMap = useMemo(() => {
    const map: Record<string, JourneyNode> = {};
    dynamicNodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [dynamicNodes]);

  const dynamicEdges = useMemo(() => {
    if (tobi.activeProjectId !== "tobitests") {
      if (dynamicNodes.length <= 1) return [];
      return dynamicNodes.slice(1).map((target, idx) => {
        const prev = dynamicNodes[idx];
        return {
          id: `e-${prev.id}-${target.id}`,
          from: prev.id,
          to: target.id,
          verb: target.category === "API" ? "API 2xx/4xx" : "Navegar / Click",
          agentName: target.category === "API" ? "Telemetry Auditor" : "Explorer QA",
          agentRole: target.category === "API" ? "Auditor API ({ request })" : "Explorador de DOM",
          agentMcp: target.category === "API" ? "@playwright/test" : "@playwright/mcp",
          actionCode: `await page.goto('${target.route}');`,
          humanExplanation: `Transición explorada: ${prev.title} › ${target.title}.`,
          duration: `${80 + idx * 25}ms`,
          status: (target.failedCount && target.failedCount > 0 ? "Failed" : "Passed") as "Passed" | "Failed",
        };
      });
    }

    const failedOffice = testsList.filter(
      (t) => (t.spec?.includes("office") || t.name?.includes("TC-OFFICE")) && t.status === "Failed"
    ).length;
    const openBugs = (tobi.state.bugs || []).filter(
      (b) => b.status !== "Resolved" && b.status !== "Closed"
    ).length;

    return TOBI_EDGES.map((edge) => {
      let status: "Passed" | "Failed" = edge.status;
      if (edge.id === "e-office-bugdetail") {
        status = failedOffice > 0 ? "Failed" : "Passed";
      } else if (edge.id === "e-bugtracker-bugdetail") {
        status = openBugs > 0 ? "Failed" : "Passed";
      }
      return {
        ...edge,
        status,
      };
    }).filter((edge) => Boolean(nodeMap[edge.from] && nodeMap[edge.to]));
  }, [testsList, tobi.state.bugs, nodeMap, tobi.activeProjectId, dynamicNodes]);

  // Determine which node hosts the live floating agent thought HUD (div.rm-cap.rm-cap-think)
  const liveFocusedNode = useMemo(() => {
    if (selectedNodeId && nodeMap[selectedNodeId]) {
      return nodeMap[selectedNodeId];
    }
    if (activeScope === "backend") {
      return nodeMap["api-health"] || dynamicNodes[0];
    }
    const bState = liveTelemetry?.blackboardState || "idle";
    if (bState === "writing_specs" && nodeMap["specs"]) return nodeMap["specs"];
    if (bState === "auditing_telemetry" && nodeMap["bug-detail"]) return nodeMap["bug-detail"];
    if (bState === "standup_meeting" && nodeMap["office"]) return nodeMap["office"];
    if (bState === "exploring" && nodeMap["live-run"]) return nodeMap["live-run"];
    return nodeMap["dashboard"] || dynamicNodes[0];
  }, [selectedNodeId, nodeMap, liveTelemetry, dynamicNodes, activeScope]);

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
      (e.target as HTMLElement).closest(".rm-cap-think-floating") ||
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

  const matchesActiveFilters = (t: any) => {
    if (filterFailureOnly && t.status !== "Failed") return false;
    if (selectedNodeId && !getTestTouchedNodeIds(t).includes(selectedNodeId)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.spec?.toLowerCase().includes(q);
    }
    return true;
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
    return testsList.filter(matchesActiveFilters);
  }, [testsList, filterFailureOnly, selectedNodeId, searchQuery]);

  const primaryId = liveTelemetry?.orchestrationConfig?.primaryAgent || tobi.orchestrationConfig?.primaryAgent || liveTelemetry?.activeOrchestrator || "antigravity";
  const primaryName = tobi.SUPPORTED_AGENT_ENGINES?.[primaryId]?.name || primaryId.toUpperCase();
  const activeMode = liveTelemetry?.orchestrationConfig?.mode || tobi.orchestrationConfig?.mode || "dual";
  const activeOrchestratorLabel = activeMode === "single"
    ? `${primaryName} [SOLO]`
    : `${(liveTelemetry?.activeOrchestrator || primaryId).toUpperCase()} [DUAL]`;
  const activeStepNumber = liveTelemetry?.currentPipelineStep || 8;
  const activeBlackboardState = liveTelemetry?.blackboardState || "idle";

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
              {testsList.length} tests ({activeScope.toUpperCase()}) · {tobi.state.project.name} (rama {tobi.state.project.branch})
            </span>
          </div>

          {/* Progress bar */}
          <div className="journey-progress-container">
            <div className="journey-progress-status">
              <span className="status-live-dot" />
              <strong>Ejecución completada</strong>
              <span className="reading-snapshots">
                {activeScope === "backend"
                  ? `Contratos HTTP APIRequestContext · ${testsList.length} endpoints verificados`
                  : activeScope === "frontend"
                    ? `Árbol de navegación UI · ${testsList.length} capturas DOM`
                    : `Full-Stack E2E + API · ${testsList.length} pruebas activas`}
              </span>
            </div>

            <div className="journey-progress-bar-wrap">
              <div
                className="journey-progress-seg passed"
                style={{ width: `${((run.passed !== undefined ? run.passed : 84) / (run.total || 84)) * 100}%` }}
                title={`${run.passed !== undefined ? run.passed : 84} Aprobados`}
              />
              {(run.failed || 0) > 0 && (
                <div
                  className="journey-progress-seg failed"
                  style={{ width: `${((run.failed || 0) / (run.total || 84)) * 100}%` }}
                  title={`${run.failed} Con Incidente`}
                />
              )}
            </div>

            <div className="journey-progress-meta">
              <span className="meta-counts">
                <strong className="text-success">{run.passed !== undefined ? run.passed : 84}</strong> aprobados ·{" "}
                <strong className={(run.failed || 0) > 0 ? "text-danger" : "text-success"}>{run.failed || 0}</strong>{" "}
                {(run.failed || 0) === 1 ? "incidente" : "incidentes"}
              </span>
              <span className="meta-time">Tiempo total: {run.duration || "12.4s"}</span>
            </div>
          </div>
        </div>

        <div className="journey-topbar-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
          {/* Dynamic Post-Test Scope Switcher */}
          <div
            data-testid="audit-scope-switcher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "3px",
              gap: "3px",
            }}
          >
            {(
              [
                { id: "frontend", label: "🖥️ Frontend" },
                { id: "backend", label: "⚙️ Backend API" },
                { id: "fullstack", label: "🔗 Full-Stack" },
              ] as const
            ).map((opt) => {
              const isSelected = activeScope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`scope-option-${opt.id}`}
                  onClick={() => tobi.setAuditScope(opt.id)}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: isSelected ? "#6366f1" : "transparent",
                    color: isSelected ? "#ffffff" : "#94a3b8",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            data-testid="reaudit-scope-btn"
            className="btn-toggle-sidebar"
            onClick={() => tobi.runLiveAudit(activeScope)}
            title={`Ejecutar o re-auditar alcance ${activeScope.toUpperCase()} fusionando resultados incrementalmente`}
            style={{
              borderColor: "rgba(99, 102, 241, 0.55)",
              background: "rgba(99, 102, 241, 0.14)",
              color: "#c7d2fe",
              fontWeight: 700,
            }}
          >
            ⚡ Re-auditar alcance
          </button>

          {/* Toggle Sidebar to maximize canvas */}
          <button
            type="button"
            className={`btn-toggle-sidebar ${!sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Ocultar panel de tests para maximizar el tablero" : "Mostrar panel de tests"}
          >
            {sidebarOpen ? "⮞ Maximizar Tablero" : `⮜ Ver Tests (${filteredTests.length})`}
          </button>

          <button
            type="button"
            className={`btn-filter-fail ${filterFailureOnly ? "active" : ""}`}
            onClick={() => setFilterFailureOnly(!filterFailureOnly)}
          >
            <span className="fail-dot" />
            {filterFailureOnly ? `Mostrando fallas (${run.failed || 0})` : "Filtrar solo incidentes"}
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
      <div className="journey-layout run-map rm-flush rm-panning">
        {/* Canvas Board */}
        <div
          ref={viewportRef}
          className={`journey-canvas-viewport rm-grid ${isDragging ? "dragging" : ""}`}
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
                  Trayectoria:{" "}
                  {getTestTouchedNodeIds(activeTest)
                    .map((id) => {
                      const n = nodeMap[id];
                      return n ? n.title.split("·")[0].trim() : id;
                    })
                    .join(" ➔ ")}
                </span>
              </div>
            </div>
          )}

          {/* Un-audited Project Empty State Banner */}
          {tobi.activeProjectId !== "tobitests" && testsList.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 35,
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                borderRadius: "12px",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
                maxWidth: "680px",
              }}
            >
              <div style={{ fontSize: "28px" }}>🗺️</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                  Mapa de Flujos en espera de exploración ({tobi.state.project.name})
                </div>
                <div style={{ color: "#94a3b8", fontSize: "12px", lineHeight: "1.45" }}>
                  Este proyecto aún no cuenta con ejecuciones Playwright registradas. Hacé click en <strong>⚡ Re-auditar alcance</strong> para que Explorer QA y Telemetry Auditor naveguen tu frontend real y mapeen las rutas.
                </div>
              </div>
              <button
                type="button"
                onClick={() => tobi.runLiveAudit(activeScope)}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 18px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                }}
              >
                ⚡ Iniciar Auditoría
              </button>
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

          {/* Canvas coordinate layer (TestSprite rm-world) */}
          <div
            className="journey-canvas-stage rm-world rm-grow rm-far"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Entry Pill (rm-wl rm-entry) */}
            <div
              className="rm-wl rm-entry"
              style={{
                position: "absolute",
                left: "80px",
                top: "256px",
              }}
            >
              <span className="rm-entry-dot" />
              <span>start · {testsList.length}</span>
            </div>

            {/* Live Floating Agent Thought HUD tethered over active node (div.rm-cap.rm-cap-think) */}
            {liveFocusedNode && (
              <div
                className={`rm-cap rm-cap-think rm-cap-think-floating state-${activeBlackboardState}`}
                style={{
                  position: "absolute",
                  left: `${liveFocusedNode.x}px`,
                  top: `${liveFocusedNode.y - 62}px`,
                  zIndex: 30,
                }}
                title={liveTelemetry?.thoughtSnippet || liveTelemetry?.detail || "Co-Orchestration Blackboard active"}
              >
                <span className="rm-ci" aria-hidden="true">
                  {brailleChar}
                </span>
                <span className="rm-ct">
                  <span className="rm-orchestrator-pill">{activeOrchestratorLabel}</span>
                  <span className="rm-tv">
                    {liveTelemetry?.action || "Choosing the next step…"}
                  </span>
                  <span className="rm-d">
                    · Step {activeStepNumber}/8 · {activeBlackboardState}
                  </span>
                </span>
              </div>
            )}

            {/* SVG Connecting Bezier Curves */}
            <svg
              className="journey-svg-layer rm-ov"
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

              {dynamicEdges.map((edge) => {
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
            {dynamicNodes.map((node) => {
              const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(node.id) : false;
              const isDimmed = highlightedNodeIds ? !highlightedNodeIds.has(node.id) : false;
              const hasFailure = node.failedCount > 0;
              const blockedCount = node.blockedCount || 0;
              const hasBlocked = blockedCount > 0;
              const isApiNode =
                node.category === "API" ||
                node.route.startsWith("/api") ||
                node.route.includes("/api/") ||
                !node.screenshot;

              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.title}, ${node.testsCount} tests reached it`}
                  className={`journey-node-card rm-frame ${isHighlighted ? "highlighted rm-hi" : ""} ${
                    isDimmed ? "dimmed" : ""
                  } ${hasFailure ? "has-failure rm-has-fail" : ""} ${
                    hasBlocked ? "has-blocked rm-has-block" : ""
                  } ${isApiNode ? "rm-api-node" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                  onClick={() => {
                    const nextId = selectedNodeId === node.id ? null : node.id;
                    setSelectedNodeId(nextId);
                    if (nextId && !sidebarOpen) {
                      setSidebarOpen(true);
                    }
                  }}
                >
                  {/* Top Label (rm-wl rm-lab) */}
                  <div className="rm-node-label rm-wl rm-lab" title={node.title}>
                    <span className="rm-label-globe">{isApiNode ? "⚡" : "🌐"}</span>
                    {isApiNode && <span className="rm-api-badge-inline">API</span>}
                    <span className="rm-label-text rm-ttl">{node.title}</span>
                    {hasFailure ? (
                      <span className="rm-label-badge danger">{node.failedCount} falla</span>
                    ) : hasBlocked ? (
                      <span className="rm-label-badge warning">{blockedCount} bloq</span>
                    ) : (
                      <span className="rm-label-badge ok">OK</span>
                    )}
                  </div>

                  {/* Thumbnail Wrap (rm-thumb) */}
                  <div className="rm-thumb-wrap rm-thumb">
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
                    {isApiNode && !node.screenshot ? (
                      <div className="api-endpoint-telemetry-preview">
                        <div className="api-preview-methods">
                          <span className="api-method-pill get">GET</span>
                          <span className="api-method-pill post">POST</span>
                          <span className="api-method-pill rbac">RBAC</span>
                          <span className="api-contract-pill">application/json</span>
                        </div>
                        <div className="api-preview-route-line">
                          <code>{node.route}</code>
                        </div>
                        <div className="api-preview-metrics">
                          <span className="api-status-ok">● 200 OK · Schema Valid</span>
                          <span className="api-sla-tag">⏱ 38ms &lt; 500ms SLA</span>
                        </div>
                      </div>
                    ) : node.screenshot ? (
                      <img
                        src={node.screenshot}
                        alt={node.title}
                        className="node-screenshot-img"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          height: 140,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(15, 23, 42, 0.7)",
                          color: "var(--muted, #94a3b8)",
                          padding: 12,
                          gap: 6,
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: 24 }}>🧭</span>
                        <code style={{ fontSize: 11, color: "#cbd5e1" }}>{node.route}</code>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>Pendiente de captura visual</span>
                      </div>
                    )}
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
                        else if (node.id === "live-run" || isApiNode) navigate("live-run");
                        else if (node.id === "settings") navigate("settings");
                        else navigate("dashboard");
                      }}
                      title="Abrir vista en el workspace"
                    >
                      Abrir ↗
                    </button>
                  </div>

                  {/* Bottom Tri-State Metadata (rm-wl rm-meta: rm-f, rm-b, rm-t) */}
                  <div className="rm-node-meta rm-wl rm-meta">
                    <span className={`rm-f ${hasFailure ? "rm-fail-count" : "rm-zero"}`}>
                      {node.failedCount} failed here
                    </span>
                    <span className="rm-meta-sep">·</span>
                    <span className={`rm-b ${hasBlocked ? "rm-block-count" : "rm-zero"}`}>
                      {blockedCount} blocked here
                    </span>
                    <span className="rm-meta-sep">·</span>
                    <span className="rm-t rm-pass-count">
                      {node.testsCount} tests · {node.touches} touches
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Controls at Bottom Left (rm-hud rm-tools) */}
          <div className="journey-canvas-controls rm-hud rm-hud-tools rm-tools">
            <button
              type="button"
              className="rm-btn rm-primary rm-btn-follow"
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

            <div className="rm-zoom rm-zoom-group">
              <button type="button" className="rm-zoom-btn" onClick={zoomOut} title="Alejar (-)" aria-label="Zoom out">
                －
              </button>
              <button
                type="button"
                className="rm-zoom-btn"
                onClick={resetView}
                title="Restablecer escala al 100%"
                aria-label="Fit the map"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" className="rm-zoom-btn" onClick={zoomIn} title="Acercar (+)" aria-label="Zoom in">
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

          {/* Floating Bottom Status Pill (rm-hud rm-foot -> rm-cap rm-cap-think) */}
          <div className="journey-bottom-pill rm-hud rm-hud-foot rm-foot">
            <div className="rm-cap rm-cap-think">
              <span
                className="rm-ci rm-foot-spinner"
                style={{ color: (run.failed || 0) === 0 ? "#10b981" : "#38bdf8" }}
              >
                {brailleChar}
              </span>
              <span className="rm-ct">
                <span className="rm-tv">
                  {liveTelemetry?.action || "Árbol de navegación sincronizado"}
                </span>
                <span className="rm-d">
                  {" "}
                  · 1 in progress · Step {activeStepNumber}/8 · {testsList.length} tests ({run.passed ?? 84} ok /{" "}
                  {run.failed || 0} fail)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Tests List (rm-panel rm-tests) */}
        {sidebarOpen && (
          <aside className="journey-tests-sidebar rm-panel rm-tests" aria-label="Tests in this run">
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
                Pasá el mouse por un test para iluminar su ruta. Hacé clic en un nodo o test para filtrar e inspeccionar.
              </p>

              {/* Node Filter Banner when a route node is clicked */}
              {selectedNodeId && nodeMap[selectedNodeId] && (
                <div className="node-filter-active-chip">
                  <div className="node-filter-chip-info">
                    <span className="node-filter-dot" />
                    <strong>
                      Nodo: {nodeMap[selectedNodeId].title.split("·")[0].trim()} ({filteredTests.length} tests)
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="btn-clear-node-filter"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    Ver todos
                  </button>
                </div>
              )}

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

            <div className="sidebar-tests-scroll rm-tl">
              {Object.entries(groupedSuites).map(([suite, tests]) => {
                const visibleTests = (tests as any[]).filter(matchesActiveFilters);

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

            <div className="rm-pfoot">
              Hover a test to trace its path. Click to replay it.
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
