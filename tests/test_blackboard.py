import json
import os
import threading
import time
from pathlib import Path
import pytest

import ingest_playwright_results as ing
import tobitests_cli as cli


def test_parse_args_defaults_are_none():
    """T1: parse_args([]) tiene defaults None para scope/status/step/url/orchestrator."""
    args = cli.parse_args([])
    assert args.scope is None
    assert args.status is None
    assert args.step is None
    assert args.url is None
    assert args.orchestrator is None


def test_partial_call_preserves_state(repo):
    """T2: Llamada parcial preserva scope, status y step existentes si no se especifican."""
    bb_path = repo / "web" / "public" / "data" / "antigravity-live.json"
    initial_bb = {
        "auditScope": "backend",
        "blackboardState": "exploring",
        "currentPipelineStep": 3,
        "activeOrchestrator": "antigravity",
        "activeProject": "vetconnect",
        "targetUrl": "http://localhost:8000",
        "orchestrationConfig": {
            "primaryAgent": "antigravity",
            "secondaryAgent": "opencode",
            "mode": "dual",
        },
    }
    bb_path.write_text(json.dumps(initial_bb), encoding="utf-8")

    cli.update_blackboard(
        repo_root=repo,
        status=None,
        step=None,
        audit_scope=None,
        primary_agent="claude-code",
    )

    updated = json.loads(bb_path.read_text(encoding="utf-8"))
    assert updated["auditScope"] == "backend"
    assert updated["blackboardState"] == "exploring"
    assert updated["currentPipelineStep"] == 3
    assert updated["activeProject"] == "vetconnect"
    assert updated["targetUrl"] == "http://localhost:8000"
    assert updated["orchestrationConfig"]["primaryAgent"] == "claude-code"


def test_first_call_uses_fallbacks(repo):
    """T3: Primera llamada sin archivo previo usa fallbacks seguros (fullstack, idle, paso 8)."""
    bb_path = repo / "web" / "public" / "data" / "antigravity-live.json"
    if bb_path.exists():
        bb_path.unlink()

    cli.update_blackboard(repo_root=repo)

    data = json.loads(bb_path.read_text(encoding="utf-8"))
    assert data["auditScope"] == "fullstack"
    assert data["blackboardState"] == "idle"
    assert data["currentPipelineStep"] == 8
    assert data["activeOrchestrator"] == "antigravity"
    assert data["targetUrl"] == "http://localhost:3000"


def test_atomic_write_keeps_original_on_failure(repo, monkeypatch):
    """T4: Fallo durante reemplazo atómico no corrompe el original ni deja huérfanos .tmp."""
    target_file = repo / "web" / "public" / "data" / "target.json"
    target_file.write_text(json.dumps({"original": True}), encoding="utf-8")

    def mock_replace(src, dst):
        raise OSError("Disk write failed")

    monkeypatch.setattr(os, "replace", mock_replace)

    with pytest.raises(OSError):
        cli.atomic_write_json(target_file, {"original": False})

    # El archivo original sigue intacto
    content = json.loads(target_file.read_text(encoding="utf-8"))
    assert content["original"] is True

    # No quedan temporales
    tmps = list(target_file.parent.glob("*.tmp")) + list(target_file.parent.glob(".*.tmp"))
    assert len(tmps) == 0


def test_lock_serializes_updates(repo):
    """T5: locked_update serializa updates concurrentes y limpia locks viejos (>10s)."""
    counter_file = repo / "web" / "public" / "data" / "counter.json"
    counter_file.write_text(json.dumps({"count": 0}), encoding="utf-8")

    errors = []

    def worker():
        try:
            def inc(d):
                cur = d.get("count", 0)
                time.sleep(0.02)
                d["count"] = cur + 1
                return d

            cli.locked_update(counter_file, inc)
        except Exception as e:
            errors.append(e)

    t1 = threading.Thread(target=worker)
    t2 = threading.Thread(target=worker)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    assert len(errors) == 0
    final_data = json.loads(counter_file.read_text(encoding="utf-8"))
    assert final_data["count"] == 2

    # Probar limpieza de lock viejo (> 10s)
    lock_file = Path(f"{str(counter_file)}.lock")
    lock_file.write_text("stale lock", encoding="utf-8")
    old_time = time.time() - 20
    os.utime(lock_file, (old_time, old_time))

    def inc_after_stale(d):
        d["count"] += 1
        return d

    cli.locked_update(counter_file, inc_after_stale)
    data_after = json.loads(counter_file.read_text(encoding="utf-8"))
    assert data_after["count"] == 3


def test_transition_preserves_existing_keys(repo):
    """T6: transition_blackboard_to_standup hace merge, preserva claves y actualiza timestamps/ttl."""
    bb_path = repo / "web" / "public" / "data" / "antigravity-live.json"
    initial_bb = {
        "activeOrchestrator": "cursor",
        "source": "CURSOR_CUSTOM",
        "orchestrationConfig": {"primaryAgent": "cursor", "mode": "single"},
        "detectedAgents": ["cursor", "opencode"],
        "agents": {"custom": True},
        "history": [{"step": i, "action": f"Act {i}"} for i in range(15)],
    }
    bb_path.write_text(json.dumps(initial_bb), encoding="utf-8")

    ing.transition_blackboard_to_standup(repo_root=repo, project_slug="tobitests")

    data = json.loads(bb_path.read_text(encoding="utf-8"))
    assert data["orchestrationConfig"]["primaryAgent"] == "cursor"
    assert data["detectedAgents"] == ["cursor", "opencode"]
    assert data["agents"] == {"custom": True}
    assert data["activeOrchestrator"] == "cursor"
    assert data["source"] == "CURSOR_CUSTOM"
    assert "updatedAt" in data
    assert data["ttlSeconds"] == 300
    assert len(data["history"]) <= 12
