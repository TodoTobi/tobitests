import json
from pathlib import Path
import pytest
from conftest import make_multi_suite_report, make_report, make_spec, make_telemetry_file
import ingest_playwright_results as ing


def test_ingest_updates_journey_map_counts_and_edges(repo):
    """Verifica que update_journey_map_from_run actualiza testsCount, failedCount, touches y edges."""
    initial_state = {
        "project": {"name": "TobiTests", "url": "http://localhost:5173"},
        "metrics": {
            "passRate": "0%",
            "totalRuns": 0,
            "failedTests": 0,
            "openBugs": 0,
            "avgDuration": "0.0s",
            "activeRun": "",
            "totalTests": 0,
        },
        "journeyMap": {
            "nodes": [
                {
                    "id": "landing",
                    "title": "Portada",
                    "route": "http://localhost:5173/",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                    "category": "auth",
                },
                {
                    "id": "office",
                    "title": "La Oficina 2.5D",
                    "route": "/office",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                    "category": "workspace",
                },
                {
                    "id": "specs",
                    "title": "Test Specs Playwright",
                    "route": "/specs",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                    "category": "diagnostics",
                },
            ],
            "edges": [
                {
                    "id": "e-landing-office",
                    "from": "landing",
                    "to": "office",
                    "status": "Skipped",
                },
                {
                    "id": "e-office-specs",
                    "from": "office",
                    "to": "specs",
                    "status": "Skipped",
                },
            ],
        },
        "runs": [],
        "bugs": [],
    }

    state_file = ing.state_path(repo, "tobitests")
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    # tobitests-office.spec.ts: 1 Passed, 1 Failed
    spec_office_pass = make_spec("TC-OFFICE-01: Renderizado", status="passed", test_status="expected")
    spec_office_fail = make_spec("TC-OFFICE-02: Fallo en oficina", status="failed", test_status="unexpected")

    # tobitests-specs.spec.ts: 1 Skipped
    spec_specs_skip = make_spec("TC-SPECS-01: Spec skipped", status="skipped", test_status="skipped")

    report_data = make_multi_suite_report([
        ("specs/tobitests-office.spec.ts", [spec_office_pass, spec_office_fail]),
        ("specs/tobitests-specs.spec.ts", [spec_specs_skip]),
    ])

    report_file = repo / "test-results" / "report.json"
    report_file.write_text(json.dumps(report_data), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_file,
        copied_screenshots=[],
        copied_videos=[],
    )

    updated_state = json.loads(state_file.read_text(encoding="utf-8"))
    nodes_by_id = {n["id"]: n for n in updated_state["journeyMap"]["nodes"]}
    edges_by_id = {e["id"]: e for e in updated_state["journeyMap"]["edges"]}

    office = nodes_by_id["office"]
    assert office["testsCount"] == 2
    assert office["failedCount"] == 1
    assert office["touches"] >= 2
    assert office["blockedCount"] == 0

    specs = nodes_by_id["specs"]
    assert specs["testsCount"] == 0
    assert specs["blockedCount"] == 1

    assert edges_by_id["e-landing-office"]["status"] == "Failed"
    assert edges_by_id["e-office-specs"]["status"] == "Skipped"


def test_ingest_never_invents_blocked_count_when_all_pass(repo):
    """Verifica que cuando todos los tests pasan, failedCount y blockedCount son 0 en todos los nodos."""
    initial_state = {
        "project": {"name": "TobiTests", "url": "http://localhost:5173"},
        "metrics": {
            "passRate": "0%",
            "totalRuns": 0,
            "failedTests": 0,
            "openBugs": 0,
            "avgDuration": "0.0s",
            "activeRun": "",
            "totalTests": 0,
        },
        "journeyMap": {
            "nodes": [
                {
                    "id": "landing",
                    "title": "Portada",
                    "route": "/",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                },
                {
                    "id": "office",
                    "title": "Office",
                    "route": "/office",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                },
            ],
            "edges": [
                {"id": "e-1", "from": "landing", "to": "office", "status": "Skipped"}
            ],
        },
    }
    state_file = ing.state_path(repo, "tobitests")
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    spec_pass = make_spec("TC-OFFICE-01: OK", status="passed", test_status="expected")
    report_data = make_report([spec_pass], file="specs/tobitests-office.spec.ts")
    report_file = repo / "test-results" / "report.json"
    report_file.write_text(json.dumps(report_data), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_file,
        copied_screenshots=[],
        copied_videos=[],
    )

    updated_state = json.loads(state_file.read_text(encoding="utf-8"))
    for node in updated_state["journeyMap"]["nodes"]:
        assert node["failedCount"] == 0
        assert node["blockedCount"] == 0


def test_telemetry_touch_and_navigation_events_map_to_nodes(repo):
    """Verifica que eventos de telemetría touch y navigation incrementan testsCount y touches."""
    initial_state = {
        "project": {"name": "TobiTests", "url": "http://localhost:5180"},
        "metrics": {
            "passRate": "0%",
            "totalRuns": 0,
            "failedTests": 0,
            "openBugs": 0,
            "avgDuration": "0.0s",
            "activeRun": "",
            "totalTests": 0,
        },
        "journeyMap": {
            "nodes": [
                {
                    "id": "settings",
                    "title": "Configuracion",
                    "route": "/settings",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                },
                {
                    "id": "office",
                    "title": "Office",
                    "route": "/office",
                    "testsCount": 0,
                    "touches": 0,
                    "failedCount": 0,
                    "blockedCount": 0,
                },
            ],
            "edges": [],
        },
    }
    state_file = ing.state_path(repo, "tobitests")
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    events = [
        {"t": 10, "type": "touch", "target": "/settings"},
        {"t": 20, "type": "navigation", "url": "http://localhost:5180/office"},
    ]
    telemetry_path = make_telemetry_file(repo / "test-results", events)

    spec = make_spec(
        "Generic UI Test",
        status="passed",
        test_status="expected",
        attachments=[{"name": "tobi-telemetry", "path": str(telemetry_path)}],
    )
    report_data = make_report([spec], file="specs/generic.spec.ts")
    report_file = repo / "test-results" / "report.json"
    report_file.write_text(json.dumps(report_data), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_file,
        copied_screenshots=[],
        copied_videos=[],
    )

    updated_state = json.loads(state_file.read_text(encoding="utf-8"))
    nodes_by_id = {n["id"]: n for n in updated_state["journeyMap"]["nodes"]}

    assert nodes_by_id["settings"]["testsCount"] >= 1
    assert nodes_by_id["settings"]["touches"] >= 1
    assert nodes_by_id["office"]["testsCount"] >= 1
    assert nodes_by_id["office"]["touches"] >= 1
