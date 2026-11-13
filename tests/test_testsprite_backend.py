"""Tests unitarios e integracion para las capacidades TestSprite del backend de TobiTests."""

from __future__ import annotations

import json
from pathlib import Path

from conftest import make_report, make_spec
import ingest_playwright_results as ing
import run_deep_audit
import tobitests_cli as cli
import tobitests_mcp as mcp


def test_classify_failure_taxonomy():
    """Verifica clasificacion determinista en ENV_DRIFT, SELECTOR_FRAGILITY y PRODUCT_BUG."""
    # 1. ENV_DRIFT
    env_test = {
        "name": "TC-ENV",
        "spec": "app.spec.ts",
        "error": {"message": "page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000"},
        "evidence": {"console_log": [], "network_trace": []},
    }
    res_env = ing.classify_failure(env_test)
    assert res_env["category"] == "ENV_DRIFT"
    assert res_env["healingCandidate"] is None

    # 2. SELECTOR_FRAGILITY
    sel_test = {
        "name": "TC-SEL",
        "spec": "app.spec.ts",
        "error": {
            "message": "TimeoutError: locator.click: Timeout 15000ms exceeded. waiting for locator('button.btn-old')"
        },
        "evidence": {"console_log": [], "network_trace": []},
    }
    res_sel = ing.classify_failure(sel_test)
    assert res_sel["category"] == "SELECTOR_FRAGILITY"
    assert res_sel["healingCandidate"] is not None
    assert res_sel["healingCandidate"]["brokenLocator"] == "button.btn-old"
    assert res_sel["healingCandidate"]["canAutoHeal"] is True

    # 3. PRODUCT_BUG (pageerror o HTTP 500 -> critical / P0)
    prod_page_err = {
        "name": "TC-PROD-ERR",
        "spec": "app.spec.ts",
        "error": {"message": "Strict Policy L1 violation"},
        "pageErrors": ["TypeError: Cannot read properties of undefined"],
        "evidence": {"console_log": [], "network_trace": []},
    }
    res_prod1 = ing.classify_failure(prod_page_err)
    assert res_prod1["category"] == "PRODUCT_BUG"
    assert res_prod1["severity"] == "critical"
    assert res_prod1["priority"] == "P0"

    prod_http_500 = {
        "name": "TC-PROD-500",
        "spec": "api.spec.ts",
        "error": {"message": "Expected 201, received 500"},
        "evidence": {"console_log": [], "network_trace": ["POST /api/orders -> 500 (120ms)"]},
    }
    res_prod2 = ing.classify_failure(prod_http_500)
    assert res_prod2["category"] == "PRODUCT_BUG"
    assert res_prod2["severity"] == "critical"
    assert res_prod2["priority"] == "P0"


def test_auto_generated_bug_resolves_when_test_passes_on_rerun(repo):
    """Un BUG-AUTO confirmado se auto-resuelve cuando su testKey vuelve a pasar."""
    spec_fail = make_spec(
        "TC-01: Checkout submit",
        status="failed",
        test_status="unexpected",
        errors=({"message": "Expected 201, got 500", "location": {"file": "specs/demo.spec.ts", "line": 10, "column": 3}},),
    )
    rep_fail = repo / "test-results" / "fail.json"
    rep_fail.write_text(json.dumps(make_report([spec_fail], file="specs/demo.spec.ts")), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="demo",
        report_path=rep_fail,
        copied_screenshots=[],
        copied_videos=[],
    )
    state_1 = json.loads(state_file.read_text(encoding="utf-8"))
    assert state_1["metrics"]["openBugs"] == 1
    assert state_1["bugs"][0]["id"] == "BUG-AUTO-01"
    assert state_1["bugs"][0]["status"] == "Confirmed"

    # Re-run passing
    spec_pass = make_spec("TC-01: Checkout submit", status="passed", test_status="expected")
    rep_pass = repo / "test-results" / "pass.json"
    rep_pass.write_text(json.dumps(make_report([spec_pass], file="specs/demo.spec.ts")), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="demo",
        report_path=rep_pass,
        copied_screenshots=[],
        copied_videos=[],
    )
    state_2 = json.loads(state_file.read_text(encoding="utf-8"))
    assert len(state_2["bugs"]) == 1
    assert state_2["bugs"][0]["id"] == "BUG-AUTO-01"
    assert state_2["bugs"][0]["status"] == "Resolved"
    assert "resolvedInRun" in state_2["bugs"][0]
    assert state_2["metrics"]["openBugs"] == 0


def test_heal_fragile_selectors_patches_spec_file(tmp_path):
    """heal_fragile_selectors reemplaza locator fragil en specs/*.spec.ts cuando apply_changes=True."""
    specs_dir = tmp_path / "specs"
    specs_dir.mkdir(parents=True, exist_ok=True)
    spec_file = specs_dir / "demo.spec.ts"
    spec_file.write_text(
        "import { test } from '@playwright/test';\n"
        "test('click old', async ({ page }) => {\n"
        "  await page.locator('button.btn-old').click();\n"
        "});\n",
        encoding="utf-8",
    )

    test_item = {
        "name": "click old",
        "spec": "demo.spec.ts",
        "error": {
            "message": "TimeoutError: waiting for locator('button.btn-old')",
            "location": {"file": "specs/demo.spec.ts", "line": 3, "column": 14},
        },
        "evidence": {"console_log": [], "network_trace": []},
    }
    bug = ing.synthesize_draft_bug(test_item, run_id="#RUN-PW-1", bug_id="BUG-AUTO-01", repo_root=tmp_path)
    assert bug["failureCategory"] == "SELECTOR_FRAGILITY"

    healed = ing.heal_fragile_selectors(tmp_path, [bug], apply_changes=True)
    assert len(healed) == 1
    assert healed[0]["applied"] is True

    patched_code = spec_file.read_text(encoding="utf-8")
    assert "locator('button.btn-old')" not in patched_code
    assert healed[0]["suggestedLocator"] in patched_code


def test_nextjs_app_router_api_routes_and_schemas_detected(tmp_path):
    """Detecta route handlers App Router de Next.js (GET/POST) y schemas/ORM (zod, prisma)."""
    next_repo = tmp_path / "next_api_repo"
    next_repo.mkdir()
    pkg = {
        "dependencies": {
            "next": "^15.0.0",
            "react": "^19.0.0",
            "zod": "^3.23.0",
            "@prisma/client": "^5.20.0",
        }
    }
    (next_repo / "package.json").write_text(json.dumps(pkg), encoding="utf-8")

    orders_route = next_repo / "app" / "api" / "orders" / "route.ts"
    orders_route.parent.mkdir(parents=True, exist_ok=True)
    orders_route.write_text(
        "export async function GET() { return Response.json([]); }\n"
        "export async function POST() { return Response.json({}, { status: 201 }); }\n",
        encoding="utf-8",
    )

    stack, routes = cli.detect_stack_and_routes(str(next_repo), "http://localhost:3000", "fullstack")
    assert "zod" in stack["schemas"]
    assert "prisma" in stack["schemas"]

    route_strs = [r["route"] for r in routes]
    assert "GET /api/orders" in route_strs
    assert "POST /api/orders" in route_strs


def test_run_deep_audit_reads_routes_discovered_from_prd(tmp_path):
    """run_deep_audit lee routesDiscovered de prd-ground-truth.json sin ignorar rutas UI."""
    app_repo = tmp_path / "target_app"
    (app_repo / "app" / "pricing").mkdir(parents=True, exist_ok=True)
    (app_repo / "app" / "checkout").mkdir(parents=True, exist_ok=True)
    (app_repo / "app" / "pricing" / "page.tsx").write_text("export default function P() { return null; }", encoding="utf-8")
    (app_repo / "app" / "checkout" / "page.tsx").write_text("export default function C() { return null; }", encoding="utf-8")
    (app_repo / "package.json").write_text(json.dumps({"dependencies": {"next": "^14.2.0", "react": "^18.3.0"}}), encoding="utf-8")

    cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://127.0.0.1:3000",
        target_repo=str(app_repo),
        audit_scope="fullstack",
    )

    exit_code = run_deep_audit.main(
        ["--project", "demo", "--dry-run", "--repo-root", str(tmp_path)]
    )
    assert exit_code == 0

    telemetry = json.loads((tmp_path / "workspaces" / "demo" / "deep-audit-telemetry.json").read_text(encoding="utf-8"))
    visited = telemetry["visited_routes"]
    assert "/pricing" in visited
    assert "/checkout" in visited


def test_agent_digest_is_compact_and_mcp_tools_respond(repo, tmp_path):
    """agent-digest.json se genera compacto (<4KB) y tobitests_mcp responde tools/list y tools/call."""
    spec = make_spec("TC-01: Smoke", status="passed", test_status="expected")
    rep = repo / "test-results" / "r.json"
    rep.write_text(json.dumps(make_report([spec], file="specs/demo.spec.ts")), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="demo",
        report_path=rep,
        copied_screenshots=[],
        copied_videos=[],
    )

    digest_path = repo / "workspaces" / "demo" / "agent-digest.json"
    assert digest_path.exists()
    assert digest_path.stat().st_size < 4096

    # MCP tools/list
    list_resp = mcp.handle_request({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, default_repo_root=repo)
    assert list_resp is not None
    tool_names = [t["name"] for t in list_resp["result"]["tools"]]
    assert "tobitests_bootstrap" in tool_names
    assert "tobitests_get_digest" in tool_names

    # MCP tools/call -> tobitests_get_digest
    digest_resp = mcp.handle_request(
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {"name": "tobitests_get_digest", "arguments": {"project": "demo", "workspaceRoot": str(repo)}},
        },
        default_repo_root=repo,
    )
    assert digest_resp is not None
    assert digest_resp["result"]["isError"] is False
    digest_payload = json.loads(digest_resp["result"]["content"][0]["text"])
    assert digest_payload["project"] == "demo"
    assert digest_payload["summary"]["passed"] == 1

    # MCP tools/call -> tobitests_bootstrap (en repo aislado tmp_path)
    boot_root = tmp_path / "boot_ws"
    boot_root.mkdir()
    boot_resp = mcp.handle_request(
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "tobitests_bootstrap",
                "arguments": {
                    "project": "shop-app",
                    "url": "http://127.0.0.1:4000",
                    "scope": "fullstack",
                    "workspaceRoot": str(boot_root),
                },
            },
        },
        default_repo_root=boot_root,
    )
    assert boot_resp is not None
    assert boot_resp["result"]["isError"] is False
    boot_payload = json.loads(boot_resp["result"]["content"][0]["text"])
    assert boot_payload["ok"] is True
    assert boot_payload["project"] == "shop-app"
    assert (boot_root / "workspaces" / "shop-app" / "agent-digest.json").exists()
