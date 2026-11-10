import json
import sys
from pathlib import Path
import pytest

# (a) sys.path.insert(0, <raíz>/scripts)
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))


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
