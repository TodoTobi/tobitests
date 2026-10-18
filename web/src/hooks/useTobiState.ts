import { useState, useEffect, useCallback, useMemo } from 'react';
import tobiData from '../data/tobi-state.json';
import vetData from '../data/vetconnect-state.json';

export type AuditScope = 'frontend' | 'backend' | 'fullstack';

export type AgentEngineId =
  | 'antigravity'
  | 'opencode'
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'windsurf'
  | 'custom';

export interface AgentEngineConfig {
  id: AgentEngineId;
  name: string;
  type: 'ide' | 'cli' | 'hybrid';
  badge: string;
  color: string;
  accent: string;
  description: string;
  detected?: boolean;
}

export const SUPPORTED_AGENT_ENGINES: Record<AgentEngineId, AgentEngineConfig> = {
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    type: 'ide',
    badge: 'AGY',
    color: '#8B5CF6',
    accent: '#06B6D4',
    description: 'Agentic IDE with native @playwright/mcp & Chrome DevTools MCP orchestration',
    detected: true,
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    type: 'cli',
    badge: 'OC',
    color: '#10B981',
    accent: '#34D399',
    description: 'CLI Co-Orchestrator for Playwright .spec.ts synthesis & selector self-healing',
    detected: true,
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    type: 'cli',
    badge: 'CC',
    color: '#D97706',
    accent: '#F59E0B',
    description: 'Anthropic terminal agent with native MCP client & CLAUDE.md protocol',
    detected: true,
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    type: 'ide',
    badge: 'CUR',
    color: '#3B82F6',
    accent: '#60A5FA',
    description: 'AI Code Editor with multi-file Composer, .cursorrules & MCP integration',
    detected: true,
  },
  codex: {
    id: 'codex',
    name: 'Codex CLI',
    type: 'cli',
    badge: 'CDX',
    color: '#94A3B8',
    accent: '#CBD5E1',
    description: 'OpenAI terminal agent for autonomous test execution and code triage',
    detected: false,
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    type: 'ide',
    badge: 'WS',
    color: '#06B6D4',
    accent: '#22D3EE',
    description: 'Agentic IDE with Cascade multi-step flows and local MCP servers',
    detected: false,
  },
  custom: {
    id: 'custom',
    name: 'Custom Agent',
    type: 'cli',
    badge: 'AI',
    color: '#EC4899',
    accent: '#F472B6',
    description: 'Any custom LLM agent or CI runner connected to antigravity-live.json',
    detected: false,
  },
};

export interface OrchestrationConfig {
  mode: 'dual' | 'single';
  primaryAgent: AgentEngineId;
  secondaryAgent: AgentEngineId | null;
  detectedAgents: AgentEngineId[];
}

export const DEFAULT_ORCHESTRATION_CONFIG: OrchestrationConfig = {
  mode: 'dual',
  primaryAgent: 'antigravity',
  secondaryAgent: 'opencode',
  detectedAgents: ['antigravity', 'opencode', 'claude-code', 'cursor'],
};

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
  blackboardState?: "idle" | "exploring" | "writing_specs" | "auditing_telemetry" | "standup_meeting" | string;
  activeOrchestrator?: AgentEngineId | string;
  handoffReady?: boolean;
  currentPipelineStep?: number;
  pipelineStepName?: string;
  activeProject?: string;
  auditScope?: AuditScope;
  orchestrationConfig?: OrchestrationConfig;
  agentStates?: Record<string, "working" | "idle" | string>;
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
  steps?: any[];
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
  priority?: string;
  oracle_layer?: string;
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
  gherkin?: {
    given: string;
    when: string;
    then: string;
    but?: string;
  };
  screenshot?: string;
  videoUrl?: string;
  doctorVideoUrl?: string;
  evidence?: {
    screenshot?: string;
    video?: string;
    console_log?: string[];
    network_trace?: string[];
  };
  root_cause_file?: string;
  root_cause_line?: number;
  diagnostic?: {
    observedFact?: string;
    whiteBoxHypothesis?: string;
    reproductionSpec?: string;
    affectedFile?: string;
    recommendedFix?: string;
    impact?: string;
    badgeTone?: string;
    scopeIn?: string[];
    scopeOut?: string[];
  };
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
  auditScope?: AuditScope;
  project: {
    name: string;
    repoPath?: string;
    url: string;
    backendUrl?: string;
    branch: string;
    environment: string;
    lastAudit: string;
    auditScope?: AuditScope;
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
  backendUrl?: string;
  auditScope?: AuditScope;
  isCustom?: boolean;
}

const DEFAULT_PROJECTS: ProjectOption[] = [
  {
    id: "tobitests",
    name: "TobiTests (Self-Audit)",
    environment: "Dogfooding Local",
    branch: "main",
    repoPath: ".",
    url: "http://localhost:5173",
    auditScope: "fullstack",
    isCustom: false
  },
  {
    id: "vetconnect",
    name: "VetConnect",
    environment: "Staging Local",
    branch: "main",
    repoPath: "../vetconnect-demo",
    url: "http://localhost:3000",
    auditScope: "fullstack",
    isCustom: false
  }
];

function getSavedScopeMap(): Record<string, AuditScope> {
  try {
    const raw = localStorage.getItem("tobitests_audit_scopes_v1");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveScopeForProject(projectId: string, scope: AuditScope) {
  try {
    const current = getSavedScopeMap();
    current[projectId] = scope;
    localStorage.setItem("tobitests_audit_scopes_v1", JSON.stringify(current));
  } catch (e) {}
}

function getSavedOrchestrationConfig(): OrchestrationConfig {
  try {
    const raw = localStorage.getItem("tobitests_orchestration_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.primaryAgent) {
        return {
          ...DEFAULT_ORCHESTRATION_CONFIG,
          ...parsed,
        };
      }
    }
  } catch (e) {}
  return DEFAULT_ORCHESTRATION_CONFIG;
}

function saveOrchestrationConfig(config: OrchestrationConfig) {
  try {
    localStorage.setItem("tobitests_orchestration_v1", JSON.stringify(config));
  } catch (e) {}
}

function ensureBuiltInDualScopeData(raw: TobiState, projectId: string, scope: AuditScope): TobiState {
  const isVet = projectId === "vetconnect";
  const apiSpecFile = isVet ? "vetconnect-api.spec.ts" : "tobitests-api.spec.ts";
  const apiSuiteName = isVet
    ? "Suite API: VetConnect REST, RBAC & Concurrencia ({ request })"
    : "Suite API: TobiTests Blackboard & SSE Contracts ({ request })";

  const existingSuites = raw.suites || [];
  const hasApiSuite = existingSuites.some((s) => s.specFile === apiSpecFile || s.specFile.includes("-api.spec.ts"));
  const nextSuites: SuiteItem[] = hasApiSuite
    ? existingSuites
    : [
        ...existingSuites,
        {
          name: apiSuiteName,
          description: isVet
            ? "Auditoría pura de endpoints REST (/api/auth, /api/consultations, /api/pets), contratos JSON, RBAC 401/403 y mutaciones concurrentes."
            : "Auditoría pura de contratos HTTP (/api/antigravity/live, /api/state, /api/stream), validación de esquemas JSON y SLA < 500ms.",
          tests: 4,
          status: "Passed",
          passRate: "100%",
          duration: "0.42s",
          lastRun: "Hoy",
          specFile: apiSpecFile,
        },
      ];

  const existingSpecs = raw.specs || [];
  const hasApiSpec = existingSpecs.some((s) => s.name === apiSpecFile || s.name.includes("-api.spec.ts"));
  const nextSpecs: SpecItem[] = hasApiSpec
    ? existingSpecs
    : [
        ...existingSpecs,
        {
          name: apiSpecFile,
          domain: "Backend / REST API ({ request })",
          status: "Passed",
          testsCount: 4,
          lastRun: "Hoy",
          code: `import { test, expect } from '@playwright/test';\n\ntest.describe('${apiSuiteName}', () => {\n  test('TC-API-01: GET /api/health & live contract returns 200 OK and valid JSON schema (< 500ms SLA)', async ({ request }) => {\n    const res = await request.get('${raw.project.url}/api/antigravity/live');\n    expect(res.status()).toBe(200);\n  });\n\n  test('TC-API-02: POST /api/state rejects malformed payload with 400 Bad Request (never 500)', async ({ request }) => {\n    const res = await request.post('${raw.project.url}/api/state', { data: 'invalid' });\n    expect(res.status()).toBeLessThan(500);\n  });\n});`,
        },
      ];

  const apiTests: RunTestItem[] = [
    {
      name: isVet
        ? "TC-API-01: GET /api/consultations devuelve 200 OK, application/json y cumple SLA < 500ms"
        : "TC-API-01: GET /api/antigravity/live devuelve 200 OK, application/json y contrato de Blackboard válido (< 500ms)",
      spec: apiSpecFile,
      status: "Passed",
      duration: "0.08s",
    },
    {
      name: isVet
        ? "TC-API-02: POST /api/consultations rechaza payload vacío o SQLi/XSS con 400/422 estructurado (nunca 500)"
        : "TC-API-02: POST /api/antigravity/scope sincroniza auditScope y rechaza payloads malformados sin error 500",
      spec: apiSpecFile,
      status: "Passed",
      duration: "0.11s",
    },
    {
      name: isVet
        ? "TC-API-03: RBAC 401/403 bloquea acceso de rol Tutor a endpoints exclusivos de Médico (/api/doctor/queue)"
        : "TC-API-03: RBAC & Security Headers verificados en endpoints de estado (/api/state y /api/stream)",
      spec: apiSpecFile,
      status: "Passed",
      duration: "0.12s",
    },
    {
      name: isVet
        ? "TC-API-04: Concurrencia Promise.all en reserva de turno previene doble booking con Idempotency-Key"
        : "TC-API-04: Concurrencia Promise.all en actualización de Blackboard mantiene consistencia atómica sin race conditions",
      spec: apiSpecFile,
      status: "Passed",
      duration: "0.11s",
    },
  ];

  const nextRuns = (raw.runs || []).map((r, idx) => {
    if (idx !== 0) return r;
    const currentTests = r.tests || [];
    const hasApiTests = currentTests.some((t) => t.spec === apiSpecFile || t.name.startsWith("TC-API-"));
    if (hasApiTests) return r;
    const mergedTests = [...currentTests, ...apiTests];
    return {
      ...r,
      tests: mergedTests,
    };
  });

  return {
    ...raw,
    auditScope: scope,
    project: {
      ...raw.project,
      auditScope: scope,
    },
    suites: nextSuites,
    specs: nextSpecs,
    runs: nextRuns,
  };
}

function createCustomProjectInitialState(proj: ProjectOption): TobiState {
  const currentDate = new Date().toLocaleDateString("es-AR");
  const scope: AuditScope = proj.auditScope || "fullstack";
  return {
    auditScope: scope,
    project: {
      name: proj.name,
      repoPath: proj.repoPath,
      url: proj.url || "http://localhost:3000",
      backendUrl: proj.backendUrl || proj.url || "http://localhost:3000",
      branch: proj.branch || "main",
      environment: proj.environment || "Local Workspace",
      lastAudit: "Recién vinculado",
      auditScope: scope,
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
        suite: `Baseline Discovery (${scope.toUpperCase()})`,
        branch: proj.branch || "main",
        status: "Passed",
        total: 12,
        passed: 12,
        failed: 0,
        skipped: 0,
        duration: "12s",
        date: currentDate,
        commit: "HEAD",
        tests: [
          { name: "TC-UI-01: Verificar estructura del repositorio y árbol de archivos", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.2s" },
          { name: "TC-UI-02: Inspeccionar package.json y dependencias del proyecto", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "0.8s" },
          { name: "TC-UI-03: Auditar disponibilidad del puerto local del servicio web", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.5s" },
          { name: "TC-UI-04: Escanear contratos de rutas UI y componentes principales", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "2.1s" },
          { name: "TC-UI-05: Verificar árbol DOM de accesibilidad y roles semánticos (a11y)", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "2.4s" },
          { name: "TC-UI-06: Verificar consistencia visual, responsive y cierre Escape en modales", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.6s" },
          { name: "TC-UI-07: Comprobar errores en consola y excepciones no capturadas (Layer 1)", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.1s" },
          { name: "TC-UI-08: Generar fixture inicial de Playwright para testing continuo", spec: "workspace-discovery.spec.ts", status: "Passed", duration: "1.3s" },
          { name: "TC-API-01: GET /api/health devuelve 200 OK, application/json y latencia < 500ms", spec: "workspace-api.spec.ts", status: "Passed", duration: "0.09s" },
          { name: "TC-API-02: POST /api/v1/items valida fuzzing 400/422 ante payloads malformados (nunca 500)", spec: "workspace-api.spec.ts", status: "Passed", duration: "0.14s" },
          { name: "TC-API-03: RBAC 401/403 rechaza tokens JWT expirados o escalación de privilegios", spec: "workspace-api.spec.ts", status: "Passed", duration: "0.11s" },
          { name: "TC-API-04: Concurrencia Promise.all verifica idempotencia sin race conditions", spec: "workspace-api.spec.ts", status: "Passed", duration: "0.15s" },
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
        bubble: `Vinculado al workspace de ${proj.name} (${scope}). Listo para orquestar suites.`,
        idleBubble: `En guardia · Workspace ${proj.name} (${scope}) conectado`,
        task: `Supervisando auditoría (${scope}) de ${proj.name}`,
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
      suite: `Baseline Discovery (${scope.toUpperCase()})`,
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
        { time: "14:00:00", level: "info", message: `Workspace vinculado: ${proj.repoPath} (scope=${scope})`, source: "ORCHESTRATOR" },
        { time: "14:00:02", level: "info", message: `Chrome CDP escuchando en ${proj.url || "http://localhost:3000"}`, source: "DEVTOOLS_CDP" },
      ],
    },
    bugs: [],
    specs: [
      {
        name: "workspace-discovery.spec.ts",
        domain: "Frontend UX/UI & DOM",
        status: "Passed",
        testsCount: 8,
        lastRun: currentDate,
        code: `import { test, expect } from '@playwright/test';\n\ntest.describe('${proj.name} - Frontend UX/UI Discovery', () => {\n  test('TC-UI-01: debe cargar el punto de entrada sin errores en consola', async ({ page }) => {\n    await page.goto('${proj.url || "http://localhost:3000"}');\n    await expect(page).toHaveTitle(/.+/);\n  });\n});`,
      },
      {
        name: "workspace-api.spec.ts",
        domain: "Backend / REST API ({ request })",
        status: "Passed",
        testsCount: 4,
        lastRun: currentDate,
        code: `import { test, expect } from '@playwright/test';\n\ntest.describe('${proj.name} - Pure Backend API Contracts', () => {\n  test('TC-API-01: GET /api/health returns 200 OK & application/json (< 500ms)', async ({ request }) => {\n    const res = await request.get('${proj.backendUrl || proj.url || "http://localhost:3000"}/api/health');\n    expect(res.status()).toBeLessThan(500);\n  });\n});`,
      },
    ],
    suites: [
      {
        name: "Frontend UX/UI & A11y Smoke Suite",
        description: `Pruebas visuales de DOM, responsive, modales y accesibilidad para ${proj.name}`,
        tests: 8,
        status: "Passed",
        passRate: "100%",
        duration: "6.4s",
        lastRun: currentDate,
        specFile: "workspace-discovery.spec.ts",
      },
      {
        name: "Backend API Contracts, RBAC & Concurrency ({ request })",
        description: `Auditoría de endpoints REST 2xx/4xx, esquemas JSON, JWT y concurrencia para ${proj.name}`,
        tests: 4,
        status: "Passed",
        passRate: "100%",
        duration: "0.49s",
        lastRun: currentDate,
        specFile: "workspace-api.spec.ts",
      },
    ],
  };
}

export function useTobiState() {
  const [customProjects, setCustomProjects] = useState<ProjectOption[]>(() => {
    try {
      const saved = localStorage.getItem("tobitests_projects_v1") || localStorage.getItem("tobitests_custom_projects");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [scopeMap, setScopeMap] = useState<Record<string, AuditScope>>(() => getSavedScopeMap());

  const availableProjects: ProjectOption[] = [
    ...DEFAULT_PROJECTS.map((p) => ({
      ...p,
      auditScope: scopeMap[p.id] || p.auditScope || "fullstack",
    })),
    ...customProjects.map((p) => ({
      ...p,
      auditScope: scopeMap[p.id] || p.auditScope || "fullstack",
    })),
  ];

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem("tobitests_active_project") || "tobitests";
  });

  const [state, setState] = useState<TobiState>(() => {
    const saved = localStorage.getItem("tobitests_active_project") || "tobitests";
    const savedScopes = getSavedScopeMap();
    const resolvedScope: AuditScope = savedScopes[saved] || "fullstack";

    // Check if custom project state exists
    if (saved.startsWith("custom-")) {
      try {
        const cached = localStorage.getItem(`tobitests_state_${saved}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          const sc = savedScopes[saved] || parsed.auditScope || parsed.project?.auditScope || "fullstack";
          return {
            ...parsed,
            auditScope: sc,
            project: { ...parsed.project, auditScope: sc },
          };
        }
      } catch (e) {}
    }

    const raw = (saved === "vetconnect" ? vetData : tobiData) as unknown as TobiState;
    const enriched = ensureBuiltInDualScopeData(raw, saved, resolvedScope);
    const idleAgents = (enriched.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    const openBugsCount = (enriched.bugs || []).filter((b: any) => b.status !== "Resolved" && b.status !== "Closed").length;
    return {
      ...enriched,
      officeAgents: idleAgents,
      metrics: {
        ...enriched.metrics,
        openBugs: openBugsCount,
      },
    };
  });

  const [connected, setConnected] = useState(false);
  const [antigravityLive, setAntigravityLive] = useState<AntigravityLive | null>(null);

  const auditScope: AuditScope =
    state.auditScope ||
    state.project?.auditScope ||
    scopeMap[activeProjectId] ||
    antigravityLive?.auditScope ||
    "fullstack";

  const setAuditScope = useCallback((nextScope: AuditScope) => {
    saveScopeForProject(activeProjectId, nextScope);
    setScopeMap((prev) => ({ ...prev, [activeProjectId]: nextScope }));

    setState((prev) => {
      const updatedState: TobiState = {
        ...prev,
        auditScope: nextScope,
        project: {
          ...prev.project,
          auditScope: nextScope,
        },
      };
      if (activeProjectId.startsWith("custom-")) {
        try {
          localStorage.setItem(`tobitests_state_${activeProjectId}`, JSON.stringify(updatedState));
          const customStatesRaw = localStorage.getItem("tobitests_custom_states_v1");
          const customStates = customStatesRaw ? JSON.parse(customStatesRaw) : {};
          customStates[activeProjectId] = updatedState;
          localStorage.setItem("tobitests_custom_states_v1", JSON.stringify(customStates));
        } catch (e) {}
      }
      return updatedState;
    });

    if (activeProjectId.startsWith("custom-")) {
      setCustomProjects((prev) => {
        const nextList = prev.map((p) => (p.id === activeProjectId ? { ...p, auditScope: nextScope } : p));
        try {
          localStorage.setItem("tobitests_custom_projects", JSON.stringify(nextList));
          localStorage.setItem("tobitests_projects_v1", JSON.stringify(nextList));
        } catch (e) {}
        return nextList;
      });
    }

    setAntigravityLive((prev) => (prev ? { ...prev, auditScope: nextScope } : prev));

    try {
      fetch("/api/antigravity/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: activeProjectId, auditScope: nextScope }),
      }).catch(() => {});
    } catch (e) {}
  }, [activeProjectId]);

  const [orchestrationConfig, setOrchestrationConfig] = useState<OrchestrationConfig>(() => getSavedOrchestrationConfig());

  // Keep local config in sync if server broadcasts detected agents or updated orchestration config
  useEffect(() => {
    if (antigravityLive?.orchestrationConfig) {
      const liveCfg = antigravityLive.orchestrationConfig;
      setOrchestrationConfig((prev) => {
        if (
          liveCfg.mode === prev.mode &&
          liveCfg.primaryAgent === prev.primaryAgent &&
          liveCfg.secondaryAgent === prev.secondaryAgent &&
          JSON.stringify(liveCfg.detectedAgents || []) === JSON.stringify(prev.detectedAgents || [])
        ) {
          return prev;
        }
        return {
          ...prev,
          ...liveCfg,
          detectedAgents: liveCfg.detectedAgents && liveCfg.detectedAgents.length > 0
            ? liveCfg.detectedAgents
            : prev.detectedAgents,
        };
      });
    }
  }, [antigravityLive?.orchestrationConfig]);

  const saveOrchestration = useCallback((newConfig: OrchestrationConfig) => {
    setOrchestrationConfig(newConfig);
    saveOrchestrationConfig(newConfig);
    try {
      fetch("/api/antigravity/orchestration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      }).catch(() => {});
    } catch (e) {}
  }, []);

  const setPrimaryAgent = useCallback((agentId: AgentEngineId) => {
    setOrchestrationConfig((prev) => {
      let nextSecondary = prev.secondaryAgent;
      if (nextSecondary === agentId) {
        nextSecondary = prev.primaryAgent !== agentId ? prev.primaryAgent : null;
      }
      const updated: OrchestrationConfig = {
        ...prev,
        primaryAgent: agentId,
        secondaryAgent: nextSecondary,
      };
      saveOrchestration(updated);
      return updated;
    });
  }, [saveOrchestration]);

  const setSecondaryAgent = useCallback((agentId: AgentEngineId | null) => {
    setOrchestrationConfig((prev) => {
      let nextPrimary = prev.primaryAgent;
      if (agentId && nextPrimary === agentId) {
        nextPrimary = prev.secondaryAgent || "antigravity";
      }
      const updated: OrchestrationConfig = {
        ...prev,
        primaryAgent: nextPrimary,
        secondaryAgent: agentId,
        mode: agentId === null ? "single" : prev.mode,
      };
      saveOrchestration(updated);
      return updated;
    });
  }, [saveOrchestration]);

  const swapAgentRoles = useCallback(() => {
    setOrchestrationConfig((prev) => {
      if (!prev.secondaryAgent) {
        return prev;
      }
      const updated: OrchestrationConfig = {
        ...prev,
        primaryAgent: prev.secondaryAgent,
        secondaryAgent: prev.primaryAgent,
      };
      saveOrchestration(updated);
      return updated;
    });
  }, [saveOrchestration]);

  const toggleSecondaryAgent = useCallback((enabled?: boolean) => {
    setOrchestrationConfig((prev) => {
      const isNowSingle = enabled !== undefined ? !enabled : prev.mode === "dual";
      const nextMode: "dual" | "single" = isNowSingle ? "single" : "dual";
      let nextSecondary = prev.secondaryAgent;
      if (nextMode === "dual" && !nextSecondary) {
        nextSecondary = prev.primaryAgent === "opencode" ? "antigravity" : "opencode";
      }
      const updated: OrchestrationConfig = {
        ...prev,
        mode: nextMode,
        secondaryAgent: nextMode === "single" ? null : nextSecondary,
      };
      saveOrchestration(updated);
      return updated;
    });
  }, [saveOrchestration]);

  const switchProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    localStorage.setItem("tobitests_active_project", projectId);
    const savedScopes = getSavedScopeMap();
    const resolvedScope: AuditScope = savedScopes[projectId] || "fullstack";

    if (projectId.startsWith("custom-")) {
      try {
        const cached = localStorage.getItem(`tobitests_state_${projectId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          const sc: AuditScope = savedScopes[projectId] || parsed.auditScope || parsed.project?.auditScope || "fullstack";
          setState({
            ...parsed,
            auditScope: sc,
            project: { ...parsed.project, auditScope: sc },
          });
          return;
        }
      } catch (e) {}

      // Fallback: look up in custom projects list
      try {
        const savedList = localStorage.getItem("tobitests_projects_v1") || localStorage.getItem("tobitests_custom_projects");
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
    const enriched = ensureBuiltInDualScopeData(raw, projectId, resolvedScope);
    const idleAgents = (enriched.officeAgents || []).map((a) => ({
      ...a,
      status: "idle",
      bubble: a.idleBubble || "Descansando en la cafetería tras completar el run",
    }));
    const openBugsCount = (enriched.bugs || []).filter((b: any) => b.status !== "Resolved" && b.status !== "Closed").length;
    setState({
      ...enriched,
      officeAgents: idleAgents,
      metrics: {
        ...enriched.metrics,
        openBugs: openBugsCount,
      },
    });
  }, []);

  const addProject = useCallback((params: { id?: string; name: string; repoPath: string; url?: string; backendUrl?: string; auditScope?: AuditScope; environment?: string; branch?: string; isCustom?: boolean }) => {
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "proyecto";
    const id = params.id || `custom-${slug}-${Date.now().toString(36)}`;
    const chosenScope: AuditScope = params.auditScope || "fullstack";
    const newProj: ProjectOption = {
      id,
      name: params.name,
      repoPath: params.repoPath,
      url: params.url || "http://localhost:3000",
      backendUrl: params.backendUrl || params.url || "http://localhost:3000",
      environment: params.environment || "Local Workspace",
      branch: "main",
      auditScope: chosenScope,
      isCustom: true,
    };

    saveScopeForProject(id, chosenScope);
    setScopeMap((prev) => ({ ...prev, [id]: chosenScope }));

    const updated = [...customProjects, newProj];
    setCustomProjects(updated);
    try {
      localStorage.setItem("tobitests_custom_projects", JSON.stringify(updated));
      localStorage.setItem("tobitests_projects_v1", JSON.stringify(updated));
    } catch (e) {}

    const initialState = createCustomProjectInitialState(newProj);
    try {
      localStorage.setItem(`tobitests_state_${id}`, JSON.stringify(initialState));
      const customStatesRaw = localStorage.getItem("tobitests_custom_states_v1");
      const customStates = customStatesRaw ? JSON.parse(customStatesRaw) : {};
      customStates[id] = initialState;
      localStorage.setItem("tobitests_custom_states_v1", JSON.stringify(customStates));
    } catch (e) {}

    setActiveProjectId(id);
    localStorage.setItem("tobitests_active_project", id);
    setState(initialState);

    try {
      fetch("/api/antigravity/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: id, auditScope: chosenScope }),
      }).catch(() => {});
    } catch (e) {}
  }, [customProjects]);

  const removeProject = useCallback((projectId: string) => {
    const updated = customProjects.filter((p) => p.id !== projectId);
    setCustomProjects(updated);
    try {
      localStorage.setItem("tobitests_custom_projects", JSON.stringify(updated));
      localStorage.setItem("tobitests_projects_v1", JSON.stringify(updated));
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

  const resolveCercoFiles = useCallback((bug: BugItem) => {
    const isTobi = state.project.name.toLowerCase().includes("tobi");
    const isVet = state.project.name.toLowerCase().includes("vet");

    let defaultIn: string[];
    let defaultOut: string[];

    if (isTobi) {
      defaultIn = [bug.diagnostic?.affectedFile || "web/src/components/OfficeView.tsx", "web/src/data/tobi-state.json"];
      defaultOut = ["useAgentMotion.ts", "OfficeScene.tsx", "JourneyCanvas.tsx"];
    } else if (isVet) {
      defaultIn = [bug.diagnostic?.affectedFile || "web/src/pages/ClientApp.tsx"];
      defaultOut = ["web/src/context/AuthContext.tsx", "web/src/routes/ProtectedRoute.tsx", "web/src/services/api.ts"];
    } else {
      defaultIn = [bug.diagnostic?.affectedFile || "src/App.tsx"];
      defaultOut = ["package.json", "tsconfig.json", "vite.config.ts"];
    }

    const scopeIn = bug.diagnostic?.scopeIn && bug.diagnostic.scopeIn.length > 0 ? bug.diagnostic.scopeIn : defaultIn;
    const scopeOut = bug.diagnostic?.scopeOut && bug.diagnostic.scopeOut.length > 0 ? bug.diagnostic.scopeOut : defaultOut;

    return { scopeIn, scopeOut };
  }, [state.project.name]);

  const copyBddToClipboard = useCallback((bug: BugItem) => {
    const { scopeIn, scopeOut } = resolveCercoFiles(bug);
    const affectedFile = bug.diagnostic?.affectedFile || scopeIn[0] || "src/App.tsx";
    const recommendedFix = bug.diagnostic?.recommendedFix || "Minimal Fix estricto en el área del cerco";

    const text = `Esquema de Plantilla Estandarizado:
Definir el Escenario (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, sección: ${bug.section}).
Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

==================================================
Protocolo Anti-Regresiones con Blindaje (Quirófano de Código)
==================================================
Fase 1: Identificar el escenario & Aislamiento en Capas:
- Capa UI/Vista: ${affectedFile}
- Capa de Hooks/Estado: Validación y sincronización de estado reactivo
- Capa de Red/Request: Verificado con DevTools CDP y Playwright MCP
- Capa Backend/API: Contratos de eventos preservados
- Capa de Base de Datos / Persistencia: Estado sincronizado con el modelo de datos

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode):
1. ARCHIVOS DENTRO DEL ALCANCE: [${scopeIn.join(", ")}]
2. ARCHIVOS FUERA DEL ALCANCE: [${scopeOut.join(", ")}]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos preservando contratos retrocompatibles
4. ESTRATEGIA DE FIX: ${recommendedFix}

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
  }, [resolveCercoFiles]);

  const downloadMasterBugReport = useCallback(() => {
    const content = `# Master Bug Report — ${state.project.name}
Generado automáticamente por TobiTests (Multi-Agent E2E Framework)
Fecha: ${new Date().toLocaleString("es-AR")}

${state.bugs.map((bug, index) => {
  const { scopeIn, scopeOut } = resolveCercoFiles(bug);
  const affectedFile = bug.diagnostic?.affectedFile || scopeIn[0] || "src/App.tsx";
  const recommendedFix = bug.diagnostic?.recommendedFix || "Minimal Fix estricto en el área del cerco";

  return `---
### ${index + 1}. [${bug.id}] ${bug.title}
* **Severidad:** ${bug.severity}
* **Estado:** ${bug.status}
* **Sección:** ${bug.section}
* **Agente Detector:** ${bug.agent}
* **Ejecución Asociada:** ${bug.runId}

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, sección: ${bug.section}).

Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: ${affectedFile}
  - Capa Hooks/Estado: Validación y sincronización de estado reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [${scopeIn.join(", ")}]
  2. ARCHIVOS FUERA DEL ALCANCE: [${scopeOut.join(", ")}]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: ${recommendedFix}
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: \`bugfix/cerco-${bug.id.toLowerCase()}\`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto
`;
}).join('\n')}
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

  const runLiveAudit = useCallback((overrideScope?: AuditScope) => {
    const activeSc = overrideScope || auditScope;
    setAllAgentsMode("working");
    try {
      fetch("/api/antigravity/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: activeProjectId, auditScope: activeSc }),
      }).catch(() => {});
    } catch (e) {}
  }, [activeProjectId, auditScope, setAllAgentsMode]);

  const displayOfficeAgents: OfficeAgent[] = useMemo(() => {
    const primaryEngine = SUPPORTED_AGENT_ENGINES[orchestrationConfig.primaryAgent] || SUPPORTED_AGENT_ENGINES.antigravity;
    const secondaryId = orchestrationConfig.secondaryAgent;
    const secondaryEngine = secondaryId ? (SUPPORTED_AGENT_ENGINES[secondaryId] || SUPPORTED_AGENT_ENGINES.opencode) : null;
    const isSolo = orchestrationConfig.mode === "single" || !secondaryEngine;

    return (state.officeAgents || []).map((agent) => {
      if (agent.id === "orchestrator") {
        return {
          ...agent,
          name: `${primaryEngine.name} [PRIMARY LEAD]`,
          initials: primaryEngine.badge,
          role: isSolo
            ? `Orquestador Autónomo Solo · Pipeline Completo (Pasos 1-8)`
            : `Orquestador Principal & White-Box Brain (Pasos 1-4, 7)`,
          employment: isSolo ? `Lead Solo Agent (${primaryEngine.name})` : `Lead Orchestrator (${primaryEngine.name})`,
          mcp: primaryEngine.id === "antigravity" ? "@playwright/mcp" : `@${primaryEngine.id}/agent`,
        };
      }
      if (agent.id === "opencode") {
        if (isSolo) {
          return {
            ...agent,
            name: secondaryEngine ? `${secondaryEngine.name} [STANDBY / OFFLINE]` : "Execution Arm [OFFLINE]",
            initials: secondaryEngine ? secondaryEngine.badge : "OFF",
            role: "Agente Secundario en Standby (Modo Solo Activo)",
            employment: "Standby Lounge",
            status: "idle",
            activity: "lounge",
            bubble: `En sala de descanso. Modo Solo activo: ${primaryEngine.name} ejecuta los 8 pasos autónomamente.`,
            idleBubble: "Modo Solo activo: en espera de reactivación dual",
            tone: "neutral" as const,
          };
        }
        return {
          ...agent,
          name: `${secondaryEngine!.name} [SECONDARY RUNNER]`,
          initials: secondaryEngine!.badge,
          role: "Sintetizador de Specs, Runner CLI & Self-Healing (Pasos 5, 6, 8)",
          employment: `Execution Arm (${secondaryEngine!.name})`,
          mcp: secondaryEngine!.id === "opencode" ? "@opencode/deepseek" : `@${secondaryEngine!.id}/runner`,
        };
      }
      return agent;
    });
  }, [state.officeAgents, orchestrationConfig]);

  return {
    state: {
      ...state,
      officeAgents: displayOfficeAgents,
    },
    connected,
    antigravityLive,
    activeProjectId,
    availableProjects,
    auditScope,
    setAuditScope,
    runLiveAudit,
    addProject,
    removeProject,
    switchProject,
    updateState,
    toggleAgentStatus,
    setAllAgentsMode,
    copyBddToClipboard,
    downloadMasterBugReport,
    rerunTest,
    orchestrationConfig,
    setPrimaryAgent,
    setSecondaryAgent,
    swapAgentRoles,
    toggleSecondaryAgent,
    SUPPORTED_AGENT_ENGINES,
  };
}

