import json
import os
import sys
import threading
import time
from pathlib import Path

# Add scripts directory to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import ingest_playwright_results as ing
import sync_specs
import tobitests_cli as cli


def _make_dummy_state(repo_root: Path, slug: str, specs=None) -> Path:
    data_dir = repo_root / "web" / "public" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    state_file = data_dir / f"{slug}-state.json"
    state = {
        "project": {"name": slug, "url": "http://localhost:3000"},
        "specs": specs or [],
        "runs": [],
        "metrics": {"totalRuns": 0, "passRate": "0%"},
    }
    state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")
    return state_file


def test_sync_once_updates_code_from_disk(tmp_path):
    """T1: state con un spec cuyo code es viejo -> tras sync_once, code == contenido real."""
    spec_file = tmp_path / "specs" / "tobitests-sample.spec.ts"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    fresh_code = "import { test } from '@playwright/test';\ntest('fresh', async () => {});\n"
    spec_file.write_text(fresh_code, encoding="utf-8")

    state_file = _make_dummy_state(
        tmp_path,
        "tobitests",
        specs=[
            {
                "name": "tobitests-sample.spec.ts",
                "domain": "Sample",
                "status": "Skipped",
                "testsCount": 0,
                "code": "old code",
            }
        ],
    )

    changed = sync_specs.sync_once(tmp_path, "tobitests")
    assert changed == 1

    updated = json.loads(state_file.read_text(encoding="utf-8"))
    assert updated["specs"][0]["code"] == fresh_code
    assert updated["specs"][0]["testsCount"] == 1


def test_sync_once_adds_new_spec_files(tmp_path):
    """T2: un specs/<slug>-nuevo.spec.ts no listado se agrega con status:Skipped, testsCount correcto y code real."""
    state_file = _make_dummy_state(tmp_path, "tobitests", specs=[])

    spec_file = tmp_path / "specs" / "tobitests-nuevo.spec.ts"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    code = "import { test } from '@playwright/test';\ntest('one', () => {});\ntest('two', () => {});\n"
    spec_file.write_text(code, encoding="utf-8")

    changed = sync_specs.sync_once(tmp_path, "tobitests")
    assert changed == 1

    updated = json.loads(state_file.read_text(encoding="utf-8"))
    assert len(updated["specs"]) == 1
    new_spec = updated["specs"][0]
    assert new_spec["name"] == "tobitests-nuevo.spec.ts"
    assert new_spec["status"] == "Skipped"
    assert new_spec["testsCount"] == 2
    assert new_spec["code"] == code


def test_sync_once_missing_state_returns_exit_2(tmp_path, capsys):
    """T3: main(["--project", "x"]) sin state -> devuelve 2 con mensaje a stderr (sin traceback)."""
    code = sync_specs.main(["--project", "nonexistent-project", "--repo", str(tmp_path)])
    assert code == 2

    captured = capsys.readouterr()
    assert "Error:" in captured.err or "not found" in captured.err.lower()
    assert "Traceback" not in captured.err


def test_sync_is_idempotent(tmp_path):
    """T4: dos sync_once seguidos -> el segundo devuelve 0 y no reescribe el archivo (mtime igual)."""
    spec_file = tmp_path / "specs" / "tobitests-sample.spec.ts"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    spec_file.write_text("test('x', () => {});\n", encoding="utf-8")

    state_file = _make_dummy_state(
        tmp_path,
        "tobitests",
        specs=[{"name": "tobitests-sample.spec.ts", "code": "old", "status": "Skipped", "testsCount": 0}],
    )

    first_changed = sync_specs.sync_once(tmp_path, "tobitests")
    assert first_changed == 1
    mtime_after_first = state_file.stat().st_mtime_ns

    # Small pause to ensure time difference if touched
    time.sleep(0.01)

    second_changed = sync_specs.sync_once(tmp_path, "tobitests")
    assert second_changed == 0
    mtime_after_second = state_file.stat().st_mtime_ns

    assert mtime_after_first == mtime_after_second


def test_watch_detects_change_and_stops(tmp_path):
    """T5: watch(repo_root, slug, interval=0.02, max_cycles=5) sincroniza cambios concurrentes y se detiene."""
    spec_file = tmp_path / "specs" / "tobitests-sample.spec.ts"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    spec_file.write_text("test('initial', () => {});\n", encoding="utf-8")

    state_file = _make_dummy_state(
        tmp_path,
        "tobitests",
        specs=[{"name": "tobitests-sample.spec.ts", "code": "test('initial', () => {});\n", "status": "Skipped", "testsCount": 1}],
    )

    def modifier():
        time.sleep(0.03)
        spec_file.write_text("test('initial', () => {});\ntest('second', () => {});\n", encoding="utf-8")

    t = threading.Thread(target=modifier)
    t.start()

    sync_specs.watch(tmp_path, "tobitests", interval=0.02, max_cycles=6)
    t.join()

    updated = json.loads(state_file.read_text(encoding="utf-8"))
    assert updated["specs"][0]["testsCount"] == 2


def test_state_path_is_single_source(tmp_path):
    """T6: los 3 scripts devuelven el mismo path para tobitests y para un slug cualquiera."""
    # Test for tobitests
    p_sync = sync_specs.state_path(tmp_path, "tobitests")
    p_ing = ing.state_path(tmp_path, "tobitests")
    p_cli = cli.state_path(tmp_path, "tobitests")
    assert p_sync == p_ing == p_cli

    # Test for arbitrary slug
    p_sync_custom = sync_specs.state_path(tmp_path, "mi-proyecto")
    p_ing_custom = ing.state_path(tmp_path, "mi-proyecto")
    p_cli_custom = cli.state_path(tmp_path, "mi-proyecto")
    assert p_sync_custom == p_ing_custom == p_cli_custom
    assert p_sync_custom.name == "mi-proyecto-state.json"


def test_opencode_json_scripts():
    """T7: opencode.json ya no tiene dev:all recursivo, audit:init no tiene subcomando init, y sync:watch ejecuta --watch."""
    opencode_path = REPO_ROOT / "opencode.json"
    data = json.loads(opencode_path.read_text(encoding="utf-8"))
    scripts = data.get("scripts", {})

    assert scripts.get("dev:all") == "npm run dev --prefix web"
    assert "init" not in scripts.get("audit:init", "").split()
    assert "--watch" in scripts.get("sync:watch", "")
