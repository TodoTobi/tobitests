import { useState, useEffect } from "react";

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
}

export function TestDetailModal({ test, onClose, onRunTest, onCreateBug }: TestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "log" | "history">("preview");
  const [diagTab, setDiagTab] = useState<"error" | "cause" | "fix">("error");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [viewMode, setViewMode] = useState<"screenshot" | "video">("screenshot");
  const [priority, setPriority] = useState<"Alta" | "Media" | "Baja">("Media");

  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setViewMode("screenshot");
  }, [test?.name]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!test) return null;

  const steps: TestStep[] = test.steps && test.steps.length > 0 ? test.steps : [
    { step: 1, action: "Navegar", target: "page.goto('http://localhost:5173/')", status: "Passed", duration: "120ms" },
    { step: 2, action: "Inspeccionar", target: "expect(page.locator('body')).toBeVisible()", status: "Passed", duration: "35ms" },
    { step: 3, action: "Interactuar", target: "page.click('button:visible')", status: "Passed", duration: "60ms" },
    { step: 4, action: "Verificar", target: "expect(page).toHaveURL(/.*\\/dashboard/)", status: test.status === "Failed" ? "Failed" : "Passed", duration: "40ms" }
  ];

  const activeStep = steps[currentStepIdx] || steps[0];
  const isFailed = test.status === "Failed";

  // Derive readable module name from spec file
  const moduleLabel = test.spec.replace("vetconnect-", "").replace(".spec.ts", "").toUpperCase();

  const handleNextStep = () => {
    setCurrentStepIdx((prev) => (prev + 1 < steps.length ? prev + 1 : 0));
  };

  const handlePrevStep = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  const handleCopyFixPrompt = () => {
    const promptText = `Por favor, revisá y corregí la siguiente falla en el test de VetConnect:
- Test: ${test.name}
- Archivo Spec: specs/${test.spec}
- Paso que falla: Paso #${activeStep?.step || currentStepIdx + 1}: ${activeStep?.action} (${activeStep?.target})
- Esperado: ${activeStep?.expected || "Estado sincronizado"}
- Obtenido: ${activeStep?.actual || "Divergencia de estado"}
- Diagnóstico: ${isFailed ? "Desincronización de estado entre componentes y almacenamiento reactivo." : "Prueba aprobada."}
Proponé el cambio de código exacto respetando la arquitectura del proyecto.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  return (
    <div className="test-modal-overlay" onClick={onClose}>
      <div className="test-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <header className="test-modal-header">
          <div className="test-modal-header-left">
            <div className="test-modal-breadcrumb">
              <span>{test.spec}</span>
              <span className="crumb-sep">/</span>
              <span className="module-badge">{moduleLabel}</span>
            </div>
            <div className="test-modal-title-row">
              <h2 className="test-modal-title">{test.name}</h2>
              <span className={`test-status-pill ${isFailed ? "failed" : "passed"}`}>
                <span className="pill-dot" />
                {isFailed ? "Con Hallazgo" : "Aprobado"}
              </span>
            </div>
          </div>

          <div className="test-modal-header-right">
            {isFailed && (
              <button
                type="button"
                className="btn-create-bug"
                onClick={() => onCreateBug && onCreateBug(test)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2l1.5 2h5L16 2M9 9h6M8 13H3m18 0h-5M8 17H4m16 0h-4"/><rect x="8" y="4" width="8" height="17" rx="4"/></svg>
                Crear ticket de bug
              </button>
            )}
            <button
              type="button"
              className="btn-run-test-primary"
              onClick={() => onRunTest && onRunTest(test)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Ejecutar prueba
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
                  {test.goal ||
                    "Verifica el flujo de extremo a extremo en la interfaz, validando la interacción del usuario y la respuesta visual del sistema en tiempo y forma."}
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
                  VetConnect · http://localhost:5173 · {test.spec}
                </div>
              </div>

              {activeTab === "preview" ? (
                <div className="viewport-stage">
                  {viewMode === "video" ? (
                    <video
                      src={test.videoUrl || "/evidence/videos/doctor-portal-audit.webm"}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="stage-video"
                    />
                  ) : (
                    <div className="stage-image-wrap">
                      <img
                        src={test.screenshot || "/evidence/runs/05-tutor-dashboard.png"}
                        alt={test.name}
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
                    <span>specs/{test.spec}</span>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => {
                        navigator.clipboard.writeText(`test('${test.name}', async ({ page }) => {\n${steps.map(s => `  // ${s.action}\n  await ${s.target};`).join("\n")}\n});`);
                      }}
                    >
                      Copiar código
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>
{`import { test, expect } from '@playwright/test';

test.describe('${moduleLabel} Flow', () => {
  test('${test.name}', async ({ page }) => {
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
              ) : (
                <div className="viewport-history-panel">
                  <div className="history-item">
                    <span className="history-dot passed" />
                    <div><strong>#RUN-04 (Actual)</strong><small>Hoy · 100% de aserciones validadas</small></div>
                    <span className="history-duration">{test.duration}</span>
                  </div>
                  <div className="history-item">
                    <span className="history-dot passed" />
                    <div><strong>#RUN-03</strong><small>Ayer · Duración óptima</small></div>
                    <span className="history-duration">{test.duration}</span>
                  </div>
                  <div className="history-item">
                    <span className={`history-dot ${isFailed ? "failed" : "passed"}`} />
                    <div><strong>#RUN-02</strong><small>2 días atrás</small></div>
                    <span className="history-duration">1.2s</span>
                  </div>
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
                    Diagnóstico
                  </button>
                  <button
                    type="button"
                    className={`analysis-tab ${diagTab === "cause" ? "active" : ""}`}
                    onClick={() => setDiagTab("cause")}
                  >
                    Causa Raíz
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
                        {isFailed ? "⚠️ DISCREPANCIA DETECTADA EN LA PRUEBA" : "✓ PRUEBA APROBADA SIN INCIDENCIAS"}
                      </strong>
                      <p>
                        {isFailed
                          ? `Al ejecutar el paso #${currentStepIdx + 1} (${activeStep?.target}), el resultado obtenido difiere del comportamiento esperado en la interfaz.`
                          : "Todas las aserciones de interfaz, tiempos de respuesta y visibilidad de componentes superaron los umbrales de aceptación."}
                      </p>
                    </div>

                    <div className="analysis-observations">
                      <div className="observations-title">OBSERVACIONES CLAVE:</div>
                      <ul className="observations-list">
                        <li>
                          <strong>Módulo evaluado:</strong> {moduleLabel} en <code>specs/{test.spec}</code>.
                        </li>
                        <li>
                          <strong>Acción puntual:</strong> {activeStep?.action} sobre el selector <code>{activeStep?.target}</code>.
                        </li>
                        <li>
                          <strong>Tiempos de renderizado:</strong> Paso ejecutado en {activeStep?.duration} sin bloqueos en el hilo principal del DOM.
                        </li>
                        {isFailed && (
                          <li className="obs-failed-text">
                            <strong>Divergencia confirmada:</strong> El estado local del cliente no sincroniza de forma reactiva con el backend o las demás vistas.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : diagTab === "cause" ? (
                  <div className="analysis-cause-box">
                    <div className="cause-title">Causa técnica de nivel White-Box:</div>
                    <p className="cause-text">
                      {isFailed
                        ? "Falta de unificación en la invalidación de caché reactiva (React Query / SWR / Zustand). Cuando se despacha la mutación localmente, el componente hermano no suscribe a los cambios del modelo de datos."
                        : "El componente monta correctamente su estado a través de props reactivas y valida las condiciones de renderizado antes de disparar eventos de usuario."}
                    </p>
                    <div className="affected-file-tag">
                      <span>Archivo a auditar:</span>
                      <code>web/src/pages/{moduleLabel.toLowerCase()}/Component.tsx</code>
                    </div>
                  </div>
                ) : (
                  <div className="analysis-fix-box">
                    <div className="fix-title">Plan de mitigación recomendado:</div>
                    <p className="fix-text">
                      {isFailed
                        ? "1. Emitir un evento global o invalidación de query tras confirmar la acción.\n2. Asegurar que las vistas compartan la misma fuente de verdad (Single Source of Truth).\n3. Re-ejecutar el spec con Playwright para verificar la regresión en verde."
                        : "No se requieren acciones correctivas. Mantener la suite incluida en la integración continua (CI)."}
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
