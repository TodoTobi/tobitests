import { useState, useEffect, useCallback } from 'react';
import tobiData from '../data/tobi-state.json';
import vetData from '../data/vetconnect-state.json';

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
}

const AVAILABLE_PROJECTS: ProjectOption[] = [
  {
    id: "tobitests",
    name: "TobiTests (Self-Audit)",
    environment: "Dogfooding Local",
    branch: "main",
    repoPath: "C:/Users/usuario/Documents/tobitests"
  },
  {
    id: "vetconnect",
    name: "VetConnect",
    environment: "Staging Local",
    branch: "main",
    repoPath: "C:/Users/usuario/Documents/VetConnect"
  }
];

export function useTobiState() {
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem("tobitests_active_project") || "tobitests";
  });
  const [state, setState] = useState<TobiState>(() => {
    const saved = localStorage.getItem("tobitests_active_project");
    const raw = (saved === "vetconnect" ? vetData : tobiData) as unknown as TobiState;
    const idleAgents = (raw.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    return { ...raw, officeAgents: idleAgents };
  });
  const [connected, setConnected] = useState(false);

  const switchProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    localStorage.setItem("tobitests_active_project", projectId);
    const raw = (projectId === "vetconnect" ? vetData : tobiData) as unknown as TobiState;
    const idleAgents = (raw.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    setState({ ...raw, officeAgents: idleAgents });
  }, []);

  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: any = null;

    try {
      es = new EventSource('/api/stream');
      es.onopen = () => setConnected(true);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.payload) {
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
        }, 3000);
      };
    } catch (e) {
      console.warn('[TobiTests Bridge] SSE failed, using local data');
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

  return {
    state,
    connected,
    activeProjectId,
    availableProjects: AVAILABLE_PROJECTS,
    switchProject,
    updateState,
    toggleAgentStatus,
    setAllAgentsMode,
    copyBddToClipboard,
    downloadMasterBugReport,
  };
}
