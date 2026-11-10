import hashlib
import importlib.util
import json
import os
import shutil
import sys
from pathlib import Path
from types import ModuleType
from typing import Dict, List, Tuple
import pytest

# (a) sys.path.insert(0, <raíz>/scripts)
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))


def compute_snapshot(dirs: List[Path], repo_root: Path) -> Dict[str, str]:
    """Calcula {ruta_relativa: sha256} para todos los archivos bajo dirs."""
    snap: Dict[str, str] = {}
    for d in dirs:
        if not d.exists():
            continue
        for root, _, files in os.walk(d):
            for f in files:
                p = Path(root) / f
                try:
                    rel = p.relative_to(repo_root).as_posix()
                    content = p.read_bytes()
                    h = hashlib.sha256(content).hexdigest()
                    snap[rel] = h
                except OSError:
                    pass
    return snap


def diff_snapshots(before: Dict[str, str], after: Dict[str, str]) -> List[Tuple[str, str]]:
    """Devuelve [(change_type, rel_path)] donde change_type in ('created', 'deleted', 'modified')."""
    changes: List[Tuple[str, str]] = []
    before_keys = set(before.keys())
    after_keys = set(after.keys())

    for k in sorted(after_keys - before_keys):
        changes.append(("created", k))

    for k in sorted(before_keys - after_keys):
        changes.append(("deleted", k))

    for k in sorted(before_keys & after_keys):
        if before[k] != after[k]:
            changes.append(("modified", k))

    return changes


@pytest.fixture(scope="session", autouse=True)
def repo_integrity_guardian():
    repo_root = REPO_ROOT
    watched_dirs = [
        repo_root / "web" / "public" / "data",
        repo_root / "web" / "src" / "data",
        repo_root / "web" / "public" / "evidence",
        repo_root / "specs",
        repo_root / "scripts",
    ]
    workspaces_dir = repo_root / "workspaces"
    if workspaces_dir.exists():
        watched_dirs.append(workspaces_dir)

    before_snap = compute_snapshot(watched_dirs, repo_root)

    yield

    after_snap = compute_snapshot(watched_dirs, repo_root)
    diffs = diff_snapshots(before_snap, after_snap)

    if diffs:
        lines = [f"[{change_type}] {path}" for change_type, path in diffs[:20]]
        msg = (
            f"Repo integrity violation! {len(diffs)} file(s) altered in real repository during test session:\n"
            + "\n".join(lines)
        )
        raise AssertionError(msg)


def _load_module_from_file(module_name: str, file_path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module from {file_path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod


@pytest.fixture
def isolated_scripts(tmp_path):
    scripts_dest = tmp_path / "scripts"
    scripts_dest.mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "public" / "data").mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "src" / "data").mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "public" / "evidence" / "runs").mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "public" / "evidence" / "videos").mkdir(parents=True, exist_ok=True)
    (tmp_path / "specs").mkdir(parents=True, exist_ok=True)
    (tmp_path / "test-results").mkdir(parents=True, exist_ok=True)

    real_scripts = REPO_ROOT / "scripts"
    for py_file in real_scripts.glob("*.py"):
        shutil.copy2(py_file, scripts_dest / py_file.name)

    class IsolatedContainer:
        def __init__(self, root: Path):
            self.root = root
            self.cli = _load_module_from_file(f"tobitests_cli_iso_{tmp_path.name}", scripts_dest / "tobitests_cli.py")
            self.ingest = _load_module_from_file(f"ingest_playwright_results_iso_{tmp_path.name}", scripts_dest / "ingest_playwright_results.py")
            self.sync = _load_module_from_file(f"sync_specs_iso_{tmp_path.name}", scripts_dest / "sync_specs.py")
            if (scripts_dest / "run_deep_audit.py").exists():
                self.deep_audit = _load_module_from_file(f"run_deep_audit_iso_{tmp_path.name}", scripts_dest / "run_deep_audit.py")

        def __getitem__(self, item: str):
            if item in ("cli", "tobitests_cli"):
                return self.cli
            if item in ("ingest", "ingest_playwright_results"):
                return self.ingest
            if item in ("sync", "sync_specs"):
                return self.sync
            raise KeyError(item)

    return IsolatedContainer(tmp_path)



# (b) helpers
def make_spec(
    title: str,
    status: str = "passed",
    attachments: tuple = (),
    steps: tuple = (),
    errors: tuple = (),
    test_status: str = "expected",
    results: bool = True,
    duration: int = 120,
    stdout: tuple = (),
    stderr: tuple = (),
):
    if results is False or results == []:
        results_list = []
    elif isinstance(results, list):
        results_list = results
    else:
        results_list = [
            {
                "status": status,
                "duration": duration,
                "attachments": list(attachments),
                "steps": list(steps),
                "errors": list(errors),
                "stdout": list(stdout),
                "stderr": list(stderr),
            }
        ]

    return {
        "title": title,
        "file": "a.spec.ts",
        "tests": [
            {
                "status": test_status,
                "results": results_list,
            }
        ],
    }


def make_report(specs, duration: int = 1000, file: str = "a.spec.ts"):
    return {
        "suites": [
            {
                "title": Path(file).name,
                "file": file,
                "specs": list(specs),
                "suites": [],
            }
        ],
        "stats": {"duration": duration},
    }


def make_multi_suite_report(suite_specs_pairs, duration: int = 1000):
    suites = []
    for file_path, specs in suite_specs_pairs:
        suites.append(
            {
                "title": Path(file_path).name,
                "file": file_path,
                "specs": list(specs),
                "suites": [],
            }
        )
    return {
        "suites": suites,
        "stats": {"duration": duration},
    }


def make_telemetry_file(tmp_path: Path, events, name: str = "tobi-telemetry.jsonl") -> Path:
    p = tmp_path / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        for e in events:
            if isinstance(e, str):
                f.write(e + "\n")
            else:
                f.write(json.dumps(e) + "\n")
    return p


# (c) fixture repo(tmp_path)
@pytest.fixture
def repo(tmp_path):
    (tmp_path / "web" / "public" / "evidence" / "runs").mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "public" / "evidence" / "videos").mkdir(parents=True, exist_ok=True)
    (tmp_path / "web" / "public" / "data").mkdir(parents=True, exist_ok=True)
    (tmp_path / "test-results").mkdir(parents=True, exist_ok=True)
    return tmp_path
