# Workspace: VetConnect Demo (`vetconnect-demo`)

This workspace contains the Normalized PRD (`prd-ground-truth.json`), 6-Suite / 108-Test Matrix (`test-matrix.json`), and domain generator scripts for **VetConnect** (Veterinary Telemedicine & Clinical Triage Platform).

## Key Assets
- **Ground Truth PRD:** [`prd-ground-truth.json`](./prd-ground-truth.json)
- **Test Matrix (6 Suites, 108 Tests):** [`test-matrix.json`](./test-matrix.json)
- **UI State Snapshot:** [`../../web/public/data/vetconnect-state.json`](../../web/public/data/vetconnect-state.json)
- **Domain Scripts:** [`scripts/`](./scripts/) (`build_full_test_matrix.py`, `enrich_bugs_and_tests.py`, `record_bug_execution.py`, `record_doctor_execution.py`, `verify_vetconnect_bugs.py`)

## Confirmed Bugs (3-Oracle Triage)
1. **`BUG-01` (`high` / P1 — Layer 2 State Divergence):** Cancelling an active consultation in `/client/messages` removes it locally from `MessageList` (`src/pages/client/MessagesPage.tsx:142`) without invalidating React Query cache for `/client/pets` (`"En consulta"`).
2. **`BUG-02` (`medium` / P2 — Layer 2 State Divergence):** Professional license (`MN-48291`) missing in digital prescription modal (`src/components/prescriptions/PrescriptionModal.tsx:78`).
3. **`BUG-03` (`high` / P1 — Layer 1 Implicit Oracle):** WebRTC stream dropout in `/call/:id` without automatic ICE restart (`src/hooks/useWebRTC.ts:215`).
4. **`BUG-04` (`low` / P3 — Layer 3 Visual/UX Oracle):** Triage queue filter state resets upon returning from patient record (`src/pages/vet/QueuePage.tsx:34`).
