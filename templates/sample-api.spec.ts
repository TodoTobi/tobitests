import { test, expect } from '@playwright/test';

/**
 * TobiTests — Official Pure Backend & REST API Audit Template
 *
 * Uses Playwright's native `{ request }` (APIRequestContext) fixture to execute
 * high-speed, zero-browser white-box and black-box API audits across:
 *   1. Health, Contract & Schema Validation (2xx + Latency SLA)
 *   2. Negative & Boundary Payload Fuzzing (400/422 vs unhandled 500)
 *   3. RBAC, JWT & Security Boundaries (401 Unauthorized / 403 Forbidden)
 *   4. Idempotency & Concurrency / Race Conditions (Promise.all parallel mutations)
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Suite 1: Health, Contract & Schema Validation (2xx)', () => {
  test('TC-API-01: GET /api/health returns 200 OK, application/json, and satisfies < 500ms SLA', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}/api/health`);
    const latencyMs = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(latencyMs).toBeLessThan(500);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
      })
    );
  });

  test('TC-API-02: GET /api/v1/items adheres to pagination and item schema contract (< 3000ms SLA)', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}/api/v1/items`, {
      params: { page: 1, limit: 10 },
    });
    const latencyMs = Date.now() - startTime;

    expect([200, 206]).toContain(response.status());
    expect(response.headers()['content-type']).toContain('application/json');
    expect(latencyMs).toBeLessThan(3000);

    const payload = await response.json();
    expect(payload).toHaveProperty('data');
    expect(Array.isArray(payload.data)).toBe(true);
  });
});

test.describe('Suite 2: Negative & Boundary Payload Fuzzing (4xx vs 500)', () => {
  test('TC-API-03: POST /api/v1/items rejects missing required fields with structured 400/422 (never 500)', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/items`, {
      data: {},
    });

    // Layer 1 Oracle: Server must never crash with 500 on empty or partial payloads
    expect(response.status()).not.toBe(500);
    expect([400, 422]).toContain(response.status());

    const errorBody = await response.json();
    expect(errorBody).toEqual(
      expect.objectContaining({
        error: expect.anything(),
      })
    );
  });

  test('TC-API-04: POST /api/v1/items sanitizes SQLi, XSS, and boundary type mismatches without unhandled exceptions', async ({ request }) => {
    const adversarialPayloads = [
      { name: "' OR '1'='1'; DROP TABLE users; --", amount: -999999999 },
      { name: '<script>alert("xss")</script>', amount: 'not-a-number' },
      { name: 'A'.repeat(10000), amount: Number.MAX_SAFE_INTEGER },
    ];

    for (const payload of adversarialPayloads) {
      const response = await request.post(`${API_BASE_URL}/api/v1/items`, {
        data: payload,
      });

      expect(response.status(), `Unhandled 500 on payload: ${JSON.stringify(payload)}`).toBeLessThan(500);
      expect([400, 401, 403, 422]).toContain(response.status());
    }
  });
});

test.describe('Suite 3: RBAC, JWT & Security Boundaries (401 / 403)', () => {
  test('TC-API-05: Protected route rejects unauthenticated and tampered Bearer tokens with 401 Unauthorized', async ({ request }) => {
    const unauthRes = await request.get(`${API_BASE_URL}/api/v1/admin/users`);
    expect(unauthRes.status()).toBe(401);

    const tamperedRes = await request.get(`${API_BASE_URL}/api/v1/admin/users`, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature',
      },
    });
    expect([401, 403]).toContain(tamperedRes.status());
  });

  test('TC-API-06: Standard user token is blocked from vertical/horizontal privilege escalation (403 Forbidden)', async ({ request }) => {
    const lowPrivilegeToken = process.env.TEST_USER_JWT || 'mock-standard-user-token';

    // Attempt vertical escalation (admin endpoint)
    const verticalRes = await request.delete(`${API_BASE_URL}/api/v1/admin/users/target-id-01`, {
      headers: { Authorization: `Bearer ${lowPrivilegeToken}` },
    });
    expect([401, 403]).toContain(verticalRes.status());

    // Attempt horizontal escalation (accessing another tenant/user record)
    const horizontalRes = await request.patch(`${API_BASE_URL}/api/v1/users/other-tenant-uuid/profile`, {
      headers: { Authorization: `Bearer ${lowPrivilegeToken}` },
      data: { role: 'admin' },
    });
    expect([401, 403, 404]).toContain(horizontalRes.status());
  });
});

test.describe('Suite 4: Idempotency & Concurrency / Race Conditions', () => {
  test('TC-API-07: Parallel Promise.all mutations with identical Idempotency-Key prevent duplicate state creation', async ({ request }) => {
    const idempotencyKey = `idem-${Date.now()}`;
    const mutationPayload = {
      referenceId: idempotencyKey,
      action: 'reserve_slot',
      quantity: 1,
    };

    // Fire 5 simultaneous requests to detect race conditions or double-booking
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.post(`${API_BASE_URL}/api/v1/transactions`, {
          headers: { 'Idempotency-Key': idempotencyKey },
          data: mutationPayload,
        })
      )
    );

    const statuses = responses.map((r) => r.status());

    // None of the concurrent requests may trigger a 500 Internal Server Error
    for (const status of statuses) {
      expect(status).toBeLessThan(500);
    }

    // At most one request should create a new resource (201), while others return idempotent 200 or 409 Conflict
    const createdCount = statuses.filter((s) => s === 201).length;
    expect(createdCount).toBeLessThanOrEqual(1);
  });
});
