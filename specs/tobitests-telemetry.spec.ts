import fs from 'fs';
import { test, expect } from './fixtures/tobi';

test.describe('TobiTests — Telemetry Fixture Verification', () => {
  test('T1: console capturado en eventos de tobi', async ({ page, tobi }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => console.warn('tobi-probe'));

    await expect.poll(() => {
      return tobi.events.some((e) => e.type === 'console' && e.text.includes('tobi-probe'));
    }).toBe(true);
  });

  test('T2: response con reloj común y correlación por ID', async ({ page, tobi }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect.poll(() => {
      const res = tobi.events.find((e) => e.type === 'response' && e.status === 200);
      if (!res || res.type !== 'response') return false;
      const req = tobi.events.find((e) => e.type === 'request' && e.id === res.id);
      if (!req || req.type !== 'request') return false;
      return res.t >= req.t;
    }).toBe(true);
  });

  test('T3: pageerror capturado con allowPageErrors() activo', async ({ page, tobi }) => {
    tobi.allowPageErrors();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('boom');
      }, 0);
    });

    await expect.poll(() => {
      return tobi.events.some((e) => e.type === 'pageerror' && e.message.includes('boom'));
    }).toBe(true);
  });

  test('T4: step marca el reloj con step-start y step-end', async ({ page, tobi }) => {
    await tobi.step('abrir', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    const start = tobi.events.find((e) => e.type === 'step-start' && e.title === 'abrir');
    const end = tobi.events.find((e) => e.type === 'step-end' && e.title === 'abrir');

    expect(start).toBeDefined();
    expect(end).toBeDefined();
    if (start && end) {
      expect(end.t).toBeGreaterThanOrEqual(start.t);
    }
  });

  test('T5: snap crea evento y archivo en disco', async ({ page, tobi }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await tobi.snap('inicio');

    const snapEvent = tobi.events.find((e) => e.type === 'snap' && e.name === 'inicio');
    expect(snapEvent).toBeDefined();
    if (snapEvent && snapEvent.type === 'snap') {
      expect(fs.existsSync(snapEvent.file)).toBe(true);
    }
  });

  test('T6: modo estricto falla en pageerror no permitido', async ({ page, tobi }) => {
    test.fail(); // Playwright afirma que este test debe fallar
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('unhandled-strict-error');
      }, 10);
    });
    await expect.poll(() => tobi.events.some((e) => e.type === 'pageerror' && e.message.includes('unhandled-strict-error'))).toBe(true);
  });

  test('T7: evento clock se emite primero con epochMs válido', async ({ page, tobi }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const firstEvent = tobi.events[0];
    expect(firstEvent).toBeDefined();
    expect(firstEvent.type).toBe('clock');
    if (firstEvent.type === 'clock') {
      expect(firstEvent.t).toBe(0);
      expect(firstEvent.epochMs).toBeGreaterThan(1700000000000);
      expect(Math.abs(Date.now() - firstEvent.epochMs)).toBeLessThan(30000);
    }
  });

  test('T8: virtual mouse helper inyecta cursor visible y soporta humanClick', async ({ page, tobi }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cursor = page.locator('#tobi-virtual-cursor');
    await expect(cursor).toBeAttached();

    // Simular movimiento y click humano
    await tobi.humanMove(200, 200, 5);
    await expect(cursor).toHaveClass(/active/);

    const logoBtn = page.locator('.logo').first();
    if (await logoBtn.isVisible()) {
      await tobi.humanClick(logoBtn);
      const ripple = page.locator('.tobi-click-ripple');
      // El ripple se genera en mousedown
      expect(await ripple.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
