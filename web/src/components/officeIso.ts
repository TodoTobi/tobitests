export const TILE = 40;
export const HALF = TILE / 2;
export const COLS = 18;
export const ROWS = 13;
export const WALL_H = 150;

export const OFFSET_X = ROWS * TILE;
export const OFFSET_Y = 180;

export const SCENE_W = (COLS + ROWS) * TILE;
export const SCENE_H = (COLS + ROWS) * HALF + OFFSET_Y + 20;

export interface Pt {
  x: number;
  y: number;
}

export interface Grid {
  x: number;
  y: number;
}

export function project(gx: number, gy: number, gz = 0): Pt {
  return { x: (gx - gy) * TILE + OFFSET_X, y: (gx + gy) * HALF + OFFSET_Y - gz };
}

export function pts(list: Pt[]): string {
  return list.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`).join(" ");
}

export interface BoxSpec {
  gx: number;
  gy: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
}

export function boxPolygons(b: BoxSpec) {
  const top = pts([
    project(b.gx, b.gy, b.h),
    project(b.gx + b.w, b.gy, b.h),
    project(b.gx + b.w, b.gy + b.d, b.h),
    project(b.gx, b.gy + b.d, b.h),
  ]);
  const left = pts([
    project(b.gx, b.gy + b.d, b.h),
    project(b.gx, b.gy + b.d, 0),
    project(b.gx + b.w, b.gy + b.d, 0),
    project(b.gx + b.w, b.gy + b.d, b.h),
  ]);
  const right = pts([
    project(b.gx + b.w, b.gy, b.h),
    project(b.gx + b.w, b.gy, 0),
    project(b.gx + b.w, b.gy + b.d, 0),
    project(b.gx + b.w, b.gy + b.d, b.h),
  ]);
  return { top, left, right };
}

export function rugPolygon(gx: number, gy: number, w: number, d: number, z = 0.4): string {
  return pts([
    project(gx, gy, z),
    project(gx + w, gy, z),
    project(gx + w, gy + d, z),
    project(gx, gy + d, z),
  ]);
}

export function wallPanel(axis: "x" | "y", a0: number, a1: number, z0: number, z1: number): string {
  const p = (a: number, z: number) => (axis === "x" ? project(a, 0, z) : project(0, a, z));
  return pts([p(a0, z1), p(a1, z1), p(a1, z0), p(a0, z0)]);
}

/* ------------------------------------------------------------------ */
/* Zones                                                              */
/* ------------------------------------------------------------------ */

export interface Zone {
  id: string;
  label: string;
  gx: number;
  gy: number;
  w: number;
  d: number;
  fill: string;
  stroke: string;
  floor: string;
  labelGx: number;
  labelGy: number;
}

export const ZONES: Zone[] = [
  { id: "dev", label: "ZONA DE DESARROLLO", gx: 0.6, gy: 0.6, w: 7.4, d: 5, fill: "rgba(86,150,232,.13)", stroke: "rgba(86,150,232,.4)", floor: "rgba(86,150,232,.05)", labelGx: 4.3, labelGy: 0.6 },
  { id: "infra", label: "SALA DE SERVIDORES", gx: 10.4, gy: 0.6, w: 6.6, d: 5, fill: "rgba(120,110,220,.13)", stroke: "rgba(120,110,220,.4)", floor: "rgba(120,110,220,.05)", labelGx: 14, labelGy: 0.6 },
  { id: "command", label: "MESA DE COMANDO CENTRAL", gx: 6.2, gy: 6, w: 5.6, d: 2.4, fill: "rgba(226,168,60,.15)", stroke: "rgba(226,168,60,.45)", floor: "rgba(226,168,60,.06)", labelGx: 9.1, labelGy: 8.7 },
  { id: "reception", label: "RECEPCIÓN / LOBBY", gx: 0.6, gy: 9.2, w: 4.8, d: 3, fill: "rgba(70,190,140,.13)", stroke: "rgba(70,190,140,.42)", floor: "rgba(70,190,140,.05)", labelGx: 3.2, labelGy: 12.5 },
  { id: "meeting", label: "SALA DE REUNIONES", gx: 6.4, gy: 9.2, w: 5.4, d: 3, fill: "rgba(93,120,240,.13)", stroke: "rgba(93,120,240,.42)", floor: "rgba(93,120,240,.05)", labelGx: 9.2, labelGy: 12.5 },
  { id: "break", label: "CAFETERÍA / BREAK ROOM", gx: 12.2, gy: 9.2, w: 5.4, d: 3, fill: "rgba(232,96,140,.13)", stroke: "rgba(232,96,140,.42)", floor: "rgba(232,96,140,.05)", labelGx: 15, labelGy: 12.5 },
];

/* ------------------------------------------------------------------ */
/* Static furniture (isometric boxes)                                 */
/* ------------------------------------------------------------------ */

export const FURNITURE: BoxSpec[] = [
  // --- Development zone: three wood desks ---
  { gx: 1.4, gy: 1.3, w: 1.7, d: 1.0, h: 26, top: "#e8d7bf", left: "#cbb69a", right: "#dcc8ac" },
  { gx: 4.7, gy: 1.3, w: 1.7, d: 1.0, h: 26, top: "#e8d7bf", left: "#cbb69a", right: "#dcc8ac" },
  { gx: 3.0, gy: 3.6, w: 1.7, d: 1.0, h: 26, top: "#e8d7bf", left: "#cbb69a", right: "#dcc8ac" },
  // keyboards / mice on desks + desk lamps
  { gx: 1.7, gy: 1.75, w: 0.7, d: 0.28, h: 30, top: "#3a4453", left: "#222a35", right: "#2b333d" },
  { gx: 5.0, gy: 1.75, w: 0.7, d: 0.28, h: 30, top: "#3a4453", left: "#222a35", right: "#2b333d" },
  { gx: 3.3, gy: 4.05, w: 0.7, d: 0.28, h: 30, top: "#3a4453", left: "#222a35", right: "#2b333d" },
  { gx: 2.9, gy: 1.55, w: 0.55, d: 0.4, h: 31, top: "#fff7e6", left: "#d9c9a6", right: "#e9dcc0" },
  // chairs (kept out of the collision grid — they are low)
  { gx: 1.85, gy: 2.65, w: 0.7, d: 0.7, h: 15, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },
  { gx: 5.15, gy: 2.65, w: 0.7, d: 0.7, h: 15, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },
  { gx: 3.45, gy: 4.95, w: 0.7, d: 0.7, h: 15, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },
  // filing cabinets against the wall
  { gx: 7.6, gy: 0.7, w: 0.9, d: 0.9, h: 42, top: "#cfd6de", left: "#9aa6b2", right: "#b3bec9" },
  { gx: 8.7, gy: 0.7, w: 0.9, d: 0.9, h: 42, top: "#cfd6de", left: "#9aa6b2", right: "#b3bec9" },

  // --- Server room: two racks + telemetry console ---
  { gx: 13.2, gy: 1.2, w: 1.2, d: 1.0, h: 66, top: "#3a4453", left: "#20272f", right: "#2b333d" },
  { gx: 14.9, gy: 1.2, w: 1.2, d: 1.0, h: 66, top: "#3a4453", left: "#20272f", right: "#2b333d" },
  { gx: 12.2, gy: 3.2, w: 1.7, d: 1.0, h: 26, top: "#cdd9e8", left: "#a9bccf", right: "#bccddf" },
  { gx: 12.5, gy: 3.65, w: 0.7, d: 0.28, h: 30, top: "#3a4453", left: "#222a35", right: "#2b333d" },
  { gx: 13.05, gy: 4.55, w: 0.7, d: 0.7, h: 15, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },

  // --- Central command desk ---
  { gx: 7.3, gy: 6.1, w: 3.2, d: 1.3, h: 28, top: "#cdd9e8", left: "#a9bccf", right: "#bccddf" },
  { gx: 8.9, gy: 7.75, w: 0.8, d: 0.8, h: 17, top: "#6b7cff", left: "#4a58c8", right: "#5a6ae0" },

  // --- Reception ---
  { gx: 1.4, gy: 9.5, w: 2.7, d: 0.8, h: 32, top: "#f1f3f6", left: "#c9d0d8", right: "#dde3ea" },
  { gx: 1.8, gy: 9.75, w: 0.6, d: 0.35, h: 40, top: "#111827", left: "#0b1220", right: "#1f2937" },
  { gx: 0.9, gy: 8.7, w: 0.6, d: 0.6, h: 34, top: "#6fbf8f", left: "#d9b98f", right: "#e4c9a4" },
  { gx: 4.4, gy: 11.6, w: 0.5, d: 0.5, h: 22, top: "#dfe4ea", left: "#9aa6b2", right: "#b3bec9" },

  // --- Meeting room: table + chairs ---
  { gx: 8.3, gy: 9.6, w: 2.7, d: 1.6, h: 23, top: "#e9d5ba", left: "#c9b294", right: "#dcc7aa" },
  { gx: 8.7, gy: 9.0, w: 0.6, d: 0.6, h: 14, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },
  { gx: 10.0, gy: 10.9, w: 0.6, d: 0.6, h: 14, top: "#8b97c9", left: "#5f6cae", right: "#7481bf" },
  { gx: 8.9, gy: 10.1, w: 0.7, d: 0.4, h: 25, top: "#cfd6de", left: "#9aa6b2", right: "#b3bec9" },

  // --- Break room ---
  { gx: 15.3, gy: 9.2, w: 0.9, d: 0.7, h: 44, top: "#f4f6f9", left: "#c9d0d8", right: "#dde3ea" },
  { gx: 13.4, gy: 10.4, w: 1.8, d: 0.8, h: 24, top: "#7d8cff", left: "#4a58c8", right: "#5a6ae0" },
  { gx: 14.0, gy: 9.9, w: 1.1, d: 0.6, h: 12, top: "#e9d5ba", left: "#c9b294", right: "#dcc7aa" },
  { gx: 16.4, gy: 10.6, w: 0.6, d: 0.6, h: 32, top: "#6fbf8f", left: "#d9b98f", right: "#e4c9a4" },
  { gx: 12.5, gy: 11.5, w: 0.6, d: 0.6, h: 32, top: "#6fbf8f", left: "#d9b98f", right: "#e4c9a4" },

  // corridor props: plants, water cooler, bins
  { gx: 6.0, gy: 5.1, w: 0.6, d: 0.6, h: 34, top: "#6fbf8f", left: "#d9b98f", right: "#e4c9a4" },
  { gx: 11.4, gy: 8.4, w: 0.6, d: 0.6, h: 34, top: "#6fbf8f", left: "#d9b98f", right: "#e4c9a4" },
  { gx: 7.2, gy: 8.5, w: 0.5, d: 0.5, h: 30, top: "#dff0ff", left: "#9ec7e8", right: "#b9d9f2" },
  { gx: 5.4, gy: 6.2, w: 0.45, d: 0.45, h: 16, top: "#c3ccd6", left: "#8f9aa6", right: "#a7b2bd" },
  { gx: 12.0, gy: 5.4, w: 0.45, d: 0.45, h: 16, top: "#c3ccd6", left: "#8f9aa6", right: "#a7b2bd" },
];

/* ------------------------------------------------------------------ */
/* Interactive screens (upright billboards)                           */
/* ------------------------------------------------------------------ */

export interface ScreenModal {
  title: string;
  img?: string;
  code?: string;
  agentName: string;
  details: string;
  viewport: string;
  associatedSpec: string;
}

export interface MonitorSpec {
  id: string;
  gx: number;
  gy: number;
  gz: number;
  width: number;
  badge: string;
  modal: ScreenModal;
}

export const MONITORS: MonitorSpec[] = [
  { id: "m-explorer", gx: 2.25, gy: 1.85, gz: 26, width: 104, badge: "1280x800", modal: { title: "Explorer QA — Formulario de Login de VetConnect", img: "/evidence/runs/02-login-inspection.png", agentName: "Explorer QA", details: "Inspección del árbol de accesibilidad en /login y validación de los campos email y contraseña.", viewport: "1280x800 · Chromium Headless", associatedSpec: "specs/vetconnect-auth.spec.ts" } },
  { id: "m-writer", gx: 5.55, gy: 1.85, gz: 26, width: 104, badge: "SPEC .TS", modal: { title: "Spec Writer — vetconnect-auth.spec.ts", code: "test('redirects unauthenticated', async () => {\n  await page.goto('/client/dashboard');\n  await expect(page).toHaveURL(/\\/login/);\n});", agentName: "Spec Writer", details: "Compilación de la suite Playwright con 4 casos E2E sobre el flujo de autenticación.", viewport: "Editor · 4 tests OK", associatedSpec: "specs/vetconnect-auth.spec.ts" } },
  { id: "m-security", gx: 3.85, gy: 4.15, gz: 26, width: 104, badge: "ROLES", modal: { title: "RBAC Hunter — Redirección Forzada por Rol", img: "/evidence/runs/03-rbac-guard-redirect.png", agentName: "RBAC Security Hunter", details: "Auditoría de protección de endpoints. Acceso a /vet/dashboard bloqueado sin credenciales.", viewport: "1280x800 · Security Probe", associatedSpec: "specs/vetconnect-auth.spec.ts" } },
  { id: "m-telemetry", gx: 13.1, gy: 3.75, gz: 26, width: 104, badge: "CDP TRACE", modal: { title: "Telemetry Auditor — Traza de Divergencia (BUG-01)", img: "/evidence/bugs/bug-01-divergence-evidence.png", agentName: "Telemetry Auditor", details: "Desagregación de la red y consola: desincronización de estado entre Mensajes y Mascotas.", viewport: "1280x800 · Chrome CDP Network Log", associatedSpec: "specs/vetconnect-appointments.spec.ts" } },
  { id: "m-orchestrator", gx: 8.9, gy: 6.75, gz: 28, width: 128, badge: "ORQUESTANDO 4", modal: { title: "Antigravity — Comprobación de Guardias de Rutas", img: "/evidence/runs/03-rbac-guard-redirect.png", agentName: "Antigravity Orchestrator", details: "Redirección automática de /client/dashboard a /login cuando no existe sesión activa.", viewport: "1280x800 · Auth Guard Check", associatedSpec: "specs/vetconnect-auth.spec.ts" } },
];

/* ------------------------------------------------------------------ */
/* Ceiling lamps (decorative billboards)                              */
/* ------------------------------------------------------------------ */

export interface Lamp {
  id: string;
  gx: number;
  gy: number;
  gz: number;
}

export const LAMPS: Lamp[] = [
  { id: "l1", gx: 3.6, gy: 3.4, gz: 205 },
  { id: "l2", gx: 13.2, gy: 3.4, gz: 205 },
  { id: "l3", gx: 9.1, gy: 10.4, gz: 205 },
  { id: "l4", gx: 3.2, gy: 10.6, gz: 205 },
];

/* ------------------------------------------------------------------ */
/* Agent movement: waypoints, routes and pathfinding                  */
/* ------------------------------------------------------------------ */

export type StopAction = "work" | "coffee" | "idle";

export interface Stop {
  gx: number;
  gy: number;
  act: StopAction;
}

const S = (gx: number, gy: number, act: StopAction): Stop => ({ gx, gy, act });

export const ROUTES: Record<string, { working: Stop[]; idle: Stop[] }> = {
  orchestrator: {
    working: [
      S(8.5, 7.5, "work"),
      S(2.5, 3.5, "idle"),
      S(8.5, 7.5, "work"),
      S(13.5, 4.5, "idle"),
      S(8.5, 7.5, "work"),
      S(5.5, 3.5, "idle"),
      S(8.5, 7.5, "work"),
      S(3.5, 5.5, "idle"),
    ],
    idle: [S(8.5, 7.5, "idle"), S(14.5, 11.5, "coffee"), S(3.5, 10.5, "coffee")],
  },
  explorer: {
    working: [S(2.5, 3.5, "work"), S(1.5, 5.5, "idle"), S(2.5, 3.5, "work")],
    idle: [S(2.5, 3.5, "idle"), S(3.5, 10.5, "coffee")],
  },
  telemetry: {
    working: [S(13.5, 2.5, "work"), S(13.5, 4.5, "work"), S(13.5, 2.5, "work")],
    idle: [S(13.5, 4.5, "idle"), S(14.5, 11.5, "coffee")],
  },
  writer: {
    working: [S(5.5, 3.5, "work"), S(9.5, 11.5, "idle"), S(5.5, 3.5, "work")],
    idle: [S(5.5, 3.5, "idle"), S(9.5, 11.5, "coffee")],
  },
  security: {
    working: [S(2.5, 8.5, "idle"), S(16.5, 8.5, "idle"), S(16.5, 5.5, "idle"), S(6.5, 8.5, "idle")],
    idle: [S(2.5, 8.5, "idle"), S(14.5, 11.5, "coffee")],
  },
};

/* ------------------------------------------------------------------ */
/* Collision grid + A* pathfinding                                    */
/* ------------------------------------------------------------------ */

const BLOCKED: boolean[][] = (() => {
  const grid = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  for (const f of FURNITURE) {
    if (f.h < 18) continue; // low props (chairs, bins) are walkable
    const x0 = Math.max(0, Math.floor(f.gx - 0.12));
    const x1 = Math.min(COLS - 1, Math.ceil(f.gx + f.w + 0.12) - 1);
    const y0 = Math.max(0, Math.floor(f.gy - 0.12));
    const y1 = Math.min(ROWS - 1, Math.ceil(f.gy + f.d + 0.12) - 1);
    for (let i = x0; i <= x1; i += 1) for (let j = y0; j <= y1; j += 1) grid[j][i] = true;
  }
  return grid;
})();

function isFree(i: number, j: number): boolean {
  if (i < 0 || j < 0 || i >= COLS || j >= ROWS) return false;
  return !BLOCKED[j][i];
}

function nearestFree(i: number, j: number): [number, number] {
  if (isFree(i, j)) return [i, j];
  for (let r = 1; r < 8; r += 1) {
    for (let di = -r; di <= r; di += 1) {
      for (let dj = -r; dj <= r; dj += 1) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        if (isFree(i + di, j + dj)) return [i + di, j + dj];
      }
    }
  }
  return [i, j];
}

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export function findPath(from: Grid, to: Grid): Grid[] {
  const [si, sj] = nearestFree(Math.floor(from.x), Math.floor(from.y));
  let [gi, gj] = nearestFree(Math.floor(to.x), Math.floor(to.y));
  const key = (i: number, j: number) => j * COLS + i;
  const open: number[] = [key(si, sj)];
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>([[key(si, sj), 0]]);
  const h = (i: number, j: number) => Math.hypot(i - gi, j - gj);
  const fScore = new Map<number, number>([[key(si, sj), h(si, sj)]]);
  const seen = new Set<number>();

  while (open.length) {
    let bestIdx = 0;
    for (let k = 1; k < open.length; k += 1) {
      if ((fScore.get(open[k]) ?? Infinity) < (fScore.get(open[bestIdx]) ?? Infinity)) bestIdx = k;
    }
    const current = open.splice(bestIdx, 1)[0];
    const ci = current % COLS;
    const cj = Math.floor(current / COLS);
    if (ci === gi && cj === gj) {
      const path: Grid[] = [];
      let node = current;
      while (cameFrom.has(node)) {
        path.unshift({ x: (node % COLS) + 0.5, y: Math.floor(node / COLS) + 0.5 });
        node = cameFrom.get(node)!;
      }
      return path;
    }
    seen.add(current);
    for (const [di, dj] of DIRS) {
      const ni = ci + di;
      const nj = cj + dj;
      if (!isFree(ni, nj)) continue;
      if (di !== 0 && dj !== 0 && (!isFree(ci + di, cj) || !isFree(ci, cj + dj))) continue;
      const nk = key(ni, nj);
      const tentative = (gScore.get(current) ?? Infinity) + (di !== 0 && dj !== 0 ? 1.414 : 1);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current);
        gScore.set(nk, tentative);
        fScore.set(nk, tentative + h(ni, nj));
        if (!open.includes(nk)) open.push(nk);
      }
    }
  }
  return [{ x: gi + 0.5, y: gj + 0.5 }];
}
