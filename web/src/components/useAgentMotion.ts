import { useEffect, useRef, useState } from "react";
import type { OfficeAgent } from "../hooks/useTobiState";
import { ROUTES, STANDUP_POSITIONS, findPath, type Grid, type StopAction } from "./officeIso";

export interface AgentPose {
  id: string;
  x: number;
  y: number;
  dir: 1 | -1;
  action: "walk" | StopAction;
}

interface MotionState {
  x: number;
  y: number;
  path: Grid[];
  goalIdx: number;
  dwell: number;
  dir: 1 | -1;
  action: "walk" | StopAction;
  prevStandup?: boolean;
}

const SPEED = 2.7; // grid cells per second
const FALLBACK: Grid = { x: 9.5, y: 7.5 };

function dwellTime(action: StopAction): number {
  if (action === "work") return 5 + Math.random() * 4;
  if (action === "coffee") return 5 + Math.random() * 3;
  return 3 + Math.random() * 2.5;
}

export function useAgentMotion(agents: OfficeAgent[], isSimulating: boolean, isStandup = false): AgentPose[] {
  const store = useRef<Map<string, MotionState>>(new Map());
  const [poses, setPoses] = useState<AgentPose[]>([]);
  const lastT = useRef(0);
  const lastEmit = useRef(0);

  if (store.current.size === 0) {
    for (const a of agents) {
      const route = (a.status === "working" ? ROUTES[a.id]?.working : ROUTES[a.id]?.idle) || [];
      const start = route[0] ? { x: route[0].gx, y: route[0].gy } : FALLBACK;
      store.current.set(a.id, { x: start.x, y: start.y, path: [], goalIdx: 0, dwell: 0, dir: 1, action: "idle", prevStandup: false });
    }
  }

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (!lastT.current) lastT.current = t;
      const dt = Math.min(0.06, (t - lastT.current) / 1000);
      lastT.current = t;
      const speed = SPEED * (isSimulating ? 1.25 : 1);

      for (const a of agents) {
        const m = store.current.get(a.id);
        if (!m) continue;

        // Reset path when transitioning in or out of standup
        if (m.prevStandup !== isStandup) {
          m.prevStandup = isStandup;
          m.path = [];
          m.dwell = 0;
        }

        if (isStandup) {
          const standup = STANDUP_POSITIONS[a.id] || { gx: 9.6, gy: 10.4 };
          const distToStandup = Math.hypot(standup.gx - m.x, standup.gy - m.y);

          if (!m.path.length && distToStandup > 0.25) {
            m.path = findPath({ x: m.x, y: m.y }, { x: standup.gx, y: standup.gy });
          }

          if (m.path.length) {
            const next = m.path[0];
            const dx = next.x - m.x;
            const dy = next.y - m.y;
            const dist = Math.hypot(dx, dy);
            const stepLen = speed * dt;
            if (dist <= stepLen || dist === 0) {
              m.x = next.x;
              m.y = next.y;
              m.path.shift();
            } else {
              m.x += (dx / dist) * stepLen;
              m.y += (dy / dist) * stepLen;
            }
            const sdx = dx - dy;
            if (Math.abs(sdx) > 0.03) m.dir = sdx >= 0 ? 1 : -1;
            m.action = "walk";
          } else {
            m.action = "idle";
            // Face towards the center of the meeting table (approx gx 9.6)
            m.dir = m.x > 9.6 ? -1 : 1;
          }
          continue;
        }

        const route = (a.status === "working" ? ROUTES[a.id]?.working : ROUTES[a.id]?.idle) || ROUTES[a.id]?.working || [];
        if (!route.length) continue;
        const stop = route[m.goalIdx % route.length];

        if (!m.path.length && m.dwell <= 0) {
          if (Math.hypot(stop.gx - m.x, stop.gy - m.y) > 0.25) {
            m.path = findPath({ x: m.x, y: m.y }, { x: stop.gx, y: stop.gy });
          }
        }

        if (m.path.length) {
          const next = m.path[0];
          const dx = next.x - m.x;
          const dy = next.y - m.y;
          const dist = Math.hypot(dx, dy);
          const stepLen = speed * dt;
          if (dist <= stepLen || dist === 0) {
            m.x = next.x;
            m.y = next.y;
            m.path.shift();
          } else {
            m.x += (dx / dist) * stepLen;
            m.y += (dy / dist) * stepLen;
          }
          const sdx = dx - dy;
          if (Math.abs(sdx) > 0.03) m.dir = sdx >= 0 ? 1 : -1;
          m.action = "walk";
        } else {
          if (m.dwell <= 0) m.dwell = dwellTime(stop.act);
          m.action = stop.act;
          m.dwell -= dt;
          if (m.dwell <= 0) {
            m.goalIdx = (m.goalIdx + 1) % route.length;
            m.dwell = 0;
            m.path = [];
          }
        }
      }

      if (t - lastEmit.current > 40) {
        lastEmit.current = t;
        setPoses(
          agents.map((a) => {
            const m = store.current.get(a.id)!;
            return { id: a.id, x: m.x, y: m.y, dir: m.dir, action: m.action };
          })
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [agents, isSimulating, isStandup]);

  return poses;
}
