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

        {/* ============================================================ */}
        {/* NOC / SOC Operations Video Wall (Left Wall: gy 0.6 to 4.2)   */}
        {/* ============================================================ */}
        <g className="iso-noc-wall">
          {/* Bezel frame */}
          <polygon points={wallPanel("y", 0.5, 4.3, 53, 127)} fill="#0f172a" stroke="#334155" strokeWidth="2" />
          
          {/* Screen 1 (Top Left): Kubernetes Cluster Pod Matrix */}
          <polygon points={wallPanel("y", 0.65, 2.3, 92, 125)} fill="#030712" stroke="#1e293b" strokeWidth="1" />
          <text x={project(0, 0.8, 122).x} y={project(0, 0.8, 122).y} fill="#10b981" fontSize="5" fontFamily="monospace" fontWeight="bold">K8S CLUSTER: 24/24 PODS OK</text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => {
              const pt = project(0, 0.8 + c * 0.28, 115 - r * 8);
              return <circle key={`pod-${r}-${c}`} cx={pt.x} cy={pt.y} r={2} fill={r === 2 && c === 4 ? "#38bdf8" : "#10b981"} />;
            })
          )}

          {/* Screen 2 (Top Right): Global CDN & Low-Latency Edge Map */}
          <polygon points={wallPanel("y", 2.5, 4.15, 92, 125)} fill="#030712" stroke="#1e293b" strokeWidth="1" />
          <text x={project(0, 2.65, 122).x} y={project(0, 2.65, 122).y} fill="#38bdf8" fontSize="5" fontFamily="monospace" fontWeight="bold">EDGE CDN: LON 14ms · NYC 22ms</text>
          <polyline points={pts([project(0, 2.8, 110), project(0, 3.3, 106), project(0, 3.8, 112)])} stroke="#0284c7" strokeWidth="1" fill="none" strokeDasharray="2 1.5" />
          <circle cx={project(0, 2.8, 110).x} cy={project(0, 2.8, 110).y} r={2.2} fill="#38bdf8" />
          <circle cx={project(0, 3.3, 106).x} cy={project(0, 3.3, 106).y} r={2.2} fill="#10b981" />
          <circle cx={project(0, 3.8, 112).x} cy={project(0, 3.8, 112).y} r={2.2} fill="#f59e0b" />

          {/* Screen 3 (Bottom Left): Prometheus & Grafana Traffic Metrics Wave */}
          <polygon points={wallPanel("y", 0.65, 2.3, 56, 89)} fill="#030712" stroke="#1e293b" strokeWidth="1" />
          <text x={project(0, 0.8, 86).x} y={project(0, 0.8, 86).y} fill="#f59e0b" fontSize="5" fontFamily="monospace" fontWeight="bold">GRAFANA: 8.4k req/s · CPU 18%</text>
          <polyline
            points={pts([
              project(0, 0.75, 64),
              project(0, 1.0, 72),
              project(0, 1.3, 68),
              project(0, 1.6, 78),
              project(0, 1.9, 70),
              project(0, 2.2, 75),
            ])}
            stroke="#f59e0b"
            strokeWidth="1.5"
            fill="none"
          />
          <polyline
            points={pts([
              project(0, 0.75, 60),
              project(0, 1.0, 63),
              project(0, 1.3, 62),
              project(0, 1.6, 66),
              project(0, 1.9, 64),
              project(0, 2.2, 65),
            ])}
            stroke="#10b981"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Screen 4 (Bottom Right): SOC Cybersecurity & DDoS Firewall */}
          <polygon points={wallPanel("y", 2.5, 4.15, 56, 89)} fill="#030712" stroke="#1e293b" strokeWidth="1" />
          <text x={project(0, 2.65, 86).x} y={project(0, 2.65, 86).y} fill="#a855f7" fontSize="5" fontFamily="monospace" fontWeight="bold">SOC WAF: ZERO TRUST ACTIVE</text>
          <polygon points={pts([project(0, 3.3, 76), project(0, 3.45, 74), project(0, 3.45, 66), project(0, 3.3, 62), project(0, 3.15, 66), project(0, 3.15, 74)])} fill="#10b981" opacity="0.8" />
          <text x={project(0, 2.7, 62).x} y={project(0, 2.7, 62).y} fill="#94a3b8" fontSize="4.5" fontFamily="monospace">Blocked: 1,420 DDoS/hr</text>
        </g>

        {/* System Architecture Glass Whiteboard (Left Wall: gy 4.6 to 5.8) */}
        <g className="iso-architecture-whiteboard">
          <polygon points={wallPanel("y", 4.5, 5.85, 44, 108)} fill="#f8fafc" stroke="#64748b" strokeWidth="1.8" />
          <polygon points={wallPanel("y", 4.5, 5.85, 44, 47)} fill="#cbd5e1" />
          <text x={project(0, 4.65, 102).x} y={project(0, 4.65, 102).y} fill="#0f172a" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">Cloud Architecture</text>
          
          <polygon points={wallPanel("y", 4.65, 5.0, 84, 94)} fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.8" />
          <text x={project(0, 4.7, 89).x} y={project(0, 4.7, 89).y} fill="#1e3a8a" fontSize="3.8" fontFamily="monospace">API Gateway</text>
          
          <polygon points={wallPanel("y", 5.35, 5.75, 84, 94)} fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
          <text x={project(0, 5.4, 89).x} y={project(0, 5.4, 89).y} fill="#78350f" fontSize="3.8" fontFamily="monospace">Kafka Bus</text>

          <polyline points={pts([project(0, 5.0, 89), project(0, 5.35, 89)])} stroke="#3b82f6" strokeWidth="1" strokeDasharray="1.5 1" />

          <polygon points={wallPanel("y", 4.8, 5.6, 62, 74)} fill="#dcfce7" stroke="#10b981" strokeWidth="0.8" />
          <text x={project(0, 4.85, 68).x} y={project(0, 4.85, 68).y} fill="#065f46" fontSize="3.8" fontFamily="monospace">Postgres + Redis HA</text>
          
          {/* Sprint sticky notes */}
          <polygon points={wallPanel("y", 4.7, 4.95, 50, 58)} fill="#fde047" stroke="#eab308" strokeWidth="0.5" />
          <polygon points={wallPanel("y", 5.1, 5.35, 50, 58)} fill="#f472b6" stroke="#db2777" strokeWidth="0.5" />
          <polygon points={wallPanel("y", 5.5, 5.75, 50, 58)} fill="#38bdf8" stroke="#0284c7" strokeWidth="0.5" />
        </g>

        {/* Floor with rich warm gradient */}
        <polygon points={floor} fill="url(#isoFloor)" stroke="#cfc8b8" strokeWidth="1" />

        {/* Datacenter Raised Perforated Floor Grid (Suelo Técnico) */}
        <g className="datacenter-raised-floor">
          <polygon points={pts([project(10.5, 0.8, 0.5), project(16.7, 0.8, 0.5), project(16.7, 5.4, 0.5), project(10.5, 5.4, 0.5)])} fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="4 3" />
          {[1.4, 2.4, 3.4, 4.4].map((y) =>
            [11.0, 12.4, 13.8, 15.2].map((x) => (
              <polygon
                key={`vent-tile-${x}-${y}`}
                points={pts([project(x, y, 0.6), project(x + 0.95, y, 0.6), project(x + 0.95, y + 0.75, 0.6), project(x, y + 0.75, 0.6)])}
                fill="#1e293b"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
            ))
          )}
        </g>

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

        {/* Flush Floor Power & RJ45 Data Grommets */}
        {[
          { x: 2.2, y: 2.5 },
          { x: 5.5, y: 2.5 },
          { x: 3.8, y: 4.8 },
          { x: 7.2, y: 6.8 },
          { x: 10.6, y: 6.8 },
        ].map((grommet, i) => {
          const pt = project(grommet.x, grommet.y, 0.4);
          return (
            <g key={`grommet-${i}`} opacity={0.9}>
              <rect x={pt.x - 4} y={pt.y - 2.5} width="8" height="5" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
              <circle cx={pt.x - 1.5} cy={pt.y} r={0.8} fill="#38bdf8" />
              <circle cx={pt.x + 1.5} cy={pt.y} r={0.8} fill="#38bdf8" />
            </g>
          );
        })}

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

        {/* Datacenter Glass Security Partition with Biometric Scanner */}
        <g className="iso-datacenter-partition">
          <polygon points={pts([project(10.4, 0.6, 88), project(10.4, 5.4, 88), project(10.4, 5.4, 0), project(10.4, 0.6, 0)])} fill="rgba(6, 182, 212, 0.08)" stroke="#475569" strokeWidth="1.8" />
          <polyline points={pts([project(10.4, 0.6, 44), project(10.4, 5.4, 44)])} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
          <polyline points={pts([project(10.4, 0.6, 48), project(10.4, 5.4, 48)])} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.6" />
          {/* Sliding door mullion */}
          <polyline points={pts([project(10.4, 3.6, 88), project(10.4, 3.6, 0)])} stroke="#1e293b" strokeWidth="2.2" />
          {/* Biometric RFID badge access reader */}
          <rect x={project(10.4, 3.8, 38).x - 3} y={project(10.4, 3.8, 38).y - 6} width="6" height="12" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={project(10.4, 3.8, 38).x} cy={project(10.4, 3.8, 38).y - 2} r={1.6} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
        </g>

        {/* Central Command Desk Cyan Ambient LED Strip */}
        <polyline
          points={pts([project(7.3, 6.1 + 1.3, 28), project(7.3 + 3.2, 6.1 + 1.3, 28)])}
          stroke="#06b6d4"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 5px #06b6d4)" }}
        />

        {/* Datacenter 3-Rack Blinking LED Clusters & CRAC cooling indicator */}
        <g className="server-led-cluster">
          {/* CRAC Cooling Digital Temp Readout (10.6, 1.1) */}
          <rect x={project(10.6 + 0.9, 1.1 + 0.3, 48).x - 2} y={project(10.6 + 0.9, 1.1 + 0.3, 48).y - 4} width="16" height="7" rx="1" fill="#030712" stroke="#38bdf8" strokeWidth="0.6" />
          <text x={project(10.6 + 0.9, 1.1 + 0.3, 48).x} y={project(10.6 + 0.9, 1.1 + 0.3, 48).y + 1} fill="#38bdf8" fontSize="4.2" fontFamily="monospace">19.2°C</text>

          {/* Rack 1 (11.8, 1.1, h: 72) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
            const ptL = project(11.8 + 1.25, 1.1 + 0.25, 18 + row * 6.5);
            const ptR = project(11.8 + 1.25, 1.1 + 0.75, 18 + row * 6.5);
            return (
              <g key={`rack1-led-${row}`}>
                <circle cx={ptL.x} cy={ptL.y} r={1.6} fill={row % 3 === 0 ? "#10b981" : row % 3 === 1 ? "#06b6d4" : "#f59e0b"} />
                <circle cx={ptR.x} cy={ptR.y} r={1.6} fill={row % 2 === 0 ? "#10b981" : "#38bdf8"} />
              </g>
            );
          })}
          {/* Rack 2 (13.5, 1.1, h: 72) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
            const ptL = project(13.5 + 1.25, 1.1 + 0.25, 18 + row * 6.5);
            const ptR = project(13.5 + 1.25, 1.1 + 0.75, 18 + row * 6.5);
            return (
              <g key={`rack2-led-${row}`}>
                <circle cx={ptL.x} cy={ptL.y} r={1.6} fill={row % 2 === 0 ? "#10b981" : "#f59e0b"} />
                <circle cx={ptR.x} cy={ptR.y} r={1.6} fill={row % 3 === 0 ? "#38bdf8" : "#10b981"} />
              </g>
            );
          })}
          {/* Rack 3 (15.2, 1.1, h: 72) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
            const ptL = project(15.2 + 1.25, 1.1 + 0.25, 18 + row * 6.5);
            const ptR = project(15.2 + 1.25, 1.1 + 0.75, 18 + row * 6.5);
            return (
              <g key={`rack3-led-${row}`}>
                <circle cx={ptL.x} cy={ptL.y} r={1.6} fill={row % 3 === 0 ? "#38bdf8" : "#10b981"} />
                <circle cx={ptR.x} cy={ptR.y} r={1.6} fill={row % 2 === 0 ? "#f59e0b" : "#10b981"} />
              </g>
            );
          })}
        </g>

        {/* Overhead Yellow Fiber-Optic Ducts & Blue Cable Ladders */}
        <g className="overhead-fiber-trays">
          <polyline
            points={pts([
              project(15.0, 1.8, 145),
              project(10.5, 1.8, 145),
              project(8.9, 3.8, 145),
              project(8.9, 6.2, 145),
            ])}
            stroke="#f59e0b"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <polyline
            points={pts([
              project(15.0, 2.1, 144),
              project(10.5, 2.1, 144),
              project(8.6, 4.0, 144),
              project(8.6, 6.2, 144),
            ])}
            stroke="#0284c7"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />
        </g>

        {/* Enterprise Wi-Fi 7 Ceiling Access Points */}
        {[
          { x: 4.2, y: 3.2, z: 195 },
          { x: 13.5, y: 3.5, z: 195 },
          { x: 9.0, y: 8.8, z: 195 },
        ].map((ap, i) => {
          const pt = project(ap.x, ap.y, ap.z);
          return (
            <g key={`wifi-ap-${i}`} className="wifi-ap-node">
              <circle cx={pt.x} cy={pt.y} r={6.5} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <circle cx={pt.x} cy={pt.y} r={4} fill="#0f172a" />
              <circle cx={pt.x} cy={pt.y} r={2} fill="#38bdf8" style={{ filter: "drop-shadow(0 0 4px #38bdf8)" }} />
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
