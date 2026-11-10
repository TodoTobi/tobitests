import json
from pathlib import Path
import pytest
from conftest import make_report, make_spec, make_telemetry_file
import ingest_playwright_results as ing


def test_t1_consume_tobi_steps_json_with_metadata(repo):
    """T1: Ingesta consume test-results/tobi-steps.json cuando existe, asocia test.steps con metadata."""
    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Sample Test": {
            "file": "a.spec.ts",
            "title": "Sample Test",
            "retry": 0,
            "startEpochMs": 1000000000,
            "steps": [
                {
                    "title": "page.goto(http://localhost:5173)",
                    "category": "pw:api",
                    "depth": 0,
                    "startEpochMs": 1000000150,
                    "durationMs": 120,
                    "error": None,
                }
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec("Sample Test")
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    assert len(tests) == 1
    t = tests[0]
    assert t.get("stepsMissing") is not True
    assert len(t["steps"]) == 1
    s = t["steps"][0]
    assert s["target"] == "page.goto(http://localhost:5173)"
    assert s["duration"] == "120ms"
    assert s["status"] == "Passed"
    assert s.get("category") == "Navigate"
    assert s.get("t") == 150


def test_t2_tobi_steps_has_prevalence_over_report_json(repo):
    """T2: Los steps de tobi-steps.json tienen prevalencia sobre los de report.json."""
    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Prevalence Test": {
            "file": "a.spec.ts",
            "title": "Prevalence Test",
            "retry": 0,
            "startEpochMs": 1000000000,
            "steps": [
                {
                    "title": "page.click(button#login)",
                    "category": "pw:api",
                    "depth": 0,
                    "startEpochMs": 1000000100,
                    "durationMs": 45,
                    "error": None,
                }
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec(
        "Prevalence Test",
        steps=[{"title": "test.step('dummy step')", "duration": 999}],
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
    assert len(t["steps"]) == 1
    assert t["steps"][0]["target"] == "page.click(button#login)"
    assert t["steps"][0]["duration"] == "45ms"


def test_t3_clock_alignment_with_telemetry_epoch(repo):
    """T3: Si el test tiene telemetría con clock, s['t'] == s['startEpochMs'] - T0."""
    t0_epoch = 1700000000000
    telemetry_events = [
        {"t": 0, "type": "clock", "epochMs": t0_epoch},
        {"t": 100, "type": "console", "level": "log", "text": "boot"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", telemetry_events)

    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Clock Align Test": {
            "file": "a.spec.ts",
            "title": "Clock Align Test",
            "retry": 0,
            "startEpochMs": t0_epoch,
            "steps": [
                {
                    "title": "expect(title).toBeVisible()",
                    "category": "expect",
                    "depth": 0,
                    "startEpochMs": t0_epoch + 1250,
                    "durationMs": 30,
                    "error": None,
                }
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec(
        "Clock Align Test",
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
    assert t["steps"][0]["t"] == 1250


def test_t4_failed_step_extracted_to_test_error(repo):
    """T4: El paso fallido se identifica por s['error'] is not None."""
    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Failing Test": {
            "file": "a.spec.ts",
            "title": "Failing Test",
            "retry": 0,
            "startEpochMs": 1000000000,
            "steps": [
                {
                    "title": "page.goto(/dashboard)",
                    "category": "pw:api",
                    "depth": 0,
                    "startEpochMs": 1000000100,
                    "durationMs": 80,
                    "error": None,
                },
                {
                    "title": "expect(page).toHaveURL(/.*dashboard/)",
                    "category": "expect",
                    "depth": 0,
                    "startEpochMs": 1000000200,
                    "durationMs": 500,
                    "error": "Error: Timed out 500ms waiting for expect(locator).toHaveURL()",
                },
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec("Failing Test", status="failed")
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
    assert t["steps"][1]["status"] == "Failed"
    assert "Timed out" in t["steps"][1]["actual"]
    assert "Timed out" in t["error"]["message"]


def test_t5_nearby_events_window_from_step_timestamps(repo):
    """T5: error.nearby se arma con los eventos en la ventana de tiempo del fallo."""
    t0_epoch = 1700000000000
    telemetry_events = [
        {"t": 0, "type": "clock", "epochMs": t0_epoch},
        {"t": 1000, "type": "console", "level": "log", "text": "too early"},
        {"t": 5500, "type": "response", "id": 1, "url": "/api/data", "status": 500, "ms": 40},
        {"t": 6050, "type": "console", "level": "error", "text": "crash in dashboard"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", telemetry_events)

    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Nearby Window Test": {
            "file": "a.spec.ts",
            "title": "Nearby Window Test",
            "retry": 0,
            "startEpochMs": t0_epoch,
            "steps": [
                {
                    "title": "page.goto(/)",
                    "category": "pw:api",
                    "depth": 0,
                    "startEpochMs": t0_epoch + 100,
                    "durationMs": 200,
                    "error": None,
                },
                {
                    "title": "expect(data).toBeLoaded()",
                    "category": "expect",
                    "depth": 0,
                    "startEpochMs": t0_epoch + 6000,
                    "durationMs": 100,
                    "error": "Failed to load data",
                },
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec(
        "Nearby Window Test",
        status="failed",
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
    nearby = t.get("error", {}).get("nearby", [])
    assert any("crash in dashboard" in line for line in nearby)
    assert not any("too early" in line for line in nearby)


def test_t6_graceful_fallback_without_steps_file(repo):
    """T6: Si tobi-steps.json no existe, degrada al comportamiento previo."""
    spec = make_spec("Fallback Test")
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    assert len(tests) == 1
    t = tests[0]
    assert t["steps"] == []
    assert t.get("stepsMissing") is True


def test_t7_console_and_network_stats_on_all_events(repo):
    """T7: console_stats y network_stats se calculan sobre TODOS los eventos (incluso 200 y log)."""
    telemetry_events = [
        {"t": 0, "type": "clock", "epochMs": 1700000000000},
        {"t": 10, "type": "console", "level": "log", "text": "hello"},
        {"t": 20, "type": "console", "level": "warn", "text": "warning msg"},
        {"t": 30, "type": "console", "level": "error", "text": "boom error"},
        {"t": 40, "type": "request", "id": 1, "method": "GET", "url": "/api/users"},
        {"t": 60, "type": "response", "id": 1, "url": "/api/users", "status": 200, "ms": 20},
        {"t": 70, "type": "request", "id": 2, "method": "POST", "url": "/api/fail"},
        {"t": 90, "type": "response", "id": 2, "url": "/api/fail", "status": 500, "ms": 20},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", telemetry_events)

    spec = make_spec(
        "Stats Test",
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
    ev = t.get("evidence", {})
    assert "console_stats" in ev
    assert "network_stats" in ev

    cs = ev["console_stats"]
    assert cs["total"] == 3
    assert cs["by_level"].get("error") == 1
    assert cs["by_level"].get("warn") == 1 or cs["by_level"].get("warning") == 1
    assert cs["by_level"].get("log") == 1

    ns = ev["network_stats"]
    assert ns["total"] == 2
    assert ns["by_status_group"].get("2xx") == 1
    assert ns["by_status_group"].get("5xx") == 1
    assert ns["failed_count"] == 1


def test_t8_clock_event_excluded_from_console_log(repo):
    """T8: La línea clock no se interpreta como consola ni ensucia console_log."""
    telemetry_events = [
        {"t": 0, "type": "clock", "epochMs": 1700000000000},
        {"t": 50, "type": "console", "level": "error", "text": "real error"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", telemetry_events)

    spec = make_spec(
        "Clock Exclusion Test",
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
    c_log = t.get("evidence", {}).get("console_log", [])
    assert len(c_log) == 1
    assert "real error" in c_log[0]
    assert not any("clock" in line.lower() for line in c_log)


def test_t9_takes_latest_retry_from_steps(repo):
    """T9: Si un test se reintentó, tobi-steps.json contiene la última corrida (retry == max(retries))."""
    steps_file = repo / "test-results" / "tobi-steps.json"
    steps_file.parent.mkdir(parents=True, exist_ok=True)
    steps_payload = {
        "a.spec.ts::Retry Test": {
            "file": "a.spec.ts",
            "title": "Retry Test",
            "retry": 1,
            "startEpochMs": 1000000000,
            "steps": [
                {
                    "title": "page.click(button#retry-worked)",
                    "category": "pw:api",
                    "depth": 0,
                    "startEpochMs": 1000000050,
                    "durationMs": 30,
                    "error": None,
                }
            ],
        }
    }
    steps_file.write_text(json.dumps(steps_payload), encoding="utf-8")

    spec = make_spec("Retry Test")
    report = make_report([spec])

    tests = ing.extract_tests_from_suite(
        report["suites"][0],
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    t = tests[0]
    assert len(t["steps"]) == 1
    assert t["steps"][0]["target"] == "page.click(button#retry-worked)"
