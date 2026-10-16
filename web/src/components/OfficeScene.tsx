import { memo } from "react";
import { AgentFigure } from "./OfficeCharacters";
import type { OfficeAgent } from "../hooks/useTobiState";
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
          <linearGradient id="isoFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f2ec" />
            <stop offset="100%" stopColor="#e7e4dc" />
          </linearGradient>
          <linearGradient id="isoWallL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8f6f1" />
            <stop offset="100%" stopColor="#ebe8e0" />
          </linearGradient>
          <linearGradient id="isoWallR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f2ec" />
            <stop offset="100%" stopColor="#e2dfd6" />
          </linearGradient>
          <linearGradient id="isoGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4e6e0" />
            <stop offset="100%" stopColor="#eaf3ef" />
          </linearGradient>
        </defs>

        {/* Walls */}
        <polygon points={wallLeft} fill="url(#isoWallL)" stroke="#d9d5ca" strokeWidth="1" />
        <polygon points={wallRight} fill="url(#isoWallR)" stroke="#d9d5ca" strokeWidth="1" />

        {/* Windows */}
        {RIGHT_WINDOWS.map(([a, b], i) => (
          <g key={`rw${i}`}>
            <polygon points={wallPanel("x", a, b, 64, 116)} fill="url(#isoGlass)" stroke="#9fbfb0" strokeWidth="2" />
            <polyline points={pts([project((a + b) / 2, 0, 116), project((a + b) / 2, 0, 64)])} fill="none" stroke="#9fbfb0" strokeWidth="1.5" />
            <polyline points={pts([project(a, 0, 90), project(b, 0, 90)])} fill="none" stroke="#9fbfb0" strokeWidth="1.5" />
          </g>
        ))}
        {LEFT_WINDOWS.map(([a, b], i) => (
          <g key={`lw${i}`}>
            <polygon points={wallPanel("y", a, b, 64, 116)} fill="url(#isoGlass)" stroke="#9fbfb0" strokeWidth="2" />
            <polyline points={pts([project(0, (a + b) / 2, 116), project(0, (a + b) / 2, 64)])} fill="none" stroke="#9fbfb0" strokeWidth="1.5" />
            <polyline points={pts([project(0, a, 90), project(0, b, 90)])} fill="none" stroke="#9fbfb0" strokeWidth="1.5" />
          </g>
        ))}

        {/* Wall sign (TobiTests mark) on the right wall */}
        <g>
          <polygon points={wallPanel("x", 13.4, 16.4, 70, 122)} fill="#eaf4ee" stroke="#b8dcc6" strokeWidth="1.5" />
          <polygon points={wallPanel("x", 13.9, 14.3, 82, 112)} fill="#1f9d63" />
          <polygon points={wallPanel("x", 14.6, 14.9, 82, 112)} fill="#1f9d63" />
          <polygon points={wallPanel("x", 15.2, 16.0, 90, 112)} fill="#1f9d63" />
        </g>

        {/* Exit sign */}
        <polygon points={wallPanel("x", 17.0, 17.6, 96, 110)} fill="#2a7d3f" stroke="#ffffff" strokeWidth="1" />

        {/* Wall clock */}
        <g>
          <circle cx={project(0, 4.9, 104).x} cy={project(0, 4.9, 104).y} r={15} fill="#ffffff" stroke="#cfccc2" strokeWidth="3" />
          <line x1={project(0, 4.9, 104).x} y1={project(0, 4.9, 104).y} x2={project(0, 4.9, 104).x} y2={project(0, 4.9, 104).y - 8} stroke="#334155" strokeWidth="2" />
          <line x1={project(0, 4.9, 104).x} y1={project(0, 4.9, 104).y} x2={project(0, 4.9, 104).x + 6} y2={project(0, 4.9, 104).y} stroke="#334155" strokeWidth="2" />
        </g>

        {/* Floor */}
        <polygon points={floor} fill="url(#isoFloor)" stroke="#d9d5ca" strokeWidth="1" />
        {gridLines.map((l) => (
          <polyline key={l.key} points={l.points} fill="none" stroke="rgba(120,140,160,.13)" strokeWidth="1" />
        ))}

        {/* Zone rugs */}
        {ZONES.map((z) => (
          <g key={z.id}>
            <polygon points={rugPolygon(z.gx, z.gy, z.w, z.d, 0.4)} fill={z.floor} />
            <polygon points={rugPolygon(z.gx, z.gy, z.w, z.d, 0.6)} fill={z.fill} stroke={z.stroke} strokeWidth="1.5" strokeDasharray="6 5" />
          </g>
        ))}

        {/* Furniture (painter's order) */}
        {orderedFurniture.map((b, i) => {
          const p = boxPolygons(b);
          return (
            <g key={i}>
              <polygon points={p.left} fill={b.left} />
              <polygon points={p.right} fill={b.right} />
              <polygon points={p.top} fill={b.top} stroke="rgba(0,0,0,.06)" strokeWidth="1" />
            </g>
          );
        })}
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
}: OfficeSceneProps) {
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
        const isWorking = agent.status === "working";
        const bubble = isStandup
          ? STANDUP_POSITIONS[agent.id]?.bubble || agent.bubble
          : isWorking
          ? agent.bubble
          : agent.idleBubble || "Descansando";
        const walking = pose.action === "walk";
        return (
          <div
            key={agent.id}
            className={`iso-agent ${walking ? "is-walking" : ""} ${!walking && pose.action === "work" ? "is-working" : ""} ${
              !walking && pose.action !== "work" ? "is-resting" : ""
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
            <span className="iso-agent-bubble">{bubble}</span>
            <span className="iso-agent-shadow" />
            <span className="iso-agent-flip" style={{ transform: pose.dir < 0 ? "scaleX(-1)" : "none" }}>
              <span className="iso-agent-figure">
                <AgentFigure id={agent.id} status={pose.action === "work" ? "working" : "idle"} size={58} />
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
