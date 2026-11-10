import json
from pathlib import Path
import pytest
from conftest import make_report, make_spec, make_telemetry_file
import ingest_playwright_results as ing


def test_network_trace_lists_errors_with_ms(repo):
    """T1: request + response 403 -> network_trace == ['GET /api/x -> 403 (142ms)'], 200 no aparece."""
    events = [
        {"t": 100, "type": "request", "id": 1, "method": "GET", "url": "/api/x"},
        {"t": 242, "type": "response", "id": 1, "url": "/api/x", "status": 403, "ms": 142},
        {"t": 300, "type": "request", "id": 2, "method": "GET", "url": "/api/ok"},
        {"t": 350, "type": "response", "id": 2, "url": "/api/ok", "status": 200, "ms": 50},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Network Trace Test",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert t["evidence"]["network_trace"] == ["GET /api/x -> 403 (142ms)"]
    assert "telemetry" not in t.get("evidence", {}).get("missing", [])


def test_requestfailed_and_hung_are_listed(repo):
    """T2: requestfailed y hung se listan en network_trace."""
    events = [
        {"t": 100, "type": "request", "id": 1, "method": "POST", "url": "/api/y"},
        {"t": 200, "type": "requestfailed", "id": 1, "url": "/api/y", "error": "net::ERR_CONNECTION_REFUSED"},
        {"t": 300, "type": "request", "id": 2, "method": "GET", "url": "/api/z"},
        {"t": 3400, "type": "hung", "id": 2, "url": "/api/z", "ms": 3100},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Failed & Hung Test",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    trace = t["evidence"]["network_trace"]
    assert "POST /api/y -> FAILED (net::ERR_CONNECTION_REFUSED)" in trace
    assert "GET /api/z -> HUNG (3100ms)" in trace


def test_console_log_only_errors_and_warnings_with_clock(repo):
    """T3: un console.log no aparece; un error/warn aparece con formato [+1234ms] [level] text."""
    events = [
        {"t": 100, "type": "console", "level": "log", "text": "normal info"},
        {"t": 1234, "type": "console", "level": "error", "text": "critical bug"},
        {"t": 1500, "type": "console", "level": "warn", "text": "deprecation notice"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Console Telemetry Test",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    console_log = t["evidence"]["console_log"]
    assert "[+1234ms] [error] critical bug" in console_log
    assert "[+1500ms] [warn] deprecation notice" in console_log
    assert not any("normal info" in line for line in console_log)


def test_nearby_events_for_failed_step(repo):
    """T4: test Failed con step fallido entre t=5000 y 5200 -> error.nearby contiene evento en t=5100 y no en 1000."""
    events = [
        {"t": 1000, "type": "response", "id": 1, "url": "/api/early", "status": 403, "ms": 10},
        {"t": 5000, "type": "step-start", "title": "Submit Form"},
        {"t": 5100, "type": "response", "id": 2, "url": "/api/late", "status": 403, "ms": 10},
        {"t": 5200, "type": "step-end", "title": "Submit Form", "error": "Request timed out"},
        {"t": 8000, "type": "response", "id": 3, "url": "/api/waylater", "status": 403, "ms": 10},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Failed Step Nearby Test",
        status="failed",
        test_status="unexpected",
        steps=[{"title": "Submit Form", "error": {"message": "Request timed out"}, "duration": 200}],
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert t["status"] == "Failed"
    nearby = t["error"]["nearby"]
    assert any("/api/late" in line and "5100" in line for line in nearby)
    assert not any("/api/early" in line for line in nearby)
    assert not any("/api/waylater" in line for line in nearby)


def test_snap_is_assigned_to_matching_step(repo):
    """T5: snap en t=5150 se asigna al step de la ventana 5000-5200 y se copia a evidencia."""
    snap_source = repo / "test-results" / "snap-1-inicio.png"
    snap_source.write_bytes(b"fake-png-bytes")

    events = [
        {"t": 5000, "type": "step-start", "title": "Navigate Home"},
        {"t": 5150, "type": "snap", "name": "inicio", "file": str(snap_source)},
        {"t": 5200, "type": "step-end", "title": "Navigate Home"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Snap Assignment Test",
        steps=[{"title": "Navigate Home", "duration": 200}],
        attachments=[
            {"name": "tobi-telemetry", "path": str(telemetry_path)},
            {"name": "snap-1-inicio", "path": str(snap_source)},
        ],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    step = t["steps"][0]
    assert step["screenshot"].startswith("/evidence/runs/")
    assert step["screenshot"].endswith("snap-1-inicio.png")

    # Archivo copiado en disco
    dest_path = repo / "web" / "public" / step["screenshot"].lstrip("/")
    assert dest_path.exists()
    assert dest_path.read_bytes() == b"fake-png-bytes"


def test_bad_jsonl_lines_are_ignored(repo):
    """T6: líneas inválidas en JSONL se ignoran sin romper la ingesta."""
    events = [
        "this is not json",
        "{broken json",
        {"t": 1234, "type": "console", "level": "error", "text": "valid line"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Corrupt JSONL Test",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert t["evidence"]["console_log"] == ["[+1234ms] [error] valid line"]


def test_missing_telemetry_marks_missing(repo):
    """T7: sin adjunto tobi-telemetry -> 'telemetry' en evidence.missing y sin error."""
    spec = make_spec("No Telemetry Test")
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert "telemetry" in t["evidence"]["missing"]
    assert "console_log" not in t.get("evidence", {})
    assert "network_trace" not in t.get("evidence", {})


def test_caps_at_50(repo):
    """T8: console_log y network_trace se truncan a un máximo de 50 elementos."""
    events = []
    # 60 console errors
    for i in range(60):
        events.append({"t": 100 + i, "type": "console", "level": "error", "text": f"err {i}"})
    # 60 failed requests
    for i in range(60):
        events.append({"t": 200 + i, "type": "request", "id": i + 1, "method": "GET", "url": f"/api/{i}"})
        events.append({"t": 300 + i, "type": "response", "id": i + 1, "url": f"/api/{i}", "status": 500, "ms": 50})

    telemetry_path = make_telemetry_file(repo / "test-results", events)
    spec = make_spec(
        "Cap 50 Test",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert len(t["evidence"]["console_log"]) == 50
    assert len(t["evidence"]["network_trace"]) == 50
