from pathlib import Path
from conftest import compute_snapshot, diff_snapshots


def test_guardian_detects_changes(tmp_path):
    root = tmp_path / "repo"
    sub = root / "web" / "data"
    sub.mkdir(parents=True)

    f_mod = sub / "file_mod.txt"
    f_mod.write_text("v1", encoding="utf-8")

    f_del = sub / "file_del.txt"
    f_del.write_text("v1", encoding="utf-8")

    before = compute_snapshot([sub], root)

    # Modificar uno
    f_mod.write_text("v2", encoding="utf-8")
    # Borrar otro
    f_del.unlink()
    # Crear un tercero
    f_cre = sub / "file_cre.txt"
    f_cre.write_text("v1", encoding="utf-8")

    after = compute_snapshot([sub], root)

    diffs = diff_snapshots(before, after)
    diff_map = {path: ctype for ctype, path in diffs}

    assert diff_map["web/data/file_mod.txt"] == "modified"
    assert diff_map["web/data/file_del.txt"] == "deleted"
    assert diff_map["web/data/file_cre.txt"] == "created"
    assert len(diffs) == 3
