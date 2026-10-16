import { useCallback, useEffect, useRef, useState, type ReactNode, type JSX } from "react";
import type { useTobiState, OfficeAgent } from "../hooks/useTobiState";
import { OfficeScene } from "./OfficeScene";
import { useAgentMotion } from "./useAgentMotion";
import { getAgentStationPoint, project as isoProject, SCENE_W, SCENE_H, type ScreenModal } from "./officeIso";
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
  source: "ORCHESTRATOR" | "PLAYWRIGHT" | "DEVTOOLS_CDP" | "EXPLORER" | "SECURITY" | "SPEC" | "SUBAGENT" | "OPENCODE";
  message: string;
  level: "info" | "success" | "warn" | "accent";
  agentId?: string;
}

const AGENT_ZONE: Record<string, string> = {
  orchestrator: "Mesa de Comando Central",
  explorer: "Zona de Desarrollo · @playwright/mcp",
  telemetry: "Sala de Servidores · Chrome CDP",
  writer: "Zona de Desarrollo · Test Spec Runner",
  security: "Zona de Desarrollo · RBAC & Edge",
  opencode: "Zona de Desarrollo · OpenCode (DeepSeek v4.1)",
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
  const project = tobi.state.project;
  const isTobiProject = tobi.activeProjectId === "tobitests" || project.name.toLowerCase().includes("tobi");
  const [selectedId, setSelectedId] = useState<string>("orchestrator");
  const [beat, setBeat] = useState(0);
  const [activeScreenModal, setActiveScreenModal] = useState<ScreenModal | null>(null);
  const [terminalFilter, setTerminalFilter] = useState<"all" | "agent" | "mcp" | "subagent" | "warn">("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // Pan & Zoom and Standup States (inspired by Claw3D & interactive studio)
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [wheelZoomEnabled, setWheelZoomEnabled] = useState(true);
  const [isStandup, setIsStandup] = useState(false);

  const poses = useAgentMotion(agents, isSimulating, isStandup);

  const getInitialLogs = useCallback((): LogEntry[] => {
    if (isTobiProject) {
      return [
        { id: "l-1", time: "14:50:01", source: "ORCHESTRATOR", message: `Antigravity conectado al workspace local (${project.repoPath || "C:/Users/usuario/Documents/tobitests"})`, level: "accent", agentId: "orchestrator" },
        { id: "l-2", time: "14:50:03", source: "PLAYWRIGHT", message: "@playwright/mcp: Proceso Chromium inicializado en http://localhost:5173", level: "info", agentId: "explorer" },
        { id: "l-3", time: "14:50:05", source: "DEVTOOLS_CDP", message: "chrome-devtools-mcp: Escuchando eventos Network y Console en tiempo real", level: "info", agentId: "telemetry" },
        { id: "l-4", time: "14:50:08", source: "EXPLORER", message: "Explorer QA recorrió Landing, Dashboard y Bug Tracker [200 OK · 180ms]", level: "success", agentId: "explorer" },
        { id: "l-5", time: "14:50:11", source: "DEVTOOLS_CDP", message: "Alerta de estado: divergencia en selector de filtros de telemetría (BUG-01)", level: "warn", agentId: "telemetry" },
        { id: "l-6", time: "14:50:14", source: "SPEC", message: "Spec Writer compiló tobitests-shell.spec.ts y tobitests-office.spec.ts", level: "success", agentId: "writer" },
      ];
    }
    return [
      { id: "l-1", time: "21:50:01", source: "ORCHESTRATOR", message: "Antigravity conectado al workspace local (C:/Users/usuario/Documents/VetConnect)", level: "accent", agentId: "orchestrator" },
      { id: "l-2", time: "21:50:03", source: "PLAYWRIGHT", message: "@playwright/mcp: Proceso Chromium inicializado en puerto CDP 5173", level: "info", agentId: "explorer" },
      { id: "l-3", time: "21:50:05", source: "DEVTOOLS_CDP", message: "chrome-devtools-mcp: Escuchando eventos Network y Console", level: "info", agentId: "telemetry" },
      { id: "l-4", time: "21:50:08", source: "EXPLORER", message: "Explorer QA ejecutó page.goto('http://localhost:5173/login') [200 OK · 840ms]", level: "success", agentId: "explorer" },
      { id: "l-5", time: "21:50:11", source: "SECURITY", message: "RBAC Hunter: Comprobada redirección no autorizada en /client/dashboard → /login", level: "info", agentId: "security" },
      { id: "l-6", time: "21:50:14", source: "DEVTOOLS_CDP", message: "Alerta de estado: divergencia entre Mensajes y Mascotas (BUG-01)", level: "warn", agentId: "telemetry" },
    ];
  }, [isTobiProject, project.repoPath]);

  const [logs, setLogs] = useState<LogEntry[]>(getInitialLogs);

  // Sincronizar logs cuando cambia el proyecto
  useEffect(() => {
    setLogs(getInitialLogs());
  }, [tobi.activeProjectId, getInitialLogs]);

  useEffect(() => {
    const timer = window.setInterval(() => setBeat((b) => (b + 1) % 4), 4600);
    return () => window.clearInterval(timer);
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedId) || agents[0];
  const workingAgents = agents.filter((a) => a.status === "working");
  const idleAgents = agents.filter((a) => a.status !== "working");

  const appendLog = (
    source: LogEntry["source"],
    message: string,
    level: LogEntry["level"] = "info",
    agentId?: string
  ) => {
    const resolvedAgentId =
      agentId ||
      (source === "ORCHESTRATOR"
        ? "orchestrator"
        : source === "EXPLORER"
        ? "explorer"
        : source === "SPEC"
        ? "writer"
        : source === "OPENCODE"
        ? "opencode"
        : source === "DEVTOOLS_CDP"
        ? "telemetry"
        : source === "SECURITY"
        ? "security"
        : undefined);

    setLogs((prev) => [
      ...prev.slice(-45),
      {
        id: `log-${Date.now()}-${Math.random()}`,
        time: nowTime(),
        source,
        message,
        level,
        agentId: resolvedAgentId,
      },
    ]);
  };

  const zoneFor = (agent: OfficeAgent) =>
    agent.status === "working" ? AGENT_ZONE[agent.id] || "Zona de Desarrollo" : "Cafetería / Break Room";

  const resetView = useCallback(() => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth || 960;
    const vh = viewportRef.current.clientHeight || 700;
    const targetZoom = Math.min(vw / (SCENE_W * 1.05), vh / (SCENE_H * 1.05), 1);
    const initialZoom = Math.max(0.68, Math.min(targetZoom, 0.92));
    setZoom(initialZoom);
    setPan({
      x: (vw - SCENE_W * initialZoom) / 2,
      y: Math.max(12, (vh - SCENE_H * initialZoom) / 2),
    });
  }, []);

  const focusAgent = useCallback((agentId: string) => {
    setSelectedId(agentId);
    const pt = getAgentStationPoint(agentId);
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth || 960;
    const vh = viewportRef.current.clientHeight || 700;
    const targetZoom = 1.35;
    setZoom(targetZoom);
    setPan({
      x: vw / 2 - pt.x * targetZoom,
      y: vh / 2 - pt.y * targetZoom,
    });
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      appendLog("ORCHESTRATOR", `🎯 Cámara fijada en estación de ${agent.name} (${zoneFor(agent)})`, "info");
    }
  }, [agents]);

  const toggleStandup = useCallback(() => {
    setIsStandup((prev) => {
      const next = !prev;
      if (next) {
        appendLog("ORCHESTRATOR", "🗣️ STANDUP DE EQUIPO INICIADO: Todos los agentes convocados a la Sala de Reuniones", "accent");
        if (viewportRef.current) {
          const vw = viewportRef.current.clientWidth || 960;
          const vh = viewportRef.current.clientHeight || 700;
          const meetingPt = isoProject(9.6, 10.4, 0);
          const targetZoom = 1.25;
          setZoom(targetZoom);
          setPan({
            x: vw / 2 - meetingPt.x * targetZoom,
            y: vh / 2 - meetingPt.y * targetZoom,
          });
        }
      } else {
        appendLog("ORCHESTRATOR", "✓ Standup finalizado: agentes reanudando sus puestos y cafetería", "info");
        resetView();
      }
      return next;
    });
  }, [resetView]);

  useEffect(() => {
    resetView();
    const handleResize = () => resetView();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resetView]);

  // Non-passive wheel zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!wheelZoomEnabled) return;
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.45), 2.4);
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

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [wheelZoomEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".iso-screen") || target.closest(".iso-agent")) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const dispatchAgentTask = (agent: OfficeAgent) => {
    if (agent.status !== "working") tobi.toggleAgentStatus(agent.id);
    if (isTobiProject) {
      switch (agent.id) {
        case "orchestrator":
          appendLog("ORCHESTRATOR", "Antigravity inició auditoría integral de TobiTests en http://localhost:5173", "accent");
          break;
        case "explorer":
          appendLog("EXPLORER", "Explorer QA: page.click('button:has-text(\"La Oficina\")') [Paso 1: Abrir vista]", "success");
          break;
        case "telemetry":
          appendLog("DEVTOOLS_CDP", "Telemetry Auditor: monitoreando streams de consola y eventos de reactividad", "info");
          break;
        case "security":
        case "writer":
          appendLog("SPEC", "Spec Writer: generando especificaciones Playwright para tobitests-office.spec.ts", "success");
          break;
        case "opencode":
          appendLog("OPENCODE", "OpenCode (DeepSeek v4.1): refactorizando JourneyCanvas con debounce y virtualización", "accent");
          break;
      }
    } else {
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
        case "opencode":
          appendLog("OPENCODE", "OpenCode (DeepSeek v4.1): aplicando parche para saneamiento de props y estado en NestJS", "accent");
          break;
      }
    }
  };

  const runFullOfficeSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setBeat(0);
    tobi.setAllAgentsMode("working");

    const targetName = project.name;
    appendLog("ORCHESTRATOR", `▶ SIMULACIÓN MULTI-AGENTE INICIADA: coordinando subagentes sobre ${targetName}`, "accent");

    const steps: Array<[number, number, () => void]> = isTobiProject ? [
      [1800, 2, () => { setSelectedId("explorer"); setBeat(1); appendLog("EXPLORER", "Paso 1: Explorer QA auditó la interfaz y navegación de TobiTests", "success"); }],
      [3600, 3, () => { setSelectedId("telemetry"); setBeat(2); appendLog("DEVTOOLS_CDP", "Paso 2: Telemetry Auditor inspeccionó eventos y rendimiento en Chrome CDP", "info"); }],
      [5400, 4, () => { setSelectedId("writer"); setBeat(3); appendLog("SPEC", "Paso 3: Spec Writer sintetizó 84 pruebas de Playwright con selectores semánticos", "success"); }],
      [7200, 5, () => { setSelectedId("opencode"); setBeat(2); appendLog("OPENCODE", "Paso 4: OpenCode (DeepSeek v4.1) optimizó el rendimiento y corrigió selectores en el Journey Canvas", "accent"); }],
      [9000, 6, () => { setSelectedId("orchestrator"); setBeat(0); appendLog("ORCHESTRATOR", "Paso 5: Orchestrator consolidó el reporte de calidad y detectó BUG-01", "warn"); }],
      [10800, 0, () => { setIsSimulating(false); setSelectedId("orchestrator"); tobi.setAllAgentsMode("idle"); appendLog("ORCHESTRATOR", `✓ SIMULACIÓN COMPLETADA: 83 pruebas aprobadas, 1 incidente documentado. Subagentes pasando a descanso.`, "accent"); }],
    ] : [
      [1800, 2, () => { setSelectedId("explorer"); setBeat(1); appendLog("EXPLORER", "Paso 1: Explorer QA auditó el DOM inicial de http://localhost:5173/", "success"); }],
      [3600, 3, () => { setSelectedId("telemetry"); setBeat(2); appendLog("DEVTOOLS_CDP", "Paso 2: Telemetry Auditor inspeccionó red y consola de VetConnect", "info"); }],
      [5400, 4, () => { setSelectedId("security"); setBeat(3); appendLog("SECURITY", "Paso 3: RBAC Hunter validó la protección de /client/* y /vet/*", "warn"); }],
      [7200, 5, () => { setSelectedId("writer"); setBeat(0); appendLog("SPEC", "Paso 4: Spec Writer generó vetconnect-auth.spec.ts y appointments.spec.ts", "success"); }],
      [9000, 6, () => { setSelectedId("opencode"); setBeat(2); appendLog("OPENCODE", "Paso 5: OpenCode (DeepSeek v4.1) generó parche de remediación para desbordamiento de estado", "accent"); }],
      [10800, 0, () => { setIsSimulating(false); setSelectedId("orchestrator"); tobi.setAllAgentsMode("idle"); appendLog("ORCHESTRATOR", "✓ SIMULACIÓN COMPLETADA: 5 pruebas aprobadas, 1 bug documentado en BDD. Subagentes pasando a descanso.", "accent"); }],
    ];

    steps.forEach(([delay, step, run]) =>
      window.setTimeout(() => {
        setSimulationStep(step);
        run();
      }, delay)
    );
  };

  // FIX BUG-01: Aislamiento estricto de streams de telemetría y prevención de polución cruzada
  const filteredLogs = logs.filter((log) => {
    if (terminalFilter === "agent") {
      return log.agentId === selectedId;
    }
    if (terminalFilter === "warn") {
      if (log.level !== "warn") return false;
      if (selectedId && selectedId !== "orchestrator") {
        return log.agentId === selectedId || !log.agentId;
      }
      return true;
    }
    if (terminalFilter === "mcp") return log.source === "PLAYWRIGHT" || log.source === "DEVTOOLS_CDP";
    if (terminalFilter === "subagent") return log.source === "EXPLORER" || log.source === "SECURITY" || log.source === "SPEC" || log.source === "OPENCODE";
    return true;
  });

  return (
    <>
      <PageHeading
        title="La Oficina — Isometric Multi-Agent Studio"
        subtitle="Vista isométrica interactiva: desplazate arrastrando con el mouse, hacé zoom con la rueda o el HUD, convocá al equipo al Standup y enfocá a cualquier agente con Lock Camera."
      >
        <Button
          variant={isStandup ? "primary" : "secondary"}
          onClick={toggleStandup}
        >
          {isStandup ? "🚪 Volver a Puestos" : "🗣️ Standup de Equipo"}
        </Button>
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
          <Icon name="spark" size="sm" /> {isSimulating ? `Ejecutando Paso ${simulationStep}/5...` : "Simular Flujo E2E Completo"}
        </Button>
      </PageHeading>

      <div className="iso-studio">
        <div className="iso-topbar">
          <div className="iso-brand">
            <span className="project-avatar">{project.name.charAt(0)}</span>
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
            <strong>Navegación con mouse</strong>
            Arrastrá para desplazarte · Rueda para zoom · Clic para enfocar agente
          </div>
        </div>

        <div className="iso-layout">
          <div className="iso-stage">
            <div
              ref={viewportRef}
              className={`iso-viewport ${isDragging ? "is-dragging" : ""}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Floating HUD Controls */}
              <div className="iso-viewport-hud">
                <button
                  type="button"
                  className="iso-hud-btn"
                  title="Alejar (Zoom Out)"
                  onClick={() => setZoom((z) => Math.max(0.45, z * 0.88))}
                >
                  -
                </button>
                <button
                  type="button"
                  className="iso-hud-btn iso-hud-zoom"
                  title="Restablecer zoom y centrar"
                  onClick={resetView}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className="iso-hud-btn"
                  title="Acercar (Zoom In)"
                  onClick={() => setZoom((z) => Math.min(2.4, z * 1.14))}
                >
                  +
                </button>
                <span className="iso-hud-sep" />
                <button
                  type="button"
                  className="iso-hud-btn iso-hud-pill"
                  title="Recentrar vista panorámica"
                  onClick={resetView}
                >
                  <Icon name="layers" size="sm" /> Centrar
                </button>
                <button
                  type="button"
                  className="iso-hud-btn iso-hud-pill"
                  title={`Enfocar cámara en ${selectedAgent.name}`}
                  onClick={() => focusAgent(selectedAgent.id)}
                >
                  🎯 Foco: {selectedAgent.name.split(" ")[0]}
                </button>
                <button
                  type="button"
                  className={`iso-hud-btn iso-hud-pill ${wheelZoomEnabled ? "active" : ""}`}
                  title="Activar o desactivar zoom con rueda del mouse"
                  onClick={() => setWheelZoomEnabled((v) => !v)}
                >
                  🖱️ Rueda: {wheelZoomEnabled ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  className={`iso-hud-btn iso-hud-pill iso-hud-standup ${isStandup ? "active" : ""}`}
                  title="Convocar o dispersar reunión de equipo en la Sala de Reuniones"
                  onClick={toggleStandup}
                >
                  🗣️ {isStandup ? "En Reunión" : "Standup"}
                </button>
              </div>

              <OfficeScene
                agents={agents}
                poses={poses}
                selectedId={selectedId}
                projectName={project.name}
                isStandup={isStandup}
                pan={pan}
                zoom={zoom}
                onSelect={focusAgent}
                onOpenScreen={setActiveScreenModal}
              />
            </div>

            <div className="iso-mobile">
              {agents.map((a) => (
                <div key={a.id} className="iso-mobile-row" onClick={() => focusAgent(a.id)}>
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

                  {selectedAgent.id === "orchestrator" && (
                    <div className="iso-inspector-thinking-feed">
                      <div className="feed-header">
                        <span className="live-pulse" />
                        <strong>TRAZA DE PENSAMIENTO Y EJECUCIÓN (LIVE TRACE)</strong>
                      </div>
                      <div className="feed-body">
                        <div className="trace-item">
                          <span className="trace-time">Thought for 19s ›</span>
                          <span className="trace-action">Find failed tests in run 0</span>
                        </div>
                        <div className="trace-item">
                          <span className="trace-time">Check runs list ›</span>
                          <span className="trace-action">Locate openBugs in App.tsx</span>
                        </div>
                        <div className="trace-item">
                          <span className="trace-time">Thought for 14s ›</span>
                          <span className="trace-action">Locate openBugs in App.tsx</span>
                        </div>
                        <div className="trace-item highlight">
                          <span className="trace-time">Analyzed ⚛️</span>
                          <span className="trace-action">TestDetailModal.tsx #L540-603</span>
                        </div>
                        <div className="trace-thinking-box">
                          <div className="thinking-title">Thinking for 22s ▾</div>
                          <p className="thinking-p">The alert incorrectly highlights the wrong step as failing; it accuses Step 1 (passed) instead of Step 3 (failed) and incorrectly starts the modal on Step 1. The "Copy Templates" button copies an incomplete prompt.</p>
                          <p className="thinking-p">The dashboard incorrectly displays an open bug, and the "Create Bug" button should link to an existing, resolved ticket; the dashboard's metrics also incorrectly reflect the open bug count. Re-executing the test should transition the test status to "Passed."</p>
                          <p className="thinking-p">Analyzing TestDetailModal.tsx reveals test is used in a useEffect hook and the header's "Create Bug" button.</p>
                        </div>
                        <div className="trace-item success">
                          <span className="trace-time">Verified ›</span>
                          <span className="trace-action">Playwright Chromium: Paso #3 corregido, 84/84 tests Passed ✓</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="iso-inspector-actions">
                  <Button variant="primary" onClick={() => dispatchAgentTask(selectedAgent)}>
                    <Icon name="play" size="sm" /> Despachar tarea a {selectedAgent.name.split(" ")[0]}
                  </Button>
                  <Button variant="secondary" onClick={() => focusAgent(selectedAgent.id)}>
                    <Icon name="layers" size="sm" /> 🎯 Enfocar en cámara
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
                  onClick={() => focusAgent(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      focusAgent(a.id);
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
                ["agent", `👤 Solo ${selectedAgent.name.split(" ")[0]}`],
                ["mcp", "MCP Events"],
                ["subagent", "Subagentes"],
                ["warn", "Hallazgos / Warn"],
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
              <button
                type="button"
                className="iso-filter"
                title="Limpiar búfer reactivo de la terminal"
                onClick={() => setLogs([])}
              >
                Limpiar búfer
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
