# Workspace: TobiTests Self-Audit (`tobitests-self-audit`)

This workspace contains the dogfooding Normalized PRD (`prd-ground-truth.json`), 5-Suite / 84-Test Matrix (`test-matrix.json`), and self-audit scripts used by **TobiTests** to audit its own web dashboard, 2.5D isometric office, and interactive flow map.

## Key Assets
- **Ground Truth PRD:** [`prd-ground-truth.json`](./prd-ground-truth.json)
- **Test Matrix (5 Suites, 84 Tests):** [`test-matrix.json`](./test-matrix.json)
- **UI State Snapshot:** [`../../web/public/data/tobi-state.json`](../../web/public/data/tobi-state.json) & [`../../web/public/data/tobitests-state.json`](../../web/public/data/tobitests-state.json)
- **Self-Audit Scripts:** [`scripts/`](./scripts/) (`generate_self_audit_data.py`, `record_tobitests_audit.py`, `verify_journey.py`, `verify_modal_fix.py`)
