import { useEffect, useState, type ReactNode, type JSX } from "react";
import type { useTobiState, OfficeAgent } from "../hooks/useTobiState";
import { OfficeScene } from "./OfficeScene";
import type { ScreenModal } from "./officeIso";
import "./office.css";

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
  source: "ORCHESTRATOR" | "PLAYWRIGHT" | "DEVTOOLS_CDP" | "EXPLORER" | "SECURITY" | "SPEC" | "SUBAGENT";
  message: string;
  level: "info" | "success" | "warn" | "accent";
}

const AGENT_ZONE: Record<string, string> = {
  orchestrator: "Mesa de Comando Central",
  explorer: "Zona de Desarrollo · @playwright/mcp",
  telemetry: "Sala de Servidores · Chrome CDP",
  writer: "Zona de Desarrollo · Test Spec Runner",
  security: "Zona de Desarrollo · RBAC & Edge",
};

function nowTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
}

export function OfficeView({ navigate, tobi, Badge, Button, Icon, PageHeading }: OfficeViewProps) {
  const agents = tobi.state.officeAgents;
  const [selectedId, setSelectedId] = useState<string>("orchestrator");
  const [beat, setBeat] = useState(0);
  const [activeScreenModal, setActiveScreenModal] = useState<ScreenModal | null>(null);
  const [terminalFilter, setTerminalFilter] = useState<"all" | "mcp" | "subagent" | "warn">("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "l-1", time: "21:50:01", source: "ORCHESTRATOR", message: "Antigravity conectado al workspace local (C:/Users/usuario/Documents/VetConnect)", level: "accent" },
    { id: "l-2", time: "21:50:03", source: "PLAYWRIGHT", message: "@playwright/mcp: Proceso Chromium inicializado en puerto CDP 5173", level: "info" },
    { id: "l-3", time: "21:50:05", source: "DEVTOOLS_CDP", message: "chrome-devtools-mcp: Escuchando eventos Network y Console", level: "info" },
    { id: "l-4", time: "21:50:08", source: "EXPLORER", message: "Explorer QA ejecutó page.goto('http://localhost:5173/login') [200 OK · 840ms]", level: "success" },
    { id: "l-5", time: "21:50:11", source: "SECURITY", message: "RBAC Hunter: Comprobada redirección no autorizada en /client/dashboard → /login", level: "info" },
    { id: "l-6", time: "21:50:14", source: "DEVTOOLS_CDP", message: "Alerta de estado: divergencia entre Mensajes y Mascotas (BUG-01)", level: "warn" },
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => setBeat((b) => (b + 1) % 4), 4600);
    return () => window.clearInterval(timer);
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedId) || agents[0];
  const workingAgents = agents.filter((a) => a.status === "working");
  const idleAgents = agents.filter((a) => a.status !== "working");

  const appendLog = (source: LogEntry["source"], message: string, level: LogEntry["level"] = "info") => {
    setLogs((prev) => [...prev.slice(-40), { id: `log-${Date.now()}-${Math.random()}`, time: nowTime(), source, message, level }]);
  };

  const dispatchAgentTask = (agent: OfficeAgent) => {
    if (agent.status !== "working") tobi.toggleAgentStatus(agent.id);
    switch (agent.id) {
      case "orchestrator":
        appendLog("ORCHESTRATOR", "Antigravity inició auditoría white-box de rutas en App.tsx", "accent");
        break;
      case "explorer":
        appendLog("EXPLORER", "Explorer QA: page.fill('input[type=email]', 'vet@vetconnect.com')", "success");
        break;
      case "telemetry":
        appendLog("DEVTOOLS_CDP", "Telemetry Auditor: capturando traza de red en /api/v1/auth/session", "info");
        break;
      case "security":
        appendLog("SECURITY", "RBAC Hunter: evaluando matriz de roles CLIENT vs VET vs ADMIN", "warn");
        break;
      case "writer":
        appendLog("SPEC", "Spec Writer: compilando vetconnect-auth.spec.ts con 4 tests Playwright", "success");
        break;
    }
  };

  const runFullOfficeSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setBeat(0);
    tobi.setAllAgentsMode("working");
    appendLog("ORCHESTRATOR", "▶ SIMULACIÓN MULTI-AGENTE INICIADA: coordinando 4 subagentes sobre VetConnect", "accent");

    const steps: Array<[number, number, () => void]> = [
      [1800, 2, () => { setSelectedId("explorer"); setBeat(1); appendLog("EXPLORER", "Paso 1: Explorer QA auditó el DOM inicial de http://localhost:5173/", "success"); }],
      [3600, 3, () => { setSelectedId("telemetry"); setBeat(2); appendLog("DEVTOOLS_CDP", "Paso 2: Telemetry Auditor inspeccionó red y consola de VetConnect", "info"); }],
      [5400, 4, () => { setSelectedId("security"); setBeat(3); appendLog("SECURITY", "Paso 3: RBAC Hunter validó la protección de /client/* y /vet/*", "warn"); }],
      [7200, 5, () => { setSelectedId("writer"); setBeat(0); appendLog("SPEC", "Paso 4: Spec Writer generó vetconnect-auth.spec.ts y appointments.spec.ts", "success"); }],
      [9000, 0, () => { setIsSimulating(false); setSelectedId("orchestrator"); appendLog("ORCHESTRATOR", "✓ SIMULACIÓN COMPLETADA: 5 pruebas aprobadas, 1 bug documentado en BDD", "accent"); }],
    ];
    steps.forEach(([delay, step, run]) =>
      window.setTimeout(() => {
        setSimulationStep(step);
        run();
      }, delay)
    );
  };

  const zoneFor = (agent: OfficeAgent) =>
    agent.status === "working" ? AGENT_ZONE[agent.id] || "Zona de Desarrollo" : "Cafetería / Break Room";

  const filteredLogs = logs.filter((log) => {
    if (terminalFilter === "mcp") return log.source === "PLAYWRIGHT" || log.source === "DEVTOOLS_CDP";
    if (terminalFilter === "subagent") return log.source === "EXPLORER" || log.source === "SECURITY" || log.source === "SPEC";
    if (terminalFilter === "warn") return log.level === "warn";
    return true;
  });

  return (
    <>
      <PageHeading
        title="La Oficina — Isometric Multi-Agent Studio"
        subtitle="Vista isométrica en vivo del estudio: observá al Agente Central (Antigravity) y a los subagentes desplazarse entre las zonas de desarrollo, la sala de servidores, la mesa de comando, la sala de reuniones y la cafetería."
      >
        <Button
          variant="secondary"
          onClick={() => {
            tobi.setAllAgentsMode("idle");
            appendLog("ORCHESTRATOR", "Los agentes se retiraron a la cafetería y sus puestos", "info");
          }}
        >
          ☕ Mandar a descansar
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            tobi.setAllAgentsMode("working");
            appendLog("ORCHESTRATOR", "Todos los subagentes volvieron a sus puestos", "accent");
          }}
        >
          ⚡ Poner a laburar
        </Button>
        <Button onClick={runFullOfficeSimulation} disabled={isSimulating}>
          <Icon name="spark" size="sm" /> {isSimulating ? `Ejecutando Paso ${simulationStep}/4...` : "Simular Flujo E2E Completo"}
        </Button>
      </PageHeading>

      <div className="iso-studio">
        <div className="iso-topbar">
          <div className="iso-brand">
            <span className="project-avatar">V</span>
            <div>
              <small>REPOSITORIO VINCULADO EN VIVO</small>
              <strong>
                {tobi.state.project.name} · {tobi.state.project.repoPath}
              </strong>
            </div>
            <Badge tone="success">
              <span className="connection-dot" /> Dual-MCP
            </Badge>
          </div>

          <div className="iso-counters">
            <span className="iso-counter">
              <i /> <strong>{workingAgents.length}</strong> trabajando
            </span>
            <span className="iso-counter resting">
              <i /> <strong>{idleAgents.length}</strong> descansando
            </span>
          </div>

          <div className="iso-hint">
            <strong>Sistema interactivo</strong>
            Clic en un personaje o en una pantalla para inspeccionar
          </div>
        </div>

        <div className="iso-layout">
          <div className="iso-stage">
            <div className="iso-viewport">
              <OfficeScene
                agents={agents}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onOpenScreen={setActiveScreenModal}
                isSimulating={isSimulating}
                beat={beat}
              />
            </div>

            <div className="iso-mobile">
              {agents.map((a) => (
                <div key={a.id} className="iso-mobile-row" onClick={() => setSelectedId(a.id)}>
                  <span className="iso-mobile-avatar">
                    <span className={`iso-roster-dot ${a.status === "working" ? "working" : ""}`} />
                  </span>
                  <div>
                    <strong>{a.name}</strong>
                    <small>
                      {a.status === "working" ? "Trabajando" : "Descansando"} · {zoneFor(a)}
                    </small>
                  </div>
                  <Badge tone={a.status === "working" ? "agent" : "neutral"}>
                    {a.status === "working" ? "Activo" : "Idle"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <aside className="iso-inspector">
            {selectedAgent && (
              <div className="iso-inspector-card">
                <div className="iso-inspector-head">
                  <span className="iso-inspector-avatar">
                    <span className={`iso-roster-dot ${selectedAgent.status === "working" ? "working" : ""}`} />
                  </span>
                  <div>
                    <Badge tone={selectedAgent.status === "working" ? "agent" : "neutral"}>
                      {selectedAgent.status === "working" ? "⚡ TRABAJANDO EN TAREA" : "☕ DESCANSANDO"}
                    </Badge>
                    <div className="heading-sm">{selectedAgent.name}</div>
                    <small>{selectedAgent.role}</small>
                  </div>
                </div>

                <div className="iso-inspector-details">
                  <div className="iso-inspector-row">
                    <small>ESPECIALIDAD</small>
                    <p>{selectedAgent.employment}</p>
                  </div>
                  <div className="iso-inspector-row">
                    <small>TAREA ASIGNADA POR EL ORQUESTADOR</small>
                    <p>{selectedAgent.status === "working" ? selectedAgent.task : "En espera de órdenes en su escritorio o cafetería."}</p>
                  </div>
                  <div className="iso-inspector-row">
                    <small>CONEXIÓN MCP & MOTOR</small>
                    <code>{selectedAgent.mcp || "Playwright MCP + Chrome DevTools MCP"}</code>
                  </div>
                  <div className="iso-inspector-row">
                    <small>UBICACIÓN ACTUAL EN LA PLANTA</small>
                    <span className="iso-inspector-zone">
                      <Icon name="layers" size="sm" /> {zoneFor(selectedAgent)}
                    </span>
                  </div>
                </div>

                <div className="iso-inspector-actions">
                  <Button variant="primary" onClick={() => dispatchAgentTask(selectedAgent)}>
                    <Icon name="play" size="sm" /> Despachar tarea a {selectedAgent.name.split(" ")[0]}
                  </Button>
                  <Button
                    variant={selectedAgent.status === "working" ? "secondary" : "ghost"}
                    onClick={() => {
                      tobi.toggleAgentStatus(selectedAgent.id);
                      appendLog(
                        selectedAgent.id === "orchestrator" ? "ORCHESTRATOR" : "SUBAGENT",
                        `${selectedAgent.name} ahora está ${selectedAgent.status === "working" ? "descansando" : "trabajando"}`
                      );
                    }}
                  >
                    {selectedAgent.status === "working" ? "☕ Mandar a descansar" : "⚡ Poner a laburar"}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("live-run")}>
                    Ver ejecución en vivo ({selectedAgent.run}) <Icon name="arrow" size="sm" />
                  </Button>
                </div>
              </div>
            )}

            <div className="iso-roster">
              <div className="iso-roster-title">PLANTILLA COMPLETA ({agents.length})</div>
              {agents.map((a) => (
                <div
                  key={a.id}
                  className={`iso-roster-row ${selectedId === a.id ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(a.id);
                    }
                  }}
                >
                  <span className={`iso-roster-dot ${a.status === "working" ? "working" : ""}`} />
                  <div className="iso-roster-info">
                    <strong>{a.name}</strong>
                    <small>{a.employment}</small>
                  </div>
                  <Badge tone={a.status === "working" ? "agent" : "neutral"}>
                    {a.status === "working" ? "Activo" : "Idle"}
                  </Badge>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="iso-terminal">
          <div className="iso-terminal-header">
            <div className="iso-terminal-title">
              <Icon name="terminal" size="sm" />
              <strong>TERMINAL DE OPERACIONES · EVENT STREAM</strong>
              <span className="iso-terminal-live">LIVE</span>
            </div>
            <div className="iso-terminal-filters">
              {([
                ["all", `Todos (${logs.length})`],
                ["mcp", "MCP Events"],
                ["subagent", "Subagentes"],
                ["warn", "Hallazgos"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`iso-filter ${terminalFilter === key ? "active" : ""}`}
                  onClick={() => setTerminalFilter(key)}
                >
                  {label}
                </button>
              ))}
              <button type="button" className="iso-filter" onClick={() => setLogs([])}>
                Limpiar
              </button>
            </div>
          </div>

          <div className="iso-terminal-logs">
            {filteredLogs.length === 0 ? (
              <div className="iso-term-empty">Sin eventos para este filtro.</div>
            ) : (
              filteredLogs.map((log) => (
                <div className={`iso-term-line log-${log.level}`} key={log.id}>
                  <span className="iso-term-time">{log.time}</span>
                  <span className={`iso-term-source tag-${log.source.toLowerCase()}`}>[{log.source}]</span>
                  <span className="iso-term-msg">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {activeScreenModal && (
        <div className="screen-modal-backdrop" onClick={() => setActiveScreenModal(null)}>
          <div className="screen-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="screen-modal-header">
              <div>
                <div className="heading-sm">{activeScreenModal.title}</div>
                <small>
                  Auditor: {activeScreenModal.agentName} · {activeScreenModal.viewport}
                </small>
              </div>
              <Button variant="icon" label="Cerrar" onClick={() => setActiveScreenModal(null)}>
                <Icon name="x" />
              </Button>
            </div>
            <div className="screen-modal-body">
              {activeScreenModal.img ? (
                <img src={activeScreenModal.img} alt={activeScreenModal.title} className="screen-modal-img" />
              ) : (
                <pre className="iso-code-modal">
                  <code>{activeScreenModal.code}</code>
                </pre>
              )}
              <div className="screen-modal-meta">
                <p>
                  <strong>Observación:</strong> {activeScreenModal.details}
                </p>
                <div className="screen-modal-actions">
                  <code>Spec asociado: {activeScreenModal.associatedSpec}</code>
                  <Button
                    onClick={() => {
                      setActiveScreenModal(null);
                      navigate("live-run");
                    }}
                  >
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
