import json
from pathlib import Path
import pytest

import tobitests_cli as cli


def test_fresh_init_has_no_results(tmp_path):
    """T1: Un bootstrap fresco no produce resultados falsos (runs=[], suites=[], sin liveRun)."""
    prd_path, matrix_path, state_path = cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    state = json.loads(state_path.read_text(encoding="utf-8"))
    assert state["runs"] == []
    assert state["suites"] == []
    assert "liveRun" not in state
    assert state["metrics"]["totalTests"] == 0
    assert state["metrics"]["passRate"] == "0%"
    assert state["metrics"]["totalRuns"] == 0
    assert state["metrics"]["avgDuration"] == "0.0s"
    assert state["metrics"]["activeRun"] == ""


def test_no_fabricated_strings(tmp_path):
    """T2: El JSON serializado del state no contiene strings fabricadas de oráculos o ejecuciones."""
    _, _, state_path = cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    state_text = state_path.read_text(encoding="utf-8")
    assert "Verified clean under" not in state_text
    assert "Oráculo de 3 Capas completado" not in state_text
    assert "DEVTOOLS_CDP" not in state_text
    assert "4.8s" not in state_text
    assert "100%" not in state_text


def test_specs_come_from_disk(tmp_path):
    """T3: Los specs en state vienen exclusivamente de archivos existentes en disco."""
    _, _, state_path = cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    state = json.loads(state_path.read_text(encoding="utf-8"))
    spec_file = tmp_path / "specs" / "demo.spec.ts"
    assert spec_file.exists()

    # Solo debe listar demo.spec.ts que realmente existe
    assert len(state["specs"]) == 1
    assert state["specs"][0]["name"] == "demo.spec.ts"
    assert state["specs"][0]["code"] == spec_file.read_text(encoding="utf-8")
    assert state["specs"][0]["status"] == "Skipped"

    # No debe inventar specs inexistentes
    assert not any("demo-auth.spec.ts" in s["name"] for s in state["specs"])


def test_matrix_marks_implemented(tmp_path):
    """T4: Matriz marca implemented: true solo para demo.spec.ts con sus cases reales."""
    _, matrix_path, _ = cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    matrix = json.loads(matrix_path.read_text(encoding="utf-8"))
    suites = matrix["suites"]

    demo_suite = next(s for s in suites if s["specFile"] == "demo.spec.ts")
    assert demo_suite["implemented"] is True
    assert len(demo_suite["cases"]) == 4
    assert demo_suite["cases"][0] == "TC-01: Entry Point & DOM Readiness (Layer 1 Oracle)"
    assert demo_suite["cases"][1] == "TC-02: Runtime Telemetry & Console Health (Layer 1 Oracle)"
    assert demo_suite["cases"][2] == "TC-03: Interactive Surface & Accessibility Tree (Layer 2 Oracle)"
    assert demo_suite["cases"][3] == "TC-04: Viewport Adaptability & Layout Integrity (Layer 3 Oracle)"

    # Las demás suites planificadas están en implemented: false
    other_suites = [s for s in suites if s["specFile"] != "demo.spec.ts"]
    assert len(other_suites) > 0
    for s in other_suites:
        assert s["implemented"] is False


def test_journey_counters_are_zero_and_edges_skipped(tmp_path):
    """T5: Contadores de journeyMap en 0 y edges en Skipped / '—' / 'Pendiente de verificación'."""
    _, _, state_path = cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    state = json.loads(state_path.read_text(encoding="utf-8"))

    for node in state["journeyMap"]["nodes"]:
        assert node["testsCount"] == 0
        assert node["touches"] == 0
        assert node["failedCount"] == 0
        assert node["blockedCount"] == 0

    for edge in state["journeyMap"]["edges"]:
        assert edge["status"] == "Skipped"
        assert edge["duration"] == "—"
        assert edge["humanExplanation"] == "Pendiente de verificación"


def test_rerun_preserves_real_data(tmp_path):
    """T6: Re-ejecutar init preserva runs, liveRun, metrics, officeAgents y bugs reales."""
    public_data = tmp_path / "web" / "public" / "data"
    public_data.mkdir(parents=True, exist_ok=True)
    state_file = public_data / "demo-state.json"

    initial_state = {
        "auditScope": "frontend",
        "project": {"name": "demo", "url": "http://localhost:3000", "auditScope": "frontend"},
        "metrics": {"totalRuns": 7, "passRate": "85%", "totalTests": 10, "failedTests": 1, "openBugs": 2},
        "runs": [{"id": "#RUN-PW-REAL", "tests": [{"name": "real test"}]}],
        "liveRun": {"id": "#RUN-PW-REAL", "status": "Completed", "steps": []},
        "officeAgents": [{"id": "orchestrator", "customRole": "Lead"}],
        "bugs": [{"id": "BUG-01", "title": "Real Bug"}],
        "suites": [{"name": "Suite 1"}],
        "specs": [],
        "journeyMap": {"nodes": [], "edges": []},
    }
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
        audit_scope="backend",
        force_clean=False,
    )
    saved = json.loads(state_file.read_text(encoding="utf-8"))

    # Preservados intactos
    assert saved["runs"][0]["id"] == "#RUN-PW-REAL"
    assert saved["liveRun"]["id"] == "#RUN-PW-REAL"
    assert saved["metrics"]["totalRuns"] == 7
    assert saved["officeAgents"][0].get("customRole") == "Lead"
    assert len(saved["bugs"]) == 1
    assert saved["suites"] == [{"name": "Suite 1"}]

    # Actualizados por el init
    assert saved["auditScope"] == "backend"
    assert saved["project"]["auditScope"] == "backend"


def test_force_on_protected_demo_requires_wipe_flag(monkeypatch):
    """T7: --force sobre slug protegido devuelve 2 sin modificar archivos si falta --wipe-demo."""
    # Sin --wipe-demo -> exit 2
    exit_code = cli.main(["--project", "tobitests", "--force"])
    assert exit_code == 2

    # Con --wipe-demo -> procede (retorna 0)
    exit_code_ok = cli.main(["--project", "tobitests", "--force", "--wipe-demo"])
    assert exit_code_ok == 0


def test_generated_spec_is_honest(tmp_path):
    """T8: El spec generado no tiene sleeps, screenshots manuales ni typeof, y tiene asserts reales."""
    cli.generate_workspace_artifacts(
        repo_root=tmp_path,
        project_name="demo",
        project_slug="demo",
        url="http://localhost:3000",
        target_repo=None,
    )
    spec_text = (tmp_path / "specs" / "demo.spec.ts").read_text(encoding="utf-8")

    assert "waitForTimeout" not in spec_text
    assert "page.screenshot(" not in spec_text
    assert "typeof hasSevereOverflow" not in spec_text
    assert "expect(pageErrors).toEqual([])" in spec_text
    assert "expect(hasSevereOverflow).toBe(false)" in spec_text
