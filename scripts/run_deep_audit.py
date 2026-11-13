"""Multi-Oracle Deep Audit Runner y Telemetry Synthesizer para TobiTests.

Ejecuta auditorÃ­as profundas agnÃ³sticas con captura de video y telemetrÃ­a.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
import shutil
import sys
import time
from typing import Any, Dict, List, Optional
import urllib.parse


def atomic_write_json(path: Path, payload: Dict[str, Any], retries: int = 6, delay: float = 0.05) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.parent / f".{path.name}.{os.getpid()}.{time.time_ns()}.tmp"
    try:
        tmp_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        for attempt in range(retries):
            try:
                os.replace(tmp_path, path)
                break
            except PermissionError:
                if attempt == retries - 1:
                    raise
                time.sleep(delay * (attempt + 1))
    except Exception:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass
        raise


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="TobiTests Universal Deep Audit Runner")
    parser.add_argument("--project", default="tobitests", help="Project slug to audit")
    parser.add_argument("--url", default=None, help="Target URL (defaults to state or PRD)")
    parser.add_argument("--timeout", type=int, default=15000, help="Per-action timeout in ms")
    parser.add_argument("--repo-root", default=None, help="Repository root directory")
    parser.add_argument("--dry-run", action="store_true", help="Validate config without launching browser")
    return parser.parse_args(argv)


async def execute_deep_audit(
    project: str,
    target_url: str,
    timeout_ms: int,
    repo_root: Path,
    routes_to_visit: List[str],
) -> Dict[str, Any]:
    from playwright.async_api import async_playwright

    workspace_dir = repo_root / "workspaces" / project
    evidence_dir = repo_root / "web" / "public" / "evidence" / "videos"
    temp_dir = evidence_dir / f"temp_{project}_{os.getpid()}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    evidence_dir.mkdir(parents=True, exist_ok=True)

    console_errors: List[str] = []
    network_failures: List[str] = []
    page_errors: List[str] = []
    visited: List[str] = []

    browser = None
    ctx = None

    # Credenciales opcionales vía variables de entorno seguras
    audit_user = os.environ.get("TOBI_AUDIT_USER")
    audit_password = os.environ.get("TOBI_AUDIT_PASSWORD")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(
                record_video_dir=str(temp_dir),
                record_video_size={"width": 1280, "height": 720},
                viewport={"width": 1280, "height": 720},
            )
            page = await ctx.new_page()
            page.set_default_timeout(timeout_ms)

            page.on("console", lambda m: console_errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on("requestfailed", lambda r: network_failures.append(f"{r.method} {r.url} -> {r.failure}"))
            page.on("response", lambda res: network_failures.append(f"HTTP {res.status} {res.url}") if res.status >= 400 else None)

            base_parsed = urllib.parse.urlparse(target_url)

            # Visitar landing inicial
            await page.goto(target_url, wait_until="domcontentloaded")
            visited.append(target_url)

            # Aceptar cookies / consent si existe
            consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias"), button:has-text("Accept")').first
            if await consent.count() > 0:
                try:
                    await consent.click(timeout=1500)
                except Exception:
                    pass

            # Si hay credenciales y pantalla de login, autenticar de forma genÃ©rica
            if audit_user and audit_password:
                user_input = page.locator('input[type="email"], input[name="username"], input[name="email"]').first
                pass_input = page.locator('input[type="password"]').first
                submit_btn = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first

                if await user_input.count() > 0 and await pass_input.count() > 0:
                    try:
                        await user_input.fill(audit_user)
                        await pass_input.fill(audit_password)
                        if await submit_btn.count() > 0:
                            await submit_btn.click()
                            await page.wait_for_timeout(2000)
                    except Exception:
                        pass

            # Recorrer rutas del PRD
            for r in routes_to_visit:
                if r == "/" or r.startswith(("GET ", "POST ", "PUT ", "DELETE ")):
                    continue
                full_url = urllib.parse.urljoin(target_url, r)
                try:
                    await page.goto(full_url, wait_until="domcontentloaded")
                    visited.append(full_url)
                    await page.wait_for_timeout(500)
                except Exception as e:
                    network_failures.append(f"GET {full_url} -> {e}")

            screenshot_path = repo_root / "web" / "public" / "evidence" / "runs" / f"{project}-deep-audit.png"
            screenshot_path.parent.mkdir(parents=True, exist_ok=True)
            await page.screenshot(path=str(screenshot_path))
    finally:
        if ctx:
            try:
                await ctx.close()
            except Exception:
                pass
        if browser:
            try:
                await browser.close()
            except Exception:
                pass

        # Mover video final
        if temp_dir.exists():
            vfiles = [f for f in os.listdir(temp_dir) if f.endswith(".webm")]
            if vfiles:
                dest_video = evidence_dir / f"{project}-deep-audit.webm"
                try:
                    shutil.move(str(temp_dir / vfiles[0]), str(dest_video))
                except Exception:
                    pass
            shutil.rmtree(temp_dir, ignore_errors=True)

    return {
        "project": project,
        "target_url": target_url,
        "visited_routes": visited,
        "console_errors": console_errors,
        "network_failures": network_failures,
        "page_errors": page_errors,
    }


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    repo_root = Path(args.repo_root).resolve() if args.repo_root else Path(__file__).resolve().parent.parent
    workspace_dir = repo_root / "workspaces" / args.project
    workspace_dir.mkdir(parents=True, exist_ok=True)
    telemetry_path = workspace_dir / "deep-audit-telemetry.json"

    # Determinar URL objetivo
    target_url = args.url
    if not target_url:
        state_file = repo_root / "web" / "public" / "data" / f"{args.project}-state.json"
        if state_file.exists():
            try:
                state_data = json.loads(state_file.read_text(encoding="utf-8"))
                target_url = state_data.get("project", {}).get("url")
            except Exception:
                pass
        if not target_url:
            prd_file = workspace_dir / "prd-ground-truth.json"
            if prd_file.exists():
                try:
                    prd_data = json.loads(prd_file.read_text(encoding="utf-8"))
                    target_url = prd_data.get("project", {}).get("url") or prd_data.get("baseUrl")
                except Exception:
                    pass
        if not target_url:
            target_url = "http://localhost:5173"

    # Rutas a visitar desde el PRD
    routes_to_visit: List[str] = []
    prd_path = workspace_dir / "prd-ground-truth.json"
    if prd_path.exists():
        try:
            prd_data = json.loads(prd_path.read_text(encoding="utf-8"))
            raw_routes = prd_data.get("routesDiscovered") or prd_data.get("routes") or []
            for r in raw_routes:
                if not isinstance(r, dict):
                    continue
                raw_route = str(r.get("route", "")).strip()
                if not raw_route:
                    continue
                if raw_route.startswith(("GET ", "POST ", "PUT ", "DELETE ", "PATCH ")) or r.get("category") == "API":
                    continue
                if raw_route.startswith(("http://", "https://")):
                    parsed_r = urllib.parse.urlparse(raw_route)
                    clean_path = parsed_r.path or "/"
                else:
                    clean_path = raw_route
                if clean_path not in routes_to_visit:
                    routes_to_visit.append(clean_path)
        except Exception:
            pass
    if not routes_to_visit:
        routes_to_visit = ["/"]

    if args.dry_run:
        telemetry = {
            "project": args.project,
            "target_url": target_url,
            "visited_routes": routes_to_visit,
            "console_errors": [],
            "network_failures": [],
            "dry_run": True,
        }
        atomic_write_json(telemetry_path, telemetry)
        return 0

    results = asyncio.run(
        execute_deep_audit(
            project=args.project,
            target_url=target_url,
            timeout_ms=args.timeout,
            repo_root=repo_root,
            routes_to_visit=routes_to_visit,
        )
    )

    atomic_write_json(telemetry_path, results)
    return 0


if __name__ == "__main__":
    sys.exit(main())
