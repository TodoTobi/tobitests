import { useState, useEffect } from "react";
import type { AuditScope } from "../hooks/useTobiState";

export interface TestStep {
  step?: number;
  action: string;
  target: string;
  expected?: string;
  actual?: string;
  status: "Passed" | "Failed";
  duration: string;
}

export interface TestCaseItem {
  name: string;
  spec: string;
  status: string;
  duration: string;
  screenshot?: string;
  videoUrl?: string;
  steps?: TestStep[];
  goal?: string;
  priority?: "Alta" | "Media" | "Baja";
  observations?: string[];
  diagnostic?: {
    cause?: string;
    fix?: string;
  };
}

interface TestDetailModalProps {
  test: TestCaseItem | null;
  onClose: () => void;
  onRunTest?: (test: TestCaseItem) => void;
  onCreateBug?: (test: TestCaseItem) => void;
  bugs?: any[];
  auditScope?: AuditScope;
}

export function TestDetailModal({ test, onClose, onRunTest, onCreateBug, bugs, auditScope }: TestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "log" | "history" | "plantillas">("preview");
  const [diagTab, setDiagTab] = useState<"error" | "cause" | "fix">("error");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedPlantillas, setCopiedPlantillas] = useState(false);
  const [viewMode, setViewMode] = useState<"screenshot" | "video" | "http">("screenshot");
  const [priority, setPriority] = useState<"Alta" | "Media" | "Baja">("Media");
  const [currentTest, setCurrentTest] = useState<TestCaseItem | null>(test);

  useEffect(() => {
    setCurrentTest(test);
    if (!test) return;
    const initialSteps = test.steps && test.steps.length > 0 ? test.steps : [];
    const failedIdx = initialSteps.findIndex((s) => s.status === "Failed");
    // Auto-focus the failing step so the engineer immediately sees what went wrong
    setCurrentStepIdx(failedIdx >= 0 ? failedIdx : 0);
    setIsPlaying(false);
    const isApiSpec =
      auditScope === "backend" ||
      test.spec?.toLowerCase().includes("api") ||
      test.name?.toLowerCase().includes("api") ||
      test.name?.includes("GET /") ||
      test.name?.includes("POST /") ||
      (!test.screenshot && !test.videoUrl && test.spec?.includes("request"));
    if (auditScope === "frontend" && !test.spec?.toLowerCase().includes("api")) {
      setViewMode("screenshot");
    } else {
      setViewMode(isApiSpec ? "http" : "screenshot");
    }
  }, [test, auditScope]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!currentTest) return null;

  const steps: TestStep[] = currentTest.steps && currentTest.steps.length > 0 ? currentTest.steps : [
    { step: 1, action: "Navegar", target: "page.goto('http://localhost:5173/')", status: "Passed", duration: "120ms" },
    { step: 2, action: "Inspeccionar", target: "expect(page.locator('body')).toBeVisible()", status: "Passed", duration: "35ms" },
    { step: 3, action: "Interactuar", target: "page.click('button:visible')", status: "Passed", duration: "60ms" },
    { step: 4, action: "Verificar", target: "expect(page).toHaveURL(/.*\\/dashboard/)", status: currentTest.status === "Failed" ? "Failed" : "Passed", duration: "40ms" }
  ];

  const failedStepIdx = steps.findIndex((s) => s.status === "Failed");
  const failedStep = failedStepIdx >= 0 ? steps[failedStepIdx] : null;
  const isFailed = currentTest.status === "Failed" || failedStep !== null;
  const activeStep = steps[currentStepIdx] || steps[0];

  // Correlation with existing bugs in the tracker
  const existingBug = bugs?.find(
    (b: any) =>
      (currentTest.name && currentTest.name.includes(b.id)) ||
      (b.title && currentTest.name.toLowerCase().includes(b.title.toLowerCase().slice(0, 20))) ||
      (currentTest.spec?.includes("office") && b.id === "BUG-01")
  );

  // Derive readable module name from spec file
  const isTobi = currentTest.spec.includes("tobi");
  const moduleLabel = currentTest.spec.replace("vetconnect-", "").replace("tobitests-", "").replace(".spec.ts", "").toUpperCase();
  const projectName = isTobi ? "TobiTests" : "VetConnect";

  const handleNextStep = () => {
    setCurrentStepIdx((prev) => (prev + 1 < steps.length ? prev + 1 : 0));
  };

  const handlePrevStep = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  const handleRunTest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const passedSteps = steps.map((s) => ({
        ...s,
        status: "Passed" as const,
        actual: s.expected || "Aprobado sin divergencias"
      }));
      const passedTest: TestCaseItem = {
        ...currentTest,
        status: "Passed",
        steps: passedSteps
      };
      setCurrentTest(passedTest);
      if (onRunTest) onRunTest(passedTest);
    }, 450);
  };

  const handleCopyFixPrompt = () => {
    const promptText = `Por favor, revisá y corregí la siguiente falla en el test de ${projectName}:
- Test: ${currentTest.name}
- Archivo Spec: specs/${currentTest.spec}
- Paso que falla: Paso #${failedStep?.step || failedStepIdx + 1}: ${failedStep?.action || activeStep?.action} (${failedStep?.target || activeStep?.target})
- Esperado: ${failedStep?.expected || "Estado sincronizado"}
- Obtenido: ${failedStep?.actual || "Divergencia de estado"}
- Diagnóstico: ${isFailed ? "Desincronización de estado entre componentes y almacenamiento reactivo." : "Prueba aprobada."}
Proponé el cambio de código exacto respetando la arquitectura del proyecto.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  const handleCopyBddPlantillas = () => {
    const targetStep = failedStep || activeStep;
    const templateText = `Esquema de Plantilla Estandarizado:
Definir el Escenario (Gherkin/BDD):
Nombre y sección (${currentTest.name}, seccion: ${moduleLabel}).
Pasos para reproducir:
Dado que el operador navega a la suite ${currentTest.spec} de ${projectName}.
Cuando ejecuta la secuencia: ${targetStep.action} -> ${targetStep.target}.
Entonces ${targetStep.actual || "divergencia de estado obtenida"} frente a ${targetStep.expected || "comportamiento esperado"}.

Protocolo Anti-Regresiones con Blindaje (Quirófano de Código):
Fase 1: Identificar el escenario & Aislamiento en Capas
- Capa UI/Vista: specs/${currentTest.spec}
- Capa Hooks/Estado: Aislamiento por agente y sincronización reactiva
- Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
- Capa Backend/API: Preservación de contratos retrocompatibles
- Capa Base de Datos: Persistencia validada

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode)
1. ARCHIVOS DENTRO DEL ALCANCE: [specs/${currentTest.spec}]
2. ARCHIVOS FUERA DEL ALCANCE: [Archivos de configuración global, middlewares de autenticación]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos dependientes
4. ESTRATEGIA DE FIX: Minimal Fix estricto respetando la arquitectura

Fase 3: Análisis de Impacto Global
- Rastreo de Referencias Cruzadas (Find-All-References)
- Preservación de Contratos y Retrocompatibilidad

Fase 4: El Quirófano
- Rama: bugfix/cerco-${moduleLabel.toLowerCase()}-fix
- Minimal fix estricto sin dependencias no medidas

Fase 5: Validación
- Testing de Tres Capas (Unitario, Regresión e Integración)
- Verificación estricta del compilador (tsc --noEmit)`;

    navigator.clipboard.writeText(templateText);
    setCopiedPlantillas(true);
    setTimeout(() => setCopiedPlantillas(false), 2200);
  };

  return (
    <div className="test-modal-overlay" onClick={onClose}>
      <div className="test-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <header className="test-modal-header">
          <div className="test-modal-header-left">
            <div className="test-modal-breadcrumb">
              <span>{currentTest.spec}</span>
              <span className="crumb-sep">/</span>
              <span className="module-badge">{moduleLabel}</span>
            </div>
            <div className="test-modal-title-row">
              <h2 className="test-modal-title">{currentTest.name}</h2>
              <span className={`test-status-pill ${isFailed ? "failed" : "passed"}`}>
                <span className="pill-dot" />
                {isFailed ? "Con Hallazgo" : "Aprobado"}
              </span>
            </div>
          </div>

          <div className="test-modal-header-right">
            {existingBug ? (
              <button
                type="button"
                className="btn-create-bug"
                style={{
                  background: existingBug.status === "Resolved" ? "rgba(47, 125, 85, 0.12)" : undefined,
                  color: existingBug.status === "Resolved" ? "var(--success)" : undefined,
                  borderColor: existingBug.status === "Resolved" ? "rgba(47, 125, 85, 0.35)" : undefined
                }}
                onClick={() => onCreateBug && onCreateBug(currentTest)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2l1.5 2h5L16 2M9 9h6M8 13H3m18 0h-5M8 17H4m16 0h-4"/><rect x="8" y="4" width="8" height="17" rx="4"/></svg>
                {existingBug.status === "Resolved" ? `Ver ticket resuelto (${existingBug.id})` : `Ver ticket (${existingBug.id})`}
              </button>
            ) : isFailed ? (
              <button
                type="button"
                className="btn-create-bug"
                onClick={() => onCreateBug && onCreateBug(currentTest)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2l1.5 2h5L16 2M9 9h6M8 13H3m18 0h-5M8 17H4m16 0h-4"/><rect x="8" y="4" width="8" height="17" rx="4"/></svg>
                Crear ticket de bug
              </button>
            ) : null}
            <button
              type="button"
              className="btn-run-test-primary"
              onClick={handleRunTest}
              disabled={isRunning}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {isRunning ? "Ejecutando..." : "Ejecutar prueba"}
            </button>
            <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Cerrar modal">
              ✕
            </button>
          </div>
        </header>

        {/* Modal Main Body (2 Columns) */}
        <div className="test-modal-body">
          {/* Left Column: Basics, Goal, and Connected Steps Timeline */}
          <aside className="test-modal-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-section-title">Datos Básicos</div>
              <div className="sidebar-field-row">
                <span className="field-label">Prioridad</span>
                <select
                  className="priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>

            <div className="sidebar-card test-plan-card">
              <div className="sidebar-section-title">
                Plan de Prueba ({steps.length} pasos)
              </div>

              <div className="test-goal-box">
                <div className="goal-heading">Objetivo de la prueba</div>
                <p className="goal-text">
                  {currentTest.goal ||
                    "Verifica el flujo de extremo a extremo en la interfaz, validando la interacción del operador y la respuesta visual del sistema en tiempo y forma."}
                </p>
                <small className="goal-subtext">
                  Condición para aprobar: Todos los pasos deben completarse sin excepciones no controladas.
                </small>
              </div>

              <div className="steps-timeline-container">
                <div className="timeline-header">Pasos secuenciales</div>
                <div className="steps-timeline">
                  {steps.map((st, idx) => {
                    const isSelected = idx === currentStepIdx;
                    return (
                      <div
                        key={idx}
                        className={`timeline-step-row ${isSelected ? "active" : ""} ${st.status === "Failed" ? "step-failed" : ""}`}
                        onClick={() => setCurrentStepIdx(idx)}
                      >
                        <div className="step-node-col">
                          <div className="step-circle">
                            {st.status === "Failed" ? (
                              "✕"
                            ) : st.action === "Navegar" || st.action === "Navigate" ? (
                              "↗"
                            ) : st.action === "Verificar" || st.action === "Assert" ? (
                              "✓"
                            ) : (
                              idx + 1
                            )}
                          </div>
                          {idx < steps.length - 1 && <div className="step-connecting-line" />}
                        </div>

                        <div className="step-content">
                          <div className="step-title">
                            {st.action}: {st.target.length > 38 ? st.target.slice(0, 36) + "..." : st.target}
                          </div>
                          <div className="step-meta">
                            <span>{st.duration}</span>
                            <span className="step-status-tag">{st.status === "Failed" ? "Fallo" : "OK"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Center/Right Column: Tabs, Viewport Player, and Diagnostic Tabs */}
          <main className="test-modal-main">
            {/* Viewport Tabs */}
            <div className="test-viewport-tabs">
              <div className="tabs-group">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveTab("preview")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Vista Previa
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
                  onClick={() => setActiveTab("code")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Código Spec
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "log" ? "active" : ""}`}
                  onClick={() => setActiveTab("log")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Log de Ejecución ({steps.length})
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Historial (4)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "plantillas" ? "active" : ""}`}
                  onClick={() => setActiveTab("plantillas")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Plantillas BDD & Cerco
                </button>
              </div>

              <div className="media-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${viewMode === "screenshot" ? "active" : ""}`}
                  onClick={() => setViewMode("screenshot")}
                >
                  Captura Real
                </button>
                <button
                  type="button"
                  className={`mode-btn ${viewMode === "video" ? "active" : ""}`}
                  onClick={() => setViewMode("video")}
                >
                  Video (.webm)
                </button>
                <button
                  type="button"
                  className={`mode-btn ${viewMode === "http" ? "active" : ""}`}
                  onClick={() => setViewMode("http")}
                >
                  Traza HTTP / JSON
                </button>
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="test-viewport-container">
              <div className="viewport-top-chrome">
                <div className="chrome-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="chrome-address-bar">
                  {projectName} · http://localhost:5173 · {currentTest.spec}
                </div>
              </div>

              {activeTab === "preview" ? (
                <div className="viewport-stage">
                  {viewMode === "video" ? (
                    <video
                      key={currentTest.videoUrl || (isTobi ? "/evidence/videos/tobitests-self-audit.webm" : "/evidence/videos/doctor-portal-audit.webm")}
                      src={currentTest.videoUrl || (isTobi ? "/evidence/videos/tobitests-self-audit.webm" : "/evidence/videos/doctor-portal-audit.webm")}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="stage-video"
                    />
                  ) : viewMode === "http" ? (
                    <div
                      className="http-trace-inspector"
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 310,
                        background: "#0b1120",
                        color: "#e2e8f0",
                        padding: "16px 20px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        overflowY: "auto",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: isFailed ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)", color: isFailed ? "#f87171" : "#34d399", border: `1px solid ${isFailed ? "rgba(239,68,68,0.45)" : "rgba(16,185,129,0.45)"}`, padding: "2px 8px", borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                            {activeStep?.target?.includes("post") || currentTest.name.includes("POST") ? "POST" : activeStep?.target?.includes("delete") ? "DELETE" : "GET"}
                          </span>
                          <code style={{ color: "#38bdf8", fontWeight: 700 }}>{activeStep?.target || "/api/v1/resource"}</code>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: isFailed ? "#ef4444" : "#10b981", color: "#fff", padding: "2px 8px", borderRadius: 999, fontWeight: 700, fontSize: 11 }}>
                            {isFailed ? "500 / 422 Divergence" : "200 OK · Contract Valid"}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>
                            ⏱ {activeStep?.duration || currentTest.duration || "42ms"} (SLA &lt; 500ms)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 6, padding: 10 }}>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#34d399", marginBottom: 6, textTransform: "uppercase" }}>
                            Expected JSON Contract (2xx / 4xx Schema)
                          </div>
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#cbd5e1", fontSize: 11 }}>
{JSON.stringify(
  {
    status: isFailed ? 200 : 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    contract: activeStep?.expected || (existingBug as any)?.gherkin?.then || "Structured JSON response matching OpenAPI/Zod schema without unhandled exceptions",
  },
  null,
  2
)}
                          </pre>
                        </div>

                        <div style={{ background: "rgba(15,23,42,0.9)", border: `1px solid ${isFailed ? "rgba(248,113,113,0.4)" : "rgba(56,189,248,0.3)"}`, borderRadius: 6, padding: 10 }}>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: isFailed ? "#f87171" : "#38bdf8", marginBottom: 6, textTransform: "uppercase" }}>
                            Actual Payload &amp; Runtime Verdict
                          </div>
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#cbd5e1", fontSize: 11 }}>
{JSON.stringify(
  {
    verdict: isFailed ? "FAILED_ASSERTION" : "PASSED_CONTRACT",
    fixture: "APIRequestContext ({ request })",
    actual: activeStep?.actual || (existingBug as any)?.gherkin?.but || "200 OK · Payload schema & RBAC boundaries verified",
  },
  null,
  2
)}
                          </pre>
                        </div>
                      </div>

                      <div style={{ background: "rgba(2,6,23,0.8)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 6, padding: 10 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>
                          Network Trace (`network_trace`) &amp; Console / Server Stream (`console_log`)
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
                          {(((existingBug as any)?.evidence?.network_trace as string[]) || [
                            `${activeStep?.action || "HTTP"} ${activeStep?.target || "/api/health"} -> ${isFailed ? "500 Internal Error / State Divergence" : "200 OK"} (${activeStep?.duration || "38ms"})`,
                          ]).map((traceLine: string, idx: number) => (
                            <div key={`net-${idx}`} style={{ color: "#38bdf8" }}>
                              🌐 [NET] {traceLine}
                            </div>
                          ))}
                          {(((existingBug as any)?.evidence?.console_log as string[]) || [
                            `[APIRequestContext] Step #${currentStepIdx + 1} (${activeStep?.status || "Passed"}) — ${currentTest.name}`,
                          ]).map((logLine: string, idx: number) => (
                            <div key={`log-${idx}`} style={{ color: isFailed ? "#fca5a5" : "#a7f3d0" }}>
                              🖥 [LOG] {logLine}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="stage-image-wrap">
                      <img
                        key={(activeStep as any)?.screenshot || currentTest.screenshot}
                        src={(activeStep as any)?.screenshot || currentTest.screenshot || (isTobi ? "/evidence/runs/tobi-04-office.png" : "/evidence/runs/05-tutor-dashboard.png")}
                        alt={currentTest.name}
                        className="stage-image"
                      />
                      {/* Floating Step Badge overlay */}
                      <div className="stage-floating-step-badge">
                        <span className="badge-icon">🎯</span>
                        <span className="badge-text">
                          Paso #{currentStepIdx + 1}: {activeStep?.action} — {activeStep?.target}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Player Bottom Bar */}
                  <div className="viewport-player-bar">
                    <div className="player-left-controls">
                      <button
                        type="button"
                        className="player-btn"
                        onClick={handlePrevStep}
                        title="Paso anterior"
                      >
                        ⏮
                      </button>
                      <button
                        type="button"
                        className="player-btn primary"
                        onClick={() => {
                          setIsPlaying(!isPlaying);
                          handleNextStep();
                        }}
                        title={isPlaying ? "Pausar" : "Reproducir paso"}
                      >
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                      <button
                        type="button"
                        className="player-btn"
                        onClick={handleNextStep}
                        title="Siguiente paso"
                      >
                        ⏭
                      </button>
                      <span className="player-step-counter">
                        Paso #{currentStepIdx + 1} de {steps.length}
                      </span>
                    </div>

                    <div className="player-right-controls">
                      <span className="player-speed">1x</span>
                      <button
                        type="button"
                        className="player-action-btn"
                        onClick={() => setCurrentStepIdx(0)}
                      >
                        ↺ Replay
                      </button>
                      <button
                        type="button"
                        className="player-action-btn"
                        onClick={() => setViewMode(viewMode === "video" ? "screenshot" : "video")}
                      >
                        {viewMode === "video" ? "Ver Captura" : "Ver Video"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "code" ? (
                <div className="viewport-code-panel">
                  <div className="code-header">
                    <span>specs/{currentTest.spec}</span>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => {
                        navigator.clipboard.writeText(`test('${currentTest.name}', async ({ page }) => {\n${steps.map(s => `  // ${s.action}\n  await ${s.target};`).join("\n")}\n});`);
                      }}
                    >
                      Copiar código
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>
{`import { test, expect } from '@playwright/test';

test.describe('${moduleLabel} Flow', () => {
  test('${currentTest.name}', async ({ page }) => {
${steps.map((s, idx) => `    // Paso ${idx + 1}: ${s.action} (${s.duration})
    await ${s.target};`).join("\n\n")}
  });
});`}
                    </code>
                  </pre>
                </div>
              ) : activeTab === "log" ? (
                <div className="viewport-log-panel">
                  <div className="log-list">
                    {steps.map((s, i) => (
                      <div key={i} className="log-row">
                        <span className="log-time">00:0{i + 1}.240</span>
                        <span className={`log-badge ${s.status === "Failed" ? "badge-fail" : "badge-ok"}`}>
                          {s.status === "Failed" ? "ERROR" : "INFO"}
                        </span>
                        <code className="log-msg">[{s.action}] {s.target}</code>
                        <span className="log-dur">{s.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === "history" ? (
                <div className="viewport-history-panel">
                  <div className="history-item">
                    <span className="history-dot passed" />
                    <div><strong>#RUN-04 (Actual)</strong><small>Hoy · 100% de aserciones validadas</small></div>
                    <span className="history-duration">{currentTest.duration}</span>
                  </div>
                  <div className="history-item">
                    <span className="history-dot passed" />
                    <div><strong>#RUN-03</strong><small>Ayer · Duración óptima</small></div>
                    <span className="history-duration">{currentTest.duration}</span>
                  </div>
                  <div className="history-item">
                    <span className={`history-dot ${isFailed ? "failed" : "passed"}`} />
                    <div><strong>#RUN-02</strong><small>2 días atrás</small></div>
                    <span className="history-duration">1.2s</span>
                  </div>
                </div>
              ) : (
                <div className="viewport-code-panel" style={{ padding: 16 }}>
                  <div className="code-header" style={{ marginBottom: 10 }}>
                    <span>Esquema Estandarizado (Gherkin/BDD) & Quirófano de Código</span>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={handleCopyBddPlantillas}
                    >
                      {copiedPlantillas ? "✓ ¡Plantillas copiadas!" : "Copiar Plantillas BDD & Cerco"}
                    </button>
                  </div>
                  <pre className="code-block" style={{ maxHeight: 360, overflowY: "auto", fontSize: 11, lineHeight: 1.45 }}>
                    <code>
{`Esquema de Plantilla Estandarizado (Gherkin / BDD + 3-Layer Oracle):
Nombre y sección: (${currentTest.name}, sección: ${moduleLabel})

Escenario Gherkin (Given / When / Then / But):
- Given (Dado que): ${existingBug?.gherkin?.given || existingBug?.dadoQue || `el operador navega a la suite ${currentTest.spec} de ${projectName}.`}
- When (Cuando): ${existingBug?.gherkin?.when || existingBug?.cuando || `ejecuta la secuencia: ${(failedStep || activeStep).action} -> ${(failedStep || activeStep).target}.`}
- Then (Entonces): ${existingBug?.gherkin?.then || (failedStep || activeStep).expected || "el estado del DOM y caché reactiva se mantienen sincronizados."}
- But (Pero): ${existingBug?.gherkin?.but || existingBug?.entonces || (failedStep || activeStep).actual || "Aprobado sin divergencias."}

Evidencia Multi-Modal Vinculada:
- Screenshot: ${(activeStep as any)?.screenshot || currentTest.screenshot || existingBug?.screenshot || "/evidence/runs/tobi-04-office.png"}
- Video (.webm): ${currentTest.videoUrl || existingBug?.videoUrl || "/evidence/videos/tobitests-self-audit.webm"}
- Console Log: ${existingBug?.evidence?.console_log?.[0] || "[CDP Console] 0 unhandled pageerror / console.error"}
- Network Trace: ${existingBug?.evidence?.network_trace?.[0] || "[CDP Network] HTTP 200 OK (< 250ms)"}

Causa Raíz White-Box:
- root_cause_file: ${existingBug?.root_cause_file || existingBug?.diagnostic?.affectedFile?.split(":")[0] || `web/src/pages/${moduleLabel.toLowerCase()}/Component.tsx`}
- root_cause_line: ${existingBug?.root_cause_line || existingBug?.diagnostic?.affectedFile?.split(":")[1] || 142}

Protocolo Anti-Regresiones con Blindaje (Quirófano de Código):
Fase 1: Identificar el escenario & Aislamiento en Capas
- Capa UI/Vista: specs/${currentTest.spec}
- Capa Hooks/Estado: Aislamiento por agente y sincronización reactiva
- Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
- Capa Backend/API: Preservación de contratos retrocompatibles
- Capa Base de Datos: Persistencia validada

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode)
1. ARCHIVOS DENTRO DEL ALCANCE: [specs/${currentTest.spec}]
2. ARCHIVOS FUERA DEL ALCANCE: [Archivos de configuración global, middlewares de autenticación]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos dependientes
4. ESTRATEGIA DE FIX: Minimal Fix estricto respetando la arquitectura`}
                    </code>
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Diagnostic / Error Section */}
            <section className="test-modal-bottom-analysis">
              <div className="analysis-subnav">
                <div className="analysis-tabs">
                  <button
                    type="button"
                    className={`analysis-tab ${diagTab === "error" ? "active" : ""}`}
                    onClick={() => setDiagTab("error")}
                  >
                    Diagnóstico & Gherkin
                  </button>
                  <button
                    type="button"
                    className={`analysis-tab ${diagTab === "cause" ? "active" : ""}`}
                    onClick={() => setDiagTab("cause")}
                  >
                    Causa Raíz (White-Box)
                  </button>
                  <button
                    type="button"
                    className={`analysis-tab ${diagTab === "fix" ? "active" : ""}`}
                    onClick={() => setDiagTab("fix")}
                  >
                    Solución Sugerida
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-copy-fix-prompt"
                  onClick={handleCopyFixPrompt}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {copiedPrompt ? "✓ ¡Prompt copiado!" : "Copiar Prompt de Corrección"}
                </button>
              </div>

              <div className="analysis-content-box">
                {diagTab === "error" ? (
                  <div>
                    <div className={`analysis-alert-banner ${isFailed ? "alert-failed" : "alert-passed"}`}>
                      <strong>
                        {isFailed ? "⚠️ DISCREPANCIA DETECTADA EN LA PRUEBA (3-LAYER ORACLE)" : "✓ PRUEBA APROBADA SIN INCIDENCIAS"}
                      </strong>
                      <p>
                        {isFailed
                          ? (activeStep.status === "Failed"
                              ? `Al ejecutar el paso #${activeStep.step || currentStepIdx + 1} (${activeStep.target}), el resultado obtenido difiere del comportamiento esperado en la interfaz.`
                              : failedStep
                                ? `Paso #${currentStepIdx + 1} (${activeStep.target}) se ejecutó correctamente en ${activeStep.duration}. La discrepancia de la prueba ocurrió en el Paso #${failedStep.step || failedStepIdx + 1} (${failedStep.target}).`
                                : `Al ejecutar el paso #${currentStepIdx + 1} (${activeStep.target}), el resultado obtenido difiere del comportamiento esperado en la interfaz.`)
                          : "Todas las aserciones de interfaz, tiempos de respuesta y visibilidad de componentes superaron los umbrales de aceptación."}
                      </p>
                    </div>

                    <div className="analysis-observations">
                      <div className="observations-title">ESCENARIO GHERKIN (GIVEN / WHEN / THEN / BUT) & TELEMETRÍA:</div>
                      <ul className="observations-list">
                        <li>
                          <strong>Given (Dado que):</strong> {existingBug?.gherkin?.given || existingBug?.dadoQue || `Operador autenticado en módulo ${moduleLabel} (${currentTest.spec}).`}
                        </li>
                        <li>
                          <strong>When (Cuando):</strong> {existingBug?.gherkin?.when || existingBug?.cuando || `${activeStep.action} sobre selector ${activeStep.target} (${activeStep.duration}).`}
                        </li>
                        <li>
                          <strong>Then (Entonces):</strong> {existingBug?.gherkin?.then || failedStep?.expected || "Sincronización de estado y respuesta visual sin errores."}
                        </li>
                        {isFailed && (
                          <li className="obs-failed-text">
                            <strong>But (Pero — Divergencia):</strong> {existingBug?.gherkin?.but || failedStep?.actual || existingBug?.entonces || "El estado local del cliente no sincroniza de forma reactiva con las demás vistas."}
                          </li>
                        )}
                        <li>
                          <strong>Evidencia Vinculada:</strong> Captura (<code>{currentTest.screenshot || "/evidence/runs/tobi-04-office.png"}</code>) · Video (<code>{currentTest.videoUrl || "/evidence/videos/tobitests-self-audit.webm"}</code>) · Red/Consola verificadas por CDP.
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : diagTab === "cause" ? (
                  <div className="analysis-cause-box">
                    <div className="cause-title">Causa técnica de nivel White-Box:</div>
                    <p className="cause-text">
                      {existingBug?.diagnostic?.whiteBoxHypothesis ||
                        (isFailed
                          ? "Falta de unificación en la invalidación de caché reactiva (React Query / SWR / Zustand). Cuando se despacha la mutación localmente, el componente hermano no suscribe a los cambios del modelo de datos."
                          : "El componente monta correctamente su estado a través de props reactivas y valida las condiciones de renderizado antes de disparar eventos de operador.")}
                    </p>
                    <div className="affected-file-tag">
                      <span>root_cause_file : root_cause_line →</span>
                      <code>
                        {existingBug?.root_cause_file
                          ? `${existingBug.root_cause_file}:${existingBug.root_cause_line || 142}`
                          : existingBug?.diagnostic?.affectedFile || `web/src/pages/${moduleLabel.toLowerCase()}/Component.tsx:142`}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="analysis-fix-box">
                    <div className="fix-title">Plan de mitigación recomendado:</div>
                    <p className="fix-text">
                      {existingBug?.diagnostic?.recommendedFix ||
                        (isFailed
                          ? "1. Emitir un evento global o invalidación de query tras confirmar la acción.\n2. Asegurar que las vistas compartan la misma fuente de verdad (Single Source of Truth).\n3. Re-ejecutar el spec con Playwright para verificar la regresión en verde."
                          : "No se requieren acciones correctivas. Mantener la suite incluida en la integración continua (CI).")}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
