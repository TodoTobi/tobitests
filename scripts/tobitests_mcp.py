#!/usr/bin/env python3
"""
TobiTests Native MCP (Model Context Protocol) Stdio Server & Tool Dispatcher.

Exposes TobiTests autonomous QA capabilities to AI coding agents (Antigravity,
OpenCode, Claude Code, Cursor, Codex, Windsurf) with < 450-token structured digests.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

SCRIPTS_DIR = Path(__file__).resolve().parent
DEFAULT_REPO_ROOT = SCRIPTS_DIR.parent

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import ingest_playwright_results as ing  # noqa: E402
import tobitests_cli as cli  # noqa: E402


TOOLS_CATALOG: List[Dict[str, Any]] = [
    {
        "name": "tobitests_bootstrap",
        "description": (
            "Initialize or update a project workspace, scan stack/routes/APIs/schemas, "
            "generate prd-ground-truth.json, test-matrix.json, specs, and compact agent-digest.json."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string", "description": "Target project name or slug"},
                "url": {"type": "string", "description": "Target web app or API base URL"},
                "repo": {"type": "string", "description": "Target repository path to inspect"},
                "scope": {
                    "type": "string",
                    "enum": ["frontend", "backend", "fullstack"],
                    "default": "fullstack",
                },
                "synthesizeSuites": {
                    "type": "boolean",
                    "default": False,
                    "description": "Generate all planned domain .spec.ts suites on disk",
                },
                "workspaceRoot": {
                    "type": "string",
                    "description": "Optional TobiTests root override",
                },
            },
            "required": ["project"],
        },
    },
    {
        "name": "tobitests_run_audit",
        "description": (
            "Execute Playwright tests, ingest telemetry, classify failures "
            "(PRODUCT_BUG / SELECTOR_FRAGILITY / ENV_DRIFT), auto-resolve passing bugs, "
            "and return compact agent-digest.json."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string", "default": "tobitests"},
                "spec": {"type": "string", "description": "Optional specific spec file"},
                "scope": {"type": "string", "enum": ["frontend", "backend", "fullstack"]},
                "skipPreflight": {"type": "boolean", "default": False},
                "healSpecs": {"type": "boolean", "default": False},
                "workspaceRoot": {"type": "string"},
            },
        },
    },
    {
        "name": "tobitests_get_digest",
        "description": (
            "Return compact workspaces/<project>/agent-digest.json with actionable bugs, "
            "white-box root cause, healing candidates, and untested routes (saves >90% tokens)."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string", "default": "tobitests"},
                "workspaceRoot": {"type": "string"},
            },
        },
    },
    {
        "name": "tobitests_heal_selectors",
        "description": (
            "Analyze or apply semantic selector self-healing on specs/*.spec.ts "
            "for SELECTOR_FRAGILITY findings."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string", "default": "tobitests"},
                "apply": {"type": "boolean", "default": False},
                "workspaceRoot": {"type": "string"},
            },
        },
    },
    {
        "name": "tobitests_blackboard_sync",
        "description": (
            "Synchronize Shared Blackboard (antigravity-live.json) state and pipeline step "
            "for dual co-orchestration and Office 2.5D visualization."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["idle", "exploring", "writing_specs", "auditing_telemetry", "standup_meeting"],
                },
                "step": {"type": "integer", "minimum": 1, "maximum": 8},
                "project": {"type": "string"},
                "orchestrator": {
                    "type": "string",
                    "enum": ["antigravity", "opencode", "claude-code", "cursor", "codex", "windsurf", "custom"],
                },
                "scope": {"type": "string", "enum": ["frontend", "backend", "fullstack"]},
                "url": {"type": "string"},
                "workspaceRoot": {"type": "string"},
            },
        },
    },
]


def _resolve_root(arguments: Dict[str, Any], default_repo_root: Optional[Path]) -> Path:
    ws_override = arguments.get("workspaceRoot")
    if ws_override:
        return Path(str(ws_override)).resolve()
    return (default_repo_root or DEFAULT_REPO_ROOT).resolve()


def dispatch_tool(
    name: str,
    arguments: Optional[Dict[str, Any]] = None,
    default_repo_root: Optional[Path] = None,
) -> Dict[str, Any]:
    args = arguments or {}
    root = _resolve_root(args, default_repo_root)

    if name == "tobitests_bootstrap":
        project_name = str(args.get("project") or "").strip()
        if not project_name:
            raise ValueError("Missing required argument: 'project'")
        project_slug = cli.slugify(project_name)
        url = str(args.get("url") or "http://localhost:3000")
        target_repo = str(args["repo"]) if args.get("repo") else None
        scope = str(args.get("scope") or "fullstack")
        synthesize_suites = bool(args.get("synthesizeSuites", False))

        prd_path, matrix_path, state_file = cli.generate_workspace_artifacts(
            repo_root=root,
            project_name=project_name,
            project_slug=project_slug,
            url=url,
            target_repo=target_repo,
            audit_scope=scope,
            synthesize_suites=synthesize_suites,
        )
        digest_file = root / "workspaces" / project_slug / "agent-digest.json"
        digest = json.loads(digest_file.read_text(encoding="utf-8")) if digest_file.exists() else {}
        return {
            "ok": True,
            "project": project_slug,
            "prdPath": str(prd_path.relative_to(root).as_posix()),
            "matrixPath": str(matrix_path.relative_to(root).as_posix()),
            "statePath": str(state_file.relative_to(root).as_posix()),
            "digest": digest,
        }

    if name == "tobitests_run_audit":
        project_slug = cli.slugify(str(args.get("project") or "tobitests"))
        argv = ["--project", project_slug, "--run-playwright", "--repo", str(root)]
        if args.get("spec"):
            argv.extend(["--spec", str(args["spec"])])
        if args.get("scope"):
            argv.extend(["--scope", str(args["scope"])])
        if args.get("skipPreflight"):
            argv.append("--skip-preflight")
        if args.get("healSpecs"):
            argv.append("--heal-specs")

        exit_code = ing.main(argv)
        digest_file = root / "workspaces" / project_slug / "agent-digest.json"
        digest = json.loads(digest_file.read_text(encoding="utf-8")) if digest_file.exists() else None
        return {
            "ok": exit_code == 0,
            "exitCode": exit_code,
            "project": project_slug,
            "digest": digest,
        }

    if name == "tobitests_get_digest":
        project_slug = cli.slugify(str(args.get("project") or "tobitests"))
        digest_file = root / "workspaces" / project_slug / "agent-digest.json"
        if digest_file.exists():
            return json.loads(digest_file.read_text(encoding="utf-8"))

        state_file = ing.state_path(root, project_slug)
        if state_file.exists():
            state = json.loads(state_file.read_text(encoding="utf-8"))
            generated = ing.generate_agent_digest(root, project_slug, state)
            return json.loads(generated.read_text(encoding="utf-8"))

        return {
            "ok": False,
            "error": f"No state or digest found for project '{project_slug}'",
            "project": project_slug,
        }

    if name == "tobitests_heal_selectors":
        project_slug = cli.slugify(str(args.get("project") or "tobitests"))
        apply_changes = bool(args.get("apply", False))
        state_file = ing.state_path(root, project_slug)
        if not state_file.exists():
            return {"ok": False, "error": f"State file not found for project '{project_slug}'"}
        state = json.loads(state_file.read_text(encoding="utf-8"))
        candidates = ing.heal_fragile_selectors(root, state.get("bugs", []), apply_changes=apply_changes)
        return {
            "ok": True,
            "project": project_slug,
            "apply": apply_changes,
            "candidates": candidates,
        }

    if name == "tobitests_blackboard_sync":
        live_path = cli.update_blackboard(
            repo_root=root,
            status=args.get("status"),
            orchestrator=args.get("orchestrator"),
            step=args.get("step"),
            project_slug=cli.slugify(args["project"]) if args.get("project") else None,
            audit_scope=args.get("scope"),
            url=args.get("url"),
        )
        live_data = json.loads(live_path.read_text(encoding="utf-8"))
        return {
            "ok": True,
            "blackboardState": live_data.get("blackboardState"),
            "currentPipelineStep": live_data.get("currentPipelineStep"),
            "activeProject": live_data.get("activeProject"),
            "activeOrchestrator": live_data.get("activeOrchestrator"),
        }

    raise KeyError(f"Unknown MCP tool: {name}")


def handle_request(
    request: Dict[str, Any],
    default_repo_root: Optional[Path] = None,
) -> Optional[Dict[str, Any]]:
    req_id = request.get("id")
    method = request.get("method", "")
    params = request.get("params") or {}

    if method == "notifications/initialized":
        return None

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "tobitests-mcp", "version": "2.0.0"},
            },
        }

    if method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": TOOLS_CATALOG},
        }

    if method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments") or {}
        try:
            res = dispatch_tool(tool_name, tool_args, default_repo_root=default_repo_root)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}],
                    "isError": False,
                },
            }
        except Exception as exc:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps({"ok": False, "error": str(exc)})}],
                    "isError": True,
                },
            }

    if req_id is None:
        return None

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {"code": -32601, "message": f"Method not found: {method}"},
    }


def serve_stdio(default_repo_root: Optional[Path] = None) -> int:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        stripped = line.strip()
        if not stripped:
            continue

        # Support optional LSP Content-Length framing as well as raw NDJSON
        if stripped.lower().startswith("content-length:"):
            try:
                length = int(stripped.split(":", 1)[1].strip())
            except ValueError:
                continue
            while True:
                hdr = sys.stdin.readline()
                if not hdr or hdr.strip() == "":
                    break
            body = sys.stdin.read(length)
            if not body:
                break
            raw_json = body
        else:
            raw_json = stripped

        try:
            req = json.loads(raw_json)
        except json.JSONDecodeError as exc:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {exc}"},
            }
            sys.stdout.write(json.dumps(err_resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()
            continue

        resp = handle_request(req, default_repo_root=default_repo_root)
        if resp is not None:
            sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()

    return 0


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="tobitests_mcp",
        description="TobiTests Native MCP Stdio Server & CLI Tool Runner",
    )
    parser.add_argument("--list-tools", action="store_true", help="Print available MCP tools as JSON and exit")
    parser.add_argument("--call-tool", type=str, default=None, help="Execute a single MCP tool and print JSON result")
    parser.add_argument("--args", type=str, default="{}", help="JSON arguments for --call-tool")
    parser.add_argument("--repo-root", type=str, default=None, help="Optional TobiTests root path")
    args = parser.parse_args(argv)

    root = Path(args.repo_root).resolve() if args.repo_root else DEFAULT_REPO_ROOT

    if args.list_tools:
        print(json.dumps({"tools": TOOLS_CATALOG}, ensure_ascii=False, indent=2))
        return 0

    if args.call_tool:
        tool_args = json.loads(args.args or "{}")
        result = dispatch_tool(args.call_tool, tool_args, default_repo_root=root)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    return serve_stdio(default_repo_root=root)


if __name__ == "__main__":
    sys.exit(main())
