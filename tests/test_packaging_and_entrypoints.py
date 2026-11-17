"""Tests for Python packaging, CLI/MCP entrypoints, .mcp.json contract, and path normalization."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
import pytest

try:
    import tomllib  # Python 3.11+
except ModuleNotFoundError:  # pragma: no cover
    tomllib = None  # type: ignore[assignment]

import ingest_playwright_results as ing
import tobitests_cli as cli
import tobitests_mcp as mcp


REPO_ROOT = Path(__file__).resolve().parent.parent


def test_resolve_default_repo_root_checkout_vs_site_packages(tmp_path, monkeypatch):
    checkout = tmp_path / "checkout"
    (checkout / "scripts").mkdir(parents=True)
    (checkout / "playwright.config.ts").write_text("// config\n", encoding="utf-8")

    site_pkg = tmp_path / "venv" / "Lib" / "site-packages"
    site_pkg.mkdir(parents=True)

    user_cwd = tmp_path / "user-app"
    user_cwd.mkdir()
    monkeypatch.chdir(user_cwd)

    assert cli.resolve_default_repo_root(checkout / "scripts") == checkout.resolve()
    assert mcp.resolve_default_repo_root(checkout / "scripts") == checkout.resolve()

    assert cli.resolve_default_repo_root(site_pkg) == user_cwd.resolve()
    assert mcp.resolve_default_repo_root(site_pkg) == user_cwd.resolve()


def test_installed_entrypoint_falls_back_to_cwd(tmp_path, monkeypatch):
    site_pkg = tmp_path / "site-packages"
    site_pkg.mkdir()
    user_cwd = tmp_path / "external-project"
    user_cwd.mkdir()

    monkeypatch.setattr(cli, "SCRIPTS_DIR", site_pkg)
    monkeypatch.setattr(mcp, "SCRIPTS_DIR", site_pkg)
    monkeypatch.chdir(user_cwd)

    rc_cli = cli.main(["--project", "ext-cli-app", "--url", "http://127.0.0.1:4100"])
    assert rc_cli == 0
    assert (user_cwd / "workspaces" / "ext-cli-app" / "agent-digest.json").is_file()

    rc_mcp = mcp.main([
        "--call-tool",
        "tobitests_bootstrap",
        "--args",
        json.dumps({"project": "ext-mcp-app", "url": "http://127.0.0.1:4200"}),
    ])
    assert rc_mcp == 0
    assert (user_cwd / "workspaces" / "ext-mcp-app" / "agent-digest.json").is_file()


def test_repo_root_override_distinct_from_target_repo(tmp_path, monkeypatch):
    checkout = tmp_path / "checkout"
    (checkout / "scripts").mkdir(parents=True)
    (checkout / "playwright.config.ts").write_text("// config\n", encoding="utf-8")

    override_dir = tmp_path / "workspace-override"
    override_dir.mkdir()
    target_app_dir = tmp_path / "target-app"
    target_app_dir.mkdir()
    (target_app_dir / "package.json").write_text(
        json.dumps({"dependencies": {"react": "^19.0.0", "vite": "^6.0.0"}}),
        encoding="utf-8",
    )

    elsewhere = tmp_path / "elsewhere"
    elsewhere.mkdir()
    monkeypatch.setattr(cli, "SCRIPTS_DIR", checkout / "scripts")
    monkeypatch.setattr(mcp, "SCRIPTS_DIR", checkout / "scripts")
    monkeypatch.chdir(elsewhere)

    rc_cli = cli.main([
        "--project",
        "override-proj",
        "--repo-root",
        str(override_dir),
        "--repo",
        str(target_app_dir),
    ])
    assert rc_cli == 0
    prd_path = override_dir / "workspaces" / "override-proj" / "prd-ground-truth.json"
    assert prd_path.is_file()
    assert not (checkout / "workspaces" / "override-proj").exists()

    prd = json.loads(prd_path.read_text(encoding="utf-8"))
    assert prd["project"]["repoPath"] == "../target-app"

    rc_mcp = mcp.main([
        "--repo-root",
        str(override_dir),
        "--call-tool",
        "tobitests_bootstrap",
        "--args",
        json.dumps({"project": "mcp-ovr"}),
    ])
    assert rc_mcp == 0
    assert (override_dir / "workspaces" / "mcp-ovr" / "agent-digest.json").is_file()
    assert not (checkout / "workspaces" / "mcp-ovr").exists()


def test_cli_and_mcp_help_exit_zero_without_blocking(capsys):
    with pytest.raises(SystemExit) as cli_exc:
        cli.main(["--help"])
    assert cli_exc.value.code == 0
    cli_out = capsys.readouterr().out
    assert "--repo-root" in cli_out

    with pytest.raises(SystemExit) as mcp_exc:
        mcp.main(["--help"])
    assert mcp_exc.value.code == 0
    mcp_out = capsys.readouterr().out
    assert "--repo-root" in mcp_out

    cli_proc = subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "tobitests_cli.py"), "--help"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    assert cli_proc.returncode == 0
    assert "--repo-root" in cli_proc.stdout

    mcp_proc = subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "tobitests_mcp.py"), "--help"],
        input="",
        capture_output=True,
        text=True,
        timeout=5,
    )
    assert mcp_proc.returncode == 0
    assert "--repo-root" in mcp_proc.stdout


def test_pyproject_and_mcp_json_contracts():
    pyproject_path = REPO_ROOT / "pyproject.toml"
    assert pyproject_path.is_file()
    if tomllib is not None:
        data = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))
        assert data["project"]["name"] == "tobitests"
        assert data["project"]["version"] == "1.0.0"
        assert data["project"]["scripts"] == {
            "tobitests": "tobitests_cli:main",
            "tobitests-mcp": "tobitests_mcp:main",
        }
        expected_modules = sorted(p.stem for p in (REPO_ROOT / "scripts").glob("*.py"))
        assert sorted(data["tool"]["setuptools"]["py-modules"]) == expected_modules
        assert data["tool"]["setuptools"]["package-dir"] == {"": "scripts"}

    mcp_json_path = REPO_ROOT / ".mcp.json"
    assert mcp_json_path.is_file()
    mcp_raw = mcp_json_path.read_text(encoding="utf-8")
    assert "C:\\Users\\" not in mcp_raw and "C:/Users/" not in mcp_raw
    mcp_cfg = json.loads(mcp_raw)
    assert mcp_cfg["mcpServers"]["tobitests"] == {
        "command": "python",
        "args": ["scripts/tobitests_mcp.py"],
    }


def test_path_normalization_cli_and_ingest(tmp_path):
    ws = tmp_path / "ws"
    ws.mkdir()
    sibling = tmp_path / "sibling-app"
    sibling.mkdir()

    assert cli._normalize_repo_path(None, ws) == "."
    assert cli._normalize_repo_path(str(ws), ws) == "."
    assert cli._normalize_repo_path(str(sibling), ws) == "../sibling-app"

    _, _, state_file = cli.generate_workspace_artifacts(
        repo_root=ws,
        project_name="norm-demo",
        project_slug="norm-demo",
        url="http://127.0.0.1:3000",
        target_repo=str(ws),
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    assert state["project"]["repoPath"] == "."

    # Ingest report containing absolute paths — the ingest function must sanitise them
    # to relative paths so no host-specific paths leak into committed state files.
    # We use the real tmp_path as repo root so _normalize_repo_rel can relativise it,
    # and add a separate fixed Windows-style "other user" path to verify regex stripping.
    (ws / "test-results").mkdir(parents=True, exist_ok=True)
    (ws / "web" / "public" / "data").mkdir(parents=True, exist_ok=True)
    abs_spec = str(ws / "specs" / "norm-demo.spec.ts")
    other_user_path = "C:\\Users\\someone\\Documents\\repo\\specs\\other.spec.ts"
    report = {
        "suites": [
            {
                "title": "norm-demo.spec.ts",
                "file": abs_spec,
                "specs": [
                    {
                        "title": "TC-01: Path sanitization",
                        "file": abs_spec,
                        "tests": [
                            {
                                "status": "unexpected",
                                "results": [
                                    {
                                        "status": "failed",
                                        "duration": 100,
                                        "errors": [
                                            {
                                                "message": f"Expected 200 at {abs_spec}:12:5 and {other_user_path}:4",
                                                "stack": f"at fn ({abs_spec}:12:5)",
                                                "location": {"file": abs_spec, "line": 12, "column": 5},
                                            }
                                        ],
                                        "attachments": [],
                                        "steps": [],
                                        "stdout": [],
                                        "stderr": [],
                                    }
                                ],
                            }
                        ],
                    }
                ],
                "suites": [],
            }
        ],
        "stats": {"duration": 100},
    }
    rep_path = ws / "test-results" / "report.json"
    rep_path.write_text(json.dumps(report), encoding="utf-8")

    out_state = ing.ingest_report_into_state(
        repo_root=ws,
        project_slug="norm-demo",
        report_path=rep_path,
        copied_screenshots=[],
        copied_videos=[],
    )
    ingested_text = out_state.read_text(encoding="utf-8")
    assert "C:\\Users\\" not in ingested_text
    assert "/Users/" not in ingested_text
    # The absolute path to ws must not appear verbatim in the output
    assert str(ws).replace("\\", "/") not in ingested_text

    ingested = json.loads(ingested_text)
    t0 = ingested["runs"][0]["tests"][0]
    assert t0["specPath"] == "specs/norm-demo.spec.ts"
    assert t0["error"]["location"]["file"] == "specs/norm-demo.spec.ts"
    assert "specs/norm-demo.spec.ts:12:5" in t0["error"]["message"]
    assert "specs/norm-demo.spec.ts:12:5" in t0["error"]["stack"]
    b0 = ingested["bugs"][0]
    assert b0["root_cause_file"] == "specs/norm-demo.spec.ts"
    assert b0["diagnostic"]["affectedFile"] == "specs/norm-demo.spec.ts:12"
