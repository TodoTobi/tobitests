import { memo, useState, useEffect } from "react";
import { AgentFigure } from "./OfficeCharacters";
import type { OfficeAgent, AntigravityLive } from "../hooks/useTobiState";
import type { AgentPose } from "./useAgentMotion";
import {
  COLS,
  DESK_LEDS,
  FURNITURE,
  LAMPS,
  MONITORS,
  ROWS,
  SCENE_H,
  SCENE_W,
  STANDUP_POSITIONS,
  WALL_H,
  ZONES,
  boxPolygons,
  project,
  pts,
  rugPolygon,
  wallPanel,
  getMonitorsForProject,
  type ScreenModal,
} from "./officeIso";

export interface AntigravityThought {
  time: string;
  action: string;
  detail?: string;
  icon?: string;
}

export const ANTIGRAVITY_REAL_THOUGHTS: AntigravityThought[] = [
  {
    time: "Thought for 19s",
    action: "Find failed tests in run 0",
    detail: "Inspeccionando suite #RUN-SELF-01 y aislando fallo en TC-OFFICE-13",
    icon: "🔍"
  },
  {
    time: "Thought for 14s",
    action: "Locate openBugs in App.tsx",
    detail: "Mapeando sincronización de métricas y contador dinámico de bugs",
    icon: "📂"
  },
  {
    time: "Thought for 9s",
    action: "Analyzed ⚛️ TestDetailModal.tsx #L540-603",
    detail: "Detectando origen de discrepancia en diagnóstico del paso #1 vs paso #3",
    icon: "⚛️"
  },
  {
    time: "Thinking for 22s",
    action: "The alert incorrectly highlights Step 1 instead of Step 3",
    detail: "Corrigiendo failingStepIdx, auto-focus en paso fallido y copia de plantillas BDD",
    icon: "🧠"
  },
  {
    time: "Thought for 11s",
    action: "Minimal Fix en TestDetailModal & useTobiState",
    detail: "Preservando retrocompatibilidad e inyectando re-ejecución en vivo",
    icon: "🛠️"
  },
  {
    time: "Thought for 16s",
    action: "Playwright verify_modal_fix.py: status Passed ✓",
    detail: "Validando en Chromium: Paso #3 enfocado, alerta correcta y 0 fallos",
    icon: "▶"
  },
  {
    time: "Thought for 8s",
    action: "Git commit & push origin main › commit 53cf23f",
    detail: "Pushed conventional commit con fix de diagnóstico y correlación de tickets",
    icon: "🌿"
  },
  {
    time: "Thought for 12s",
    action: "Engram Memory Sync: rel-1fb99a4211ddf4cc",
    detail: "Memoria persistente registrada y juzgada como compatible sin conflictos",
    icon: "💾"
  }
];

interface OfficeSceneProps {
  agents: OfficeAgent[];
  poses: AgentPose[];
  selectedId: string;
  projectName?: string;
  isStandup?: boolean;
  pan?: { x: number; y: number };
  zoom?: number;
  onSelect: (id: string) => void;
  onOpenScreen: (modal: ScreenModal) => void;
  antigravityLive?: AntigravityLive | null;
}

const floor = pts([project(0, 0, 0), project(COLS, 0, 0), project(COLS, ROWS, 0), project(0, ROWS, 0)]);
const wallLeft = pts([project(0, 0, 0), project(0, ROWS, 0), project(0, ROWS, WALL_H), project(0, 0, WALL_H)]);
const wallRight = pts([project(0, 0, 0), project(COLS, 0, 0), project(COLS, 0, WALL_H), project(0, 0, WALL_H)]);

const RIGHT_WINDOWS = [
  [2.2, 4.0],
  [6.2, 8.0],
  [10.6, 12.6],
];
const LEFT_WINDOWS = [
  [6.0, 8.0],
  [9.6, 11.6],
];

const orderedFurniture = [...FURNITURE].sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

const gridLines: { key: string; points: string }[] = [];
for (let i = 0; i <= COLS; i += 1) gridLines.push({ key: `v${i}`, points: pts([project(i, 0, 0), project(i, ROWS, 0)]) });
for (let j = 0; j <= ROWS; j += 1) gridLines.push({ key: `h${j}`, points: pts([project(0, j, 0), project(COLS, j, 0)]) });

const IsoStatic = memo(function IsoStatic({ projectName = "TobiTests", onOpenScreen }: { projectName?: string; onOpenScreen: (modal: ScreenModal) => void }) {
  const monitors = getMonitorsForProject(projectName);
  return (
    <>
      <svg className="iso-svg" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} width={SCENE_W} height={SCENE_H} aria-hidden="true">
        <defs>
          {/* Architectural floor: warm oak/micro-cement gradient */}
          <linearGradient id="isoFloor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3efe6" />
            <stop offset="50%" stopColor="#eae5d8" />
            <stop offset="100%" stopColor="#dfd9cb" />
          </linearGradient>

          {/* Clean modern minimalist wall gradients with ceiling bounce lighting */}
          <linearGradient id="isoWallL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#faf9f6" />
            <stop offset="60%" stopColor="#eeebe2" />
            <stop offset="100%" stopColor="#dfdbd0" />
          </linearGradient>
          <linearGradient id="isoWallR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5f3ec" />
            <stop offset="60%" stopColor="#e8e4da" />
            <stop offset="100%" stopColor="#d8d4c7" />
          </linearGradient>

          {/* Architectural tinted glass with sky reflection */}
          <linearGradient id="isoGlass" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#7dd3fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
          </linearGradient>

          {/* Soft volumetric sunbeams streaming onto the floor */}
          <linearGradient id="isoSunbeam" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.18" />
            <stop offset="40%" stopColor="#fef3c7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </linearGradient>

          {/* Ambient occlusion shadow along left wall base */}
          <linearGradient id="isoWallShadowL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.18)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
          </linearGradient>

          {/* Ambient occlusion shadow along right wall base */}
          <linearGradient id="isoWallShadowR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.18)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
          </linearGradient>
        </defs>

        {/* Walls */}
        <polygon points={wallLeft} fill="url(#isoWallL)" stroke="#d2cdbf" strokeWidth="1" />
        <polygon points={wallRight} fill="url(#isoWallR)" stroke="#d2cdbf" strokeWidth="1" />

        {/* Baseboard molding (zócalo) for architectural realism */}
        <polygon points={wallPanel("y", 0, ROWS, 0, 4)} fill="#cfc8b8" stroke="#bab3a0" strokeWidth="0.8" />
        <polygon points={wallPanel("x", 0, COLS, 0, 4)} fill="#cfc8b8" stroke="#bab3a0" strokeWidth="0.8" />

        {/* Windows */}
        {RIGHT_WINDOWS.map(([a, b], i) => (
          <g key={`rw${i}`}>
            <polygon points={wallPanel("x", a, b, 64, 116)} fill="url(#isoGlass)" stroke="#64748b" strokeWidth="2.2" />
            <polyline points={pts([project((a + b) / 2, 0, 116), project((a + b) / 2, 0, 64)])} fill="none" stroke="#475569" strokeWidth="1.5" />
            <polyline points={pts([project(a, 0, 90), project(b, 0, 90)])} fill="none" stroke="#475569" strokeWidth="1.5" />
            {/* Glass reflection streak */}
            <polygon points={pts([project(a + 0.3, 0, 112), project(a + 0.8, 0, 112), project(a + 0.2, 0, 68), project(a - 0.3, 0, 68)])} fill="rgba(255,255,255,0.3)" />
          </g>
        ))}
        {LEFT_WINDOWS.map(([a, b], i) => (
          <g key={`lw${i}`}>
            <polygon points={wallPanel("y", a, b, 64, 116)} fill="url(#isoGlass)" stroke="#64748b" strokeWidth="2.2" />
            <polyline points={pts([project(0, (a + b) / 2, 116), project(0, (a + b) / 2, 64)])} fill="none" stroke="#475569" strokeWidth="1.5" />
            <polyline points={pts([project(0, a, 90), project(0, b, 90)])} fill="none" stroke="#475569" strokeWidth="1.5" />
            <polygon points={pts([project(0, a + 0.3, 112), project(0, a + 0.8, 112), project(0, a + 0.2, 68), project(0, a - 0.3, 68)])} fill="rgba(255,255,255,0.3)" />
          </g>
        ))}

        {/* Wall sign (TobiTests mark) on the right wall */}
        <g>
          <polygon points={wallPanel("x", 13.4, 16.4, 70, 122)} fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <polygon points={wallPanel("x", 13.9, 14.3, 82, 112)} fill="#10b981" />
          <polygon points={wallPanel("x", 14.6, 14.9, 82, 112)} fill="#06b6d4" />
          <polygon points={wallPanel("x", 15.2, 16.0, 90, 112)} fill="#8b5cf6" />
        </g>

        {/* Exit sign */}
        <polygon points={wallPanel("x", 17.0, 17.6, 96, 110)} fill="#15803d" stroke="#ffffff" strokeWidth="1" />

        {/* Wall clock */}
        <g>
          <circle cx={project(0, 4.9, 104).x} cy={project(0, 4.9, 104).y} r={15} fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
          <line x1={project(0, 4.9, 104).x} y1={project(0, 4.9, 104).y} x2={project(0, 4.9, 104).x} y2={project(0, 4.9, 104).y - 8} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <line x1={project(0, 4.9, 104).x} y1={project(0, 4.9, 104).y} x2={project(0, 4.9, 104).x + 6} y2={project(0, 4.9, 104).y} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <circle cx={project(0, 4.9, 104).x} cy={project(0, 4.9, 104).y} r={2} fill="#ef4444" />
        </g>

        {/* Floor with rich warm gradient */}
        <polygon points={floor} fill="url(#isoFloor)" stroke="#cfc8b8" strokeWidth="1" />

        {/* Ambient Occlusion base shadows */}
        <polygon
          points={pts([project(0, 0, 0), project(0, ROWS, 0), project(0.45, ROWS, 0), project(0.45, 0, 0)])}
          fill="url(#isoWallShadowL)"
          style={{ pointerEvents: "none" }}
        />
        <polygon
          points={pts([project(0, 0, 0), project(COLS, 0, 0), project(COLS, 0.45, 0), project(0, 0.45, 0)])}
          fill="url(#isoWallShadowR)"
          style={{ pointerEvents: "none" }}
        />

        {/* Soft volumetric sunbeams from the windows onto the floor */}
        {RIGHT_WINDOWS.map(([a, b], i) => (
          <polygon
            key={`sunbeam-${i}`}
            points={pts([
              project(a, 0, 64),
              project(b, 0, 64),
              project(b + 2.8, 5.2, 0),
              project(a + 2.8, 5.2, 0),
            ])}
            fill="url(#isoSunbeam)"
            style={{ mixBlendMode: "screen", pointerEvents: "none" }}
          />
        ))}

        {/* Grid lines with soft architectural refinement */}
        {gridLines.map((l) => (
          <polyline key={l.key} points={l.points} fill="none" stroke="rgba(100, 116, 139, 0.11)" strokeWidth="1" />
        ))}

        {/* Zone rugs with subtle tactile texture */}
        {ZONES.map((z) => (
          <g key={z.id}>
            <polygon points={rugPolygon(z.gx, z.gy, z.w, z.d, 0.4)} fill={z.floor} />
            <polygon points={rugPolygon(z.gx, z.gy, z.w, z.d, 0.6)} fill={z.fill} stroke={z.stroke} strokeWidth="1.6" strokeDasharray="6 5" />
          </g>
        ))}

        {/* Furniture (painter's order) */}
        {orderedFurniture.map((b, i) => {
          const p = boxPolygons(b);
          return (
            <g key={i}>
              <polygon points={p.left} fill={b.left} />
              <polygon points={p.right} fill={b.right} />
              <polygon points={p.top} fill={b.top} stroke="rgba(0,0,0,.08)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Central Command Desk Cyan Ambient LED Strip */}
        <polyline
          points={pts([project(7.3, 6.1 + 1.3, 28), project(7.3 + 3.2, 6.1 + 1.3, 28)])}
          stroke="#06b6d4"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 5px #06b6d4)" }}
        />

        {/* Datacenter Server Rack Blinking LED Clusters */}
        <g className="server-led-cluster">
          {/* Rack 1 (13.2, 1.2, h: 66) */}
          {[0, 1, 2, 3, 4, 5, 6].map((row) => {
            const ptL = project(13.2 + 1.2, 1.2 + 0.25, 20 + row * 6);
            const ptR = project(13.2 + 1.2, 1.2 + 0.75, 20 + row * 6);
            return (
              <g key={`rack1-led-${row}`}>
                <circle cx={ptL.x} cy={ptL.y} r={1.6} fill={row % 3 === 0 ? "#10b981" : row % 3 === 1 ? "#06b6d4" : "#f59e0b"} />
                <circle cx={ptR.x} cy={ptR.y} r={1.6} fill={row % 2 === 0 ? "#10b981" : "#38bdf8"} />
              </g>
            );
          })}
          {/* Rack 2 (14.9, 1.2, h: 66) */}
          {[0, 1, 2, 3, 4, 5, 6].map((row) => {
            const ptL = project(14.9 + 1.2, 1.2 + 0.25, 20 + row * 6);
            const ptR = project(14.9 + 1.2, 1.2 + 0.75, 20 + row * 6);
            return (
              <g key={`rack2-led-${row}`}>
                <circle cx={ptL.x} cy={ptL.y} r={1.6} fill={row % 2 === 0 ? "#10b981" : "#f59e0b"} />
                <circle cx={ptR.x} cy={ptR.y} r={1.6} fill={row % 3 === 0 ? "#38bdf8" : "#10b981"} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zone labels + ceiling lamps (upright) */}
      {ZONES.map((z) => {
        const p = project(z.labelGx, z.labelGy, 0);
        return (
          <div key={z.id} className="iso-zone-label" style={{ left: p.x, top: p.y }}>
            {z.label}
          </div>
        );
      })}

      {LAMPS.map((l) => {
        const glow = project(l.gx, l.gy, 0);
        const p = project(l.gx, l.gy, l.gz);
        return (
          <span key={l.id}>
            <span className="iso-lamp-glow" style={{ left: glow.x, top: glow.y }} />
            <span className="iso-lamp" style={{ left: p.x, top: p.y }}>
              <span className="iso-lamp-cord" />
              <span className="iso-lamp-shade" />
            </span>
          </span>
        );
      })}

      {/* Interactive screens */}
      {monitors.map((m) => {
        const p = project(m.gx, m.gy, m.gz);
        return (
          <button
            key={m.id}
            type="button"
            className="iso-screen"
            style={{ left: p.x, top: p.y, width: m.width, zIndex: Math.round((m.gx + m.gy) * 10) + 30 }}
            title={`Ampliar: ${m.modal.title}`}
            onClick={() => onOpenScreen(m.modal)}
          >
            <span className="iso-screen-frame">
              {m.modal.img ? <img src={m.modal.img} alt={m.modal.title} /> : <code>{m.modal.code?.split("\n").slice(0, 5).join("\n")}</code>}
            </span>
            <span className="iso-screen-badge">{m.badge}</span>
            <span className="iso-screen-stand" />
          </button>
        );
      })}
    </>
  );
});

export function OfficeScene({
  agents,
  poses = [],
  selectedId,
  projectName,
  isStandup = false,
  pan,
  zoom = 1,
  onSelect,
  onOpenScreen,
  antigravityLive,
}: OfficeSceneProps) {
  const [thoughtIdx, setThoughtIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setThoughtIdx((prev) => (prev + 1) % ANTIGRAVITY_REAL_THOUGHTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const currentThought = ANTIGRAVITY_REAL_THOUGHTS[thoughtIdx];

  const canvasStyle: React.CSSProperties = {
    width: SCENE_W,
    height: SCENE_H,
    ...(pan !== undefined
      ? {
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          left: 0,
          top: 0,
        }
      : {}),
  };

  return (
    <div className="iso-canvas" style={canvasStyle}>
      <IsoStatic projectName={projectName} onOpenScreen={onOpenScreen} />

      {/* Desk Status LEDs & Dynamic Glow */}
      {DESK_LEDS.map((led) => {
        const p = project(led.gx, led.gy, led.gz);
        const agent = agents.find((a) => a.id === led.agentId);
        const isWorking = agent?.status === "working";
        const isTelemetryAlert = led.agentId === "telemetry" && isWorking;
        const statusClass = isTelemetryAlert ? "is-alert" : isWorking ? "is-working" : "is-idle";
        return (
          <button
            key={led.id}
            type="button"
            className={`iso-desk-led ${statusClass}`}
            style={{ left: p.x, top: p.y, zIndex: Math.round((led.gx + led.gy) * 10) + 32 }}
            title={`${led.label} · Estado: ${isWorking ? "Activo (LED Verde)" : "Idle / Descanso (LED Ámbar)"}`}
            onClick={() => onSelect(led.agentId)}
          >
            <span className="iso-desk-led-halo" />
            <span className="iso-desk-led-bulb" />
          </button>
        );
      })}

      {agents.map((agent) => {
        const pose = (poses || []).find((p) => p.id === agent.id);
        if (!pose) return null;
        const p = project(pose.x, pose.y, 0);
        const isAntigravity = agent.id === "orchestrator";
        const antigravityWorking = antigravityLive ? antigravityLive.isWorking : agent.status === "working";
        const isWorking = isAntigravity ? antigravityWorking : agent.status === "working";
        const bubble = isStandup
          ? STANDUP_POSITIONS[agent.id]?.bubble || agent.bubble
          : isWorking
          ? (isAntigravity && antigravityLive ? `${antigravityLive.icon} ${antigravityLive.action}` : agent.bubble)
          : (isAntigravity && antigravityLive ? `${antigravityLive.icon} ${antigravityLive.action}` : agent.idleBubble || "Descansando");
        const walking = pose.action === "walk";
        const isOrchestratorThinking = isAntigravity && !isStandup && isWorking;

        const thoughtData = (isAntigravity && antigravityLive)
          ? {
              time: antigravityLive.timeLabel,
              icon: antigravityLive.icon,
              action: antigravityLive.action,
              detail: antigravityLive.detail,
              snippet: antigravityLive.thoughtSnippet,
            }
          : currentThought;

        return (
          <div
            key={agent.id}
            className={`iso-agent ${walking ? "is-walking" : ""} ${!walking && (isAntigravity ? isWorking : pose.action === "work") ? "is-working" : ""} ${
              !walking && !(isAntigravity ? isWorking : pose.action === "work") ? "is-resting" : ""
            } ${selectedId === agent.id ? "is-selected" : ""} ${isStandup ? "is-in-standup" : ""}`}
            style={{ left: p.x, top: p.y, zIndex: Math.round((pose.x + pose.y) * 10) + 40 }}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(agent.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(agent.id);
              }
            }}
          >
            {isOrchestratorThinking ? (
              <div className="iso-agent-bubble iso-antigravity-thinking-bubble">
                <div className="thought-badge-row">
                  <span className="thought-pulse-dot" />
                  <span className="thought-time">{thoughtData.time}</span>
                  <span className="thought-chevron">›</span>
                  <span className="thought-action">
                    {thoughtData.icon && <span className="thought-icon">{thoughtData.icon}</span>}
                    {thoughtData.action}
                  </span>
                </div>
                {thoughtData.detail && (
                  <div className="thought-detail-text">
                    {thoughtData.detail}
                  </div>
                )}
                {thoughtData.snippet && (
                  <div className="thought-detail-text" style={{ fontStyle: "italic", opacity: 0.85, marginTop: "3px", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "3px" }}>
                    💭 "{thoughtData.snippet}"
                  </div>
                )}
              </div>
            ) : (
              <span className="iso-agent-bubble">{bubble}</span>
            )}
            <span className="iso-agent-shadow" />
            <span className="iso-agent-flip" style={{ transform: pose.dir < 0 ? "scaleX(-1)" : "none" }}>
              <span className="iso-agent-figure">
                <AgentFigure
                  id={agent.id}
                  status={isAntigravity ? (isWorking ? "working" : "idle") : (pose.action === "work" ? "working" : "idle")}
                  size={58}
                />
              </span>
            </span>
            <span className="iso-agent-name">
              <strong>{agent.name}</strong>
              <small>{agent.employment}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
