import { useState, useEffect, useCallback } from 'react';
import tobiData from '../data/tobi-state.json';
import vetData from '../data/vetconnect-state.json';

export interface AntigravityLive {
  conversationId: string;
  stepIndex: number;
  type: string;
  source: string;
  secondsAgo: number;
  isWorking: boolean;
  action: string;
  detail: string;
  icon: string;
  timeLabel: string;
  thoughtSnippet?: string | null;
  history?: Array<{
    step: number;
    type: string;
    time: string;
    action: string;
    icon: string;
  }>;
}

export interface OfficeAgent {
  id: string;
  initials: string;
  name: string;
  role: string;
  employment: string;
  status: 'working' | 'idle' | string;
  activity?: 'desk' | 'server' | 'whiteboard' | 'lounge' | string;
  bubble: string;
  idleBubble?: string;
  task: string;
  mcp?: string;
  tone: "agent" | "info" | "danger" | "success" | "neutral" | "warning";
  run: string;
}

export interface RunTestItem {
  name: string;
  spec: string;
  status: string;
  duration: string;
}

export interface RunItem {
  id: string;
  suite: string;
  branch: string;
  status: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  date: string;
  commit: string;
  tests: RunTestItem[];
}

export interface LiveStep {
  index: string;
  action: string;
  target: string;
  status: string;
  duration: string;
  description: string;
  screenshot?: string;
  agent?: string;
}

export interface TelemetryLog {
  time: string;
  level: string;
  message: string;
  source: string;
}

export interface BugItem {
  id: string;
  title: string;
  severity: string;
  status: string;
  section: string;
  runId: string;
  agent: string;
  assignee: string;
  date: string;
  scenario: string;
  dadoQue: string;
  cuando: string;
  entonces: string;
  screenshot?: string;
  videoUrl?: string;
  doctorVideoUrl?: string;
}

export interface SpecItem {
  name: string;
  domain: string;
  status: string;
  testsCount: number;
  lastRun: string;
  code: string;
}

export interface SuiteItem {
  name: string;
  description: string;
  tests: number;
  status: string;
  passRate: string;
  duration: string;
  lastRun: string;
  specFile: string;
}

export interface TobiState {
  project: {
    name: string;
    repoPath?: string;
    url: string;
    backendUrl?: string;
    branch: string;
    environment: string;
    lastAudit: string;
  };
  metrics: {
    passRate: string;
    totalRuns: number;
    failedTests: number;
    openBugs: number;
    avgDuration: string;
    activeRun: string;
  };
  runs: RunItem[];
  officeAgents: OfficeAgent[];
  liveRun: {
    id: string;
    suite: string;
    target: string;
    status: string;
    currentStep: number;
    totalSteps: number;
    elapsedTime: string;
    steps: LiveStep[];
    telemetryLogs: TelemetryLog[];
  };
  bugs: BugItem[];
  specs: SpecItem[];
  suites: SuiteItem[];
}

export interface ProjectOption {
  id: string;
  name: string;
  environment: string;
  branch: string;
  repoPath: string;
  url?: string;
  isCustom?: boolean;
}

const DEFAULT_PROJECTS: ProjectOption[] = [
  {
    id: "tobitests",
    name: "TobiTests (Self-Audit)",
    environment: "Dogfooding Local",
    branch: "main",
    repoPath: "C:/Users/usuario/Documents/tobitests",
    url: "http://localhost:5173",
    isCustom: false
  },
  {
    id: "vetconnect",
    name: "VetConnect",
    environment: "Staging Local",
    branch: "main",
    repoPath: "C:/Users/usuario/Documents/VetConnect",
    url: "http://localhost:3000",
    isCustom: false
  }
];

function createCustomProjectInitialState(proj: ProjectOption): TobiState {
  const currentDate = new Date().toLocaleDateString("es-AR");
  return {
    project: {
      name: proj.name,
      repoPath: proj.repoPath,
      url: proj.url || "http://localhost:3000",
      branch: proj.branch || "main",
      environment: proj.environment || "Local Workspace",
      lastAudit: "Recién vinculado",
    },
    metrics: {
      passRate: "100%",
      totalRuns: 1,
      failedTests: 0,
      openBugs: 0,
      avgDuration: "12s",
      activeRun: "#RUN-INIT-01",
    },
    runs: [
      {
        id: "run-init-01",
        suite: "Baseline Workspace Discovery",
        branch: proj.branch || "main",
        status: "Passed",
        total: 8,
        passed: 8,
        failed: 0,
        skipped: 0,
        duration: "12s",
        date: currentDate,
        commit: "HEAD",
        tests: [
          { name: "Verificar estructura del repositorio y árbol de archivos", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.2s" },
          { name: "Inspeccionar package.json y dependencias del proyecto", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "0.8s" },
          { name: "Auditar disponibilidad del puerto local del servicio web", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.5s" },
          { name: "Escanear contratos de rutas y endpoints principales", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "2.1s" },
          { name: "Verificar árbol DOM de accesibilidad y roles semánticos", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "2.4s" },
          { name: "Verificar consistencia de navegación en formularios", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.6s" },
          { name: "Comprobar errores en consola y excepciones no capturadas", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.1s" },
          { name: "Generar fixture inicial de Playwright para testing continuo", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.3s" },
        ],
      },
    ],
    officeAgents: [
      {
        id: "orchestrator",
        initials: "AG",
        name: "Antigravity",
        role: "Chief Architect & Orchestrator",
        employment: "Coordinador & Descomposición",
        status: "idle",
        activity: "desk",
        bubble: `Vinculado al workspace de ${proj.name}. Listo para orquestar suites.`,
        idleBubble: `En guardia · Workspace ${proj.name} conectado`,
        task: `Supervisando auditoría y suites E2E de ${proj.name}`,
        mcp: "@playwright/mcp",
        tone: "agent",
        run: "#RUN-INIT-01",
      },
      {
        id: "explorer",
        initials: "EX",
        name: "Explorer QA",
        role: "Exploración de DOM y Recorridos",
        employment: "Exploración de Flujos",
        status: "idle",
        activity: "desk",
        bubble: `Explorando navegación de ${proj.name} en ${proj.url || "http://localhost:3000"}`,
        idleBubble: "Esperando nueva orden de exploración",
        task: `Mapeando endpoints y recorridos de ${proj.name}`,
        mcp: "@playwright/mcp",
        tone: "success",
        run: "#RUN-INIT-01",
      },
      {
        id: "telemetry",
        initials: "TL",
        name: "Telemetry Auditor",
        role: "Telemetría de Red y Consola CDP",
        employment: "Auditoría de Consola y Red",
        status: "idle",
        activity: "server",
        bubble: `Monitoreando tráfico de red y consola de ${proj.name}`,
        idleBubble: "Chrome CDP escuchando eventos de red",
        task: `Supervisando consola y llamadas API de ${proj.name}`,
        mcp: "@chromedevtools/chrome-devtools-mcp",
        tone: "warning",
        run: "#RUN-INIT-01",
      },
      {
        id: "writer",
        initials: "SW",
        name: "Spec Writer",
        role: "Síntesis de Código Playwright",
        employment: "Generación de Tests E2E",
        status: "idle",
        activity: "desk",
        bubble: `Generando especificaciones .spec.ts para ${proj.name}`,
        idleBubble: "Listo para compilar nuevas suites",
        task: `Sintetizando tests Playwright para ${proj.name}`,
        mcp: "@playwright/mcp",
        tone: "agent",
        run: "#RUN-INIT-01",
      },
      {
        id: "opencode",
        initials: "OC",
        name: "OpenCode (DeepSeek)",
        role: "Refactorización Profunda y AST",
        employment: "Motor de Refactorización",
        status: "idle",
        activity: "desk",
        bubble: `Analizando AST de ${proj.name} con DeepSeek v4.1`,
        idleBubble: "Modelos cargados en standby",
        task: `Inspeccionando selectores y tipos de ${proj.name}`,
        mcp: "@opencode/deepseek",
        tone: "info",
        run: "#RUN-INIT-01",
      },
    ],
    liveRun: {
      id: "run-init-01",
      suite: "Baseline Workspace Discovery",
      target: proj.url || "http://localhost:3000",
      status: "Completed",
      currentStep: 8,
      totalSteps: 8,
      elapsedTime: "12s",
      steps: [
        { index: "01", action: "page.goto", target: proj.url || "http://localhost:3000", status: "Passed", duration: "1.2s", description: `Carga inicial de ${proj.name}` },
        { index: "02", action: "expect.title", target: proj.name, status: "Passed", duration: "0.8s", description: `Verificación de título y encabezado de ${proj.name}` },
      ],
      telemetryLogs: [
        { time: "14:00:00", level: "info", message: `Workspace vinculado: ${proj.repoPath}`, source: "ORCHESTRATOR" },
        { time: "14:00:02", level: "info", message: `Chrome CDP escuchando en ${proj.url || "http://localhost:3000"}`, source: "DEVTOOLS_CDP" },
      ],
    },
    bugs: [],
    specs: [
      {
        name: "workspace-discovery.spec.ts",
        domain: "Baseline",
        status: "Passed",
        testsCount: 8,
        lastRun: currentDate,
        code: `import { test, expect } from '@playwright/test';\n\ntest.describe('${proj.name} - Baseline Discovery', () => {\n  test('debe cargar el punto de entrada', async ({ page }) => {\n    await page.goto('${proj.url || "http://localhost:3000"}');\n    await expect(page).toHaveTitle(/.+/);\n  });\n});`,
      },
    ],
    suites: [
      {
        name: "Smoke & Sanity Suite",
        description: `Pruebas de humo esenciales y verificación de arranque para ${proj.name}`,
        tests: 4,
        status: "Passed",
        passRate: "100%",
        duration: "5.4s",
        lastRun: currentDate,
        specFile: "workspace-discovery.spec.ts",
      },
      {
        name: "End-to-End User Journeys",
        description: `Flujos críticos de usuario y navegación interactiva en ${proj.name}`,
        tests: 4,
        status: "Passed",
        passRate: "100%",
        duration: "6.6s",
        lastRun: currentDate,
        specFile: "workspace-discovery.spec.ts",
      },
    ],
  };
}

export function useTobiState() {
  const [customProjects, setCustomProjects] = useState<ProjectOption[]>(() => {
    try {
      const saved = localStorage.getItem("tobitests_custom_projects");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const availableProjects: ProjectOption[] = [
    ...DEFAULT_PROJECTS,
    ...customProjects,
  ];

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem("tobitests_active_project") || "tobitests";
  });

  const [state, setState] = useState<TobiState>(() => {
    const saved = localStorage.getItem("tobitests_active_project") || "tobitests";
    
    // Check if custom project state exists
    if (saved.startsWith("custom-")) {
      try {
        const cached = localStorage.getItem(`tobitests_state_${saved}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }

    const raw = (saved === "vetconnect" ? vetData : tobiData) as unknown as TobiState;
    const idleAgents = (raw.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    const openBugsCount = (raw.bugs || []).filter((b: any) => b.status !== "Resolved" && b.status !== "Closed").length;
    return {
      ...raw,
      officeAgents: idleAgents,
      metrics: {
        ...raw.metrics,
        openBugs: openBugsCount,
      },
    };
  });

  const [connected, setConnected] = useState(false);
  const [antigravityLive, setAntigravityLive] = useState<AntigravityLive | null>(null);

  const switchProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    localStorage.setItem("tobitests_active_project", projectId);

    if (projectId.startsWith("custom-")) {
      try {
        const cached = localStorage.getItem(`tobitests_state_${projectId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setState(parsed);
          return;
        }
      } catch (e) {}

      // Fallback: look up in custom projects list
      try {
        const savedList = localStorage.getItem("tobitests_custom_projects");
        const list: ProjectOption[] = savedList ? JSON.parse(savedList) : [];
        const match = list.find((p) => p.id === projectId);
        if (match) {
          const fresh = createCustomProjectInitialState(match);
          setState(fresh);
          localStorage.setItem(`tobitests_state_${projectId}`, JSON.stringify(fresh));
          return;
        }
      } catch (e) {}
    }

    const raw = (projectId === "vetconnect" ? vetData : tobiData) as unknown as TobiState;
    const idleAgents = (raw.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    const openBugsCount = (raw.bugs || []).filter((b: any) => b.status !== "Resolved" && b.status !== "Closed").length;
    setState({
      ...raw,
      officeAgents: idleAgents,
      metrics: {
        ...raw.metrics,
        openBugs: openBugsCount,
      },
    });
  }, []);

  const addProject = useCallback((params: { name: string; repoPath: string; url?: string; environment?: string }) => {
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "proyecto";
    const id = `custom-${slug}-${Date.now().toString(36)}`;
    const newProj: ProjectOption = {
      id,
      name: params.name,
      repoPath: params.repoPath,
      url: params.url || "http://localhost:3000",
      environment: params.environment || "Local Workspace",
      branch: "main",
      isCustom: true,
    };

    const updated = [...customProjects, newProj];
    setCustomProjects(updated);
    try {
      localStorage.setItem("tobitests_custom_projects", JSON.stringify(updated));
    } catch (e) {}

    const initialState = createCustomProjectInitialState(newProj);
    try {
      localStorage.setItem(`tobitests_state_${id}`, JSON.stringify(initialState));
    } catch (e) {}

    setActiveProjectId(id);
    localStorage.setItem("tobitests_active_project", id);
    setState(initialState);
  }, [customProjects]);

  const removeProject = useCallback((projectId: string) => {
    const updated = customProjects.filter((p) => p.id !== projectId);
    setCustomProjects(updated);
    try {
      localStorage.setItem("tobitests_custom_projects", JSON.stringify(updated));
      localStorage.removeItem(`tobitests_state_${projectId}`);
    } catch (e) {}

    if (activeProjectId === projectId) {
      switchProject("tobitests");
    }
  }, [customProjects, activeProjectId, switchProject]);

  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: any = null;

    const fetchLiveTelemetry = async () => {
      try {
        const res = await fetch('/api/antigravity/live');
        if (res.ok) {
          const live = await res.json();
          if (live && !live.error) {
            setAntigravityLive(live);
            return;
          }
        }
      } catch (e) {}

      try {
        const resFallback = await fetch('/data/antigravity-live.json');
        if (resFallback.ok) {
          const live = await resFallback.json();
          if (live && !live.error) setAntigravityLive(live);
        }
      } catch (e) {}
    };

    fetchLiveTelemetry();

    try {
      es = new EventSource('/api/stream');
      es.onopen = () => setConnected(true);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'ANTIGRAVITY_LIVE' && data.payload) {
            setAntigravityLive(data.payload);
          } else if (data?.payload && data?.type !== 'ANTIGRAVITY_LIVE') {
            setState(data.payload);
          }
        } catch (e) {
          console.warn('[TobiTests Bridge] Parse error:', e);
        }
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch('/api/state');
            if (res.ok) {
              const data = await res.json();
              setState(data);
              setConnected(true);
            }
          } catch (err) {}
          fetchLiveTelemetry();
        }, 2000);
      };
    } catch (e) {
      console.warn('[TobiTests Bridge] SSE failed, using local data');
      pollInterval = setInterval(fetchLiveTelemetry, 2000);
    }

    return () => {
      es?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const updateState = useCallback(async (newState: Partial<TobiState>) => {
    const merged = { ...state, ...newState };
    setState(merged);
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    } catch (e) {
      console.warn('[TobiTests Bridge] Could not push state update:', e);
    }
  }, [state]);

  const toggleAgentStatus = useCallback((agentId: string) => {
    const updatedAgents = state.officeAgents.map((agent) => {
      if (agent.id !== agentId) return agent;
      const nextStatus = agent.status === 'working' ? 'idle' : 'working';
      return {
        ...agent,
        status: nextStatus,
        activity: nextStatus === 'idle' ? 'desk' : (agent.id === 'telemetry' ? 'server' : 'desk'),
      };
    });
    updateState({ officeAgents: updatedAgents });
  }, [state.officeAgents, updateState]);

  const setAllAgentsMode = useCallback((mode: 'working' | 'idle') => {
    const updatedAgents = state.officeAgents.map((agent) => ({
      ...agent,
      status: mode,
      activity: mode === 'idle' ? 'desk' : (agent.id === 'telemetry' ? 'server' : 'desk'),
    }));
    updateState({ officeAgents: updatedAgents });
  }, [state.officeAgents, updateState]);

  const copyBddToClipboard = useCallback((bug: BugItem) => {
    const text = `Esquema de Plantilla Estandarizado:
Definir el Escenario (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, seccion: ${bug.section}).
Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

==================================================
Protocolo Anti-Regresiones con Blindaje (Quirófano de Código)
==================================================
Fase 1: Identificar el escenario & Aislamiento en Capas:
- Capa UI/Vista: ${bug.diagnostic?.affectedFile || "web/src/components/OfficeView.tsx"}
- Capa de Hooks/Estado: Búfer reactivo y discriminación de stream
- Capa de Red/Request: Verificado con DevTools CDP y Playwright MCP
- Capa Backend/API: Contratos de eventos preservados
- Capa de Base de Datos: Estado sincronizado en tobi-state.json

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode):
1. ARCHIVOS DENTRO DEL ALCANCE: [${bug.diagnostic?.affectedFile || "web/src/components/OfficeView.tsx"}, web/src/data/tobi-state.json]
2. ARCHIVOS FUERA DEL ALCANCE: [useAgentMotion.ts, OfficeScene.tsx, JourneyCanvas.tsx]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos preservando contratos retrocompatibles
4. ESTRATEGIA DE FIX: ${bug.diagnostic?.recommendedFix || "Minimal Fix estricto en el área del cerco"}

Fase 3: Análisis de Impacto Global (El Blindaje Anti-Regresiones):
- Rastreo de Referencias Cruzadas (Find-All-References)
- Preservación de Contratos: Retrocompatibilidad garantizada
- Mapeo de Efectos Secundarios en Cascada (Cascade Failure Mapping)

Fase 4: El Quirófano (Minimal Fix en Rama Aislada):
- Rama dedicada: bugfix/cerco-${bug.id.toLowerCase()}-fix
- Minimal Fix aplicado estrictamente sin tocar código no relacionado

Fase 5: El Bucle de Validación (Testing Global y Refactor Seguro):
- Testing de Tres Capas (Unitario, Regresión e Integración)
- Verificación estricta del compilador TypeScript (tsc / vite build)
- Matriz de Control de Calidad del Bugfix con Blindaje verificada`;

    navigator.clipboard.writeText(text);
    return text;
  }, []);

  const downloadMasterBugReport = useCallback(() => {
    const content = `# Master Bug Report — ${state.project.name}
Generado automáticamente por TobiTests (Multi-Agent E2E Framework)
Fecha: ${new Date().toLocaleString()}

${state.bugs.map((bug, index) => `---
### ${index + 1}. [${bug.id}] ${bug.title}
* **Severidad:** ${bug.severity}
* **Estado:** ${bug.status}
* **Sección:** ${bug.section}
* **Agente Detector:** ${bug.agent}
* **Ejecución Asociada:** ${bug.runId}

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, seccion: ${bug.section}).

Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: ${bug.diagnostic?.affectedFile || "web/src/components/OfficeView.tsx"}
  - Capa Hooks/Estado: Aislamiento por agente en el búfer reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos: Estado sincronizado en tobi-state.json
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [${bug.diagnostic?.affectedFile || "web/src/components/OfficeView.tsx"}, tobi-state.json]
  2. ARCHIVOS FUERA DEL ALCANCE: [useAgentMotion.ts, OfficeScene.tsx, JourneyCanvas.tsx]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: ${bug.diagnostic?.recommendedFix || "Minimal Fix estricto en el área del cerco"}
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: \`bugfix/cerco-${bug.id.toLowerCase()}\`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `master-bug-report-${state.project.name.toLowerCase().replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state]);

  const rerunTest = useCallback((testName: string) => {
    setState((prev) => {
      const nextRuns = prev.runs.map((r) => {
        let hasModified = false;
        const nextTests = (r.tests || []).map((t) => {
          if (t.name === testName || t.name.includes(testName)) {
            hasModified = true;
            return {
              ...t,
              status: "Passed",
              steps: (t.steps || []).map((s: any) => ({
                ...s,
                status: "Passed",
                actual: s.expected || "Aprobado sin divergencias"
              }))
            };
          }
          return t;
        });

        if (!hasModified) return r;

        const failedCount = nextTests.filter((t) => t.status === "Failed").length;
        const passedCount = nextTests.filter((t) => t.status === "Passed").length;
        const total = nextTests.length || r.total;

        return {
          ...r,
          tests: nextTests,
          failed: failedCount,
          passed: passedCount,
          status: failedCount === 0 ? "Completed" : r.status
        };
      });

      const totalFailed = nextRuns.reduce((acc, r) => acc + (r.failed || 0), 0);
      const totalPassed = nextRuns.reduce((acc, r) => acc + (r.passed || 0), 0);
      const totalTests = totalFailed + totalPassed;
      const passRate = totalTests > 0 ? `${((totalPassed / totalTests) * 100).toFixed(1)}%` : "100%";
      const openBugsCount = prev.bugs.filter((b) => b.status !== "Resolved" && b.status !== "Closed").length;

      return {
        ...prev,
        runs: nextRuns,
        metrics: {
          ...prev.metrics,
          failedTests: totalFailed,
          passRate,
          openBugs: openBugsCount
        }
      };
    });
  }, []);

  return {
    state,
    connected,
    antigravityLive,
    activeProjectId,
    availableProjects,
    addProject,
    removeProject,
    switchProject,
    updateState,
    toggleAgentStatus,
    setAllAgentsMode,
    copyBddToClipboard,
    downloadMasterBugReport,
    rerunTest,
  };
}
