import { useState, useEffect, type ReactNode } from "react";
import type { useTobiState, OfficeAgent } from "../hooks/useTobiState";
import { AgentFigure } from "./OfficeCharacters";

interface OfficeViewProps {
  navigate: (view: any) => void;
  tobi: ReturnType<typeof useTobiState>;
  Badge: (props: { children: ReactNode; tone?: any }) => JSX.Element;
  Button: (props: any) => JSX.Element;
  Icon: (props: { name: any; size?: any }) => JSX.Element;
  PageHeading: (props: { title: string; subtitle: string; children?: ReactNode }) => JSX.Element;
}

interface LogEntry {
  id: string;
  time: string;
  source: "ORCHESTRATOR" | "PLAYWRIGHT" | "DEVTOOLS_CDP" | "EXPLORER" | "SECURITY" | "SPEC";
  message: string;
  level: "info" | "success" | "warn" | "accent";
}

export function OfficeView({
  navigate,
  tobi,
  Badge,
  Button,
  Icon,
  PageHeading,
}: OfficeViewProps) {
  const agents = tobi.state.officeAgents;
  const [selectedId, setSelectedId] = useState<string>("orchestrator");
  const [workBeat, setWorkBeat] = useState(0);
  const [activeScreenModal, setActiveScreenModal] = useState<{
    title: string;
    img: string;
    agentName: string;
    details: string;
    viewport: string;
    associatedSpec: string;
  } | null>(null);

  const [terminalFilter, setTerminalFilter] = useState<"all" | "mcp" | "subagent" | "warn">("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "l-1",
      time: "21:50:01",
      source: "ORCHESTRATOR",
      message: "Antigravity Orchestrator conectado al workspace local (C:/Users/usuario/Documents/VetConnect)",
      level: "accent",
    },
    {
      id: "l-2",
      time: "21:50:03",
      source: "PLAYWRIGHT",
      message: "@playwright/mcp: Proceso Chromium inicializado en puerto CDP 5173",
      level: "info",
    },
    {
      id: "l-3",
      time: "21:50:05",
      source: "DEVTOOLS_CDP",
      message: "chrome-devtools-mcp: Escuchando eventos Network y Console",
      level: "info",
    },
    {
      id: "l-4",
      time: "21:50:08",
      source: "EXPLORER",
      message: "Explorer QA ejecutó page.goto('http://localhost:5173/login') [200 OK - 840ms]",
      level: "success",
    },
    {
      id: "l-5",
      time: "21:50:11",
      source: "SECURITY",
      message: "RBAC Hunter: Comprobada redirección no autorizada en /client/dashboard -> /login",
      level: "info",
    },
    {
      id: "l-6",
      time: "21:50:14",
      source: "DEVTOOLS_CDP",
      message: "Alerta de estado: Divergencia entre Mensajes y Mascotas registrada (BUG-01)",
      level: "warn",
    },
  ]);

  // Subtle natural office beat: agents move slightly, screens flicker gently
  useEffect(() => {
    const timer = window.setInterval(() => {
      setWorkBeat((b) => (b + 1) % 4);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedId) || agents[0];
  const workingAgents = agents.filter((a) => a.status === "working");
  const idleAgents = agents.filter((a) => a.status !== "working");

  // Helper to append real logs
  const appendLog = (source: LogEntry["source"], message: string, level: LogEntry["level"] = "info") => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogs((prev) => [
      ...prev.slice(-35),
      { id: `log-${Date.now()}-${Math.random()}`, time, source, message, level },
    ]);
  };

  // Dispatch a signature live task for a specific agent
  const dispatchAgentTask = (agent: OfficeAgent) => {
    if (agent.status !== "working") {
      tobi.toggleAgentStatus(agent.id);
    }

    switch (agent.id) {
      case "orchestrator":
        appendLog("ORCHESTRATOR", "Antigravity inició auditoría White-Box de rutas en App.tsx", "accent");
        break;
      case "explorer":
        appendLog("EXPLORER", "Explorer QA: page.fill('input[type=email]', 'vet@vetconnect.com')", "success");
        break;
      case "telemetry":
        appendLog("DEVTOOLS_CDP", "Telemetry Auditor: Capturando traza de red en /api/v1/auth/session", "info");
        break;
      case "security":
        appendLog("SECURITY", "RBAC Hunter: Evaluando matriz de roles CLIENT vs VET vs ADMIN", "warn");
        break;
      case "writer":
        appendLog("SPEC", "Spec Writer: Compilando vetconnect-auth.spec.ts con 4 tests Playwright", "success");
        break;
    }
  };

  // Run a choreographed end-to-end multi-agent test sequence in the office
  const runFullOfficeSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    tobi.setAllAgentsMode("working");

    appendLog("ORCHESTRATOR", "▶ SIMULACIÓN MULTI-AGENTE INICIADA: Coordinando 4 subagentes sobre VetConnect", "accent");

    setTimeout(() => {
      setSimulationStep(2);
      setSelectedId("explorer");
      appendLog("EXPLORER", "Paso 1: Explorer QA navegó a http://localhost:5173/ y auditó el DOM inicial", "success");
    }, 1800);

    setTimeout(() => {
      setSimulationStep(3);
      setSelectedId("telemetry");
      appendLog("DEVTOOLS_CDP", "Paso 2: Telemetry Auditor inspeccionó peticiones de red y consola de VetConnect", "info");
    }, 3600);

    setTimeout(() => {
      setSimulationStep(4);
      setSelectedId("security");
      appendLog("SECURITY", "Paso 3: RBAC Hunter validó que rutas protegidas /client/* y /vet/* redirijan a /login", "warn");
    }, 5400);

    setTimeout(() => {
      setSimulationStep(5);
      setSelectedId("writer");
      appendLog("SPEC", "Paso 4: Spec Writer generó vetconnect-auth.spec.ts y vetconnect-appointments.spec.ts", "success");
    }, 7200);

    setTimeout(() => {
      setSimulationStep(0);
      setIsSimulating(false);
      setSelectedId("orchestrator");
      appendLog("ORCHESTRATOR", "✓ SIMULACIÓN COMPLETADA: 5 pruebas aprobadas, 1 bug documentado en formato BDD", "accent");
    }, 9000);
  };

  // Compute visual coordinates in the Floor Plan
  const getAgentFloorPosition = (agent: OfficeAgent) => {
    const isWorking = agent.status === "working";
    switch (agent.id) {
      case "orchestrator":
        // Chief Architect
        if (!isWorking) {
          return { left: "44%", top: "43%", zone: "Escritorio Central (Descansando)" };
        }
        return workBeat % 2 === 1
          ? { left: "37%", top: "33%", zone: "Pizarra de Arquitectura (Coordinando)" }
          : { left: "44%", top: "41%", zone: "Mesa de Comando Central (Orquestando)" };

      case "explorer":
        // Explorer QA
        if (!isWorking) {
          // Resting either at desk or in break room
          return workBeat === 3
            ? { left: "15%", top: "86%", zone: "Cafetería & Lounge (Tomando café ☕)" }
            : { left: "16%", top: "33%", zone: "Escritorio QA (Descansando)" };
        }
        return workBeat % 2 === 1
          ? { left: "19%", top: "31%", zone: "Terminal Playwright (Probando /login)" }
          : { left: "28%", top: "38%", zone: "Revisando reporte con Orquestador" };

      case "telemetry":
        // Telemetry Auditor
        if (!isWorking) {
          return workBeat === 2
            ? { left: "21%", top: "86%", zone: "Cafetería & Lounge (Charlando ☕)" }
            : { left: "76%", top: "33%", zone: "Escritorio Telemetría (Descansando)" };
        }
        return workBeat % 2 === 1
          ? { left: "82%", top: "20%", zone: "Rack de Servidores CDP (Inspeccionando red)" }
          : { left: "74%", top: "31%", zone: "Consola DevTools (Auditando consola)" };

      case "writer":
        // Spec Writer
        if (!isWorking) {
          return { left: "75%", top: "67%", zone: "Estudio de Specs (En su escritorio)" };
        }
        return workBeat % 2 === 1
          ? { left: "55%", top: "52%", zone: "Entregando spec al Orquestador" }
          : { left: "73%", top: "65%", zone: "Estudio Playwright (Escribiendo .spec.ts)" };

      case "security":
      default:
        // RBAC Security Hunter
        if (!isWorking) {
          return { left: "27%", top: "86%", zone: "Cafetería & Sillón Lounge (Descansando ☕)" };
        }
        return workBeat % 2 === 1
          ? { left: "28%", top: "24%", zone: "Pizarra de Seguridad (Verificando roles)" }
          : { left: "18%", top: "65%", zone: "Estación RBAC (Auditando CLIENT/VET/ADMIN)" };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (terminalFilter === "mcp") return log.source === "PLAYWRIGHT" || log.source === "DEVTOOLS_CDP";
    if (terminalFilter === "subagent") return log.source === "EXPLORER" || log.source === "SECURITY" || log.source === "SPEC";
    if (terminalFilter === "warn") return log.level === "warn";
    return true;
  });

  return (
    <>
      <PageHeading
        title="La Oficina de TobiTests — Multi-Agent Engineering Studio"
        subtitle="Centro de operaciones de alta fidelidad: observá al Agente Central (Antigravity) y a tus subagentes trabajando sobre VetConnect con monitores en vivo, telemetría CDP, racks de servidores y sala de descanso."
      >
        <Button
          variant="secondary"
          onClick={() => {
            tobi.setAllAgentsMode("idle");
            appendLog("ORCHESTRATOR", "Se enviaron todos los agentes a descansar a sus puestos y cafetería", "info");
          }}
        >
          ☕ Mandar todos a descansar
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            tobi.setAllAgentsMode("working");
            appendLog("ORCHESTRATOR", "Se activaron todos los subagentes para pruebas continuas", "accent");
          }}
        >
          ⚡ Poner a todos a laburar
        </Button>
        <Button onClick={runFullOfficeSimulation} disabled={isSimulating}>
          <Icon name="spark" size="sm" /> {isSimulating ? `Ejecutando Paso ${simulationStep}/4...` : "Simular Flujo E2E Completo"}
        </Button>
      </PageHeading>

      <div className="real-office-shell panel">
        {/* Top Control Bar */}
        <div className="real-office-topbar">
          <div className="office-brand-pill">
            <span className="project-avatar">V</span>
            <div>
              <small>REPOSITORIO VINCULADO EN VIVO</small>
              <strong>{tobi.state.project.name} · {tobi.state.project.repoPath}</strong>
            </div>
            <Badge tone="success">
              <span className="connection-dot" /> Dual-MCP Conectado
            </Badge>
          </div>

          <div className="office-counters">
            <span className="counter-pill working">
              <i /> <strong>{workingAgents.length}</strong> agentes trabajando
            </span>
            <span className="counter-pill resting">
              <i /> <strong>{idleAgents.length}</strong> descansando en la oficina
            </span>
          </div>

          <div className="office-quick-hint">
            <small>SISTEMA INTERACTIVO</small>
            <strong>Hacé clic en cualquier personaje o pantalla para inspeccionar</strong>
          </div>
        </div>

        {/* Main Office Layout */}
        <div className="real-office-body">
          {/* 2.5D / Isometric Architectural Studio Floorplan */}
          <div className="office-floorplan modern-studio">
            {/* Ambient Lighting & Data Conduits */}
            <div className="floor-conduit conduit-central" />
            <div className="floor-conduit conduit-server" />

            {/* Architectural Whiteboard (Top-Center) */}
            <div className="floor-zone zone-whiteboard modern-wb">
              <div className="zone-header">
                <Icon name="layers" size="sm" />
                <span>MAPA DE ARQUITECTURA & RUTAS · VETCONNECT</span>
              </div>
              <div className="whiteboard-surface">
                <div className="wb-row">
                  <code>GET /login</code>
                  <span className="wb-arrow">→</span>
                  <code>POST /api/v1/auth</code>
                  <Badge tone="success">200 OK</Badge>
                </div>
                <div className="wb-row">
                  <code>GUARD /client/*</code>
                  <span className="wb-arrow">→</span>
                  <span className="wb-tag">Requiere Token JWT</span>
                </div>
                <div className="wb-row alert">
                  <span className="wb-alert-badge">BUG-01</span>
                  <code>/mensajes cancel ≠ /mascotas tus-consultas</code>
                </div>
              </div>
            </div>

            {/* High-Density MCP Server Rack (Top-Right) */}
            <div className="floor-zone zone-server modern-rack">
              <div className="zone-header">
                <Icon name="terminal" size="sm" />
                <span>RACK DE SERVIDORES DUAL-MCP</span>
                <span className="rack-online-chip">ONLINE</span>
              </div>
              <div className="server-blades-grid">
                <div className="rack-blade">
                  <span className="led green" />
                  <code>@playwright/mcp</code>
                  <small>STDIO · READY</small>
                </div>
                <div className="rack-blade">
                  <span className="led pulse" />
                  <code>chrome-devtools-mcp</code>
                  <small>CDP:5173</small>
                </div>
                <div className="rack-blade">
                  <span className="led green" />
                  <code>white-box-ast-bus</code>
                  <small>PARSER OK</small>
                </div>
                <div className="rack-blade">
                  <span className="led amber" />
                  <code>telemetry-sink</code>
                  <small>24 KB/s</small>
                </div>
              </div>
            </div>

            {/* Workstation 1: Explorer QA (Top-Left) */}
            <div
              className={`workstation-pod pod-explorer modern-pod ${
                agents.find((a) => a.id === "explorer")?.status === "working" ? "active" : "idle"
              } ${selectedId === "explorer" ? "selected" : ""}`}
              onClick={() => setSelectedId("explorer")}
            >
              <div className="pod-plate">
                <span>ESTACIÓN 01 · @playwright/mcp</span>
                <strong>EXPLORER QA LAB</strong>
              </div>
              <div className="desk-furniture-real">
                <div
                  className="pod-monitor-frame interactive-screen"
                  title="Hacé clic para ampliar captura de pantalla"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScreenModal({
                      title: "Explorer QA — Formulario de Login de VetConnect",
                      img: "/evidence/runs/02-login-inspection.png",
                      agentName: "Explorer QA",
                      details: "Inspección de árbol de accesibilidad en /login. Validación de campos email y contraseña.",
                      viewport: "1280x800 · Chromium Headless",
                      associatedSpec: "specs/vetconnect-auth.spec.ts",
                    });
                  }}
                >
                  <img src="/evidence/runs/02-login-inspection.png" alt="Explorer Screen" className="pod-screen-img" />
                  <div className="screen-zoom-hint">
                    <Icon name="eye" size="sm" /> Ampliar
                  </div>
                  <span className="pod-screen-badge">VIEWPORT: 1280x800</span>
                </div>
                <div className="pod-subterminal">
                  <code>page.goto('/login') → fill(email)</code>
                </div>
                <div className="desk-chair ergonomic" />
              </div>
            </div>

            {/* Workstation 2: Telemetry Auditor (Top-Right) */}
            <div
              className={`workstation-pod pod-telemetry modern-pod ${
                agents.find((a) => a.id === "telemetry")?.status === "working" ? "active" : "idle"
              } ${selectedId === "telemetry" ? "selected" : ""}`}
              onClick={() => setSelectedId("telemetry")}
            >
              <div className="pod-plate">
                <span>ESTACIÓN 02 · DEVTOOLS CDP</span>
                <strong>TELEMETRY AUDITOR LAB</strong>
              </div>
              <div className="desk-furniture-real">
                <div
                  className="pod-monitor-frame alert-glow interactive-screen"
                  title="Hacé clic para ampliar captura de pantalla"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScreenModal({
                      title: "Telemetry Auditor — Traza de Divergencia (BUG-01)",
                      img: "/evidence/bugs/bug-01-divergence-evidence.png",
                      agentName: "Telemetry Auditor",
                      details: "Captura de desincronización de estado tras cancelar consulta entre Mensajes y Mascotas.",
                      viewport: "1280x800 · Chrome CDP Network Log",
                      associatedSpec: "specs/vetconnect-appointments.spec.ts",
                    });
                  }}
                >
                  <img src="/evidence/bugs/bug-01-divergence-evidence.png" alt="Telemetry Screen" className="pod-screen-img" />
                  <div className="screen-zoom-hint">
                    <Icon name="eye" size="sm" /> Ampliar
                  </div>
                  <span className="pod-screen-badge alert">CDP TRACE · BUG-01</span>
                </div>
                <div className="pod-subterminal">
                  <code>Console: State desync warning detected</code>
                </div>
                <div className="desk-chair ergonomic" />
              </div>
            </div>

            {/* Central Command Desk: Antigravity Chief Architect */}
            <div
              className={`workstation-pod pod-central modern-pod ${
                agents.find((a) => a.id === "orchestrator")?.status === "working" ? "active" : "idle"
              } ${selectedId === "orchestrator" ? "selected" : ""}`}
              onClick={() => setSelectedId("orchestrator")}
            >
              <div className="pod-plate central">
                <span>COMANDO CENTRAL · CEREBRO GEMINI 3.8</span>
                <strong>ANTIGRAVITY CHIEF ARCHITECT</strong>
              </div>
              <div className="desk-furniture-real central-furniture">
                <div className="pod-monitor-triple">
                  <div
                    className="pod-monitor-frame side interactive-screen"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveScreenModal({
                        title: "Antigravity — Auditoría de Landing Page",
                        img: "/evidence/runs/01-landing-audit.png",
                        agentName: "Antigravity Orchestrator",
                        details: "Inspección inicial de la portada y verificación de consola limpia en http://localhost:5173/.",
                        viewport: "1280x800 · Playwright Engine",
                        associatedSpec: "specs/vetconnect-auth.spec.ts",
                      });
                    }}
                  >
                    <img src="/evidence/runs/01-landing-audit.png" alt="Landing" className="pod-screen-img" />
                    <span className="pod-screen-badge">LANDING</span>
                  </div>
                  <div
                    className="pod-monitor-frame main interactive-screen"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveScreenModal({
                        title: "Antigravity — Comprobación de Guardias de Rutas",
                        img: "/evidence/runs/03-rbac-guard-redirect.png",
                        agentName: "Antigravity Orchestrator",
                        details: "Redirección automática de /client/dashboard a /login cuando no existe sesión activa.",
                        viewport: "1280x800 · Auth Guard Check",
                        associatedSpec: "specs/vetconnect-auth.spec.ts",
                      });
                    }}
                  >
                    <img src="/evidence/runs/03-rbac-guard-redirect.png" alt="Guard Check" className="pod-screen-img" />
                    <span className="pod-screen-badge orchestrator">ORQUESTANDO 4 SUBAGENTES</span>
                  </div>
                  <div className="pod-monitor-frame side">
                    <div className="pod-code-terminal">
                      <code>{`// White-Box\nroutes: 7\nspecs: 2\nmcp: dual-bus\naudit: live`}</code>
                    </div>
                    <span className="pod-screen-badge">WHITE-BOX</span>
                  </div>
                </div>
                <div className="desk-chair executive" />
              </div>
            </div>

            {/* Workstation 4: Spec Writer (Bottom-Right) */}
            <div
              className={`workstation-pod pod-writer modern-pod ${
                agents.find((a) => a.id === "writer")?.status === "working" ? "active" : "idle"
              } ${selectedId === "writer" ? "selected" : ""}`}
              onClick={() => setSelectedId("writer")}
            >
              <div className="pod-plate">
                <span>ESTACIÓN 03 · TEST SPEC RUNNER</span>
                <strong>SPEC WRITER STUDIO (.SPEC.TS)</strong>
              </div>
              <div className="desk-furniture-real">
                <div className="pod-code-screen">
                  <div className="code-screen-header">
                    <span />
                    <span />
                    <span />
                    <small>vetconnect-auth.spec.ts</small>
                  </div>
                  <code>{`test('redirects unauthenticated', async () => {\n  await page.goto('/client/dashboard');\n  await expect(page).toHaveURL(/\\/login/);\n});`}</code>
                </div>
                <div className="pod-subterminal">
                  <code>specs/vetconnect-auth.spec.ts: 4 tests OK</code>
                </div>
                <div className="desk-chair ergonomic" />
              </div>
            </div>

            {/* Workstation 5: RBAC Security Hunter & Coffee Break Lounge (Bottom-Left) */}
            <div
              className={`workstation-pod pod-security modern-pod ${
                agents.find((a) => a.id === "security")?.status === "working" ? "active" : "idle"
              } ${selectedId === "security" ? "selected" : ""}`}
              onClick={() => setSelectedId("security")}
            >
              <div className="pod-plate">
                <span>ESTACIÓN 04 · SEGURIDAD Y ROLES</span>
                <strong>RBAC & EDGE HUNTER</strong>
              </div>
              <div className="desk-furniture-real">
                <div
                  className="pod-monitor-frame interactive-screen"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScreenModal({
                      title: "RBAC Hunter — Redirección Forzada por Rol",
                      img: "/evidence/runs/03-rbac-guard-redirect.png",
                      agentName: "RBAC Security Hunter",
                      details: "Auditoría de protección de endpoints. Acceso a /vet/dashboard bloqueado sin credenciales.",
                      viewport: "1280x800 · Security Probe",
                      associatedSpec: "specs/vetconnect-auth.spec.ts",
                    });
                  }}
                >
                  <img src="/evidence/runs/03-rbac-guard-redirect.png" alt="RBAC Screen" className="pod-screen-img" />
                  <span className="pod-screen-badge">ROLES: CLIENT/VET/ADMIN</span>
                </div>
                <div className="pod-subterminal">
                  <code>403 Forbidden interceptado correctamente</code>
                </div>
                <div className="desk-chair ergonomic" />
              </div>
            </div>

            {/* Zone 6: Break Room & Cafetería ("The Coffee Corner") */}
            <div className="floor-zone zone-lounge">
              <div className="lounge-header">
                <span className="coffee-icon">☕</span>
                <div>
                  <strong>CAFETERÍA & SALA DE DESCANSO</strong>
                  <small>Área de relax cuando los agentes no están en tarea</small>
                </div>
              </div>
              <div className="lounge-furniture">
                <div className="espresso-machine" title="Cafetera Espresso Profesional con vapor activo">
                  <span className="steam steam-1">♨</span>
                  <span className="steam steam-2">♨</span>
                  <div className="machine-body">ESPRESSO</div>
                </div>
                <div className="lounge-sofa" title="Sillón de descanso del equipo">
                  <div className="sofa-cushion" />
                  <div className="sofa-cushion" />
                </div>
              </div>
            </div>

            {/* Real Animated SVG Agent Figures with Speech Bubbles */}
            {agents.map((agent) => {
              const pos = getAgentFloorPosition(agent);
              const isWorking = agent.status === "working";
              const isSelected = selectedId === agent.id;
              const bubbleText = isWorking ? agent.bubble : agent.idleBubble || "Descansando ☕";

              return (
                <div
                  key={agent.id}
                  className={`office-worker-node tone-${agent.tone} ${isWorking ? "is-working" : "is-resting"} ${
                    isSelected ? "is-selected" : ""
                  }`}
                  style={{ left: pos.left, top: pos.top }}
                  onClick={() => setSelectedId(agent.id)}
                >
                  {/* Dynamic Speech Bubble (≤ 5 words as requested) */}
                  <div className={`worker-speech-bubble ${isWorking ? "working" : "resting"}`}>
                    {isWorking ? (
                      <span className="bubble-live-dot" />
                    ) : (
                      <span className="bubble-zzz">💤</span>
                    )}
                    <span>{bubbleText}</span>
                  </div>

                  {/* High-Fidelity SVG Character Avatar */}
                  <div className={`worker-avatar-wrap ${isWorking ? "typing" : "sitting"}`}>
                    <AgentFigure id={agent.id} status={agent.status} size={64} />
                    <span className="worker-status-glow" />
                  </div>

                  {/* Character Nameplate */}
                  <div className="worker-nameplate">
                    <strong>{agent.name}</strong>
                    <small>{agent.employment}</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Roster & Inspector Panel */}
          <aside className="office-inspector">
            {selectedAgent && (
              <div className="selected-agent-card">
                <div className="sa-header">
                  <div className="sa-avatar-box">
                    <AgentFigure id={selectedAgent.id} status={selectedAgent.status} size={48} />
                  </div>
                  <div>
                    <Badge tone={selectedAgent.status === "working" ? "agent" : "neutral"}>
                      {selectedAgent.status === "working" ? "⚡ TRABAJANDO EN TAREA" : "☕ SENTADO DESCANSANDO"}
                    </Badge>
                    <div className="heading-sm">{selectedAgent.name}</div>
                    <small>{selectedAgent.role}</small>
                  </div>
                </div>

                <div className="sa-details">
                  <div>
                    <small>EMPLEO Y ESPECIALIDAD</small>
                    <strong>{selectedAgent.employment}</strong>
                  </div>

                  <div>
                    <small>GLOBO DE ACCIÓN ACTUAL (EN VIVO)</small>
                    <p className="sa-bubble-preview">
                      "{selectedAgent.status === "working" ? selectedAgent.bubble : selectedAgent.idleBubble || "Descansando en puesto"}"
                    </p>
                  </div>

                  <div>
                    <small>TAREA ASIGNADA POR EL ORQUESTADOR</small>
                    <p>{selectedAgent.status === "working" ? selectedAgent.task : "En espera de órdenes en su escritorio o cafetería."}</p>
                  </div>

                  <div>
                    <small>CONEXIÓN MCP & MOTOR</small>
                    <code>{selectedAgent.mcp || "Playwright MCP + Chrome DevTools MCP"}</code>
                  </div>

                  <div>
                    <small>UBICACIÓN ACTUAL EN LA PLANTA</small>
                    <span className="agent-zone-badge">{getAgentFloorPosition(selectedAgent).zone}</span>
                  </div>
                </div>

                {/* Direct Action Dispatcher for Selected Agent */}
                <div className="sa-actions">
                  <Button
                    variant="primary"
                    className="full-button"
                    onClick={() => dispatchAgentTask(selectedAgent)}
                  >
                    <Icon name="play" size="sm" /> Despachar tarea en vivo a {selectedAgent.name.split(" ")[0]}
                  </Button>

                  <Button
                    variant={selectedAgent.status === "working" ? "secondary" : "ghost"}
                    className="full-button"
                    onClick={() => {
                      tobi.toggleAgentStatus(selectedAgent.id);
                      appendLog(
                        selectedAgent.id === "orchestrator" ? "ORCHESTRATOR" : "SUBAGENT" as any,
                        `${selectedAgent.name} ahora está ${selectedAgent.status === "working" ? "descansando" : "trabajando"}`,
                        "info"
                      );
                    }}
                  >
                    {selectedAgent.status === "working" ? "☕ Mandar a descansar" : "⚡ Poner a laburar"}
                  </Button>

                  <Button variant="ghost" className="full-button" onClick={() => navigate("live-run")}>
                    Ver ejecución en vivo ({selectedAgent.run}) <Icon name="arrow" size="sm" />
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Agent Roster */}
            <div className="office-roster-list">
              <div className="roster-title">PLANTILLA COMPLETA DE SUBAGENTES ({agents.length})</div>
              {agents.map((a) => (
                <div
                  key={a.id}
                  className={`roster-row ${selectedId === a.id ? "active" : ""}`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <span className={`roster-dot ${a.status === "working" ? "working" : "idle"}`} />
                  <div className="roster-info">
                    <strong>{a.name}</strong>
                    <small>{a.employment}</small>
                  </div>
                  <Badge tone={a.status === "working" ? "agent" : "neutral"}>
                    {a.status === "working" ? "Laburando" : "Descansando"}
                  </Badge>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Live Office Console / Operations Terminal Stream */}
        <div className="office-terminal-panel">
          <div className="office-terminal-header">
            <div className="term-title">
              <Icon name="terminal" size="sm" />
              <strong>TERMINAL DE OPERACIONES EN VIVO (EVENT STREAM)</strong>
              <span className="live-tag">LIVE</span>
            </div>

            <div className="term-filters">
              <button
                className={`term-filter-btn ${terminalFilter === "all" ? "active" : ""}`}
                onClick={() => setTerminalFilter("all")}
              >
                Todos ({logs.length})
              </button>
              <button
                className={`term-filter-btn ${terminalFilter === "mcp" ? "active" : ""}`}
                onClick={() => setTerminalFilter("mcp")}
              >
                MCP Events
              </button>
              <button
                className={`term-filter-btn ${terminalFilter === "subagent" ? "active" : ""}`}
                onClick={() => setTerminalFilter("subagent")}
              >
                Subagentes
              </button>
              <button
                className={`term-filter-btn ${terminalFilter === "warn" ? "active" : ""}`}
                onClick={() => setTerminalFilter("warn")}
              >
                Hallazgos
              </button>
              <Button
                variant="ghost"
                className="term-clear-btn"
                onClick={() => setLogs([])}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="office-terminal-logs">
            {filteredLogs.map((log) => (
              <div className={`term-log-line log-${log.level}`} key={log.id}>
                <span className="log-time">{log.time}</span>
                <span className={`log-source tag-${log.source.toLowerCase()}`}>[{log.source}]</span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Zoom Modal */}
      {activeScreenModal && (
        <div className="screen-modal-backdrop" onClick={() => setActiveScreenModal(null)}>
          <div className="screen-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="screen-modal-header">
              <div>
                <div className="heading-sm">{activeScreenModal.title}</div>
                <small>Auditor: {activeScreenModal.agentName} · {activeScreenModal.viewport}</small>
              </div>
              <Button variant="icon" label="Cerrar modal" onClick={() => setActiveScreenModal(null)}>
                <Icon name="x" />
              </Button>
            </div>
            <div className="screen-modal-body">
              <img src={activeScreenModal.img} alt={activeScreenModal.title} className="screen-modal-img" />
              <div className="screen-modal-meta">
                <p><strong>Observación:</strong> {activeScreenModal.details}</p>
                <div className="screen-modal-actions">
                  <code>Spec asociado: {activeScreenModal.associatedSpec}</code>
                  <Button onClick={() => { setActiveScreenModal(null); navigate("live-run"); }}>
                    Abrir en Live Run <Icon name="arrow" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
