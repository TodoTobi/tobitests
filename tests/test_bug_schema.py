import json
from pathlib import Path
import pytest

import ingest_playwright_results as ing
import tobitests_cli as cli
from conftest import make_report, make_spec


CANONICAL_BUG = {
    "id": "BUG-01",
    "title": "Inconsistencia al cancelar consulta entre Mensajes y Mascotas",
    "severity": "high",
    "priority": "P1",
    "oracle_layer": "Layer 2: State Divergence",
    "status": "Confirmed",
    "section": "Mensajes / Consultas",
    "runId": "#RUN-01",
    "agent": "Telemetry Auditor",
    "scenario": "BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas, seccion: Mensajes / Consultas",
    "gherkin": {
        "given": "el operador tiene una consulta activa ('En consulta') registrada para una mascota.",
        "when": "el operador accede a la sección 'Mensajes' y presiona el botón 'Cancelar'.",
        "then": "el registro de la consulta debería figurar como cancelado o ser eliminado de forma sincronizada en ambas secciones.",
        "but": "el mensaje es removido de la bandeja de Mensajes, pero al navegar a 'Mascotas -> Tus consultas' sigue figurando erróneamente en estado 'En consulta'.",
    },
    "dadoQue": "el operador tiene una consulta activa (\"En consulta\") registrada para una mascota.",
    "cuando": "el operador accede a la sección \"Mensajes\" y presiona el botón \"Cancelar\".",
    "entonces": "el mensaje es removido de la bandeja pero sigue figurando en estado En consulta.",
    "screenshot": "/evidence/bugs/bug-01-divergence-evidence.png",
    "videoUrl": "/evidence/videos/bug-01-cancellation-replay.webm",
    "evidence": {
        "screenshot": "/evidence/bugs/bug-01-divergence-evidence.png",
        "video": "/evidence/videos/bug-01-cancellation-replay.webm",
        "console_log": [
            "[WARN] [QueryCache] Stale query key ['pets', 'consultations'] not invalidated after local state mutation"
        ],
        "network_trace": [
            "GET /api/pets/consultations -> 200 OK (cached stale payload: status='En consulta')"
        ],
    },
    "root_cause_file": "src/pages/client/MessagesPage.tsx",
    "root_cause_line": 142,
    "diagnostic": {
        "observedFact": "Al cancelar una consulta en Mensajes, el ítem se borra localmente pero en Mascotas permanece En consulta.",
        "whiteBoxHypothesis": "La función handleCancel en Mensajes solo muta el arreglo de mensajes del estado React local.",
        "reproductionSpec": "specs/vetconnect-appointments.spec.ts (TC-MSG-11)",
        "affectedFile": "src/pages/client/MessagesPage.tsx:142",
        "recommendedFix": "Invocar la mutación apiClient.post y ejecutar queryClient.invalidateQueries.",
        "impact": "409 SYNC DIVERGENCE",
        "badgeTone": "danger",
    },
}

REAL_BUG_01 = {
    "id": "BUG-01",
    "title": "Divergencia de estado en filtros de telemetría al alternar agentes en La Oficina",
    "severity": "Alta",
    "status": "Resolved",
    "section": "La Oficina / Telemetría",
    "runId": "#RUN-SELF-01",
    "agent": "Telemetry Auditor",
    "assignee": "Equipo Frontend",
    "date": "16/10/2026",
    "scenario": "Al alternar entre mesas de agentes en La Oficina, el filtro de telemetría conserva logs del agente previo",
    "dadoQue": "el operador está en la vista de La Oficina con la simulación en marcha",
    "cuando": "hace clic en un agente pausado y luego filtra por 'warn'",
    "entonces": "la consola muestra eventos mezclados del agente anterior sin limpiar el búfer reactivo",
    "screenshot": "/evidence/bugs/tobi-bug-01-detail.png",
    "videoUrl": "/evidence/videos/tobitests-bug-01-replay.webm",
    "doctorVideoUrl": "/evidence/videos/tobitests-self-audit.webm",
    "resolution": "Resuelto con éxito en rama bugfix/cerco-bug-01-telemetry-divergence mediante inyección de agentId en LogEntry, filtro reactivo por agente y limpieza de búfer sin polución cruzada.",
    "diagnostic": {
        "observedFact": "El feed de telemetría acumulaba entradas de puestos inactivos en vez de aislar el stream del agente seleccionado.",
        "whiteBoxHypothesis": "La interfaz LogEntry y filteredLogs carecían de asociación por agentId y discriminación de búfer reactivo.",
        "affectedFile": "web/src/components/OfficeView.tsx",
        "recommendedFix": "Inyección de agentId en LogEntry, filtro reactivo de stream por agente y botón de purga de búfer.",
        "reproductionSpec": "tobitests-office.spec.ts",
    },
}


def test_validate_bug_report_accepts_canonical_and_existing_bug01(repo):
    ok_ing_canon, errs_ing_canon = ing.validate_bug_report(CANONICAL_BUG, repo_root=repo)
    assert ok_ing_canon is True, f"ing.validate_bug_report rechazó CANONICAL_BUG: {errs_ing_canon}"
    assert errs_ing_canon == []

    ok_cli_canon, errs_cli_canon = cli.validate_bug_report(CANONICAL_BUG, repo_root=repo)
    assert ok_cli_canon is True, f"cli.validate_bug_report rechazó CANONICAL_BUG: {errs_cli_canon}"
    assert errs_cli_canon == []

    ok_ing_b01, errs_ing_b01 = ing.validate_bug_report(REAL_BUG_01, repo_root=repo)
    assert ok_ing_b01 is True, f"ing.validate_bug_report rechazó REAL_BUG_01: {errs_ing_b01}"
    assert errs_ing_b01 == []

    ok_cli_b01, errs_cli_b01 = cli.validate_bug_report(REAL_BUG_01, repo_root=repo)
    assert ok_cli_b01 is True, f"cli.validate_bug_report rechazó REAL_BUG_01: {errs_cli_b01}"
    assert errs_cli_b01 == []


def test_validate_bug_report_rejects_missing_fields_and_invalid_severity(repo):
    # Sin dadoQue
    bug_no_dado_que = dict(CANONICAL_BUG)
    del bug_no_dado_que["dadoQue"]
    ok, errs = ing.validate_bug_report(bug_no_dado_que, repo_root=repo)
    assert ok is False
    assert any("dadoQue" in e for e in errs)

    # Severidad inválida
    bug_bad_sev = dict(CANONICAL_BUG, severity="inventada")
    ok, errs = ing.validate_bug_report(bug_bad_sev, repo_root=repo)
    assert ok is False
    assert any("severity" in e for e in errs)

    # Status inválido
    bug_bad_status = dict(CANONICAL_BUG, status="Unconfirmed")
    ok, errs = ing.validate_bug_report(bug_bad_status, repo_root=repo)
    assert ok is False
    assert any("status" in e for e in errs)


def test_validate_bug_report_checks_root_cause_line_range(repo):
    app_tsx = repo / "src" / "App.tsx"
    app_tsx.parent.mkdir(parents=True, exist_ok=True)
    # Crear archivo con exactamente 10 líneas
    app_tsx.write_text("\n".join([f"// line {i}" for i in range(1, 11)]) + "\n", encoding="utf-8")

    bug_valid = dict(CANONICAL_BUG, root_cause_file="src/App.tsx", root_cause_line=5)
    ok, errs = ing.validate_bug_report(bug_valid, repo_root=repo)
    assert ok is True, f"Falló valid con errs: {errs}"
    assert errs == []

    bug_line_50 = dict(CANONICAL_BUG, root_cause_file="src/App.tsx", root_cause_line=50)
    ok, errs = ing.validate_bug_report(bug_line_50, repo_root=repo)
    assert ok is False
    assert any("out of range" in e or "line" in e for e in errs)

    bug_line_0 = dict(CANONICAL_BUG, root_cause_file="src/App.tsx", root_cause_line=0)
    ok, errs = ing.validate_bug_report(bug_line_0, repo_root=repo)
    assert ok is False
    assert any("out of range" in e or "line" in e for e in errs)


def test_ingest_creates_and_deduplicates_draft_bug_on_failed_test(repo):
    # Sembrar tobitests-state.json con BUG-01
    state_file = repo / "web" / "public" / "data" / "tobitests-state.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    initial_state = {
        "project": {"name": "Tobitests", "url": "http://localhost:5173", "branch": "main"},
        "metrics": {"openBugs": 0, "totalRuns": 0},
        "runs": [],
        "bugs": [dict(REAL_BUG_01)],
        "specs": [],
        "suites": [],
    }
    state_file.write_text(json.dumps(initial_state), encoding="utf-8")

    # Crear reporte con 1 Failed y 1 Passed
    spec_failed = make_spec(
        "Fallo de navegación",
        status="failed",
        test_status="unexpected",
        errors=(
            {
                "message": "Expected visible",
                "location": {"file": "specs/a.spec.ts", "line": 12, "column": 5},
            },
        ),
    )
    spec_passed = make_spec("Paso exitoso", status="passed", test_status="expected")

    report_path = repo / "test-results" / "report-fail.json"
    report_path.write_text(
        json.dumps(make_report([spec_failed, spec_passed], file="specs/a.spec.ts")),
        encoding="utf-8",
    )

    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_path,
        copied_screenshots=[],
        copied_videos=[],
    )

    state_after = json.loads(state_file.read_text(encoding="utf-8"))
    assert len(state_after["bugs"]) == 2
    # BUG-01 intacto
    b01 = next(b for b in state_after["bugs"] if b["id"] == "BUG-01")
    assert b01["status"] == "Resolved"

    # BUG-AUTO-01 creado
    b_auto = next(b for b in state_after["bugs"] if b["id"] == "BUG-AUTO-01")
    assert b_auto["status"] == "Confirmed"
    assert b_auto["dadoQue"] and b_auto["cuando"] and b_auto["entonces"]
    assert "specs/a.spec.ts" in b_auto["diagnostic"]["reproductionSpec"]
    assert state_after["metrics"]["openBugs"] == 1

    # Segunda ingesta del mismo reporte fallido -> NO debe duplicarse
    ing.ingest_report_into_state(
        repo_root=repo,
        project_slug="tobitests",
        report_path=report_path,
        copied_screenshots=[],
        copied_videos=[],
    )

    state_after_2 = json.loads(state_file.read_text(encoding="utf-8"))
    assert len(state_after_2["bugs"]) == 2
    auto_ids = [b["id"] for b in state_after_2["bugs"] if b.get("autoGenerated")]
    assert auto_ids == ["BUG-AUTO-01"]
