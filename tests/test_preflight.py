import http.server
import json
import os
import socket
import socketserver
import sys
import threading
import time
from pathlib import Path
import pytest

# Add scripts directory to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import ingest_playwright_results as ing


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def test_preflight_success_and_404():
    """T1: _preflight contra un http.server local en puerto efímero devuelve True, también si responde 404."""
    class Handler404(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

        def log_message(self, format, *args):
            pass

    port = _find_free_port()
    server = socketserver.TCPServer(("127.0.0.1", port), Handler404)
    t = threading.Thread(target=server.serve_forever)
    t.daemon = True
    t.start()

    try:
        url = f"http://127.0.0.1:{port}"
        assert ing._preflight(url, timeout=2.0) is True
    finally:
        server.shutdown()
        server.server_close()


def test_preflight_closed_port_returns_false_fast():
    """T2: _preflight contra un puerto cerrado devuelve False en menos de 4 segundos."""
    port = _find_free_port()  # Puerto no abierto
    url = f"http://127.0.0.1:{port}"

    start = time.time()
    result = ing._preflight(url, timeout=2.0)
    elapsed = time.time() - start

    assert result is False
    assert elapsed < 4.0


def test_main_preflight_failure_returns_4(tmp_path, monkeypatch, capsys):
    """T3: main con preflight fallido devuelve 4, NO invoca subprocess.run y no modifica state ni blackboard."""
    monkeypatch.setattr(ing, "_preflight", lambda url, timeout=3.0: False)

    called_subprocess = []
    monkeypatch.setattr(ing.subprocess, "run", lambda *args, **kwargs: called_subprocess.append(args))

    # Crear state para x
    data_dir = tmp_path / "web" / "public" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    state_file = data_dir / "x-state.json"
    state_file.write_text(json.dumps({"project": {"name": "x", "url": "http://localhost:3000"}}), encoding="utf-8")
    mtime_before = state_file.stat().st_mtime_ns

    live_file = data_dir / "antigravity-live.json"
    live_file.write_text(json.dumps({"blackboardState": "idle"}), encoding="utf-8")
    live_mtime_before = live_file.stat().st_mtime_ns

    exit_code = ing.main(["--project", "x", "--run-playwright", "--repo", str(tmp_path)])
    assert exit_code == 4
    assert len(called_subprocess) == 0

    # No se modificó state ni blackboard
    assert state_file.stat().st_mtime_ns == mtime_before
    assert live_file.stat().st_mtime_ns == live_mtime_before

    captured = capsys.readouterr()
    assert "app no responde" in captured.err
    assert "--skip-preflight" in captured.err


def test_main_skip_preflight_invokes_subprocess(tmp_path, monkeypatch):
    """T4: con --skip-preflight sí invoca subprocess.run aun si preflight fallaría."""
    monkeypatch.setattr(ing, "_preflight", lambda url, timeout=3.0: False)

    called_subprocess = []
    class DummyProc:
        returncode = 0
    monkeypatch.setattr(ing.subprocess, "run", lambda *args, **kwargs: (called_subprocess.append((args, kwargs)), DummyProc())[1])

    # Dummy report
    report_file = tmp_path / "test-results" / "report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    report_file.write_text(json.dumps({"suites": []}), encoding="utf-8")

    # Mock ingest and blackboard
    monkeypatch.setattr(ing, "ingest_report_into_state", lambda *args, **kwargs: tmp_path / "state.json")
    monkeypatch.setattr(ing, "transition_blackboard_to_standup", lambda *args, **kwargs: tmp_path / "live.json")

    exit_code = ing.main(["--project", "x", "--run-playwright", "--skip-preflight", "--repo", str(tmp_path), "--report", str(report_file)])
    assert exit_code == 0
    assert len(called_subprocess) == 1


def test_main_env_propagation_target_url(tmp_path, monkeypatch):
    """T5: el env pasado a subprocess.run contiene TOBI_PROJECT == x y TARGET_URL tomado del state o del entorno."""
    monkeypatch.setattr(ing, "_preflight", lambda url, timeout=3.0: True)

    captured_kwargs = []
    class DummyProc:
        returncode = 0
    def mock_run(*args, **kwargs):
        captured_kwargs.append(kwargs)
        return DummyProc()
    monkeypatch.setattr(ing.subprocess, "run", mock_run)

    # 1. Sin TARGET_URL en os.environ -> toma project.url del state
    data_dir = tmp_path / "web" / "public" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    state_file = data_dir / "x-state.json"
    state_file.write_text(json.dumps({"project": {"name": "x", "url": "http://localhost:4000"}}), encoding="utf-8")

    report_file = tmp_path / "test-results" / "report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    report_file.write_text(json.dumps({"suites": []}), encoding="utf-8")

    monkeypatch.setattr(ing, "ingest_report_into_state", lambda *args, **kwargs: state_file)
    monkeypatch.setattr(ing, "transition_blackboard_to_standup", lambda *args, **kwargs: tmp_path / "live.json")
    monkeypatch.delenv("TARGET_URL", raising=False)

    ing.main(["--project", "x", "--run-playwright", "--repo", str(tmp_path), "--report", str(report_file)])
    env1 = captured_kwargs[-1].get("env", {})
    assert env1.get("TOBI_PROJECT") == "x"
    assert env1.get("TARGET_URL") == "http://localhost:4000"

    # 2. Con TARGET_URL en os.environ -> se respeta el del entorno
    monkeypatch.setenv("TARGET_URL", "http://override-env:8080")
    ing.main(["--project", "x", "--run-playwright", "--repo", str(tmp_path), "--report", str(report_file)])
    env2 = captured_kwargs[-1].get("env", {})
    assert env2.get("TOBI_PROJECT") == "x"
    assert env2.get("TARGET_URL") == "http://override-env:8080"


def test_main_no_preflight_for_tobitests_default_url(tmp_path, monkeypatch):
    """T6: no se hace preflight cuando el slug es tobitests y la URL es la default (lo levanta webServer)."""
    preflight_calls = []
    monkeypatch.setattr(ing, "_preflight", lambda url, timeout=3.0: (preflight_calls.append(url), False)[1])

    class DummyProc:
        returncode = 0
    monkeypatch.setattr(ing.subprocess, "run", lambda *args, **kwargs: DummyProc())

    report_file = tmp_path / "test-results" / "report.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    report_file.write_text(json.dumps({"suites": []}), encoding="utf-8")

    monkeypatch.setattr(ing, "ingest_report_into_state", lambda *args, **kwargs: tmp_path / "state.json")
    monkeypatch.setattr(ing, "transition_blackboard_to_standup", lambda *args, **kwargs: tmp_path / "live.json")
    monkeypatch.delenv("TARGET_URL", raising=False)

    exit_code = ing.main(["--project", "tobitests", "--run-playwright", "--repo", str(tmp_path), "--report", str(report_file)])
    assert exit_code == 0
    assert len(preflight_calls) == 0  # Preflight NO fue llamado
