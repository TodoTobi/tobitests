import datetime
import json
import os
import re
import subprocess
from pathlib import Path
import pytest

import ingest_playwright_results as ing
from conftest import make_multi_suite_report, make_report, make_spec


def test_run_id_format_and_consistency(repo, monkeypatch):
    """T1: _new_run_id format y consistencia en runs[0].id == liveRun.id == metrics.activeRun."""
    fixed_time = datetime.datetime(2026, 1, 9, 15, 30, 45)
    run_id = ing._new_run_id(fixed_time)
    assert run_id == "#RUN-PW-20260109-153045"

    spec = make_spec("Test Alpha")
    report1 = repo / "test-results" / "r1.json"
    report1.write_text(json.dumps(make_report([spec])), encoding="utf-8")

    # Ingest 1 con fixed_time
    monkeypatch.setattr(ing.datetime, "datetime", type("MockDateTime", (datetime.datetime,), {
        "now": classmethod(lambda cls, tz=None: fixed_time)
    }))

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report1,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    assert state["runs"][0]["id"] == run_id
    assert state["liveRun"]["id"] == run_id
    assert state["metrics"]["activeRun"] == run_id

    # Ingest 2 con otro timestamp
    second_time = datetime.datetime(2026, 1, 9, 15, 35, 10)
    second_run_id = ing._new_run_id(second_time)
    monkeypatch.setattr(ing.datetime, "datetime", type("MockDateTime", (datetime.datetime,), {
        "now": classmethod(lambda cls, tz=None: second_time)
    }))
    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report1,
        copied_screenshots=[],
        copied_videos=[],
    )
    state2 = json.loads(state_file.read_text(encoding="utf-8"))
    assert len(state2["runs"]) == 2
    assert state2["runs"][0]["id"] == second_run_id
    assert state2["runs"][1]["id"] == run_id


def test_git_info_uses_git_and_falls_back(repo, monkeypatch):
    """T2: _git_info obtiene branch y commit vía git, o hace fallback a ('main', 'HEAD')."""
    def mock_subp(cmd, **kwargs):
        if "--abbrev-ref" in cmd:
            return subprocess.CompletedProcess(args=cmd, returncode=0, stdout="feat-x\n")
        if "--short" in cmd:
            return subprocess.CompletedProcess(args=cmd, returncode=0, stdout="abc1234\n")
        return subprocess.CompletedProcess(args=cmd, returncode=1, stdout="")

    monkeypatch.setattr(subprocess, "run", mock_subp)
    branch, commit = ing._git_info(repo)
    assert branch == "feat-x"
    assert commit == "abc1234"

    def mock_err(*args, **kwargs):
        raise FileNotFoundError("git binary not found")

    monkeypatch.setattr(subprocess, "run", mock_err)
    fallback_b, fallback_c = ing._git_info(repo)
    assert fallback_b == "main"
    assert fallback_c == "HEAD"

    # Verificar que el run usa estos valores de git
    monkeypatch.setattr(subprocess, "run", mock_subp)
    report_path = repo / "test-results" / "r.json"
    report_path.write_text(json.dumps(make_report([make_spec("Test Git")])), encoding="utf-8")
    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_path,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    assert state["runs"][0]["branch"] == "feat-x"
    assert state["runs"][0]["commit"] == "abc1234"


def test_merge_key_uses_spec_path(repo):
    """T3: Tests con mismo name pero distinto suite.file (a/x.spec.ts y b/x.spec.ts) no se pisan."""
    spec_a = make_spec("Common Test Name")
    spec_b = make_spec("Common Test Name")
    report_data = make_multi_suite_report([
        ("a/x.spec.ts", [spec_a]),
        ("b/x.spec.ts", [spec_b]),
    ])
    report_path = repo / "test-results" / "multi_suite.json"
    report_path.write_text(json.dumps(report_data), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_path,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    tests = state["runs"][0]["tests"]
    assert len(tests) == 2
    assert {t.get("specPath") for t in tests} == {"a/x.spec.ts", "b/x.spec.ts"}


def test_full_run_marks_missing_tests_stale(repo):
    """T4: Corrida completa (partial=False) marca tests previos ausentes como stale=True y no cuentan."""
    spec1 = make_spec("Test Old", status="passed")
    r1 = repo / "test-results" / "r1.json"
    r1.write_text(json.dumps(make_report([spec1], file="specs/old.spec.ts")), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r1,
        copied_screenshots=[],
        copied_videos=[],
        partial=False,
    )

    # Segunda corrida sin Test Old
    spec2 = make_spec("Test New", status="passed")
    r2 = repo / "test-results" / "r2.json"
    r2.write_text(json.dumps(make_report([spec2], file="specs/new.spec.ts")), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r2,
        copied_screenshots=[],
        copied_videos=[],
        partial=False,
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    tests = state["runs"][0]["tests"]
    assert len(tests) == 2

    old_test = next(t for t in tests if t["name"] == "Test Old")
    new_test = next(t for t in tests if t["name"] == "Test New")

    assert old_test.get("stale") is True
    assert not new_test.get("stale")

    # Metrics y conteos solo cuentan tests activos
    assert state["runs"][0]["total"] == 1
    assert state["runs"][0]["passed"] == 1
    assert state["runs"][0]["failed"] == 0
    assert state["metrics"]["totalTests"] == 1


def test_partial_run_leaves_other_specs_untouched(repo):
    """T5: Con partial=True, tests de otros archivos de spec no se marcan stale ni se tocan."""
    spec_a = make_spec("Test A", status="passed")
    r1 = repo / "test-results" / "r1.json"
    r1.write_text(json.dumps(make_report([spec_a], file="specs/a.spec.ts")), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r1,
        copied_screenshots=[],
        copied_videos=[],
    )

    spec_b = make_spec("Test B", status="passed")
    r2 = repo / "test-results" / "r2.json"
    r2.write_text(json.dumps(make_report([spec_b], file="specs/b.spec.ts")), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r2,
        copied_screenshots=[],
        copied_videos=[],
        partial=True,
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    tests = state["runs"][0]["tests"]
    assert len(tests) == 2

    test_a = next(t for t in tests if t["name"] == "Test A")
    assert not test_a.get("stale")
    assert test_a["status"] == "Passed"


def test_duration_matches_counts(repo):
    """T6: run.duration es suma de tests no-stale ({x:.1f}s), nunca '4.2s'."""
    spec1 = make_spec("Test 1", duration=250)
    spec2 = make_spec("Test 2", duration=350)
    r = repo / "test-results" / "r.json"
    r.write_text(json.dumps(make_report([spec1, spec2])), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    run = state["runs"][0]
    assert run["duration"] == "0.6s"
    assert "4.2s" not in run["duration"]


def test_evidence_is_versioned_per_run(repo, monkeypatch):
    """T7: Evidencias se versionan bajo RUN-PW-<stamp>/<testSlug>/ y RUN-PW-<stamp>/."""
    fixed_time = datetime.datetime(2026, 1, 9, 15, 30, 45)
    monkeypatch.setattr(ing.datetime, "datetime", type("MockDateTime", (datetime.datetime,), {
        "now": classmethod(lambda cls, tz=None: fixed_time)
    }))

    src_png = repo / "test-results" / "shot.png"
    src_png.write_bytes(b"image-content")
    src_webm = repo / "test-results" / "vid.webm"
    src_webm.write_bytes(b"video-content-10bytes")

    spec = make_spec(
        "Hero Dashboard Test",
        attachments=(
            {"name": "screenshot", "path": str(src_png), "contentType": "image/png"},
            {"name": "video", "path": str(src_webm), "contentType": "video/webm"},
        ),
    )
    r = repo / "test-results" / "r.json"
    r.write_text(json.dumps(make_report([spec])), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    t = state["runs"][0]["tests"][0]

    assert t["screenshot"].startswith("/evidence/runs/RUN-PW-20260109-153045/hero-dashboard-test/")
    assert t["videoUrl"].startswith("/evidence/videos/RUN-PW-20260109-153045/")

    scr_rel = t["screenshot"].lstrip("/")
    vid_rel = t["videoUrl"].lstrip("/")
    assert (repo / "web" / "public" / scr_rel).exists()
    assert (repo / "web" / "public" / vid_rel).exists()


def test_old_run_dirs_are_pruned_but_foreign_files_survive(repo, monkeypatch):
    """T8: Tras 6 ingestas solo quedan 5 carpetas RUN-PW-*; archivos ajenos no se tocan."""
    runs_dir = repo / "web" / "public" / "evidence" / "runs"
    vids_dir = repo / "web" / "public" / "evidence" / "videos"

    foreign_png = runs_dir / "tobi-01-landing.png"
    foreign_png.write_bytes(b"foreign-image")
    foreign_webm = vids_dir / "doctor-portal-audit.webm"
    foreign_webm.write_bytes(b"foreign-video")

    src_png = repo / "test-results" / "scr.png"
    src_png.write_bytes(b"scr")

    for i in range(6):
        iter_time = datetime.datetime(2026, 1, 9, 10, i, 0)
        monkeypatch.setattr(ing.datetime, "datetime", type("MockDateTime", (datetime.datetime,), {
            "now": classmethod(lambda cls, tz=None, it=iter_time: it)
        }))
        spec = make_spec(f"Test Run {i}", attachments=({"name": "screenshot", "path": str(src_png)},))
        r = repo / "test-results" / f"r_{i}.json"
        r.write_text(json.dumps(make_report([spec])), encoding="utf-8")
        ing.ingest_report_into_state(
            repo_root=repo,
            project_slug="tobitests",
            report_path=r,
            copied_screenshots=[],
            copied_videos=[],
        )

    # Verificar que solo quedan 5 carpetas RUN-PW-* en evidence/runs
    run_folders = [p.name for p in runs_dir.iterdir() if p.is_dir() and re.match(r"^RUN-PW-\d{8}-\d{6}$", p.name)]
    assert len(run_folders) == 5

    # Verificar que los archivos ajenos siguen intactos
    assert foreign_png.exists()
    assert foreign_webm.exists()


def test_liveRun_is_truthful(repo):
    """T9: liveRun tiene agent='Playwright', description='<spec> · <status>', y telemetría veraz."""
    spec1 = make_spec("Test Alpha", status="passed")
    spec2 = make_spec("Test Beta", status="failed")
    r = repo / "test-results" / "r.json"
    r.write_text(json.dumps(make_report([spec1, spec2], file="specs/flow.spec.ts")), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=r,
        copied_screenshots=[],
        copied_videos=[],
    )
    state = json.loads(state_file.read_text(encoding="utf-8"))
    live_run = state["liveRun"]

    for step in live_run["steps"]:
        assert step["agent"] == "Playwright"
        assert " · " in step["description"]

    # Telemetría de evidencia: no debe decir DEVTOOLS_CDP, source debe ser PLAYWRIGHT
    logs = live_run.get("telemetryLogs", [])
    assert not any(l.get("source") == "DEVTOOLS_CDP" for l in logs)
    ev_log = next(l for l in logs if "Evidencia" in l["message"])
    assert ev_log["source"] == "PLAYWRIGHT"
    assert "0 videos" in ev_log["message"]


def test_ingest_preserves_unmanaged_state_keys(repo):
    """T4: La ingesta preserva claves no gestionadas (bugs, specs, journeyMap, officeAgents, routes)."""
    prior_bugs = [{"id": "BUG-01", "title": "Divergencia de estado"}]
    prior_specs = [{"name": "tobitests-smoke.spec.ts"}]
    prior_journey = {"nodes": [{"id": "n1"}], "edges": []}
    prior_agents = [{"id": "orchestrator", "status": "idle"}]
    prior_routes = [{"path": "/office"}]

    state_dir = repo / "web" / "public" / "data"
    state_dir.mkdir(parents=True, exist_ok=True)
    state_file = state_dir / "tobitests-state.json"
    initial_state = {
        "project": {"name": "TobiTests"},
        "metrics": {"passRate": "100%", "totalRuns": 1, "failedTests": 0, "openBugs": 1, "avgDuration": "0.1s", "activeRun": "#RUN-OLD"},
        "runs": [],
        "bugs": prior_bugs,
        "specs": prior_specs,
        "journeyMap": prior_journey,
        "officeAgents": prior_agents,
        "routes": prior_routes,
    }
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    spec = make_spec("Test State Preservation")
    report_file = repo / "test-results" / "rep.json"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    report_file.write_text(json.dumps(make_report([spec])), encoding="utf-8")

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_file,
        copied_screenshots=[],
        copied_videos=[],
    )

    saved_state = json.loads(state_file.read_text(encoding="utf-8"))
    assert saved_state["bugs"] == prior_bugs
    assert saved_state["specs"] == prior_specs
    assert saved_state["journeyMap"] == prior_journey
    assert saved_state["officeAgents"] == prior_agents
    assert saved_state["routes"] == prior_routes

