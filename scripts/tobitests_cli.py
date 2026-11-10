#!/usr/bin/env python3
"""
TobiTests Agnostic CLI Runner & Co-Orchestration Blackboard Manager.

Supports:
1. Bootstrapping any local or remote web application into TobiTests:
   - Scans `--repo` for stack/framework detection (`package.json`) and route definitions.
   - Generates `workspaces/<project-slug>/prd-ground-truth.json` (Step 3) and
     `workspaces/<project-slug>/test-matrix.json` (Step 4).
   - Generates `web/public/data/<project-slug>-state.json` matching `useTobiState.ts`.
2. Synchronizing the Dual Co-Orchestration Shared Blackboard (`web/public/data/antigravity-live.json`):
   - Transitions between `idle`, `exploring`, `writing_specs`, `auditing_telemetry`, and `standup_meeting`.
   - Manages handoff locks between `antigravity` and `opencode` across the 8-Step Pipeline.
"""

import argparse
import datetime
import json
import os
import re
import socket
import sys
import time
import urllib.parse
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple


def resolve_fastest_url(url_str: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url_str)
        if parsed.hostname == "localhost":
            port = parsed.port or 80
            chosen_host: Optional[str] = None

            s4 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s4.settimeout(0.15)
            try:
                s4.connect(("127.0.0.1", port))
                chosen_host = "127.0.0.1"
            except Exception:
                pass
            finally:
                s4.close()

            if not chosen_host:
                s6 = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
                s6.settimeout(0.15)
                try:
                    s6.connect(("::1", port))
                    chosen_host = "[::1]"
                except Exception:
                    pass
                finally:
                    s6.close()

            if chosen_host:
                new_netloc = f"{chosen_host}:{port}" if parsed.port else chosen_host
                if parsed.username or parsed.password:
                    auth = f"{parsed.username or ''}{(':' + parsed.password) if parsed.password else ''}@"
                    new_netloc = auth + new_netloc
                return urllib.parse.urlunparse(parsed._replace(netloc=new_netloc))
    except Exception:
        pass
    return url_str


ALLOWED_SEVERITIES = {
    "critical",
    "high",
    "medium",
    "low",
    "Critical",
    "High",
    "Medium",
    "Low",
    "Crítica",
    "Alta",
    "Media",
    "Baja",
}

ALLOWED_STATUSES = {"Confirmed", "Resolved", "Closed"}


def validate_bug_report(
    bug: Dict[str, Any],
    repo_root: Optional[Path] = None,
) -> Tuple[bool, List[str]]:
    """Valida que un reporte de bug cumpla con el contrato canónico BugItem."""
    errors: List[str] = []
    if not isinstance(bug, dict):
        return False, ["Bug report must be a dictionary"]

    mandatory_str_keys = [
        "id",
        "title",
        "severity",
        "status",
        "section",
        "runId",
        "agent",
        "dadoQue",
        "cuando",
        "entonces",
    ]
    for key in mandatory_str_keys:
        if key not in bug:
            errors.append(f"Missing mandatory field: '{key}'")
        else:
            val = bug[key]
            if not isinstance(val, str) or not val.strip():
                errors.append(f"Field '{key}' must be a non-empty string")

    sev = bug.get("severity")
    if sev is not None and sev not in ALLOWED_SEVERITIES:
        errors.append(f"Invalid severity '{sev}'. Allowed: {sorted(ALLOWED_SEVERITIES)}")

    st = bug.get("status")
    if st is not None and st not in ALLOWED_STATUSES:
        errors.append(f"Invalid status '{st}'. Allowed: {sorted(ALLOWED_STATUSES)}")

    if "gherkin" in bug and bug["gherkin"] is not None:
        gh = bug["gherkin"]
        if not isinstance(gh, dict):
            errors.append("Field 'gherkin' must be a dictionary")
        else:
            for g_key in ("given", "when", "then"):
                g_val = gh.get(g_key)
                if not isinstance(g_val, str) or not g_val.strip():
                    errors.append(f"Field 'gherkin.{g_key}' must be a non-empty string")

    if "diagnostic" in bug and bug["diagnostic"] is not None:
        diag = bug["diagnostic"]
        if not isinstance(diag, dict):
            errors.append("Field 'diagnostic' must be a dictionary")
        else:
            for d_key in ("observedFact", "whiteBoxHypothesis", "reproductionSpec", "affectedFile"):
                d_val = diag.get(d_key)
                if not isinstance(d_val, str):
                    errors.append(f"Field 'diagnostic.{d_key}' must be a string")

    # White-Box Validation (Hallazgo C7)
    line_val = bug.get("root_cause_line")
    if line_val is not None:
        if not isinstance(line_val, int) or isinstance(line_val, bool):
            errors.append("Field 'root_cause_line' must be an integer")
        elif line_val < 0:
            errors.append(f"Field 'root_cause_line' must be >= 0 (got {line_val})")

    rc_file = bug.get("root_cause_file")
    if repo_root is not None and rc_file and isinstance(rc_file, str) and rc_file.strip():
        target_path = Path(repo_root) / rc_file
        if target_path.is_file():
            try:
                total_lines = len(target_path.read_text(encoding="utf-8", errors="replace").splitlines())
            except Exception:
                total_lines = 0

            if line_val is not None and isinstance(line_val, int) and not isinstance(line_val, bool):
                if line_val < 1 or line_val > total_lines:
                    errors.append(
                        f"root_cause_line {line_val} is out of range for existing file '{rc_file}' (1-{total_lines})"
                    )

    return (len(errors) == 0, errors)


PIPELINE_STEPS: Dict[int, str] = {
    1: "Bootstrap & Port/Stack Discovery",
    2: "Source Code & Route Analysis",
    3: "Normalized PRD Generation (Ground Truth JSON)",
    4: "Test Matrix Generation (Happy Path, Edge Cases, RBAC, UI/UX)",
    5: "Playwright Spec Synthesis (specs/*.spec.ts)",
    6: "Isolated Execution with Video (.webm), Screenshots & Trace Capture",
    7: "Triage & 3-Layer Divergence Oracle",
    8: "Final Gherkin Report & Selector Self-Healing",
}

BLACKBOARD_STATE_META: Dict[str, Dict[str, Any]] = {
    "idle": {
        "isWorking": False,
        "action": "En guardia · Mesa de Comando",
        "detail": "Esperando nuevo requerimiento o consulta (Blackboard en standby)",
        "icon": "☕",
        "timeLabel": "Standby · Activo",
        "agents": {
            "orchestrator": "idle",
            "explorer": "idle",
            "telemetry": "idle",
            "writer": "idle",
            "opencode": "idle",
        },
    },
    "exploring": {
        "isWorking": True,
        "action": "Explorando rutas y DOM en vivo (@playwright/mcp)",
        "detail": "Antigravity + Explorer QA recorriendo flujos y capturando snapshots",
        "icon": "🧭",
        "timeLabel": "En vivo · Explorando",
        "agents": {
            "orchestrator": "working",
            "explorer": "working",
            "telemetry": "working",
            "writer": "idle",
            "opencode": "idle",
        },
    },
    "writing_specs": {
        "isWorking": True,
        "action": "Sintetizando y ejecutando suites Playwright (.spec.ts)",
        "detail": "OpenCode + Spec Writer compilando código determinista y capturando video .webm",
        "icon": "⚡",
        "timeLabel": "En vivo · Spec Synthesis",
        "agents": {
            "orchestrator": "idle",
            "explorer": "idle",
            "telemetry": "idle",
            "writer": "working",
            "opencode": "working",
        },
    },
    "auditing_telemetry": {
        "isWorking": True,
        "action": "Evaluando trazas bajo el Oráculo de 3 Capas (CDP)",
        "detail": "Antigravity + Telemetry Auditor clasificando hallazgos (P0-P3) y causa raíz",
        "icon": "🔬",
        "timeLabel": "En vivo · 3-Oracle Audit",
        "agents": {
            "orchestrator": "working",
            "explorer": "idle",
            "telemetry": "working",
            "writer": "idle",
            "opencode": "idle",
        },
    },
    "standup_meeting": {
        "isWorking": True,
        "action": "Standup de Co-Orquestación (Antigravity + OpenCode)",
        "detail": "Sincronizando veredicto de calidad, reportes Gherkin y auto-curación de selectores",
        "icon": "🤝",
        "timeLabel": "En vivo · Standup Sync",
        "agents": {
            "orchestrator": "working",
            "explorer": "working",
            "telemetry": "working",
            "writer": "working",
            "opencode": "working",
        },
    },
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "custom-project"


def state_path(repo_root: Path, slug: str) -> Path:
    """Devuelve la ruta canónica del archivo de estado según el Paso 0."""
    return repo_root / "web" / "public" / "data" / f"{slug}-state.json"

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


def locked_update(path: Path, fn: Callable[[Dict[str, Any]], Dict[str, Any]]) -> Dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = Path(f"{str(path)}.lock")

    lock_acquired = False
    for attempt in range(5):
        try:
            if lock_path.exists() and (time.time() - lock_path.stat().st_mtime > 10):
                try:
                    lock_path.unlink()
                except Exception:
                    pass
        except OSError:
            pass

        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_EXCL | os.O_RDWR)
            os.close(fd)
            lock_acquired = True
            break
        except FileExistsError:
            if attempt < 4:
                time.sleep(0.1)

    try:
        data: Dict[str, Any] = {}
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                data = {}

        updated = fn(data)
        atomic_write_json(path, updated)
        return updated
    finally:
        if lock_acquired and lock_path.exists():
            try:
                lock_path.unlink()
            except Exception:
                pass


def detect_stack_and_routes(
    repo_path: Optional[str],
    base_url: str,
    audit_scope: str = "fullstack",
) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
    stack_info: Dict[str, Any] = {
        "framework": "Web Application (Generic SPA/SSR)" if audit_scope != "backend" else "REST / GraphQL API Service",
        "language": "TypeScript / JavaScript",
        "dependencies": [],
        "devDependencies": [],
        "packageManager": "npm",
        "hasPlaywright": False,
        "auditScope": audit_scope,
    }
    default_ui_routes: List[Dict[str, str]] = [
        {"id": "landing", "route": "/", "title": "/ · Landing & Entry Point", "category": "auth"},
        {"id": "login", "route": "/login", "title": "/login · Authentication & Session", "category": "auth"},
        {"id": "dashboard", "route": "/dashboard", "title": "/dashboard · Core Workspace", "category": "workspace"},
        {"id": "settings", "route": "/settings", "title": "/settings · Configuration & Profile", "category": "execution"},
    ]
    default_api_routes: List[Dict[str, str]] = [
        {"id": "api-health", "route": "GET /api/health", "title": "GET /api/health · API", "category": "API"},
        {"id": "api-status", "route": "GET /api/status", "title": "GET /api/status · API", "category": "API"},
        {"id": "api-auth-session", "route": "POST /api/auth/session", "title": "POST /api/auth/session · API", "category": "API"},
    ]

    def filter_by_scope(ui_r: List[Dict[str, str]], api_r: List[Dict[str, str]]) -> List[Dict[str, str]]:
        if audit_scope == "frontend":
            return ui_r
        if audit_scope == "backend":
            return api_r
        return ui_r + api_r

    if not repo_path:
        return stack_info, filter_by_scope(default_ui_routes, default_api_routes)

    root = Path(repo_path)
    if not root.exists():
        return stack_info, filter_by_scope(default_ui_routes, default_api_routes)

    # 1. Inspect package.json (root or web/ or frontend/)
    pkg_candidates = [root / "package.json", root / "web" / "package.json", root / "frontend" / "package.json"]
    all_deps: Dict[str, str] = {}
    for pkg_file in pkg_candidates:
        if pkg_file.exists():
            try:
                pkg_data = json.loads(pkg_file.read_text(encoding="utf-8", errors="ignore"))
                deps = pkg_data.get("dependencies", {}) or {}
                dev_deps = pkg_data.get("devDependencies", {}) or {}
                all_deps.update(deps)
                all_deps.update(dev_deps)
                stack_info["dependencies"] = sorted(list(deps.keys()))[:25]
                stack_info["devDependencies"] = sorted(list(dev_deps.keys()))[:25]
                break
            except Exception:
                pass

    dep_names = set(all_deps.keys())
    if "next" in dep_names:
        stack_info["framework"] = "Next.js (App/Pages Router)"
    elif "vite" in dep_names and "react" in dep_names:
        stack_info["framework"] = "React + Vite"
    elif "react" in dep_names:
        stack_info["framework"] = "React SPA"
    elif "vue" in dep_names or "nuxt" in dep_names:
        stack_info["framework"] = "Vue / Nuxt"
    elif "@angular/core" in dep_names:
        stack_info["framework"] = "Angular"
    elif "svelte" in dep_names:
        stack_info["framework"] = "SvelteKit / Svelte"
    elif "express" in dep_names or "fastify" in dep_names or "@nestjs/core" in dep_names:
        stack_info["framework"] = "Node.js API / Fullstack"

    stack_info["hasPlaywright"] = "@playwright/test" in dep_names or "playwright" in dep_names

    # 2. Inspect Python dependency manifests
    py_deps_text = ""
    for py_manifest in [root / "requirements.txt", root / "pyproject.toml", root / "Pipfile"]:
        if py_manifest.exists():
            try:
                py_deps_text += " " + py_manifest.read_text(encoding="utf-8", errors="ignore").lower()
            except Exception:
                pass

    # 3. Scan source files for UI route paths AND Backend API endpoints (Express, Fastify, NestJS, FastAPI, Flask)
    route_set: List[str] = []
    api_route_set: List[Tuple[str, str]] = []
    route_regex = re.compile(r"""(?:path|to|href)\s*[:=]\s*["'](/[a-zA-Z0-9_\-/:\*]*)["']""")
    express_api_regex = re.compile(
        r"""(?:app|router|fastify|server)\.(get|post|put|patch|delete)\s*\(\s*["'](/[a-zA-Z0-9_\-/:\*]*)["']""",
        re.IGNORECASE,
    )
    nest_api_regex = re.compile(
        r"""@(Get|Post|Put|Patch|Delete)\s*\(\s*["']?([a-zA-Z0-9_\-/:\*]*)["']?\s*\)"""
    )
    fastapi_regex = re.compile(
        r"""@(?:app|router|api_router)\.(get|post|put|patch|delete)\s*\(\s*["'](/[a-zA-Z0-9_\-/:\{\}]*)["']""",
        re.IGNORECASE,
    )
    ignore_dirs = {"node_modules", ".git", "dist", "build", ".next", "coverage", "test-results", "playwright-report", "__pycache__", ".venv", "venv"}

    scanned_files = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        for fname in filenames:
            if not fname.endswith((".tsx", ".ts", ".jsx", ".js", ".vue", ".py", ".go")):
                continue
            fpath = Path(dirpath) / fname
            scanned_files += 1
            if scanned_files > 250:
                break
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                if fname.endswith(".py"):
                    content_lower = content.lower()
                    if "fastapi" in content_lower or "fastapi" in py_deps_text:
                        stack_info["framework"] = "FastAPI / Python Backend"
                        stack_info["language"] = "Python"
                    elif "flask" in content_lower or "flask" in py_deps_text or "@app.route" in content:
                        stack_info["framework"] = "Flask / Python Backend"
                        stack_info["language"] = "Python"
                    elif ("@app." in content or "@router." in content) and stack_info["framework"].startswith("Web Application"):
                        stack_info["framework"] = "Python Backend API"
                        stack_info["language"] = "Python"

                for match in route_regex.findall(content):
                    clean_r = match.strip()
                    if (
                        clean_r.startswith("/")
                        and not clean_r.startswith("//")
                        and not clean_r.startswith("/api/")
                        and not clean_r.startswith("/evidence/")
                        and len(clean_r) <= 42
                        and clean_r not in route_set
                    ):
                        route_set.append(clean_r)

                for method, endpoint in express_api_regex.findall(content):
                    ep = endpoint.strip()
                    pair = (method.upper(), ep)
                    if len(ep) <= 48 and pair not in api_route_set:
                        api_route_set.append(pair)

                for method, endpoint in nest_api_regex.findall(content):
                    ep = "/" + endpoint.strip().lstrip("/")
                    pair = (method.upper(), ep if ep.startswith("/api") else f"/api{ep}")
                    if len(pair[1]) <= 48 and pair not in api_route_set:
                        api_route_set.append(pair)

                for method, endpoint in fastapi_regex.findall(content):
                    ep = endpoint.strip()
                    pair = (method.upper(), ep)
                    if len(ep) <= 48 and pair not in api_route_set:
                        api_route_set.append(pair)
            except Exception:
                pass
        if scanned_files > 250:
            break

    # 4. Next.js file-based route detection (App Router and Pages Router)
    next_app_candidates = [
        root / "app",
        root / "src" / "app",
        root / "web" / "app",
        root / "web" / "src" / "app",
        root / "frontend" / "app",
        root / "frontend" / "src" / "app",
    ]
    for app_dir in next_app_candidates:
        if app_dir.exists() and app_dir.is_dir():
            for p in app_dir.rglob("page.*"):
                if p.suffix in (".tsx", ".ts", ".jsx", ".js"):
                    rel = p.parent.relative_to(app_dir).as_posix()
                    route = "/" if rel == "." else f"/{rel}"
                    parts = [part for part in route.split("/") if not (part.startswith("(") and part.endswith(")")) and not part.startswith("_")]
                    clean_route = "/" + "/".join(filter(None, parts))
                    if clean_route not in route_set and len(clean_route) <= 42:
                        route_set.append(clean_route)

    next_pages_candidates = [
        root / "pages",
        root / "src" / "pages",
        root / "web" / "pages",
        root / "web" / "src" / "pages",
        root / "frontend" / "pages",
        root / "frontend" / "src" / "pages",
    ]
    for pages_dir in next_pages_candidates:
        if pages_dir.exists() and pages_dir.is_dir():
            for p in pages_dir.rglob("*.*"):
                if p.suffix in (".tsx", ".ts", ".jsx", ".js") and not p.name.startswith(("_", ".")):
                    rel = p.relative_to(pages_dir).as_posix()
                    rel_no_ext = re.sub(r"\.[^.]+$", "", rel)
                    if rel_no_ext.startswith("api/"):
                        continue
                    route = "/" if rel_no_ext == "index" else f"/{re.sub(r'/index$', '', rel_no_ext)}"
                    if route not in route_set and len(route) <= 42:
                        route_set.append(route)

    custom_ui_routes: List[Dict[str, str]] = []
    custom_api_routes: List[Dict[str, str]] = []

    if route_set:
        if "/" not in route_set:
            route_set.insert(0, "/")
        categories = ["auth", "workspace", "diagnostics", "execution"]
        for idx, r in enumerate(route_set[:7]):
            rid = slugify(r.strip("/")) if r != "/" else "landing"
            label = "Landing & Entry" if r == "/" else r.strip("/").replace("-", " ").replace("/", " · ").title()
            cat = "auth" if idx == 0 or "login" in r or "auth" in r else categories[min(idx % 4, 3)]
            custom_ui_routes.append(
                {
                    "id": rid,
                    "route": r if r != "/" else base_url,
                    "title": f"{r} · {label}",
                    "category": cat,
                }
            )

    if api_route_set:
        for idx, (method, ep) in enumerate(api_route_set[:6]):
            rid = f"api-{method.lower()}-{slugify(ep.strip('/'))}"
            custom_api_routes.append(
                {
                    "id": rid,
                    "route": f"{method} {ep}",
                    "title": f"{method} {ep} · API",
                    "category": "API",
                }
            )

    final_ui = custom_ui_routes if len(custom_ui_routes) >= 2 else default_ui_routes
    final_api = custom_api_routes if len(custom_api_routes) >= 1 else default_api_routes
    return stack_info, filter_by_scope(final_ui, final_api)


def build_journey_graph(routes: List[Dict[str, str]], project_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    col_x = [80, 480, 880, 1280]
    is_tobi_demo = project_name.lower() in ("tobitests", "tobi")
    screenshots = [
        "/evidence/runs/tobi-01-landing.png",
        "/evidence/runs/tobi-02-dashboard.png",
        "/evidence/runs/tobi-03-bug-tracker.png",
        "/evidence/runs/tobi-04-office.png",
        "/evidence/runs/tobi-05-specs.png",
        "/evidence/runs/tobi-06-live-run.png",
        "/evidence/runs/tobi-07-settings.png",
    ] if is_tobi_demo else [""]

    for i, r in enumerate(routes):
        col = 0 if i == 0 else min(1 + (i - 1) // 3, 3)
        row = 1 if i == 0 else (i - 1) % 3
        is_api = r.get("category") == "API" or "/api/" in r.get("route", "") or r.get("route", "").startswith(("GET ", "POST ", "PUT ", "DELETE "))
        nodes.append(
            {
                "id": r["id"],
                "title": r["title"],
                "subtitle": f"Endpoint API ({project_name})" if is_api else f"Ruta verificada de {project_name}",
                "route": r["route"],
                "screenshot": "API_NODE" if is_api else screenshots[i % len(screenshots)],
                "x": col_x[col],
                "y": 310 if i == 0 else (80 + row * 230),
                "width": 260,
                "height": 146,
                "testsCount": 0,
                "touches": 0,
                "failedCount": 0,
                "blockedCount": 0,
                "category": "API" if is_api else r["category"],
            }
        )

    if len(nodes) > 1:
        origin = nodes[0]
        for idx, target in enumerate(nodes[1:], start=1):
            source_id = origin["id"] if idx <= 3 else nodes[min(idx - 2, len(nodes) - 1)]["id"]
            is_target_api = target.get("category") == "API"
            edges.append(
                {
                    "id": f"e-{source_id}-{target['id']}",
                    "from": source_id,
                    "to": target["id"],
                    "verb": "API 2xx/4xx" if is_target_api else ("Navegar" if idx % 2 == 1 else "Verificar"),
                    "agentName": "Telemetry Auditor" if is_target_api else ("Explorer QA" if idx % 2 == 1 else "Telemetry Auditor"),
                    "agentRole": "Auditor API ({ request })" if is_target_api else ("Explorador de DOM" if idx % 2 == 1 else "Auditor CDP"),
                    "agentMcp": "@playwright/test (APIRequestContext)" if is_target_api else ("@playwright/mcp" if idx % 2 == 1 else "@chromedevtools/chrome-devtools-mcp"),
                    "actionCode": f"await request.get('{target['route']}');" if is_target_api else f"await page.goto('{target['route']}');",
                    "humanExplanation": "Pendiente de verificación",
                    "duration": "—",
                    "status": "Skipped",
                }
            )

    return nodes, edges


def merge_list_by_key(existing_items: List[Dict[str, Any]], new_items: List[Dict[str, Any]], key_fn) -> List[Dict[str, Any]]:
    merged_map: Dict[Any, Dict[str, Any]] = {}
    order: List[Any] = []
    for item in existing_items:
        k = key_fn(item)
        if k not in merged_map:
            order.append(k)
        merged_map[k] = item
    for item in new_items:
        k = key_fn(item)
        if k not in merged_map:
            order.append(k)
        merged_map[k] = item
    return [merged_map[k] for k in order]


def generate_workspace_artifacts(
    repo_root: Path,
    project_name: str,
    project_slug: str,
    url: str,
    target_repo: Optional[str],
    audit_scope: str = "fullstack",
    force_clean: bool = False,
) -> Tuple[Path, Path, Path]:
    url = resolve_fastest_url(url)
    ws_dir = repo_root / "workspaces" / project_slug
    ws_dir.mkdir(parents=True, exist_ok=True)
    public_data_dir = repo_root / "web" / "public" / "data"
    public_data_dir.mkdir(parents=True, exist_ok=True)

    prd_path = ws_dir / "prd-ground-truth.json"
    matrix_path = ws_dir / "test-matrix.json"
    target_state = state_path(repo_root, project_slug)

    existing_prd: Dict[str, Any] = {}
    existing_matrix: Dict[str, Any] = {}
    existing_state: Dict[str, Any] = {}

    if not force_clean:
        if prd_path.exists():
            try:
                existing_prd = json.loads(prd_path.read_text(encoding="utf-8"))
            except Exception:
                existing_prd = {}
        if matrix_path.exists():
            try:
                existing_matrix = json.loads(matrix_path.read_text(encoding="utf-8"))
            except Exception:
                existing_matrix = {}
        if target_state.exists():
            try:
                existing_state = json.loads(target_state.read_text(encoding="utf-8"))
            except Exception:
                existing_state = {}

    stack_info, new_routes = detect_stack_and_routes(target_repo, url, audit_scope=audit_scope)
    merged_routes = merge_list_by_key(
        existing_prd.get("routesDiscovered", []),
        new_routes,
        lambda r: r.get("id") or r.get("route"),
    )
    nodes, edges = build_journey_graph(merged_routes, project_name)
    now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    date_ar = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")

    prev_scopes: List[str] = existing_prd.get("auditedScopes", [])
    if audit_scope not in prev_scopes:
        prev_scopes.append(audit_scope)

    # 1. Generate / Merge Normalized PRD (Step 3)
    prd_data = {
        "schemaVersion": "1.0.0",
        "generatedAt": now_iso,
        "pipelineStep": 3,
        "orchestrator": "antigravity",
        "auditScope": audit_scope,
        "auditedScopes": prev_scopes,
        "project": {
            "id": project_slug,
            "name": project_name,
            "url": url,
            "repoPath": target_repo or str(repo_root),
            "auditScope": audit_scope,
            "stack": stack_info,
        },
        "oraclesContract": {
            "layer1Implicit": "Monitor pageerror, console.error, HTTP >= 400, and requests > 3000ms via Chrome DevTools MCP & Playwright APIRequestContext.",
            "layer2StateDivergence": "Compare source code state machine against live DOM snapshots or REST/GraphQL payloads across views and roles.",
            "layer3VisualAndA11y": "Verify pointer-events, scrollWidth overflow, Escape modal dismissal, and ARIA/WCAG contrast (or JSON schema invariants for API scope).",
        },
        "routesDiscovered": merged_routes,
    }
    atomic_write_json(prd_path, prd_data)

    # 2. Generate / Merge Test Matrix (Step 4)
    generated_spec_cases = [
        "TC-01: Entry Point & DOM Readiness (Layer 1 Oracle)",
        "TC-02: Runtime Telemetry & Console Health (Layer 1 Oracle)",
        "TC-03: Interactive Surface & Accessibility Tree (Layer 2 Oracle)",
        "TC-04: Viewport Adaptability & Layout Integrity (Layer 3 Oracle)",
    ]
    own_suite = {
        "domain": f"{project_name} — Core 3-Layer Oracle Audit",
        "scope": audit_scope,
        "specFile": f"{project_slug}.spec.ts",
        "description": f"Suite Playwright sintética para auditoría autónoma en {project_name}.",
        "implemented": True,
        "cases": generated_spec_cases,
    }

    new_suites_spec: List[Dict[str, Any]] = [own_suite]
    if audit_scope in ("frontend", "fullstack"):
        new_suites_spec.extend(
            [
                {
                    "domain": "Authentication & Entry",
                    "scope": "frontend",
                    "specFile": f"{project_slug}-auth.spec.ts",
                    "description": f"Verifica carga inicial, autenticación, manejo de sesiones y cabeceras de seguridad en {project_name}.",
                    "implemented": False,
                    "cases": [
                        f"TC-AUTH-01: Carga inicial del punto de entrada ({url}) sin errores en consola (Layer 1)",
                        "TC-AUTH-02: Validación de campos obligatorios y formatos en formulario de acceso",
                        "TC-AUTH-03: Persistencia de estado de sesión tras recarga de página (Layer 2)",
                        "TC-AUTH-04: Navegación por teclado (Tab / Escape) y roles ARIA en vista de entrada (Layer 3)",
                    ],
                },
                {
                    "domain": "Core User Journeys & State Sync",
                    "scope": "frontend",
                    "specFile": f"{project_slug}-journeys.spec.ts",
                    "description": f"Audita los recorridos principales, sincronización reactiva entre vistas y respuestas en {project_name}.",
                    "implemented": False,
                    "cases": [
                        "TC-FLOW-01: Transición fluida hacia el panel principal sin layout shift ni overflow horizontal",
                        "TC-FLOW-02: Consistencia de estado entre vistas tras mutación de datos (Layer 2 State Divergence)",
                        "TC-FLOW-03: Verificación de latencia de red (< 3000ms) y ausencia de códigos HTTP >= 400 (Layer 1)",
                        "TC-FLOW-04: Cierre accesible de modales y drawers mediante tecla Escape y clic en backdrop (Layer 3)",
                    ],
                },
                {
                    "domain": "RBAC, Edge Cases & Visual A11y",
                    "scope": "frontend",
                    "specFile": f"{project_slug}-rbac-a11y.spec.ts",
                    "description": f"Evalúa fronteras de permisos, entradas límite, responsive 375px y contraste WCAG en {project_name}.",
                    "implemented": False,
                    "cases": [
                        "TC-RBAC-01: Bloqueo de acceso no autorizado a rutas protegidas y redirección limpia",
                        "TC-RBAC-02: Sanitización de entradas contra payloads XSS e inyecciones en buscadores",
                        "TC-A11Y-01: Adaptación responsive en viewport móvil (375x812) sin solapamiento de controles",
                        "TC-A11Y-02: Verificación de interactividad (pointer-events) y contraste semántico en botones primarios",
                    ],
                },
            ]
        )

    if audit_scope in ("backend", "fullstack"):
        new_suites_spec.append(
            {
                "domain": "Backend API Contracts & Security",
                "scope": "backend",
                "specFile": f"{project_slug}-api.spec.ts",
                "description": f"Pruebas puras de API con Playwright APIRequestContext ({{ request }}): códigos HTTP, latencia < 3000ms, schemas JSON y RBAC en {project_name}.",
                "implemented": False,
                "cases": [
                    f"TC-API-01: GET {url}/api/health responde 200 OK con schema JSON válido y latencia < 500ms",
                    f"TC-API-02: POST {url}/api/antigravity/scope sincroniza auditScope sin abrir navegador",
                    "TC-API-03: Rechazo determinista 401/403 ante peticiones sin token de autorización (RBAC)",
                    "TC-API-04: Validación 400/422 ante payloads malformados sin fugas de stacktrace (500)",
                ],
            }
        )

    merged_suites_spec = merge_list_by_key(
        existing_matrix.get("suites", []),
        new_suites_spec,
        lambda s: s.get("specFile"),
    )

    for s in merged_suites_spec:
        if s.get("specFile") == f"{project_slug}.spec.ts":
            s["implemented"] = True
            s["cases"] = generated_spec_cases
        elif "implemented" not in s:
            s["implemented"] = False

    matrix_data = {
        "schemaVersion": "1.0.0",
        "generatedAt": now_iso,
        "pipelineStep": 4,
        "orchestrator": "antigravity",
        "handoffTarget": "opencode",
        "project": project_name,
        "auditScope": audit_scope,
        "auditedScopes": prev_scopes,
        "totalSuites": len(merged_suites_spec),
        "totalTests": sum(len(s.get("cases", [])) for s in merged_suites_spec),
        "suites": merged_suites_spec,
    }
    atomic_write_json(matrix_path, matrix_data)

    # 2.5. Step 5: Synthesize Physical Playwright Spec on Disk (`specs/<project-slug>.spec.ts`)
    specs_dir = repo_root / "specs"
    specs_dir.mkdir(parents=True, exist_ok=True)
    target_spec_file = specs_dir / f"{project_slug}.spec.ts"
    custom_spec_file = specs_dir / f"custom-{project_slug}.spec.ts"

    spec_content = f"""import {{ test, expect }} from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL || '{url}';

test.describe('{project_name} — Autonomous E2E Audit & 3-Layer Oracles', () => {{
  test.beforeEach(async ({{ page }}) => {{
    page.on('console', (msg) => {{
      if (msg.type() === 'error') {{
        console.error(`[Browser Console Error] ${{msg.text()}}`);
      }}
    }});
  }});

  test('TC-01: Entry Point & DOM Readiness (Layer 1 Oracle)', async ({{ page }}) => {{
    const res = await page.goto(TARGET_URL, {{ waitUntil: 'domcontentloaded', timeout: 15000 }});
    expect(res ? res.status() : 200).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible({{ timeout: 10000 }});
  }});

  test('TC-02: Runtime Telemetry & Console Health (Layer 1 Oracle)', async ({{ page }}) => {{
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.goto(TARGET_URL, {{ waitUntil: 'load', timeout: 15000 }});
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
  }});

  test('TC-03: Interactive Surface & Accessibility Tree (Layer 2 Oracle)', async ({{ page }}) => {{
    await page.goto(TARGET_URL, {{ waitUntil: 'domcontentloaded', timeout: 15000 }});
    const interactive = page.locator('button:visible, a:visible, [role="button"]:visible, input:visible, canvas:visible');
    const count = await interactive.count();
    if (count > 0) {{
      const firstTarget = interactive.first();
      await expect(firstTarget).toBeVisible();
      await firstTarget.hover({{ timeout: 2000 }});
    }}
  }});

  test('TC-04: Viewport Adaptability & Layout Integrity (Layer 3 Oracle)', async ({{ page }}) => {{
    await page.setViewportSize({{ width: 375, height: 812 }});
    await page.goto(TARGET_URL, {{ waitUntil: 'domcontentloaded', timeout: 15000 }});
    const hasSevereOverflow = await page.evaluate(() => {{
      return document.documentElement.scrollWidth > window.innerWidth + 25;
    }});
    expect(hasSevereOverflow).toBe(false);
  }});
}});
"""

    if not target_spec_file.exists() and not custom_spec_file.exists() and project_slug not in ("tobitests", "tobi"):
        target_spec_file.write_text(spec_content, encoding="utf-8")

    # 3. Read real specs from disk (`specs/<slug>*.spec.ts` and `specs/custom-<slug>*.spec.ts`)
    found_spec_files: List[Path] = []
    if specs_dir.exists():
        for f in sorted(specs_dir.iterdir()):
            if f.is_file() and f.name.endswith(".spec.ts"):
                if f.name.startswith(f"{project_slug}") or f.name.startswith(f"custom-{project_slug}"):
                    found_spec_files.append(f)

    specs_from_disk: List[Dict[str, Any]] = []
    for sf in found_spec_files:
        try:
            code_content = sf.read_text(encoding="utf-8")
        except Exception:
            code_content = ""
        tests_count = len(re.findall(r"\btest\s*\(", code_content))
        specs_from_disk.append(
            {
                "name": sf.name,
                "domain": sf.name.replace(".spec.ts", "").replace("-", " ").title(),
                "status": "Skipped",
                "testsCount": tests_count,
                "lastRun": "Pendiente",
                "code": code_content,
            }
        )

    default_office_agents = [
        {
            "id": "orchestrator",
            "initials": "AG",
            "name": "Antigravity",
            "role": "Chief Architect & Telemetry Judge",
            "employment": "Co-Orquestador Analítico",
            "status": "idle",
            "activity": "desk",
            "bubble": f"PRD y Matriz de {project_name} sincronizados (alcance: {audit_scope}).",
            "idleBubble": f"En guardia · Workspace {project_name} inicializado",
            "task": f"Coordinando el Oráculo de 3 Capas sobre {project_name} ({audit_scope})",
            "mcp": "@playwright/mcp",
            "tone": "agent",
            "run": "",
        },
        {
            "id": "explorer",
            "initials": "EX",
            "name": "Explorer QA",
            "role": "Simulador de Recorridos & DOM",
            "employment": "Exploración de Flujos",
            "status": "idle",
            "activity": "desk",
            "bubble": "Esperando primera ejecución",
            "idleBubble": "Listo para nueva exploración de rutas",
            "task": f"Validando estados y accesibilidad en {project_name}",
            "mcp": "@playwright/mcp",
            "tone": "success",
            "run": "",
        },
        {
            "id": "telemetry",
            "initials": "TL",
            "name": "Telemetry Auditor",
            "role": "Inspector CDP & Causa Raíz",
            "employment": "Auditoría de Consola y Red",
            "status": "idle",
            "activity": "server",
            "bubble": "Esperando primera ejecución",
            "idleBubble": "Chrome CDP & API Inspector en espera",
            "task": f"Auditando trazas de red, latencia y schemas de {project_name}",
            "mcp": "@chromedevtools/chrome-devtools-mcp",
            "tone": "warning",
            "run": "",
        },
        {
            "id": "writer",
            "initials": "SW",
            "name": "Spec Writer",
            "role": "Ingeniero de Especificaciones",
            "employment": "Síntesis de Código E2E & API",
            "status": "idle",
            "activity": "desk",
            "bubble": "Esperando primera ejecución",
            "idleBubble": "Suites Playwright sincronizadas",
            "task": f"Escribiendo aserciones semánticas ({audit_scope}) para {project_name}",
            "mcp": "@playwright/mcp",
            "tone": "agent",
            "run": "",
        },
        {
            "id": "opencode",
            "initials": "OC",
            "name": "OpenCode (CLI)",
            "role": "Ejecutor CLI & Auto-Curación AST",
            "employment": "Brazo Ejecutor & Spec Runner",
            "status": "idle",
            "activity": "desk",
            "bubble": "Esperando primera ejecución",
            "idleBubble": "Motor CLI en standby",
            "task": f"Ejecución aislada y self-healing en {project_name}",
            "mcp": "@opencode/deepseek",
            "tone": "info",
            "run": "",
        },
    ]

    merged_nodes = merge_list_by_key(
        existing_state.get("journeyMap", {}).get("nodes", []),
        nodes,
        lambda n: n.get("id"),
    )
    merged_edges = merge_list_by_key(
        existing_state.get("journeyMap", {}).get("edges", []),
        edges,
        lambda e: e.get("id"),
    )

    clean_metrics = {
        "passRate": "0%",
        "totalRuns": 0,
        "failedTests": 0,
        "openBugs": len([b for b in existing_state.get("bugs", []) if isinstance(b, dict) and b.get("status") not in ("Resolved", "Closed")]),
        "avgDuration": "0.0s",
        "activeRun": "",
        "totalTests": 0,
    }

    if existing_state and not force_clean:
        runs = existing_state.get("runs", [])
        suites = existing_state.get("suites", [])
        metrics = existing_state.get("metrics", clean_metrics)
        office_agents = existing_state.get("officeAgents", default_office_agents)
        bugs = existing_state.get("bugs", [])
        metrics["openBugs"] = len([b for b in bugs if isinstance(b, dict) and b.get("status") not in ("Resolved", "Closed")])
        has_live_run = "liveRun" in existing_state
        live_run = existing_state.get("liveRun")
    else:
        runs = []
        suites = []
        metrics = clean_metrics
        office_agents = default_office_agents
        bugs = []
        has_live_run = False
        live_run = None

    state_payload: Dict[str, Any] = {
        "auditScope": audit_scope,
        "project": {
            "name": project_name,
            "repoPath": target_repo or str(repo_root),
            "url": url,
            "backendUrl": "ws://localhost:9222 (Playwright + Chrome CDP)",
            "branch": "main",
            "environment": stack_info["framework"],
            "lastAudit": date_ar,
            "auditScope": audit_scope,
        },
        "metrics": metrics,
        "journeyMap": {
            "nodes": merged_nodes,
            "edges": merged_edges,
        },
        "runs": runs,
        "officeAgents": office_agents,
        "bugs": bugs,
        "specs": specs_from_disk,
        "suites": suites,
    }
    if has_live_run and live_run is not None:
        state_payload["liveRun"] = live_run

    atomic_write_json(target_state, state_payload)
    if project_slug in ("tobitests", "tobi"):
        src_state = repo_root / "web" / "src" / "data" / "tobi-state.json"
        if src_state.exists():
            atomic_write_json(src_state, state_payload)

    return prd_path, matrix_path, target_state


def detect_environment_agents(repo_root: Path) -> List[str]:
    import shutil
    if os.environ.get("TOBI_DETECTED_AGENTS"):
        custom_agents = [a.strip() for a in os.environ["TOBI_DETECTED_AGENTS"].split(",") if a.strip()]
        if custom_agents:
            if "custom" not in custom_agents:
                custom_agents.append("custom")
            return custom_agents

    detected: List[str] = []
    home = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or Path.home())

    is_tobitests_repo = (
        repo_root.resolve() == Path(__file__).resolve().parent.parent
        or ((repo_root / "package.json").exists()
            and "tobitests" in (repo_root / "package.json").read_text(encoding="utf-8", errors="ignore").lower())
    )

    # 1. Antigravity: ~/.gemini/antigravity or AGY env or PATH
    agy_dir = home / ".gemini" / "antigravity"
    if agy_dir.exists() or os.environ.get("ANTIGRAVITY") or os.environ.get("AGY_VERSION") or shutil.which("agy") or shutil.which("antigravity"):
        detected.append("antigravity")

    # 2. OpenCode: opencode binary in PATH or ~/.opencode or ~/.config/opencode, or opencode.json in external repo
    if shutil.which("opencode") or (home / ".opencode").exists() or (home / ".config" / "opencode").exists() or (not is_tobitests_repo and (repo_root / "opencode.json").exists()):
        detected.append("opencode")

    # 3. Claude Code: claude binary in PATH or ~/.claude, or CLAUDE.md in external repo
    if shutil.which("claude") or (home / ".claude").exists() or (not is_tobitests_repo and (repo_root / "CLAUDE.md").exists()):
        detected.append("claude-code")

    # 4. Cursor: cursor binary in PATH or ~/.cursor, or .cursorrules/.cursor in external repo
    if shutil.which("cursor") or (home / ".cursor").exists() or (not is_tobitests_repo and ((repo_root / ".cursorrules").exists() or (repo_root / ".cursor").exists())):
        detected.append("cursor")

    # 5. Codex: codex binary in PATH, or CODEX.md/.codex in external repo
    if shutil.which("codex") or (not is_tobitests_repo and ((repo_root / "CODEX.md").exists() or (repo_root / ".codex").exists())):
        detected.append("codex")

    # 6. Windsurf: windsurf binary in PATH or ~/.codeium, or .windsurfrules in external repo
    if shutil.which("windsurf") or (home / ".codeium").exists() or (not is_tobitests_repo and (repo_root / ".windsurfrules").exists()):
        detected.append("windsurf")

    # Baseline guarantees: always provide at least antigravity and opencode as base runners
    for baseline in ["antigravity", "opencode"]:
        if baseline not in detected:
            detected.append(baseline)

    # 7. Custom agent engine is always supported
    if "custom" not in detected:
        detected.append("custom")

    return detected


def update_blackboard(
    repo_root: Path,
    status: Optional[str] = None,
    orchestrator: Optional[str] = None,
    step: Optional[int] = None,
    project_slug: Optional[str] = None,
    audit_scope: Optional[str] = None,
    primary_agent: Optional[str] = None,
    secondary_agent: Optional[str] = None,
    mode: Optional[str] = None,
    swap_agents: bool = False,
    url: Optional[str] = None,
) -> Path:
    live_path = repo_root / "web" / "public" / "data" / "antigravity-live.json"

    def _update_fn(existing: Dict[str, Any]) -> Dict[str, Any]:
        resolved_status = status or existing.get("blackboardState") or "idle"
        resolved_step = step if step is not None else (existing.get("currentPipelineStep") or 8)
        resolved_scope = audit_scope or existing.get("auditScope") or "fullstack"
        resolved_project = project_slug or existing.get("activeProject") or "tobitests"
        resolved_url = url or existing.get("targetUrl") or "http://localhost:3000"

        now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        prev_orch = existing.get("orchestrationConfig", {})
        eff_primary = primary_agent or prev_orch.get("primaryAgent") or "antigravity"
        eff_secondary = secondary_agent or prev_orch.get("secondaryAgent") or "opencode"
        eff_mode = mode or prev_orch.get("mode") or "dual"

        if swap_agents:
            eff_primary, eff_secondary = eff_secondary, eff_primary

        resolved_orchestrator = orchestrator or existing.get("activeOrchestrator") or eff_primary

        meta = BLACKBOARD_STATE_META.get(resolved_status, BLACKBOARD_STATE_META["idle"])
        next_step_idx = int(existing.get("stepIndex", 68)) + 1

        history: List[Dict[str, Any]] = existing.get("history", [])
        history.insert(
            0,
            {
                "step": next_step_idx,
                "type": f"STEP_{resolved_step}_{resolved_status.upper()}",
                "time": now_iso,
                "action": f"[{resolved_orchestrator.upper()}] Paso {resolved_step}/8: {PIPELINE_STEPS.get(resolved_step, 'Pipeline')} ({resolved_scope.upper()})",
                "icon": meta.get("icon", "🤝"),
            },
        )

        payload = dict(existing)
        payload.update({
            "conversationId": existing.get("conversationId", "local-agent-session"),
            "stepIndex": next_step_idx,
            "type": "BLACKBOARD_SYNC",
            "source": resolved_orchestrator.upper().replace("-", "_"),
            "secondsAgo": 1,
            "isWorking": meta["isWorking"],
            "action": meta["action"],
            "detail": f"Proyecto: {resolved_project} ({resolved_scope.upper()}) · Paso {resolved_step}/8: {PIPELINE_STEPS.get(resolved_step, 'Co-Orquestación')}",
            "icon": meta["icon"],
            "timeLabel": f"{meta['timeLabel']} · Paso {resolved_step}/8",
            "thoughtSnippet": (
                f"Dual Co-Orchestration active for '{resolved_project}' (scope='{resolved_scope}', step={resolved_step}/8). "
                f"Primary Lead: {eff_primary}, Runner: {eff_secondary}, State: {resolved_status}."
            ),
            "blackboardState": resolved_status,
            "activeOrchestrator": resolved_orchestrator,
            "handoffReady": resolved_status in ("standup_meeting", "writing_specs"),
            "currentPipelineStep": resolved_step,
            "pipelineStepName": PIPELINE_STEPS.get(resolved_step, "Co-Orquestación"),
            "activeProject": resolved_project,
            "targetUrl": resolved_url,
            "auditScope": resolved_scope,
            "orchestrationConfig": {
                "primaryAgent": eff_primary,
                "secondaryAgent": eff_secondary,
                "mode": eff_mode,
                "detectedAgents": detect_environment_agents(repo_root),
                "lastRoleSwap": now_iso if swap_agents else prev_orch.get("lastRoleSwap"),
            },
            "agentStates": meta.get("agents", {}),
            "history": history[:12],
            "updatedAt": now_iso,
            "ttlSeconds": 300,
        })
        return payload

    locked_update(live_path, _update_fn)
    return live_path


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="tobitests_cli",
        description="TobiTests Agnostic 8-Step QA Pipeline & Co-Orchestration Blackboard CLI",
    )
    parser.add_argument(
        "--project",
        type=str,
        default=None,
        help="Target project name (e.g., 'mi-app' or 'VetConnect')",
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="Target web application or API base URL (default: http://localhost:3000)",
    )
    parser.add_argument(
        "--repo",
        type=str,
        default=None,
        help="Optional local repository path to scan for stack dependencies and route files",
    )
    parser.add_argument(
        "--scope",
        type=str,
        choices=["frontend", "backend", "fullstack"],
        default=None,
        help="Audit scope: 'frontend' (UI E2E only), 'backend' (pure API HTTP only), or 'fullstack' (combined UI + API). Supports incremental merge across runs.",
    )
    parser.add_argument(
        "--status",
        type=str,
        choices=["idle", "exploring", "writing_specs", "auditing_telemetry", "standup_meeting"],
        default=None,
        help="Shared Blackboard state to broadcast to web/public/data/antigravity-live.json",
    )
    parser.add_argument(
        "--orchestrator",
        type=str,
        choices=["antigravity", "opencode", "claude-code", "cursor", "codex", "windsurf", "custom"],
        default=None,
        help="Active co-orchestrator engine owning the current pipeline phase",
    )
    parser.add_argument(
        "--primary",
        type=str,
        choices=["antigravity", "opencode", "claude-code", "cursor", "codex", "windsurf", "custom"],
        default=None,
        help="Set the Primary Lead Orchestrator agent engine (Steps 1-4, 7)",
    )
    parser.add_argument(
        "--secondary",
        type=str,
        choices=["antigravity", "opencode", "claude-code", "cursor", "codex", "windsurf", "custom", "none"],
        default=None,
        help="Set the Secondary Runner agent engine (Steps 5, 6, 8), or 'none' for solo mode",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["dual", "single"],
        default=None,
        help="Orchestration mode: 'dual' (Co-orchestration) or 'single' (Solo agent)",
    )
    parser.add_argument(
        "--swap-agents",
        action="store_true",
        help="Invert / swap the Primary and Secondary agent roles",
    )
    parser.add_argument(
        "--step",
        type=int,
        choices=range(1, 9),
        default=None,
        help="Current step in the 8-Step Local Autonomous QA Pipeline (1..8)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force clean regeneration of workspace and UI state JSON from scratch",
    )
    parser.add_argument(
        "--wipe-demo",
        action="store_true",
        help="Explicitly allow wiping/regenerating protected demo project states",
    )
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    repo_root = Path(__file__).resolve().parent.parent

    project_slug: Optional[str] = None
    resolved_scope = args.scope
    resolved_url = args.url

    if args.project:
        project_slug = slugify(args.project)
        existing_state = state_path(repo_root, project_slug)
        existing_data: Dict[str, Any] = {}
        if existing_state.exists():
            try:
                existing_data = json.loads(existing_state.read_text(encoding="utf-8"))
            except Exception:
                existing_data = {}

        if not resolved_scope:
            resolved_scope = existing_data.get("auditScope") or "fullstack"
        if not resolved_url:
            resolved_url = existing_data.get("project", {}).get("url") or "http://localhost:3000"

        is_protected_demo = project_slug in {"tobitests", "tobi", "vetconnect", "vetconnect-demo", "tobitests-self-audit"}
        if is_protected_demo and args.force and not args.wipe_demo:
            print(
                f"[TobiTests CLI] ERROR: Refusing to overwrite protected demo '{project_slug}' without --wipe-demo flag.",
                file=sys.stderr,
            )
            return 2

        should_generate = (args.force and args.wipe_demo) if is_protected_demo else True
        if should_generate:
            had_existing = existing_state.exists() and not args.force
            prd_path, matrix_path, state_file = generate_workspace_artifacts(
                repo_root=repo_root,
                project_name=args.project,
                project_slug=project_slug,
                url=resolved_url,
                target_repo=args.repo,
                audit_scope=resolved_scope,
                force_clean=args.force,
            )
            mode_label = "Incrementally merged" if had_existing else "Initialized"
            print(f"[TobiTests CLI] Workspace {mode_label} (scope={resolved_scope}): workspaces/{project_slug}/")
            print(f"  -> Step 3 Normalized PRD : {prd_path.relative_to(repo_root)}")
            print(f"  -> Step 4 Test Matrix    : {matrix_path.relative_to(repo_root)}")
            print(f"  -> UI State JSON         : {state_file.relative_to(repo_root)}")
        else:
            print(f"[TobiTests CLI] Preserving built-in demo state for '{project_slug}' (use --force to overwrite).")

    live_path = update_blackboard(
        repo_root=repo_root,
        status=args.status,
        orchestrator=args.orchestrator,
        step=args.step,
        project_slug=project_slug,
        audit_scope=resolved_scope,
        primary_agent=args.primary,
        secondary_agent=args.secondary,
        mode=args.mode,
        swap_agents=args.swap_agents,
        url=resolved_url,
    )
    print(
        f"[TobiTests CLI] Shared Blackboard synchronized: {live_path.relative_to(repo_root)} "
        f"(orchestrator={args.orchestrator}, scope={resolved_scope}, state={args.status}, step={args.step}/8)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
