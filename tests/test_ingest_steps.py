import json
from pathlib import Path
import pytest

import ingest_playwright_results as ing
from conftest import make_report, make_spec


def test_strip_ansi():
    """T1: _strip_ansi elimina códigos de escape ANSI correctamente."""
    raw = "\x1b[2mexpect\x1b[22m(...)"
    assert ing._strip_ansi(raw) == "expect(...)"

    color_str = "\x1b[31mError: \x1b[32mExpected true\x1b[39m"
    assert ing._strip_ansi(color_str) == "Error: Expected true"


def test_classify_step():
    """T2: _classify_step clasifica según las 5 reglas."""
    assert ing._classify_step("expect(page).toHaveTitle('Title')") == "Assert"
    assert ing._classify_step("page.goto('http://localhost:5173')") == "Navigate"
    assert ing._classify_step("page.locator('#submit').click()") == "Click"
    assert ing._classify_step("page.locator('.row').dblclick()") == "Click"
    assert ing._classify_step("page.locator('input').fill('admin')") == "Fill"
    assert ing._classify_step("page.locator('input').type('admin')") == "Fill"
    assert ing._classify_step("page.locator('input').press('Enter')") == "Fill"
    assert ing._classify_step("page.waitForTimeout(500)") == "Action"


def test_is_internal_step():
    """T3: _is_internal_step detecta hooks, fixtures y cleanup."""
    assert ing._is_internal_step("Before Hooks") is True
    assert ing._is_internal_step('Fixture "page"') is True
    assert ing._is_internal_step("After Hooks") is True
    assert ing._is_internal_step("Worker Cleanup") is True
    assert ing._is_internal_step("beforeAll hook") is True
    assert ing._is_internal_step("afterAll hook") is True
    assert ing._is_internal_step("Attach screenshot") is True
    assert ing._is_internal_step("expect.toBeVisible") is False
    assert ing._is_internal_step("page.goto('http://localhost')") is False


def test_internal_steps_are_not_listed(repo):
    """T4: Steps internos (Before/After Hooks) se filtran y los steps restantes se renumeran 1..N."""
    raw_steps = (
        {"title": "Before Hooks", "duration": 10},
        {"title": "page.goto('http://localhost:5173')", "duration": 45},
        {"title": "expect.toBeVisible", "duration": 25},
        {"title": "After Hooks", "duration": 15},
    )
    spec = make_spec("Test Navigation", steps=raw_steps)
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
    steps = extracted[0]["steps"]
    assert len(steps) == 2
    assert steps[0]["step"] == 1
    assert steps[0]["action"] == "Navigate"
    assert steps[0]["target"] == "page.goto('http://localhost:5173')"

    assert steps[1]["step"] == 2
    assert steps[1]["action"] == "Assert"
    assert steps[1]["target"] == "expect.toBeVisible"


def test_failed_step_keeps_full_clean_message(repo):
    """T5: Error con ANSI se limpia y actual NO se trunca a 140 (permite hasta 2000 chars)."""
    long_msg = "Error: Expected \x1b[31mtrue\x1b[39m but received \x1b[32mfalse\x1b[39m. " + ("detail info " * 40)
    assert len(long_msg) > 400

    raw_steps = (
        {"title": "expect(button).toBeVisible()", "duration": 50, "error": {"message": long_msg}},
    )
    spec = make_spec("Test Assertion Failure", steps=raw_steps)
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
    step = extracted[0]["steps"][0]
    assert step["status"] == "Failed"
    assert "\x1b[" not in step["actual"]
    assert len(step["actual"]) > 200
    assert "detail info" in step["actual"]


def test_expected_is_not_hardcoded(repo):
    """T6: Steps exitosos no inventan 'Assertion satisfied': expected='' y actual=''."""
    raw_steps = (
        {"title": "page.goto('http://localhost:5173')", "duration": 30},
        {"title": "expect(title).toHaveText('Home')", "duration": 20},
    )
    spec = make_spec("Test Success Steps", steps=raw_steps)
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
    for st in extracted[0]["steps"]:
        assert st["status"] == "Passed"
        assert st["expected"] == ""
        assert st["actual"] == ""


def test_test_level_error_and_location(repo):
    """T7: Result con errors poblado setea test.error con message, stack y location, y status='Failed'."""
    spec_error = {
        "message": "Timed out 5000ms waiting for \x1b[31mlocator('#app')\x1b[39m",
        "stack": "Error: Timed out\n    at tests/flow.spec.ts:24:10",
        "location": {"file": "tests/flow.spec.ts", "line": 24, "column": 10},
    }
    spec = make_spec("Timeout Spec", status="timedOut", errors=(spec_error,))
    suite = {
        "title": "flow.spec.ts",
        "file": "tests/flow.spec.ts",
        "specs": [spec],
        "suites": [],
    }
    extracted = ing.extract_tests_from_suite(
        suite=suite,
        default_spec="tests/flow.spec.ts",
        default_screenshot="",
        default_video="",
        repo_root=repo,
    )
    t = extracted[0]
    assert t["status"] == "Failed"
    assert "error" in t
    assert "\x1b[" not in t["error"]["message"]
    assert t["error"]["message"] == "Timed out 5000ms waiting for locator('#app')"
    assert "stack" in t["error"]
    assert t["error"]["location"] == {"file": "tests/flow.spec.ts", "line": 24, "column": 10}


def test_logs_from_stdout_stderr(repo):
    """T8: stdout y stderr se unen en test.logs sin escapes ANSI, tope 2000 chars."""
    stdout_entries = ({"text": "Server responded: \x1b[32m200 OK\x1b[39m\n"},)
    stderr_entries = ({"text": "Warning: Deprecated \x1b[33mAPI call\x1b[39m\n"},)

    spec = make_spec("Logged Test", stdout=stdout_entries, stderr=stderr_entries)
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
    t = extracted[0]
    assert "logs" in t
    assert "\x1b[" not in t["logs"]
    assert "Server responded: 200 OK\nWarning: Deprecated API call" in t["logs"]


def test_error_context_attachment_is_copied(repo):
    """T9: Attachment error-context se copia a evidencia y se guarda en test.evidence.errorContext."""
    ctx_file = repo / "test-results" / "error-context.md"
    ctx_file.write_text("# Failure Diagnosis\nStack trace breakdown...", encoding="utf-8")

    spec = make_spec(
        "Context Test",
        status="failed",
        attachments=(
            {
                "name": "error-context",
                "path": str(ctx_file),
                "contentType": "text/markdown",
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
    t = extracted[0]
    assert "evidence" in t
    assert "errorContext" in t["evidence"]
    assert t["evidence"]["errorContext"].startswith("/evidence/runs/")

    rel_path = t["evidence"]["errorContext"].lstrip("/")
    assert (repo / "web" / "public" / rel_path).exists()
    assert (repo / "web" / "public" / rel_path).read_text(encoding="utf-8").startswith("# Failure Diagnosis")
