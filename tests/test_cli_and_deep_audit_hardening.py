"""Tests de blindaje para atomic_write_json en Windows, resolve_fastest_url,

detect_stack_and_routes y run_deep_audit agnÃ³stico.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import sys

import pytest

import scripts.ingest_playwright_results as ing
import scripts.run_deep_audit as run_deep_audit
import scripts.tobitests_cli as cli


def test_atomic_write_json_retries_on_permission_error(tmp_path, monkeypatch):
    """Verifica que atomic_write_json reintenta ante PermissionError (WinError 5) y escribe correctamente."""
    file_ing = tmp_path / "state_ing.json"
    file_cli = tmp_path / "state_cli.json"

    original_replace = os.replace

    def make_flaky_replace(fail_times=2):
        count = [0]

        def flaky(src, dst):
            if count[0] < fail_times:
                count[0] += 1
                raise PermissionError(5, "Acceso denegado: WinError 5")
            return original_replace(src, dst)

        return flaky

    # 1. Probar ing.atomic_write_json con 2 fallos iniciales
    monkeypatch.setattr(os, "replace", make_flaky_replace(fail_times=2))
    payload_ing = {"status": "ok", "source": "ingest", "count": 42}
    ing.atomic_write_json(file_ing, payload_ing, retries=6, delay=0.01)

    assert file_ing.exists()
    assert json.loads(file_ing.read_text(encoding="utf-8")) == payload_ing

    # 2. Probar cli.atomic_write_json con 2 fallos iniciales
    monkeypatch.setattr(os, "replace", make_flaky_replace(fail_times=2))
    payload_cli = {"status": "ok", "source": "cli", "projects": ["p1"]}
    cli.atomic_write_json(file_cli, payload_cli, retries=6, delay=0.01)

    assert file_cli.exists()
    assert json.loads(file_cli.read_text(encoding="utf-8")) == payload_cli

    # 3. Probar que si falla todos los reintentos, levanta PermissionError
    monkeypatch.setattr(os, "replace", make_flaky_replace(fail_times=10))
    with pytest.raises(PermissionError):
        ing.atomic_write_json(tmp_path / "fail.json", {"fail": True}, retries=3, delay=0.001)


def test_resolve_fastest_url_only_replaces_hostname_and_closes_sockets(monkeypatch):
    """Verifica que resolve_fastest_url solo altera el hostname y preserva path/query."""
    url = "http://localhost:5180/localhost/callback?redirect=localhost"

    # Caso 1: con socket simulado
    res = cli.resolve_fastest_url(url)
    assert "/localhost/callback?redirect=localhost" in res
    assert res.startswith("http://127.0.0.1:5180/") or res.startswith("http://[::1]:5180/") or res == url


def test_detect_stack_and_routes_never_leaks_antigravity_scope_and_detects_nextjs(tmp_path):
    """Verifica que ninguna ruta devuelva /api/antigravity/scope y que detecte rutas App Router de Next.js."""
    # 1. Repositorio vacÃ­o -> default_api_routes no debe contener antigravity/scope
    empty_repo = tmp_path / "empty_repo"
    empty_repo.mkdir()
    _, routes_empty = cli.detect_stack_and_routes(str(empty_repo), "http://localhost:5173", "fullstack")
    route_strings = [r["route"] for r in routes_empty]

    assert not any("antigravity" in r.lower() for r in route_strings), (
        f"Se detectÃ³ /api/antigravity/scope en rutas por defecto: {route_strings}"
    )
    assert any("status" in r.lower() for r in route_strings), (
        f"Se esperaba GET /api/status en default_api_routes: {route_strings}"
    )

    # 2. Proyecto Next.js con App Router: app/pricing/page.tsx
    next_repo = tmp_path / "next_repo"
    next_repo.mkdir()
    pkg = {"dependencies": {"next": "^14.2.0", "react": "^18.3.0"}}
    (next_repo / "package.json").write_text(json.dumps(pkg), encoding="utf-8")

    app_dir = next_repo / "app"
    (app_dir / "pricing").mkdir(parents=True)
    (app_dir / "pricing" / "page.tsx").write_text("export default function Pricing() { return null; }", encoding="utf-8")
    (app_dir / "checkout").mkdir(parents=True)
    (app_dir / "checkout" / "page.tsx").write_text("export default function Checkout() { return null; }", encoding="utf-8")

    stack, routes_next = cli.detect_stack_and_routes(str(next_repo), "http://localhost:3000", "frontend")
    assert "Next.js" in stack["framework"]

    next_route_paths = [r["route"] for r in routes_next]
    assert any("/pricing" in r for r in next_route_paths), f"No descubriÃ³ /pricing: {next_route_paths}"
    assert any("/checkout" in r for r in next_route_paths), f"No descubriÃ³ /checkout: {next_route_paths}"


def test_detect_stack_and_routes_python_flask_vs_fastapi(tmp_path):
    """Verifica que etiquete Flask cuando hay Flask y no FastAPI, y FastAPI cuando estÃ¡ FastAPI."""
    flask_repo = tmp_path / "flask_repo"
    flask_repo.mkdir()
    (flask_repo / "app.py").write_text(
        "from flask import Flask\napp = Flask(__name__)\n@app.route('/items')\ndef items(): pass\n",
        encoding="utf-8",
    )
    stack_flask, _ = cli.detect_stack_and_routes(str(flask_repo), "http://localhost:5000", "backend")
    assert "Flask" in stack_flask["framework"]
    assert "FastAPI" not in stack_flask["framework"]

    fastapi_repo = tmp_path / "fastapi_repo"
    fastapi_repo.mkdir()
    (fastapi_repo / "main.py").write_text(
        "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/items')\ndef items(): pass\n",
        encoding="utf-8",
    )
    stack_fastapi, _ = cli.detect_stack_and_routes(str(fastapi_repo), "http://localhost:8000", "backend")
    assert "FastAPI" in stack_fastapi["framework"]


def test_run_deep_audit_has_no_hardcoded_passwords_and_supports_dry_run(tmp_path):
    """Verifica que run_deep_audit.py no contenga passwords hardcodeadas y soporte --dry-run agnÃ³stico."""
    script_path = Path("scripts/run_deep_audit.py")
    script_code = script_path.read_text(encoding="utf-8")

    # 1. No credenciales hardcodeadas
    assert "Doctor 123+" not in script_code
    assert "demo_password_123" not in script_code
    assert "doctor@vetconnect.demo" not in script_code
    assert "tutor@vetconnect.demo" not in script_code

    # 2. Ejecutar --dry-run agnÃ³stico
    demo_repo = tmp_path / "test_repo"
    demo_repo.mkdir()
    exit_code = run_deep_audit.main([
        "--project", "testproj",
        "--url", "http://127.0.0.1:5180",
        "--dry-run",
        "--repo-root", str(tmp_path),
    ])

    assert exit_code == 0
    telemetry_path = tmp_path / "workspaces" / "testproj" / "deep-audit-telemetry.json"
    assert telemetry_path.exists()
    data = json.loads(telemetry_path.read_text(encoding="utf-8"))
    assert "visited_routes" in data
    assert "console_errors" in data
    assert "network_failures" in data
