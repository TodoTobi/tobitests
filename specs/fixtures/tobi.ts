import fs from 'fs';
import { test as baseTest, expect, type Request, type Locator } from '@playwright/test';

export type TobiEvent =
  | { t: number; type: 'clock'; epochMs: number }
  | { t: number; type: 'step-start' | 'step-end'; title: string; error?: string }
  | { t: number; type: 'console'; level: string; text: string }
  | { t: number; type: 'pageerror'; message: string; stack?: string }
  | { t: number; type: 'request'; id: number; method: string; url: string }
  | { t: number; type: 'response'; id: number; url: string; status: number; ms: number }
  | { t: number; type: 'requestfailed'; id: number; url: string; error: string }
  | { t: number; type: 'hung'; id: number; url: string; ms: number }
  | { t: number; type: 'websocket'; url: string; phase: 'open' | 'close' }
  | { t: number; type: 'snap'; name: string; file: string }
  | { t: number; type: 'navigation'; url: string }
  | { t: number; type: 'touch'; target: string };

export interface Tobi {
  events: TobiEvent[];
  step<T>(title: string, fn: () => Promise<T>): Promise<T>;
  snap(name: string): Promise<void>;
  touch: (target: string) => void;
  allowPageErrors(): void;
  humanMove(x: number, y: number, steps?: number): Promise<void>;
  humanClick(target: Locator | string, options?: { delayBefore?: number; delayAfter?: number }): Promise<void>;
  humanType(target: Locator | string, text: string, options?: { delayPerChar?: number }): Promise<void>;
}

export const test = baseTest.extend<{ tobi: Tobi }>({
  tobi: [
    async ({ page }, use, testInfo) => {
      const t0 = performance.now();
      const now = () => Math.round(performance.now() - t0);
      const startEpochMs = Date.now();

      const events: TobiEvent[] = [
        { t: 0, type: 'clock', epochMs: startEpochMs },
      ];
      let strictPageErrors = true;
      let requestIdCounter = 1;

      const requestMap = new Map<Request, { id: number; startMs: number; url: string }>();
      const pendingRequests = new Map<Request, { id: number; startMs: number; url: string }>();

      // Listeners sobre page
      await page.route('**/api/stream*', (route) => route.abort());
      await page.route('**/api/antigravity/live', (route) => route.abort());
      await page.route('**/data/antigravity-live.json', (route) => route.abort());

      // Inyección del Virtual Ghost Cursor (simulación de usuario humano en DOM y videos E2E)
      await page.addInitScript(() => {
        if ((window as any).__tobiCursorInstalled) return;
        (window as any).__tobiCursorInstalled = true;

        const installCursor = () => {
          if (document.getElementById('tobi-virtual-cursor')) return;

          const style = document.createElement('style');
          style.id = 'tobi-cursor-styles';
          style.textContent = `
            #tobi-virtual-cursor {
              position: fixed;
              top: 0;
              left: 0;
              width: 24px;
              height: 24px;
              pointer-events: none !important;
              user-select: none !important;
              z-index: 2147483647;
              transform: translate(-100px, -100px);
              transition: transform 0.04s ease-out, opacity 0.2s ease;
              opacity: 0;
            }
            #tobi-virtual-cursor.active {
              opacity: 1;
            }
            #tobi-virtual-cursor svg {
              display: block;
              width: 22px;
              height: 22px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
            }
            .tobi-click-ripple {
              position: fixed;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              border: 2px solid #246a48;
              background: rgba(36, 106, 72, 0.25);
              pointer-events: none !important;
              user-select: none !important;
              z-index: 2147483646;
              transform: translate(-50%, -50%) scale(0.4);
              animation: tobiRippleAnim 0.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes tobiRippleAnim {
              0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
            }
          `;
          document.head.appendChild(style);

          const cursor = document.createElement('div');
          cursor.id = 'tobi-virtual-cursor';
          cursor.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 3.5L10 20.5L13 13.5L20 10.5L4 3.5Z" fill="#246a48" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
              <circle cx="13" cy="13.5" r="1.5" fill="#ffffff" />
            </svg>
          `;
          document.documentElement.appendChild(cursor);

          window.addEventListener('mousemove', (e) => {
            cursor.classList.add('active');
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          }, { passive: true, capture: true });

          window.addEventListener('mousedown', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'tobi-click-ripple';
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            document.documentElement.appendChild(ripple);
            setTimeout(() => ripple.remove(), 400);
          }, { passive: true, capture: true });
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', installCursor);
        } else {
          installCursor();
        }
      });

      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          events.push({
            t: now(),
            type: 'navigation',
            url: frame.url(),
          });
        }
      });

      page.on('console', (msg) => {
        events.push({
          t: now(),
          type: 'console',
          level: msg.type(),
          text: msg.text(),
        });
      });

      page.on('pageerror', (err) => {
        events.push({
          t: now(),
          type: 'pageerror',
          message: err.message || String(err),
          stack: err.stack,
        });
      });

      page.on('request', (req) => {
        const id = requestIdCounter++;
        const t = now();
        const info = { id, startMs: t, url: req.url() };
        requestMap.set(req, info);
        pendingRequests.set(req, info);
        events.push({
          t,
          type: 'request',
          id,
          method: req.method(),
          url: req.url(),
        });
      });

      page.on('response', (res) => {
        const req = res.request();
        const tracked = requestMap.get(req);
        const t = now();
        const ms = tracked ? t - tracked.startMs : 0;
        const id = tracked ? tracked.id : 0;
        events.push({
          t,
          type: 'response',
          id,
          url: res.url(),
          status: res.status(),
          ms,
        });
      });

      page.on('requestfailed', (req) => {
        pendingRequests.delete(req);
        const tracked = requestMap.get(req);
        const t = now();
        const id = tracked ? tracked.id : 0;
        events.push({
          t,
          type: 'requestfailed',
          id,
          url: req.url(),
          error: req.failure()?.errorText || 'Unknown failure',
        });
      });

      page.on('requestfinished', (req) => {
        pendingRequests.delete(req);
      });

      page.on('websocket', (ws) => {
        events.push({
          t: now(),
          type: 'websocket',
          url: ws.url(),
          phase: 'open',
        });
        ws.on('close', () => {
          events.push({
            t: now(),
            type: 'websocket',
            url: ws.url(),
            phase: 'close',
          });
        });
      });

      let snapCounter = 1;
      const snap = async (name: string): Promise<void> => {
        const count = snapCounter++;
        const safeName = name.replace(/[^a-z0-9_-]/gi, '_');
        const filename = `snap-${count}-${safeName}.png`;
        const filePath = testInfo.outputPath(filename);
        await page.screenshot({ path: filePath });
        await testInfo.attach(`snap-${count}-${name}`, {
          path: filePath,
          contentType: 'image/png',
        });
        events.push({
          t: now(),
          type: 'snap',
          name,
          file: filePath,
        });
      };

      const step = async <T>(title: string, fn: () => Promise<T>): Promise<T> => {
        const startT = now();
        events.push({ t: startT, type: 'step-start', title });
        try {
          const res = await baseTest.step(title, fn);
          const endT = now();
          events.push({ t: endT, type: 'step-end', title });
          return res;
        } catch (err: any) {
          const endT = now();
          events.push({
            t: endT,
            type: 'step-end',
            title,
            error: String(err?.message || err),
          });
          throw err;
        }
      };

      const tobiInstance: Tobi = {
        events,
        step,
        snap,
        touch: (target: string) => {
          events.push({
            t: now(),
            type: 'touch',
            target,
          });
        },
        allowPageErrors: () => {
          strictPageErrors = false;
        },
        humanMove: async (x: number, y: number, steps = 10) => {
          await page.mouse.move(x, y, { steps });
        },
        humanClick: async (target: Locator | string, options?: { delayBefore?: number; delayAfter?: number }) => {
          const loc = typeof target === 'string' ? page.locator(target).first() : target.first();
          await loc.waitFor({ state: 'visible', timeout: 8000 });
          const box = await loc.boundingBox();
          if (box) {
            const targetX = box.x + box.width * (0.45 + Math.random() * 0.1);
            const targetY = box.y + box.height * (0.45 + Math.random() * 0.1);
            await page.mouse.move(targetX, targetY, { steps: 8 });
            await page.waitForTimeout(options?.delayBefore ?? 60);
            await page.mouse.down();
            await page.waitForTimeout(40);
            await page.mouse.up();
            await page.waitForTimeout(options?.delayAfter ?? 40);
          } else {
            await loc.click();
          }
        },
        humanType: async (target: Locator | string, text: string, options?: { delayPerChar?: number }) => {
          const loc = typeof target === 'string' ? page.locator(target).first() : target.first();
          await loc.waitFor({ state: 'visible', timeout: 8000 });
          await tobiInstance.humanClick(loc);
          await loc.pressSequentially(text, { delay: options?.delayPerChar ?? 50 });
        },
      };

      // Ejecutar el cuerpo del test
      await use(tobiInstance);

      // Teardown: detectar hung requests (> 3000ms sin respuesta)
      const endT = now();
      for (const [_, item] of pendingRequests) {
        const elapsed = endT - item.startMs;
        if (elapsed > 3000) {
          events.push({
            t: endT,
            type: 'hung',
            id: item.id,
            url: item.url,
            ms: elapsed,
          });
        }
      }

      // Escribir y adjuntar tobi-telemetry.jsonl
      const jsonlContent = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
      const telemetryPath = testInfo.outputPath('tobi-telemetry.jsonl');
      fs.writeFileSync(telemetryPath, jsonlContent, 'utf8');
      await testInfo.attach('tobi-telemetry', {
        path: telemetryPath,
        contentType: 'application/x-ndjson',
      });

      // Política estricta por defecto (salvo TOBI_STRICT_L1=0 o allowPageErrors())
      const strictDisabled = process.env.TOBI_STRICT_L1 === '0' || !strictPageErrors;
      if (!strictDisabled) {
        const baseURL = testInfo.project.use.baseURL || '';
        let baseOrigin = '';
        try {
          if (baseURL) {
            baseOrigin = new URL(baseURL).origin;
          }
        } catch (e) {}

        const violations: TobiEvent[] = [];
        for (const e of events) {
          if (e.type === 'pageerror') {
            violations.push(e);
          } else if (e.type === 'response' && e.status >= 500) {
            try {
              if (!baseOrigin || new URL(e.url).origin === baseOrigin) {
                violations.push(e);
              }
            } catch (err) {}
          }
        }

        if (violations.length > 0) {
          const sample = violations
            .slice(0, 5)
            .map((e) => {
              if (e.type === 'pageerror') return `[pageerror] ${e.message}`;
              if (e.type === 'response') return `[response ${e.status}] ${e.url}`;
              return JSON.stringify(e);
            })
            .join('\n  ');
          throw new Error(
            `[Tobi Strict Policy L1] Found ${violations.length} violation(s):\n  ${sample}`
          );
        }
      }
    },
    { auto: true },
  ],
});

export { expect };
