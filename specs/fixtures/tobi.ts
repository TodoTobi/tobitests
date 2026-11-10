import fs from 'fs';
import { test as baseTest, expect, type Request } from '@playwright/test';

export type TobiEvent =
  | { t: number; type: 'step-start' | 'step-end'; title: string; error?: string }
  | { t: number; type: 'console'; level: string; text: string }
  | { t: number; type: 'pageerror'; message: string; stack?: string }
  | { t: number; type: 'request'; id: number; method: string; url: string }
  | { t: number; type: 'response'; id: number; url: string; status: number; ms: number }
  | { t: number; type: 'requestfailed'; id: number; url: string; error: string }
  | { t: number; type: 'hung'; id: number; url: string; ms: number }
  | { t: number; type: 'websocket'; url: string; phase: 'open' | 'close' }
  | { t: number; type: 'snap'; name: string; file: string };

export interface Tobi {
  events: TobiEvent[];
  step<T>(title: string, fn: () => Promise<T>): Promise<T>;
  snap(name: string): Promise<void>;
  allowPageErrors(): void;
}

export const test = baseTest.extend<{ tobi: Tobi }>({
  tobi: [
    async ({ page }, use, testInfo) => {
      const t0 = performance.now();
      const now = () => Math.round(performance.now() - t0);

      const events: TobiEvent[] = [];
      let strictPageErrors = true;
      let requestIdCounter = 1;

      const requestMap = new Map<Request, { id: number; startMs: number; url: string }>();
      const pendingRequests = new Map<Request, { id: number; startMs: number; url: string }>();

      // Listeners sobre page
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
        allowPageErrors: () => {
          strictPageErrors = false;
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
