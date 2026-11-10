import json
import os
import shutil
import subprocess
import time
from pathlib import Path
import pytest

import ingest_playwright_results as ing
from conftest import make_report, make_spec


def test_request_only_test_does_not_crash(repo):
    """T1: Un spec sin attachments no debe crashear con UnboundLocalError por idx."""
    runs_dir = repo / "web" / "public" / "evidence" / "runs"
    (runs_dir / "unrelated-screenshot.png").write_bytes(b"dummy-png")

    spec = make_spec("API Health Check", attachments=())
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    assert len(extracted) == 1
    assert extracted[0]["name"] == "API Health Check"


def test_missing_video_stays_empty(repo):
    """T2: Si el 2do test no tiene video, no toma videos ajenos de test-results/."""
    video_real = repo / "test-results" / "real.webm"
    video_real.write_bytes(b"0123456789")  # 10 bytes

    other_video = repo / "test-results" / "other.webm"
    other_video.write_bytes(b"0123456789ABCDEF")

    spec1 = make_spec(
        "Test 1 With Video",
        attachments=(
            {
                "name": "video",
                "path": str(video_real),
                "contentType": "video/webm",
            },
        ),
    )
    spec2 = make_spec("Test 2 Without Video", attachments=())

    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec1, spec2],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )

    assert len(extracted) == 2
    assert extracted[0]["videoUrl"] != ""
    assert extracted[1]["videoUrl"] == ""
    assert "evidence" in extracted[1]
    assert "video" in extracted[1]["evidence"]["missing"]


def test_no_results_is_skipped_notrun(repo):
    """T3: results=[] -> status == 'Skipped', notRun is True, duration == '0.00s'."""
    spec = make_spec("Unrun Test", results=[])
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    assert len(extracted) == 1
    t = extracted[0]
    assert t["status"] == "Skipped"
    assert t.get("notRun") is True
    assert t["duration"] == "0.00s"


@pytest.mark.parametrize(
    "case_kwargs,expected_status,expected_extras",
    [
        ({"results": []}, "Skipped", {"notRun": True, "duration": "0.00s"}),
        ({"test_status": "skipped", "status": "passed"}, "Skipped", {}),
        ({"status": "skipped"}, "Skipped", {}),
        ({"status": "failed"}, "Failed", {}),
        ({"status": "timedOut"}, "Failed", {}),
        ({"status": "interrupted"}, "Failed", {}),
        ({"status": "passed", "test_status": "flaky"}, "Passed", {"flaky": True}),
        ({"status": "passed", "test_status": "expected"}, "Passed", {}),
    ],
)
def test_status_mapping(repo, case_kwargs, expected_status, expected_extras):
    """T4: Mapeo de status y flags aditivas según contrato."""
    spec = make_spec("Status Mapping Test", **case_kwargs)
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    assert len(extracted) == 1
    t = extracted[0]
    assert t["status"] == expected_status
    for k, v in expected_extras.items():
        assert t.get(k) == v


def test_no_synthetic_steps(repo):
    """T5: Sin steps -> steps == [] y stepsMissing is True."""
    spec = make_spec("Test Without Steps", steps=())
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    assert len(extracted) == 1
    t = extracted[0]
    assert t["steps"] == []
    assert t.get("stepsMissing") is True


def test_zero_byte_webm_is_missing(repo):
    """T6: Video de 0 bytes -> videoUrl == '' y 'video' en evidence.missing."""
    zero_webm = repo / "test-results" / "empty.webm"
    zero_webm.write_bytes(b"")

    spec = make_spec(
        "Zero Byte Video Test",
        attachments=(
            {
                "name": "video",
                "path": str(zero_webm),
                "contentType": "video/webm",
            },
        ),
    )
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    assert len(extracted) == 1
    t = extracted[0]
    assert t["videoUrl"] == ""
    assert "evidence" in t
    assert "video" in t["evidence"]["missing"]


def test_copy_failure_is_reported(repo, monkeypatch, capsys):
    """T7: Fallo de copia -> 3 intentos, aviso a stderr y marcado como missing."""
    src_png = repo / "test-results" / "test.png"
    src_png.write_bytes(b"fake-png-content")

    attempts = 0

    def mock_copy2(src, dst):
        nonlocal attempts
        attempts += 1
        raise PermissionError("Access denied")

    monkeypatch.setattr(shutil, "copy2", mock_copy2)
    monkeypatch.setattr(time, "sleep", lambda s: None)

    spec = make_spec(
        "Copy Failure Test",
        attachments=(
            {
                "name": "screenshot",
                "path": str(src_png),
                "contentType": "image/png",
            },
        ),
    )
    suite = {
        "title": "a.spec.ts",
        "file": "a.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="a.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    captured = capsys.readouterr()

    assert attempts == 3
    assert "WARNING: no se pudo copiar" in captured.err
    assert extracted[0]["screenshot"] == ""
    assert "evidence" in extracted[0]
    assert "screenshot" in extracted[0]["evidence"]["missing"]


def test_main_exit_2_on_missing_or_stale_report(repo, monkeypatch):
    """T8: main exit 2 cuando el report falta o es obsoleto."""
    monkeypatch.chdir(repo)

    # (a) report inexistente -> main devuelve 2
    exit_code_missing = ing.main(
        ["--report", str(repo / "test-results" / "nonexistent.json"), "--project", "tobitests", "--repo", str(repo)]
    )
    assert exit_code_missing == 2

    # (b) con --run-playwright y report con mtime de 1 hora atrás -> devuelve 2 y no modifica state ni blackboard
    stale_report = repo / "test-results" / "stale_report.json"
    stale_report.write_text(json.dumps(make_report([])), encoding="utf-8")
    old_time = time.time() - 3600
    os.utime(stale_report, (old_time, old_time))

    monkeypatch.setattr(
        subprocess,
        "run",
        lambda *args, **kwargs: subprocess.CompletedProcess(args=args, returncode=1),
    )

    exit_code_stale = ing.main(
        [
            "--run-playwright",
            "--report",
            str(stale_report),
            "--project",
            "tobitests",
            "--repo",
            str(repo),
        ]
    )
    assert exit_code_stale == 2
    assert not (repo / "web" / "public" / "data" / "antigravity-live.json").exists()
    assert not (repo / "web" / "public" / "data" / "tobi-state.json").exists()


def test_main_exit_3_on_parse_error(repo, monkeypatch):
    """T9: main exit 3 cuando hay error de parseo y blackboard no se modifica."""
    monkeypatch.chdir(repo)
    report_file = repo / "test-results" / "report.json"
    report_file.write_text(json.dumps(make_report([])), encoding="utf-8")

    def mock_extract(*args, **kwargs):
        raise RuntimeError("Corrupt AST/DOM")

    monkeypatch.setattr(ing, "extract_tests_from_suite", mock_extract)

    exit_code = ing.main(
        ["--report", str(report_file), "--project", "tobitests", "--repo", str(repo)]
    )
    assert exit_code == 3
    assert not (repo / "web" / "public" / "data" / "antigravity-live.json").exists()


def test_liveRun_video_never_borrowed(repo):
    """T10: Tests sin video nunca toman videos sueltos en evidence/videos."""
    unrelated_video = repo / "web" / "public" / "evidence" / "videos" / "unrelated.webm"
    unrelated_video.write_bytes(b"unrelated-video-bytes")

    spec1 = make_spec("Test Alpha", attachments=())
    spec2 = make_spec("Test Beta", attachments=())
    report_data = make_report([spec1, spec2])

    report_path = repo / "test-results" / "report.json"
    report_path.write_text(json.dumps(report_data), encoding="utf-8")

    state_file = ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_path,
        copied_screenshots=[],
        copied_videos=[],
    )

    state = json.loads(state_file.read_text(encoding="utf-8"))
    assert state.get("liveRun", {}).get("videoUrl") == ""
