#!/usr/bin/env python3
"""
TobiTests Spec File to State Synchronizer (`scripts/sync_specs.py`).

Synchronizes physical `.spec.ts` files on disk into the canonical state file
and updates mirror state files if required by the UI.
"""

import argparse
import datetime
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional


def state_path(repo_root: Path, slug: str) -> Path:
    """Devuelve la ruta canónica del archivo de estado según el Paso 0."""
    return repo_root / "web" / "public" / "data" / f"{slug}-state.json"


def atomic_write_json(path: Path, payload: Dict[str, Any], retries: int = 6, delay: float = 0.05) -> None:
    """Escritura atómica de JSON mediante archivo temporal en el mismo directorio + os.replace con reintentos en Windows."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.parent / f".{path.name}.{os.getpid()}.{time.time_ns()}.tmp"
    try:
        tmp_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        for attempt in range(retries):
            try:
                os.replace(tmp_path, path)
                break
            except PermissionError:
                if attempt == retries - 1:
                    raise
                time.sleep(delay * (attempt + 1))
    except Exception:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
        raise


def sync_once(repo_root: Path, slug: str) -> int:
    """
    Sincroniza los specs de disco con el estado canónico.
    Devuelve la cantidad de specs modificados o agregados.
    """
    target_state = state_path(repo_root, slug)
    if not target_state.exists():
        raise FileNotFoundError(f"State file not found: {target_state}")

    state = json.loads(target_state.read_text(encoding="utf-8"))
    specs_list = state.get("specs", [])
    specs_by_name = {s.get("name"): s for s in specs_list if s.get("name")}

    search_dirs = [
        repo_root / "specs",
        repo_root / "workspaces" / slug / "specs",
    ]

    changed = 0

    # 1. Actualizar specs existentes desde el disco
    for s in specs_list:
        spec_name = s.get("name")
        if not spec_name:
            continue
        for sdir in search_dirs:
            candidate = sdir / spec_name
            if candidate.is_file():
                try:
                    content = candidate.read_text(encoding="utf-8")
                except Exception:
                    continue
                if s.get("code") != content:
                    s["code"] = content
                    s["testsCount"] = len(re.findall(r"\btest\s*\(", content))
                    changed += 1
                break

    # 2. Agregar specs nuevos encontrados en disco que pertenezcan al proyecto
    for sdir in search_dirs:
        if not sdir.exists():
            continue
        for sf in sorted(sdir.iterdir()):
            if not sf.is_file() or not sf.name.endswith(".spec.ts"):
                continue

            belongs = (
                sf.name.startswith(f"{slug}-")
                or sf.name == f"{slug}.spec.ts"
                or sf.name.startswith(f"custom-{slug}")
            )
            if slug in ("tobitests", "tobi"):
                belongs = belongs or sf.name.startswith("tobitests-") or sf.name.startswith("tobi-")

            if belongs and sf.name not in specs_by_name:
                try:
                    content = sf.read_text(encoding="utf-8")
                except Exception:
                    content = ""
                tests_count = len(re.findall(r"\btest\s*\(", content))
                new_entry = {
                    "name": sf.name,
                    "domain": sf.name.replace(".spec.ts", "").replace("-", " ").title(),
                    "status": "Skipped",
                    "testsCount": tests_count,
                    "lastRun": "Pendiente",
                    "code": content,
                }
                specs_list.append(new_entry)
                specs_by_name[sf.name] = new_entry
                changed += 1

    if changed > 0:
        state["specs"] = specs_list
        atomic_write_json(target_state, state)
        if slug in ("tobitests", "tobi"):
            src_state = repo_root / "web" / "src" / "data" / "tobi-state.json"
            if src_state.exists():
                atomic_write_json(src_state, state)

    return changed


def watch(
    repo_root: Path,
    slug: str,
    interval: float = 1.0,
    max_cycles: Optional[int] = None,
) -> None:
    """Modo watch: sondeo continuo para sincronizar specs ante modificaciones."""
    cycles = 0
    try:
        while True:
            if max_cycles is not None and cycles >= max_cycles:
                break
            try:
                changed = sync_once(repo_root, slug)
                if changed > 0:
                    print(f"[{datetime.datetime.now().isoformat()}] Synced {changed} spec(s) for project '{slug}'")
            except Exception as e:
                print(f"Warning: sync failed: {e}", file=sys.stderr)
            cycles += 1
            time.sleep(interval)
    except KeyboardInterrupt:
        return


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Synchronize Playwright specs into TobiTests state.")
    parser.add_argument("--project", default="tobitests", help="Project slug (default: tobitests)")
    parser.add_argument("--watch", action="store_true", help="Watch mode for spec changes")
    parser.add_argument("--interval", type=float, default=1.0, help="Polling interval in seconds for watch mode")
    parser.add_argument("--repo", default=None, help="Repository root path")

    args = parser.parse_args(argv)
    repo_root = Path(args.repo).resolve() if args.repo else Path.cwd()
    slug = args.project

    target_state = state_path(repo_root, slug)
    if not target_state.exists():
        sys.stderr.write(f"Error: State file not found for project '{slug}': {target_state}\n")
        return 2

    if args.watch:
        try:
            watch(repo_root, slug, interval=args.interval)
        except KeyboardInterrupt:
            pass
        return 0
    else:
        changed = sync_once(repo_root, slug)
        print(f"Synced {changed} spec(s) for project '{slug}'")
        return 0


if __name__ == "__main__":
    sys.exit(main())
