import { useEffect, useState, type ReactNode } from "react";
import { useTobiState } from "./hooks/useTobiState";

type IconName =
  | "activity"
  | "arrow"
  | "bell"
  | "bug"
  | "check"
  | "chevron"
  | "code"
  | "dashboard"
  | "eye"
  | "file"
  | "help"
  | "layers"
  | "menu"
  | "play"
  | "pulse"
  | "search"
  | "settings"
  | "spark"
  | "terminal"
  | "x";

const iconPaths: Record<IconName, ReactNode> = {
  activity: <path d="M4 12h3l2-6 4 12 2-6h5" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  bug: <><path d="M8 2l1.5 2h5L16 2M9 9h6M8 13H3m18 0h-5M8 17H4m16 0h-4" /><rect x="8" y="4" width="8" height="17" rx="4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-10-4 14" />,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" /><circle cx="12" cy="12" r="2.5" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 3.6 2.1c-.8.4-1.3 1-1.3 1.9m0 4h.01" /></>,
  layers: <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  spark: <path d="m12 2 1.4 5.1L18 10l-4.6 2.9L12 18l-1.4-5.1L6 10l4.6-2.9L12 2Zm7 14 .6 2.2L22 19.5l-2.4 1.3L19 23l-.6-2.2-2.4-1.3 2.4-1.3L19 16ZM4.5 3l.7 2.3L7.5 6.5 5.2 7.7 4.5 10l-.7-2.3-2.3-1.2 2.3-1.2L4.5 3Z" />,
  terminal: <path d="m4 6 5 5-5 5m7 0h9" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, size = "md" }: { name: IconName; size?: "sm" | "md" | "lg" }) {
  return (
    <svg className={`icon icon-${size}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="TobiTests">
      <span className="logo-mark"><span /><span /><span /></span>
      {!compact && <span className="logo-word">Tobi<span>Tests</span></span>}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  className = "",
  label,
}: {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "icon";
  icon?: IconName;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const ButtonElement = "button";
  return (
    <ButtonElement className={`button button-${variant} ${className}`} onClick={onClick} aria-label={label}>
      {children}
      {icon && <Icon name={icon} size="sm" />}
    </ButtonElement>
  );
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "agent" | "info" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function SectionTitle({ eyebrow, title, description, centered = false }: { eyebrow?: string; title: string; description?: string; centered?: boolean }) {
  return (
    <div className={`section-title ${centered ? "centered" : ""}`}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="heading-xl">{title}</div>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

const capabilities = [
  { icon: "search" as IconName, index: "01", title: "Exploración asistida", text: "Agentes que recorren flujos, estados y casos límite con contexto de producto." },
  { icon: "pulse" as IconName, index: "02", title: "Diagnóstico con evidencia", text: "Logs, capturas y telemetría organizados alrededor de cada hallazgo." },
  { icon: "file" as IconName, index: "03", title: "Especificaciones reproducibles", text: "Cada descubrimiento se convierte en pasos claros, revisables y versionables." },
  { icon: "play" as IconName, index: "04", title: "Ejecución con Playwright", text: "Pruebas E2E portables, transparentes y listas para integrarse a tu flujo." },
  { icon: "layers" as IconName, index: "05", title: "Trazabilidad completa", text: "Del razonamiento inicial al resultado final, sin cajas negras." },
];

function ProductDemo() {
  return (
    <div className="product-demo">
      <div className="demo-topbar">
        <div className="browser-dots"><span /><span /><span /></div>
        <div className="browser-url"><Icon name="check" size="sm" /> preview.vetconnect.app/appointments</div>
        <Badge tone="success">Live session</Badge>
      </div>
      <div className="demo-body">
        <div className="demo-rail">
          <span className="rail-active"><Icon name="play" size="sm" /></span>
          <span><Icon name="search" size="sm" /></span>
          <span><Icon name="bug" size="sm" /></span>
          <span><Icon name="code" size="sm" /></span>
        </div>
        <div className="demo-browser">
          <div className="app-mini-header">
            <span className="mini-logo">VC</span>
            <span>VetConnect</span>
            <div className="mini-nav"><span>Inicio</span><span className="active">Turnos</span><span>Pacientes</span></div>
          </div>
          <div className="browser-content">
            <div className="mini-kicker">NUEVO TURNO</div>
            <div className="mini-title">Agendá una consulta</div>
            <div className="mini-fields"><span /><span /><span /></div>
            <div className="mini-button">Confirmar turno</div>
            <div className="target-ring"><span>Step 04</span></div>
          </div>
        </div>
        <div className="demo-inspector">
          <div className="inspector-tabs"><span className="active">Execution</span><span>Evidence</span></div>
          <div className="run-row">
            <span className="run-play"><Icon name="play" size="sm" /></span>
            <div><strong>Appointment flow</strong><small>Running · 4 of 6 steps</small></div>
            <span className="timer">00:18</span>
          </div>
          <div className="steps">
            <div className="step complete"><span><Icon name="check" size="sm" /></span><p>Open appointments</p><small>1.2s</small></div>
            <div className="step complete"><span><Icon name="check" size="sm" /></span><p>Select specialty</p><small>0.8s</small></div>
            <div className="step complete"><span><Icon name="check" size="sm" /></span><p>Choose available slot</p><small>1.4s</small></div>
            <div className="step active"><span>4</span><p>Confirm appointment</p><small>Running</small></div>
            <div className="step"><span>5</span><p>Verify confirmation</p></div>
          </div>
          <div className="agent-note">
            <span className="agent-avatar"><Icon name="spark" size="sm" /></span>
            <div><strong>Explorer QA</strong><p>Validating confirmation state...</p></div>
          </div>
        </div>
      </div>
      <div className="demo-code">
        <span className="line-no">24</span><code><i>await</i> page.getByRole(<em>'button'</em>, {"{"} name: <em>'Confirmar turno'</em> {"}"}).click();</code>
        <span className="code-status"><Icon name="check" size="sm" /> Captured</span>
      </div>
    </div>
  );
}

function MarketingHeader({ openDashboard }: { openDashboard: () => void }) {
  const [open, setOpen] = useState(false);
  const anchors = ["Producto", "Cómo funciona", "Capacidades", "Arquitectura", "Documentación"];
  return (
    <div className="marketing-header-wrap">
      <div className="marketing-header">
        <Logo />
        <div className={`marketing-nav ${open ? "open" : ""}`}>
          {anchors.map((item) => <Button key={item} variant="ghost" onClick={() => setOpen(false)}>{item}</Button>)}
        </div>
        <div className="header-actions">
          <Button variant="ghost" onClick={openDashboard}>Ingresar</Button>
          <Button onClick={openDashboard}>Explorar la plataforma <Icon name="arrow" size="sm" /></Button>
        </div>
        <Button variant="icon" className="mobile-menu" label="Abrir menú" onClick={() => setOpen(!open)}><Icon name={open ? "x" : "menu"} /></Button>
      </div>
    </div>
  );
}

function Landing({ openDashboard }: { openDashboard: () => void }) {
  return (
    <main className="landing">
      <MarketingHeader openDashboard={openDashboard} />
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <Badge tone="info"><Icon name="spark" size="sm" /> QA orchestration for modern teams</Badge>
          <div className="display">De la exploración inteligente a las pruebas que <span>podés ejecutar.</span></div>
          <p className="hero-description">TobiTests coordina agentes especializados para investigar tu aplicación, documentar hallazgos y convertirlos en pruebas E2E reproducibles con Playwright.</p>
          <div className="hero-actions">
            <Button onClick={openDashboard}>Explorar la plataforma <Icon name="arrow" size="sm" /></Button>
            <Button variant="secondary">Cómo funciona <Icon name="play" size="sm" /></Button>
          </div>
          <div className="trust-line"><span><Icon name="check" size="sm" /> Evidencia verificable</span><span><Icon name="check" size="sm" /> Playwright nativo</span><span><Icon name="check" size="sm" /> Sin cajas negras</span></div>
        </div>
        <ProductDemo />
      </section>

      <section className="capabilities section-shell">
        <SectionTitle eyebrow="CAPACIDADES" title="Un sistema conectado, no otra colección de herramientas." description="TobiTests reúne investigación, evidencia y ejecución en un flujo trazable que tu equipo puede entender y controlar." />
        <div className="capability-list">
          {capabilities.map((item) => (
            <div className="capability-row" key={item.title}>
              <span className="cap-index">{item.index}</span>
              <span className="cap-icon"><Icon name={item.icon} /></span>
              <div className="cap-copy"><div className="heading-sm">{item.title}</div><p>{item.text}</p></div>
              <Icon name="arrow" />
            </div>
          ))}
        </div>
      </section>

      <section className="architecture">
        <div className="section-shell architecture-inner">
          <SectionTitle eyebrow="ARQUITECTURA" title="La inteligencia investiga. Las pruebas verifican." description="Una separación deliberada entre el razonamiento de los agentes y la ejecución determinística de tus pruebas." centered />
          <div className="architecture-flow">
            <div className="flow-card">
              <span className="flow-number">01</span><span className="flow-icon agent"><Icon name="spark" /></span>
              <div className="heading-md">Reasoning</div><p>Los agentes exploran, contrastan señales y construyen hipótesis.</p>
              <div className="flow-tags"><Badge tone="agent">Explorer QA</Badge><Badge tone="agent">Telemetry Auditor</Badge></div>
            </div>
            <div className="flow-connector"><span /><Icon name="arrow" /></div>
            <div className="flow-card">
              <span className="flow-number">02</span><span className="flow-icon"><Icon name="code" /></span>
              <div className="heading-md">Codification</div><p>La evidencia se convierte en una especificación legible y revisable.</p>
              <div className="code-snippet"><code><i>expect</i>(confirmation).toBeVisible()</code></div>
            </div>
            <div className="flow-connector"><span /><Icon name="arrow" /></div>
            <div className="flow-card">
              <span className="flow-number">03</span><span className="flow-icon success"><Icon name="play" /></span>
              <div className="heading-md">Execution</div><p>Playwright ejecuta y verifica el comportamiento de forma reproducible.</p>
              <div className="execution-line"><span><Icon name="check" size="sm" /></span><div><strong>6 tests passed</strong><small>Chromium · 24.8s</small></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features section-shell">
        <SectionTitle eyebrow="UNA PLATAFORMA, TODO EL CONTEXTO" title="Cada vista responde una pregunta distinta." description="Desde la salud general de tus pruebas hasta el detalle exacto de un fallo, sin perder el hilo entre pantallas." />
        <div className="feature-composition">
          <div className="feature-large">
            <div className="feature-label"><span><Icon name="dashboard" /></span><div><div className="heading-sm">Dashboard</div><p>Lo importante, primero.</p></div></div>
            <div className="mini-dashboard">
              <div className="mini-metrics"><span><small>PASS RATE</small><strong>94.8%</strong><i>+2.4%</i></span><span><small>ACTIVE RUN</small><strong>18 / 24</strong><i>Running</i></span><span><small>OPEN BUGS</small><strong>07</strong><i>2 critical</i></span></div>
              <div className="mini-chart"><div className="chart-grid" /><svg viewBox="0 0 500 110" preserveAspectRatio="none"><path d="M0 90 C60 80 65 52 120 62 S190 42 230 54 S300 20 345 38 S420 15 500 20" /></svg></div>
            </div>
          </div>
          <div className="feature-stack">
            <div className="feature-small diagnostic-card">
              <div className="feature-label"><span><Icon name="pulse" /></span><div><div className="heading-sm">Diagnostic Studio</div><p>La evidencia, conectada.</p></div></div>
              <div className="diagnostic-log"><span className="error-dot" /><code>TimeoutError: locator.click</code><Badge tone="danger">Blocking</Badge></div>
            </div>
            <div className="feature-small office-card">
              <div className="feature-label"><span className="agent-symbol"><Icon name="spark" /></span><div><div className="heading-sm">La Oficina</div><p>Tus agentes, trabajando juntos.</p></div></div>
              <div className="agent-row-mini"><span>CO</span><span>EX</span><span>TA</span><span>SW</span><div><i /><i /><i /><i /></div></div>
            </div>
          </div>
          <div className="feature-wide">
            <div className="feature-label"><span><Icon name="file" /></span><div><div className="heading-sm">Test Runs · Bug Tracker · Test Specs</div><p>Resultados, problemas y especificaciones bajo una misma trazabilidad.</p></div></div>
            <div className="run-strip"><span>#TR-1048</span><span>checkout-regression</span><Badge tone="success">Passed</Badge><span>48 / 48</span><span>2m 14s</span><Button variant="ghost">Ver ejecución <Icon name="arrow" size="sm" /></Button></div>
          </div>
        </div>
      </section>

      <section className="evidence-section section-shell">
        <div className="evidence-copy">
          <SectionTitle eyebrow="TRANSPARENCIA POR DISEÑO" title="No te quedes con una respuesta. Inspeccioná la evidencia." description="Cada diagnóstico conserva el recorrido completo: qué vio el agente, qué falló, por qué importa y cómo reproducirlo." />
          <div className="evidence-points">
            <div><span>01</span><p><strong>Captura contextual</strong>El estado visual exacto del momento del fallo.</p></div>
            <div><span>02</span><p><strong>Error correlacionado</strong>Consola, red y pasos vinculados en una línea temporal.</p></div>
            <div><span>03</span><p><strong>Especificación asociada</strong>Una definición ejecutable para verificar la corrección.</p></div>
          </div>
        </div>
        <div className="evidence-panel">
          <div className="evidence-panel-head"><div><Badge tone="danger">High impact</Badge><strong>Appointment confirmation does not persist</strong></div><span>BUG-024</span></div>
          <div className="evidence-screenshot">
            <div className="shot-header"><span /><span /><span /><small>preview.vetconnect.app</small></div>
            <div className="shot-content"><div className="shot-dialog"><Icon name="bug" /><strong>No pudimos confirmar el turno</strong><small>Intentá nuevamente en unos minutos.</small><span>Reintentar</span></div></div>
            <span className="evidence-pin">1</span>
          </div>
          <div className="evidence-error"><Icon name="terminal" /><div><small>CONSOLE · 14:32:08.421</small><code>POST /api/appointments <em>500 Internal Server Error</em></code></div></div>
          <div className="evidence-spec"><Icon name="file" /><div><small>ASSOCIATED SPEC</small><strong>appointment-confirmation.spec.ts</strong></div><Badge tone="info">6 steps</Badge></div>
        </div>
      </section>

      <section className="closing">
        <div className="closing-grid" />
        <Logo />
        <div className="heading-xl">Menos incertidumbre.<br /><span>Más pruebas reproducibles.</span></div>
        <p>Convertí investigación compleja en evidencia clara y pruebas que tu equipo puede ejecutar.</p>
        <Button onClick={openDashboard}>Explorar TobiTests <Icon name="arrow" size="sm" /></Button>
      </section>

      <footer className="footer section-shell">
        <div className="footer-main"><div><Logo /><p>QA inteligente, evidencia verificable<br />y automatización reproducible.</p></div><div className="footer-links">{["Producto", "Documentación", "Arquitectura", "Integraciones", "Privacidad", "Repositorio"].map((item) => <Button variant="ghost" key={item}>{item}</Button>)}</div></div>
        <div className="footer-bottom"><span>© 2025 TobiTests. Producto conceptual.</span><span>Los agentes investigan. La evidencia explica. Playwright verifica.</span></div>
      </footer>
    </main>
  );
}

const navItems: { label: string; icon: IconName; section?: boolean }[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Test Runs", icon: "play" },
  { label: "Bug Tracker", icon: "bug" },
  { label: "Diagnostic Studio", icon: "pulse" },
  { label: "La Oficina", icon: "spark" },
  { label: "Test Specs", icon: "file" },
  { label: "Suites", icon: "layers", section: true },
  { label: "Integraciones", icon: "code" },
  { label: "Settings", icon: "settings", section: true },
];

type AppView = "landing" | "dashboard" | "test-runs" | "run-detail" | "live-run" | "bug-tracker" | "bug-detail" | "diagnostic" | "office" | "specs" | "suites" | "settings";

const navViews: Record<string, AppView | undefined> = {
  Dashboard: "dashboard",
  "Test Runs": "test-runs",
  "Bug Tracker": "bug-tracker",
  "Diagnostic Studio": "diagnostic",
  "La Oficina": "office",
  "Test Specs": "specs",
  Suites: "suites",
  Integraciones: "settings",
  Settings: "settings",
};

function Sidebar({ compact, onCompact, onHome, active = "Dashboard", onNavigate }: { compact: boolean; onCompact: () => void; onHome: () => void; active?: string; onNavigate?: (view: AppView) => void }) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  return (
    <aside className={`sidebar ${compact ? "compact" : ""}`}>
      <div className="sidebar-head"><Logo compact={compact} /><Button variant="icon" label="Contraer navegación" onClick={onCompact}><Icon name="chevron" /></Button></div>
      <div className="project-select-wrap">
        <div className="project-select" onClick={() => setProjectsOpen(!projectsOpen)}><span className="project-avatar">V</span>{!compact && <div><small>PROJECT</small><strong>VetConnect Web</strong></div>}{!compact && <Icon name="chevron" size="sm" />}</div>
        {projectsOpen && !compact && <div className="project-popover">
          <SearchField placeholder="Buscar proyecto..." />
          <span className="nav-label">CURRENT PROJECT</span>
          <div className="project-option selected"><span className="project-avatar">V</span><div><strong>VetConnect Web</strong><small>preview.vetconnect.app</small></div><Icon name="check" size="sm" /></div>
          <div className="project-context"><div><small>BRANCH</small><code>main</code></div><div><small>ENVIRONMENT</small><Badge tone="success">Preview</Badge></div><div><small>LAST RUN</small><strong>#TR-1048 · 8 min</strong></div><div><small>AVAILABILITY</small><span><i />Available</span></div></div>
        </div>}
      </div>
      <nav className="sidebar-nav">
        {!compact && <span className="nav-label">WORKSPACE</span>}
        {navItems.map((item) => (
          <div key={item.label}>
            {item.section && !compact && <span className="nav-divider" />}
            <Button variant="ghost" className={item.label === active ? "active" : ""} label={compact ? item.label : undefined} onClick={() => navViews[item.label] && onNavigate?.(navViews[item.label] as AppView)}><Icon name={item.icon} />{!compact && <span>{item.label}</span>}{item.label === "Bug Tracker" && !compact && <Badge tone="danger">7</Badge>}</Button>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="usage-ring"><span>68%</span></div>{!compact && <div><strong>Plan Professional</strong><small>6.8k / 10k minutos</small></div>}
      </div>
      {!compact && <Button variant="ghost" className="back-site" onClick={onHome}>Volver al sitio</Button>}
    </aside>
  );
}

const runs = [
  { id: "#TR-1048", suite: "Critical user journeys", branch: "main", status: "Passed", passed: 48, failed: 0, duration: "2m 14s", date: "Hace 8 min" },
  { id: "#TR-1047", suite: "Checkout regression", branch: "feat/booking", status: "Failed", passed: 31, failed: 3, duration: "4m 08s", date: "Hace 42 min" },
  { id: "#TR-1046", suite: "Authentication", branch: "main", status: "Running", passed: 18, failed: 0, duration: "1m 02s", date: "En curso" },
  { id: "#TR-1045", suite: "Patient portal", branch: "release/v2.4", status: "Inconclusive", passed: 22, failed: 1, duration: "3m 41s", date: "Ayer, 18:22" },
  { id: "#TR-1044", suite: "Smoke test", branch: "main", status: "Cancelled", passed: 4, failed: 0, duration: "0m 38s", date: "Ayer, 16:10" },
];

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, "success" | "danger" | "warning" | "agent" | "neutral"> = { Passed: "success", Failed: "danger", Running: "agent", Queued: "neutral", Cancelled: "neutral", Inconclusive: "warning" };
  return <Badge tone={tones[status] || "neutral"}><span className="status-dot" />{status}</Badge>;
}

function Metric({ label, value, meta, tone, chart }: { label: string; value: string; meta: string; tone?: string; chart?: boolean }) {
  return (
    <div className={`metric ${tone || ""}`}><span className="metric-label">{label}</span><div className="metric-main"><strong>{value}</strong>{chart && <div className="spark-bars">{[30, 48, 42, 66, 60, 83, 76, 94].map((v, i) => <i key={i} style={{ "--bar": `${v}%` } as React.CSSProperties} />)}</div>}</div><span className="metric-meta">{meta}</span></div>
  );
}

function DashboardHeader({ onMenu, onTelemetry, onToast, title = "Dashboard" }: { onMenu: () => void; onTelemetry: () => void; onToast: () => void; title?: string }) {
  return (
    <header className="app-header">
      <Button variant="icon" className="app-mobile-menu" label="Abrir navegación" onClick={onMenu}><Icon name="menu" /></Button>
      <div className="breadcrumbs"><span>VetConnect Web</span><Icon name="chevron" size="sm" /><strong>{title}</strong></div>
      <div className="app-header-actions">
        <div className="environment"><span className="connection-dot" />Preview<Icon name="chevron" size="sm" /></div>
        <Button variant="secondary" className="active-run" onClick={onTelemetry}><span className="live-pulse" />Run #TR-1046 <Badge tone="agent">18 / 24</Badge></Button>
        <Button variant="icon" label="Notificaciones" onClick={onToast}><Icon name="bell" /><span className="notification-dot" /></Button>
        <Button variant="icon" label="Ayuda"><Icon name="help" /></Button>
        <div className="profile"><span>TB</span><div><strong>Tobías</strong><small>QA Lead</small></div><Icon name="chevron" size="sm" /></div>
      </div>
    </header>
  );
}

function Dashboard({ onHome, onNavigate }: { onHome: () => void; onNavigate: (view: AppView) => void }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [notifications, setNotifications] = useState(false);
  return (
    <div className="app">
      <div className={mobileNav ? "mobile-overlay show" : "mobile-overlay"} onClick={() => setMobileNav(false)} />
      <div className={mobileNav ? "sidebar-mobile open" : "sidebar-mobile"}><Sidebar compact={false} onCompact={() => setMobileNav(false)} onHome={onHome} onNavigate={onNavigate} /></div>
      <Sidebar compact={compact} onCompact={() => setCompact(!compact)} onHome={onHome} onNavigate={onNavigate} />
      <div className="app-main">
        <DashboardHeader onMenu={() => setMobileNav(true)} onTelemetry={() => setTelemetry(true)} onToast={() => setNotifications(true)} />
        <main className="workspace">
          <div className="workspace-heading">
            <div><div className="heading-lg">Dashboard</div><p>Una vista general de tus pruebas, hallazgos y actividad de los agentes.</p></div>
            <div><Button variant="secondary"><Icon name="search" size="sm" /> Buscar</Button><Button><Icon name="play" size="sm" /> Nueva ejecución</Button></div>
          </div>

          <div className="overview">
            <div className="metrics-primary">
              <Metric label="TASA DE APROBACIÓN" value="94.8%" meta="+2.4% vs. período anterior" chart />
              <Metric label="TOTAL DE EJECUCIONES" value="1,284" meta="126 en los últimos 7 días" />
            </div>
            <div className="metrics-secondary">
              <Metric label="PRUEBAS FALLIDAS" value="12" meta="3 requieren atención" tone="danger" />
              <Metric label="BUGS ABIERTOS" value="7" meta="2 de alta prioridad" tone="warning" />
              <Metric label="DURACIÓN PROMEDIO" value="2m 48s" meta="-18s esta semana" />
              <Metric label="ÚLTIMA EJECUCIÓN" value="8 min" meta="#TR-1048 · Passed" tone="success" />
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="runs-panel panel">
              <div className="panel-head"><div><div className="heading-sm">Historial de ejecuciones</div><p>Actividad reciente en todos los entornos</p></div><Button variant="ghost">Ver todas <Icon name="arrow" size="sm" /></Button></div>
              <div className="table-wrap">
                <div className="run-table">
                  <div className="table-row table-head"><span>ID</span><span>SUITE / RAMA</span><span>ESTADO</span><span>RESULTADOS</span><span>DURACIÓN</span><span>FECHA</span><span /></div>
                  {runs.map((run) => <div className="table-row" key={run.id}><strong>{run.id}</strong><span className="suite-cell"><strong>{run.suite}</strong><small>{run.branch}</small></span><StatusBadge status={run.status} /><span className="results"><i>{run.passed} passed</i>{run.failed > 0 && <em>{run.failed} failed</em>}</span><code>{run.duration}</code><span className="date-cell">{run.date}</span><Button variant="icon" label={`Ver ${run.id}`} onClick={() => onNavigate(run.status === "Running" ? "live-run" : "run-detail")}><Icon name="chevron" size="sm" /></Button></div>)}
                </div>
              </div>
              <div className="table-footer"><span>Mostrando 5 de 1,284 ejecuciones</span><div><Button variant="icon" label="Anterior"><Icon name="chevron" size="sm" /></Button><Button variant="icon" label="Siguiente"><Icon name="chevron" size="sm" /></Button></div></div>
            </section>

            <aside className="agents-panel panel">
              <div className="panel-head"><div><div className="heading-sm">Actividad de agentes</div><p>4 agentes disponibles</p></div><span className="agents-online"><i />3 activos</span></div>
              <div className="agent-list">
                {[
                  ["CO", "Central Orchestrator", "Coordinando ejecución #TR-1046", "Ahora", "working"],
                  ["EX", "Explorer QA Agent", "Validando flujo de turnos", "Hace 1 min", "working"],
                  ["TA", "Telemetry Auditor", "Analizando 3 errores de consola", "Hace 2 min", "working"],
                  ["SW", "Spec Writer", "appointment-confirmation.spec", "Hace 12 min", "idle"],
                ].map(([initials, name, task, time, state]) => <div className="agent-item" key={name}><span className={`agent-initials ${state}`}>{initials}<i /></span><div><strong>{name}</strong><p>{task}</p><small>{time}</small></div><Icon name="chevron" size="sm" /></div>)}
              </div>
              <Button variant="secondary" className="full-button" onClick={() => onNavigate("office")}>Abrir La Oficina <Icon name="arrow" size="sm" /></Button>
            </aside>

            <section className="findings-panel panel">
              <div className="panel-head"><div><div className="heading-sm">Hallazgos recientes</div><p>Problemas que requieren atención</p></div><Button variant="ghost" onClick={() => onNavigate("bug-tracker")}>Ver Bug Tracker <Icon name="arrow" size="sm" /></Button></div>
              <div className="finding-list">
                <div className="finding critical"><span><Icon name="bug" /></span><div><Badge tone="danger">HIGH</Badge><strong>Appointment confirmation does not persist</strong><p>El turno desaparece después de actualizar la vista.</p><small>BUG-024 · Checkout regression · Hace 42 min</small></div><Icon name="chevron" /></div>
                <div className="finding"><span><Icon name="pulse" /></span><div><Badge tone="warning">MEDIUM</Badge><strong>Patient form loses unsaved changes</strong><p>La navegación no alerta sobre cambios pendientes.</p><small>BUG-023 · Patient portal · Hace 3 h</small></div><Icon name="chevron" /></div>
              </div>
            </section>

            <section className="timeline-panel panel">
              <div className="panel-head"><div><div className="heading-sm">Actividad</div><p>Hoy, 18 de junio</p></div><Button variant="icon" label="Filtrar"><Icon name="menu" /></Button></div>
              <div className="timeline">
                <div><span className="timeline-icon success"><Icon name="check" size="sm" /></span><p><strong>Ejecución #TR-1048 aprobada</strong>48 pruebas completadas en 2m 14s.<small>14:48</small></p></div>
                <div><span className="timeline-icon agent"><Icon name="spark" size="sm" /></span><p><strong>Spec Writer creó una especificación</strong>appointment-confirmation.spec.ts<small>14:36</small></p></div>
                <div><span className="timeline-icon danger"><Icon name="bug" size="sm" /></span><p><strong>Nuevo hallazgo de alta prioridad</strong>Asignado a Checkout regression.<small>14:32</small></p></div>
                <div><span className="timeline-icon"><Icon name="code" size="sm" /></span><p><strong>Integración actualizada</strong>GitHub sincronizó la rama main.<small>13:58</small></p></div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <div className={`drawer-backdrop ${telemetry ? "show" : ""}`} onClick={() => setTelemetry(false)} />
      <aside className={`telemetry-drawer ${telemetry ? "open" : ""}`}>
        <div className="drawer-head"><div><Badge tone="agent"><span className="live-pulse" />RUNNING</Badge><div className="heading-sm">Run #TR-1046</div><p>Authentication · Preview</p></div><Button variant="icon" label="Cerrar" onClick={() => setTelemetry(false)}><Icon name="x" /></Button></div>
        <div className="drawer-progress"><div><span>18 de 24 pruebas</span><strong>75%</strong></div><span><i /></span></div>
        <div className="telemetry-stream"><span className="nav-label">LIVE TELEMETRY</span>{["Login with valid credentials", "Persist session on refresh", "Reset password request", "Block invalid credentials"].map((item, i) => <div key={item}><span className={i < 3 ? "success" : "active"}>{i < 3 ? <Icon name="check" size="sm" /> : <span />}</span><p><strong>{item}</strong><small>{i < 3 ? `${(i + 1) * 0.7}s` : "Running..."}</small></p></div>)}</div>
        <div className="console-box"><span>14:49:08</span><code>navigated to /auth/login</code><span>14:49:09</span><code>locator.fill('[name=email]')</code><span>14:49:10</span><code>expect(response.status).toBe(401)</code></div>
      </aside>
      <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={onNavigate} />
    </div>
  );
}

function SearchField({ placeholder = "Buscar por ID..." }: { placeholder?: string }) {
  const InputElement = "input";
  return <div className="search-field"><Icon name="search" size="sm" /><InputElement placeholder={placeholder} aria-label={placeholder} /></div>;
}

function Filter({ label }: { label: string }) {
  return <Button variant="secondary" className="filter-button">{label}<Icon name="chevron" size="sm" /></Button>;
}

function PageHeading({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return <div className="workspace-heading operation-heading"><div><div className="heading-lg">{title}</div><p>{subtitle}</p></div><div>{children}</div></div>;
}

const operationRuns = [
  ["#TR-1048", "Critical user journeys", "Passed", "48", "48", "0", "0", "2m 14s", "main", "Hoy, 14:48"],
  ["#TR-1047", "Checkout regression", "Failed", "34", "31", "3", "0", "4m 08s", "feat/booking", "Hoy, 14:06"],
  ["#TR-1046", "Authentication", "Running", "24", "18", "0", "0", "1m 02s", "main", "En curso"],
  ["#TR-1045", "Patient portal", "Inconclusive", "28", "22", "1", "5", "3m 41s", "release/v2.4", "Ayer, 18:22"],
  ["#TR-1044", "Smoke test", "Cancelled", "18", "4", "0", "14", "0m 38s", "main", "Ayer, 16:10"],
  ["#TR-1043", "Responsive UI", "Queued", "16", "0", "0", "0", "—", "fix/mobile-nav", "En cola"],
];

function TestRunsPage({ navigate }: { navigate: (view: AppView) => void }) {
  return <>
    <PageHeading title="Test Runs" subtitle="Consultá, filtrá y compará las ejecuciones de VetConnect Web.">
      <Button variant="secondary"><Icon name="layers" size="sm" /> Comparar</Button><Button><Icon name="play" size="sm" /> Nueva ejecución</Button>
    </PageHeading>
    <div className="filter-bar panel">
      <SearchField /><div className="filter-group"><Filter label="Proyecto: Todos" /><Filter label="Suite" /><Filter label="Estado" /><Filter label="Entorno" /><Filter label="Rama" /><Filter label="Últimos 7 días" /></div>
      <Button variant="ghost">Limpiar filtros</Button>
    </div>
    <section className="panel operation-table-panel">
      <div className="panel-head"><div><div className="heading-sm">Todas las ejecuciones</div><p>1,284 resultados ficticios · Actualizado hace 1 min</p></div><Filter label="Más recientes" /></div>
      <div className="table-wrap">
        <div className="operation-table">
          <div className="op-table-row op-table-head"><span>ID</span><span>SUITE / PROYECTO</span><span>ESTADO</span><span>TOTAL</span><span>PASS</span><span>FAIL</span><span>SKIP</span><span>DURACIÓN</span><span>RAMA / FECHA</span><span /></div>
          {operationRuns.map((run) => <div className="op-table-row" key={run[0]}><strong>{run[0]}</strong><span className="suite-cell"><strong>{run[1]}</strong><small>VetConnect Web · Preview</small></span><StatusBadge status={run[2]} /><code>{run[3]}</code><span className="cell-success">{run[4]}</span><span className={run[5] !== "0" ? "cell-danger" : ""}>{run[5]}</span><span>{run[6]}</span><code>{run[7]}</code><span className="suite-cell"><strong>{run[8]}</strong><small>{run[9]}</small></span><Button variant="icon" label={`Abrir ${run[0]}`} onClick={() => navigate(run[2] === "Running" ? "live-run" : "run-detail")}><Icon name="chevron" size="sm" /></Button></div>)}
        </div>
      </div>
      <div className="table-footer"><span>Mostrando 1–6 de 1,284</span><div><Button variant="secondary">1</Button><Button variant="ghost">2</Button><Button variant="ghost">3</Button><Button variant="icon" label="Siguiente"><Icon name="chevron" size="sm" /></Button></div></div>
    </section>
    <div className="state-strip"><div><span className="state-spinner" /><p><strong>Loading</strong>Actualizando ejecuciones...</p></div><div><Icon name="search" /><p><strong>Sin resultados</strong>Ajustá o limpiá los filtros.</p></div><div><Icon name="bug" /><p><strong>Error</strong>No se pudo cargar el historial.</p></div><div><Icon name="file" /><p><strong>Vacío</strong>Todavía no hay ejecuciones.</p></div></div>
  </>;
}

function RunDetailPage({ navigate }: { navigate: (view: AppView) => void }) {
  const tests = [
    ["User can complete an appointment", "Failed", "42.8s"],
    ["Appointment persists after refresh", "Failed", "18.2s"],
    ["Available slots are displayed", "Passed", "8.1s"],
    ["Patient can cancel an appointment", "Passed", "12.4s"],
  ];
  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("test-runs")}><Icon name="arrow" size="sm" /> Volver a Test Runs</Button></div>
    <PageHeading title="Run #TR-1047" subtitle="Checkout regression · VetConnect Web · Preview">
      <Button variant="secondary"><Icon name="file" size="sm" /> Descargar reporte</Button><Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" /> Abrir Live Run</Button>
    </PageHeading>
    <div className="run-summary panel">
      <div className="result-hero"><span className="result-icon failed"><Icon name="x" /></span><div><StatusBadge status="Failed" /><div className="heading-md">3 pruebas necesitan atención</div><p>La ejecución terminó con errores en el flujo de confirmación de turnos.</p></div></div>
      <div className="summary-facts">{[["TOTAL","34"],["PASSED","31"],["FAILED","3"],["DURATION","4m 08s"],["BRANCH","feat/booking"],["COMMIT","8fd12a"]].map(([k,v]) => <div key={k}><small>{k}</small><strong>{v}</strong></div>)}</div>
    </div>
    <div className="detail-layout">
      <section className="panel test-results">
        <div className="panel-head"><div><div className="heading-sm">Resultados de pruebas</div><p>4 grupos · 34 pruebas</p></div><div className="segmented"><Button variant="ghost" className="active">Todos</Button><Button variant="ghost">Fallidos 3</Button><Button variant="ghost">Passed 31</Button></div></div>
        {tests.map(([name,status,time], i) => <div className={`test-result ${i === 0 ? "selected" : ""}`} key={name}><span className={status === "Passed" ? "test-state passed" : "test-state failed"}><Icon name={status === "Passed" ? "check" : "x"} size="sm" /></span><div><strong>{name}</strong><small>appointments.spec.ts · Chromium</small></div><code>{time}</code><StatusBadge status={status} /><Icon name="chevron" size="sm" /></div>)}
      </section>
      <aside className="panel run-inspector">
        <div className="panel-head"><div><div className="heading-sm">Detalle del fallo</div><p>Test 12 de 34</p></div><Button variant="icon" label="Más opciones"><Icon name="menu" /></Button></div>
        <div className="error-callout"><Badge tone="danger">ASSERTION ERROR</Badge><code>expect(locator).toContainText("Confirmado")</code><p>Received: "En consulta"</p></div>
        <div className="inspector-shot"><div className="shot-header"><span /><span /><span /><small>preview.vetconnect.app/messages</small></div><div><span>Consulta veterinaria</span><strong>En consulta</strong><i>Expected: Confirmado</i></div></div>
        <div className="evidence-links"><Button variant="secondary"><Icon name="eye" size="sm" /> Screenshot</Button><Button variant="secondary"><Icon name="terminal" size="sm" /> Logs</Button></div>
        <Button className="full-button" onClick={() => navigate("bug-detail")}>Abrir bug relacionado · BUG-01 <Icon name="arrow" size="sm" /></Button>
      </aside>
    </div>
  </>;
}

const liveSteps = [
  ["01", "NAVIGATE", "/login", "Passed", "1.2s"],
  ["02", "TYPE", "input[name=\"email\"]", "Passed", "0.8s"],
  ["03", "CLICK", "button[type=\"submit\"]", "Running", "2.1s"],
  ["04", "VERIFY", "expect(url).toBe('/vet/dashboard')", "Pending", "—"],
];

function LiveRunPage({ tobi }: { tobi?: ReturnType<typeof useTobiState> }) {
  const [tab, setTab] = useState("Console");
  const [selected, setSelected] = useState(2);
  const liveRun = tobi?.state.liveRun || {
    id: "#TR-1049",
    suite: "Authentication",
    target: "http://localhost:5173",
    status: "Running",
    currentStep: 2,
    totalSteps: 4,
    elapsedTime: "00:18.42",
    steps: liveSteps.map(s => ({ index: s[0], action: s[1], target: s[2], status: s[3], duration: s[4], description: "" })),
    telemetryLogs: [
      { time: "14:49:08.121", level: "INFO", message: "navigated to /login", source: "Playwright MCP" },
      { time: "14:49:09.884", level: "ACTION", message: "locator.fill('[name=email]', 'vet@example.com')", source: "Playwright MCP" },
      { time: "14:49:10.402", level: "WAIT", message: "waiting for navigation to /vet/dashboard", source: "Playwright MCP" },
      { time: "14:49:10.516", level: "SUCCESS", message: "POST /api/auth/session · 184ms", source: "Chrome DevTools MCP" },
    ]
  };

  return <>
    <PageHeading title={`Live Run · ${liveRun.id}`} subtitle={`${liveRun.suite} · Preview · Chromium 126`}>
      <Badge tone="agent"><span className="live-pulse" /> {liveRun.status.toUpperCase()}</Badge><Button variant="secondary">Pausar</Button><Button variant="secondary"><Icon name="x" size="sm" /> Detener</Button>
    </PageHeading>
    <div className="live-status"><div><span className="connection-dot" /><strong>Browser connected (Playwright + CDP)</strong><small>1280 × 720 · 32ms latency</small></div><div className="live-progress"><span><i /></span><strong>{liveRun.currentStep + 1} / {liveRun.totalSteps} pasos</strong><code>{liveRun.elapsedTime}</code></div></div>
    <div className="live-layout">
      <section className="browser-mirror panel">
        <div className="mirror-bar"><div className="browser-dots"><span /><span /><span /></div><div className="mirror-url"><Icon name="check" size="sm" /> {liveRun.target}/login</div><Badge tone="success">Connected</Badge></div>
        <div className="vet-login">
          <div className="vet-brand"><span>V</span><strong>VetConnect</strong></div>
          <div className="login-card"><div className="heading-md">Bienvenido nuevamente</div><p>Ingresá para gestionar tus pacientes.</p><label>Email</label><div className="mock-input active">vet@example.com<span className="cursor" /></div><label>Contraseña</label><div className="mock-input">••••••••••••</div><div className="login-button">Ingresar<span className="interaction-ring" /></div><small>¿Olvidaste tu contraseña?</small></div>
          <div className="step-pointer"><span>03</span><p>CLICK · submit</p></div>
        </div>
      </section>
      <aside className="step-panel panel">
        <div className="panel-head"><div><div className="heading-sm">Step Timeline</div><p>Secuencia en ejecución</p></div><Badge tone="info">{liveRun.steps.length} steps</Badge></div>
        {liveRun.steps.map((step, i) => <div className={`live-step ${selected === i ? "selected" : ""}`} key={step.index} onClick={() => setSelected(i)}><span className={`step-state ${step.status.toLowerCase()}`}>{step.status === "Passed" ? <Icon name="check" size="sm" /> : step.index}</span><div><small>{step.action}</small><code>{step.target}</code><p>{step.description || (step.status === "Running" ? "Interaction dispatched, waiting for response" : step.status === "Passed" ? "Completed successfully" : "Waiting for previous step")}</p></div><span><StatusBadge status={step.status} /><code>{step.duration}</code></span></div>)}
        <div className="step-detail"><span className="nav-label">SELECTED STEP</span><div><small>ACTION</small><strong>Click primary submit button</strong></div><div><small>SELECTOR</small><code>button[type="submit"]</code></div><Button variant="secondary" className="full-button"><Icon name="eye" size="sm" /> View related evidence</Button></div>
      </aside>
    </div>
    <section className="telemetry-panel panel">
      <div className="telemetry-tabs">{["Console","Network","DOM","Events","MCP Trace"].map(t => <Button variant="ghost" className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}{t === "Network" && <Badge tone="neutral">12</Badge>}</Button>)}<div className="telemetry-tools"><SearchField placeholder={`Filtrar ${tab.toLowerCase()}...`} /><Filter label="All levels" /></div></div>
      <div className="light-console">{liveRun.telemetryLogs.map((log, idx) => <div key={idx}><span>{log.time}</span><Badge tone={log.level === 'SUCCESS' ? 'success' : log.level === 'WAIT' ? 'warning' : log.level === 'ACTION' ? 'agent' : 'info'}>{log.level}</Badge><code>{log.message}</code><small style={{ marginLeft: 'auto', opacity: 0.6 }}>{log.source}</small></div>)}</div>
    </section>
  </>;
}

const bugs = [
  ["BUG-01", "Inconsistencia al cancelar una consulta", "High", "Confirmed", "Mensajes / Consultas", "#TR-1049", "Telemetry Auditor", "Tobías"],
  ["BUG-02", "El formulario pierde cambios sin aviso", "Medium", "Investigating", "Pacientes", "#TR-1045", "Explorer QA", "Lucía M."],
  ["BUG-03", "Sesión expirada conserva navegación", "Critical", "New", "Autenticación", "#TR-1039", "Explorer QA", "Tomás R."],
  ["BUG-04", "Desalineación en selector móvil", "Low", "Resolved", "Responsive UI", "#TR-1028", "Visual Auditor", "Lucía M."],
];

function BugTrackerPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi?: ReturnType<typeof useTobiState> }) {
  const [reportOpen, setReportOpen] = useState(false);
  const bugList = tobi?.state.bugs || [];

  return <>
    <PageHeading title="Bug Tracker" subtitle="Hallazgos documentados, reproducibles y vinculados con sus evidencias.">
      <Button variant="secondary" onClick={() => setReportOpen(true)}><Icon name="file" size="sm" /> Master Bug Report</Button>
      <Button onClick={() => tobi?.downloadMasterBugReport()}><Icon name="bug" size="sm" /> Exportar todos (.md)</Button>
    </PageHeading>
    <div className="filter-bar panel"><SearchField placeholder="Buscar bug, título o módulo..." /><div className="filter-group"><Filter label="Severidad" /><Filter label="Estado" /><Filter label="Proyecto" /><Filter label="Módulo" /><Filter label="Fecha" /></div><Button variant="ghost">Limpiar</Button></div>
    <section className="panel bug-list">
      <div className="panel-head"><div><div className="heading-sm">Hallazgos</div><p>{bugList.length} abiertos · Plantilla BDD estándar activa</p></div><Filter label="Última actividad" /></div>
      <div className="table-wrap"><div className="bug-table">
        <div className="bug-row bug-head"><span>BUG / TÍTULO</span><span>SEVERIDAD</span><span>VERIFICACIÓN</span><span>MÓDULO</span><span>ORIGEN</span><span>AGENTE</span><span>RESPONSABLE</span><span /></div>
        {bugList.map((bug) => <div className="bug-row" key={bug.id}><div><strong>{bug.id}</strong><p>{bug.title}</p><small>VetConnect Web · {bug.date}</small></div><Badge tone={bug.severity === "Critical" || bug.severity === "High" ? "danger" : bug.severity === "Medium" ? "warning" : "neutral"}>{bug.severity}</Badge><Badge tone={bug.status === "Resolved" ? "success" : bug.status === "Confirmed" ? "agent" : "info"}>{bug.status}</Badge><span>{bug.section}</span><Button variant="ghost" onClick={() => navigate("run-detail")}>{bug.runId}</Button><span>{bug.agent}</span><span>{bug.assignee}</span><Button variant="icon" label={`Abrir ${bug.id}`} onClick={() => navigate("bug-detail")}><Icon name="chevron" size="sm" /></Button></div>)}
      </div></div>
    </section>
    {reportOpen && <div className="modal-backdrop show" onClick={() => setReportOpen(false)}><div className="master-report panel" onClick={(event) => event.stopPropagation()}>
      <div className="modal-head"><div><Badge tone="info">MARKDOWN EXPORT</Badge><div className="heading-md">Master Bug Report</div><p>Prepará un informe consolidado con los hallazgos en plantilla BDD estandarizada.</p></div><Button variant="icon" label="Cerrar" onClick={() => setReportOpen(false)}><Icon name="x" /></Button></div>
      <div className="report-summary"><div><small>INCIDENCIAS</small><strong>{bugList.length}</strong></div><div><small>PROYECTO</small><strong>{tobi?.state.project.name || "VetConnect Web"}</strong></div><div><small>ESTRUCTURA</small><strong>Gherkin / BDD</strong></div><div><small>FILTROS</small><Badge tone="info">All Bugs</Badge></div></div>
      <div className="report-preview"><div className="preview-head"><span>master-bug-report.md</span><Badge tone="neutral">Preview</Badge></div><code>{`# Master Bug Report — ${tobi?.state.project.name || "VetConnect Web"}\n\n## ${bugList[0]?.id || "BUG-01"}: ${bugList[0]?.title || "Inconsistencia al cancelar consulta"}\n**Sección:** ${bugList[0]?.section || "Mensajes / Consultas"}\n\n**Dado que:** ${bugList[0]?.dadoQue || "..."}\n**Cuando:** ${bugList[0]?.cuando || "..."}\n**Entonces:** ${bugList[0]?.entonces || "..."}`}</code></div>
      <div className="modal-actions"><Button variant="ghost" onClick={() => setReportOpen(false)}>Cancelar</Button><Button onClick={() => { tobi?.downloadMasterBugReport(); setReportOpen(false); }}><Icon name="file" size="sm" /> Descargar Master Bug Report (.md)</Button></div>
    </div></div>}
  </>;
}

function BugDetailPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi?: ReturnType<typeof useTobiState> }) {
  const [evidence, setEvidence] = useState("Screenshots");
  const [copied, setCopied] = useState(false);
  const bug = tobi?.state.bugs[0] || {
    id: "BUG-01",
    title: "Inconsistencia al cancelar consulta entre Mensajes y Mascotas",
    severity: "High",
    status: "Confirmed",
    section: "Mensajes / Consultas",
    runId: "#TR-1049",
    agent: "Telemetry Auditor",
    assignee: "Tobías",
    date: "Hoy, 14:32",
    scenario: "BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas, sección: Mensajes / Consultas",
    dadoQue: "el usuario tiene una consulta activa (\"En consulta\") registrada para una mascota.",
    cuando: "el usuario accede a la sección \"Mensajes\" y presiona el botón \"Cancelar\".",
    entonces: "el mensaje es removido de la bandeja (resultado real obtenido), pero al navegar a \"Mascotas -> Tus consultas\", el registro de la consulta sigue figurando erróneamente en estado \"En consulta\" (resultado real obtenido) cuando debería figurar como cancelado o haber sido eliminado de forma sincronizada en ambas secciones (resultado esperado)."
  };

  const handleCopy = () => {
    if (tobi) {
      tobi.copyBddToClipboard(bug);
    } else {
      navigator.clipboard.writeText(`Escenario:\nNombre y sección: [${bug.id}]: ${bug.title}, sección: ${bug.section}\n\nPasos para reproducir:\nDado que ${bug.dadoQue}\nCuando ${bug.cuando}\nEntonces ${bug.entonces}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("bug-tracker")}><Icon name="arrow" size="sm" /> Volver a Bug Tracker</Button></div>
    <PageHeading title={`${bug.id} · ${bug.title}`} subtitle={`${bug.section} · ${tobi?.state.project.name || "VetConnect Web"}`}>
      <Button variant={copied ? "primary" : "secondary"} onClick={handleCopy}><Icon name="file" size="sm" /> {copied ? "✓ ¡Copiado al portapapeles!" : "Copy BDD Markdown"}</Button>
      <Button onClick={() => tobi?.downloadMasterBugReport()}><Icon name="spark" size="sm" /> Exportar Reporte (.md)</Button>
    </PageHeading>
    <div className="bug-meta panel"><div><small>SEVERIDAD</small><Badge tone="danger">{bug.severity}</Badge></div><div><small>ESTADO</small><Badge tone="agent">{bug.status}</Badge></div><div><small>MÓDULO</small><strong>{bug.section}</strong></div><div><small>ORIGEN</small><Button variant="ghost" onClick={() => navigate("run-detail")}>{bug.runId}</Button></div><div><small>SPEC</small><Button variant="ghost" onClick={() => navigate("specs")}>appointments.spec.ts</Button></div></div>
    <div className="bug-detail-grid">
      <div>
        <section className="panel content-panel"><div className="panel-head"><div className="heading-sm">Resumen del hallazgo</div></div><div className="prose"><p>{bug.title}. El usuario experimenta comportamiento divergente entre vistas tras la acción.</p><div className="fact-pair"><div><small>RESULTADO REAL</small><p>El mensaje es removido de la bandeja, pero en "Mascotas" sigue figurando como <strong>"En consulta"</strong>.</p></div><div><small>RESULTADO ESPERADO</small><p>El registro de la consulta debería figurar como <strong>"Cancelada"</strong> de forma sincronizada en ambas secciones.</p></div></div></div></section>
        <section className="panel bdd-panel"><div className="panel-head"><div><div className="heading-sm">Escenario BDD / Gherkin (Plantilla Estandarizada)</div><p>Estructura oficial para reproducción y resolución</p></div><Badge tone="info">Gherkin BDD</Badge></div>
          <div className="gherkin"><div><span>Nombre y sección:</span><p><strong>[{bug.id}]:</strong> {bug.title}, sección: <strong>{bug.section}</strong></p></div><div><span>Pasos para reproducir:</span></div><div><code>Dado que:</code><p>{bug.dadoQue}</p></div><div><code>Cuando:</code><p>{bug.cuando}</p></div><div><code>Entonces:</code><p>{bug.entonces}</p></div></div>
        </section>
      </div>
      <aside className="panel evidence-browser"><div className="evidence-tabs">{["Screenshots","Video Replay","Network Trace","Console Log","DOM Snapshot","Related Test Spec"].map(t => <Button variant="ghost" className={evidence === t ? "active" : ""} onClick={() => setEvidence(t)} key={t}>{t}</Button>)}</div><div className="bug-screenshot"><div className="shot-header"><span /><span /><span /><small>VetConnect · Mensajes</small></div><div><div className="message-item"><span>LV</span><p><strong>Consulta de Luna</strong><small>La consulta fue cancelada</small></p><Badge tone="neutral">Oculto</Badge></div><div className="inconsistency-arrow"><Icon name="arrow" /></div><div className="consult-item"><p><small>ESTADO EN CONSULTAS</small><strong>Consulta de Luna</strong></p><Badge tone="warning">En consulta</Badge></div></div></div><div className="evidence-caption"><span>Evidence 01</span><p>Capturado automáticamente por Playwright MCP y Chrome DevTools MCP.</p></div><div className="evidence-actions"><Button variant="secondary" onClick={() => tobi?.downloadMasterBugReport()}>Descargar Reporte</Button><Button variant="secondary" onClick={handleCopy}>{copied ? "¡Copiado!" : "Copiar BDD"}</Button></div></aside>
    </div>
  </>;
}

function DiagnosticPage({ navigate }: { navigate: (view: AppView) => void }) {
  const sections = [
    ["Hechos observados","success","La solicitud DELETE responde 204. El elemento se elimina de Mensajes. La consulta conserva status=active en GET /consultations."],
    ["Hipótesis del agente","agent","El mutation handler podría invalidar el cache de mensajes, pero no la query de consultas. Esta hipótesis requiere verificación."],
    ["Resultado de verificación","info","La reproducción se completó 3 veces en Preview. El comportamiento fue consistente en Chromium y WebKit."],
    ["Posibles causas raíz","warning","Invalidación parcial de cache o ausencia de actualización transaccional entre los módulos de Mensajes y Consultas."],
  ];
  return <>
    <PageHeading title="Diagnostic Studio · BUG-01" subtitle="VetConnect Web · #TR-1047 · Confirmed · Hoy, 14:32">
      <Button variant="secondary" onClick={() => navigate("bug-detail")}>Abrir bug</Button><Button onClick={() => navigate("specs")}>Ver especificación <Icon name="arrow" size="sm" /></Button>
    </PageHeading>
    <div className="diagnostic-layout">
      <div className="diagnostic-main">
        <section className="panel diagnostic-summary"><div><Badge tone="danger">HIGH IMPACT</Badge><div className="heading-md">El estado de la consulta no se sincroniza después de cancelar</div><p>La evidencia muestra una divergencia entre Mensajes y Consultas después de una respuesta exitosa del servidor.</p></div><div className="diagnostic-score"><span>87%</span><small>Evidence confidence</small></div></section>
        <div className="diagnostic-browser panel"><div className="mirror-bar"><div className="browser-dots"><span /><span /><span /></div><div className="mirror-url">preview.vetconnect.app/messages</div><Badge tone="neutral">Historical replay</Badge></div><div className="diag-viewport"><div className="diag-sidebar"><span /><span /><span /></div><div className="diag-content"><strong>Mensajes</strong><div className="diag-message"><span>LV</span><p><strong>Consulta de Luna</strong><small>Cancelada hace unos segundos</small></p></div><div className="diag-highlight"><span>Observed</span></div></div></div></div>
        <section className="panel analysis-grid">{sections.map(([title,tone,text], i) => <div className={`analysis-block ${tone}`} key={title}><span>{i+1}</span><div><div className="heading-sm">{title}</div><p>{text}</p>{title === "Hipótesis del agente" && <Badge tone="agent">NO CONFIRMADA</Badge>}</div></div>)}</section>
        <section className="panel trace-panel"><div className="panel-head"><div><div className="heading-sm">Reproducción y timeline</div><p>Eventos correlacionados · 4.8 segundos</p></div><Filter label="Todos los eventos" /></div><div className="trace-list"><div><code>00:00.000</code><Badge tone="info">ACTION</Badge><p>Click "Cancelar consulta"</p></div><div><code>00:00.184</code><Badge tone="success">204</Badge><p>DELETE /api/messages/consultation/884</p></div><div><code>00:01.201</code><Badge tone="warning">CACHE</Badge><p>messages invalidated · consultations unchanged</p></div><div><code>00:04.820</code><Badge tone="danger">ASSERT</Badge><p>Expected status "cancelled", received "active"</p></div></div></section>
      </div>
      <aside className="diagnostic-context panel">
        <div className="panel-head"><div className="heading-sm">Contexto de investigación</div></div>
        <div className="context-agent"><span>TA</span><div><small>AGENTE RESPONSABLE</small><strong>Telemetry Auditor</strong><p>Última actividad hace 2 min</p></div></div>
        <div className="context-section"><small>EVIDENCIA DISPONIBLE</small>{["2 screenshots","Network trace","Console log","DOM snapshot"].map(x => <p key={x}><Icon name="check" size="sm" />{x}</p>)}</div>
        <div className="context-section missing"><small>EVIDENCIA FALTANTE</small><p><Icon name="x" size="sm" />Server transaction logs</p><p><Icon name="x" size="sm" />Cache invalidation trace</p></div>
        <div className="context-section"><small>ARCHIVOS RELACIONADOS</small><code>src/messages/cancel.ts</code><code>src/consultations/cache.ts</code><code>appointments.spec.ts</code></div>
        <Button variant="secondary" className="full-button" onClick={() => navigate("specs")}>Abrir Test Spec asociado</Button>
      </aside>
    </div>
  </>;
}

const codeLines = [
  "test('redirects authenticated veterinarian', async ({ page }) => {",
  "  await page.goto('/login');",
  "  await page.getByLabel('Email').fill('vet@example.com');",
  "  await page.getByLabel('Password').fill('example-password');",
  "  await page.getByRole('button', { name: 'Ingresar' }).click();",
  "  await expect(page).toHaveURL('/vet/dashboard');",
  "});",
];

function SpecsPage({ navigate }: { navigate: (view: AppView) => void }) {
  const [file, setFile] = useState("auth.spec.ts");
  const files = ["auth.spec.ts","pet-creation.spec.ts","appointments.spec.ts","navigation.spec.ts"];
  return <>
    <PageHeading title="Test Specs" subtitle="Hallazgos convertidos en pruebas reproducibles y versionables.">
      <Button variant="secondary"><Icon name="code" size="sm" /> Sync with CI</Button><Button><Icon name="file" size="sm" /> Nueva especificación</Button>
    </PageHeading>
    <div className="spec-stats">{[["4","ARCHIVOS"],["26","PRUEBAS"],["92.3%","VALIDATION RATE"],["#TR-1048","LAST RUN"]].map(([v,k]) => <div className="panel" key={k}><small>{k}</small><strong>{v}</strong></div>)}</div>
    <div className="spec-workbench panel">
      <aside className="file-tree"><div className="file-tree-head"><strong>EXPLORER</strong><Button variant="icon" label="Más"><Icon name="menu" size="sm" /></Button></div><div className="tree-root"><Icon name="chevron" size="sm" /><Icon name="layers" size="sm" /><strong>vetconnect-e2e</strong></div><div className="tree-folder"><Icon name="chevron" size="sm" /><span>tests</span></div>{files.map(f => <Button variant="ghost" className={file === f ? "active" : ""} onClick={() => setFile(f)} key={f}><Icon name="file" size="sm" />{f}{f === "appointments.spec.ts" && <span className="file-dot" />}</Button>)}</aside>
      <section className="code-editor"><div className="editor-tabs"><span><Icon name="file" size="sm" />{file}<i /></span><div><Badge tone="success"><Icon name="check" size="sm" /> VALIDATED</Badge><Button variant="ghost">Copy Code</Button><Button variant="ghost">Download Spec</Button></div></div><div className="editor-breadcrumb">tests <Icon name="chevron" size="sm" /> {file} <Icon name="chevron" size="sm" /> redirects authenticated veterinarian</div><div className="code-lines">{codeLines.map((line,i) => <div key={i}><span>{i+1}</span><code className={i === 5 ? "code-highlight" : ""}>{line}</code>{i === 5 && <Badge tone="success">passed</Badge>}</div>)}</div><div className="editor-results"><div><span className="test-state passed"><Icon name="check" size="sm" /></span><p><strong>Last validation passed</strong><small>#TR-1048 · Chromium · 8.4s</small></p></div><Button variant="secondary" onClick={() => navigate("run-detail")}>Open Related Run</Button><Button variant="secondary">View History</Button></div></section>
      <aside className="change-history"><div className="panel-head"><div className="heading-sm">Change history</div></div>{[["Today, 14:36","Spec Writer","Added post-login URL assertion"],["Jun 17, 11:04","Tobías B.","Updated authentication fixture"],["Jun 12, 09:18","Spec Writer","Created from BUG-018"]].map(([d,u,t]) => <div key={d}><span><i /></span><p><small>{d}</small><strong>{t}</strong><em>{u}</em></p></div>)}</aside>
    </div>
  </>;
}

const suites = [
  ["Authentication","Login, sessions and access recovery","8","Passed","98%","1m 24s","Hoy, 14:48"],
  ["Pet Management","Creation, editing and patient records","14","Passed","96%","2m 18s","Hoy, 13:12"],
  ["Appointments","Scheduling, confirmation and cancellation","12","Failed","83%","3m 42s","Hoy, 14:06"],
  ["Messaging","Conversations and consultation states","9","Inconclusive","88%","1m 58s","Ayer, 18:22"],
  ["Navigation","Routes, permissions and deep links","7","Passed","100%","0m 54s","Ayer, 16:40"],
  ["Responsive UI","Critical flows across viewports","16","Queued","94%","4m 20s","En cola"],
];

function SuitesPage({ navigate }: { navigate: (view: AppView) => void }) {
  const [selected, setSelected] = useState("Appointments");
  return <>
    <PageHeading title="Suites" subtitle="Organizá pruebas relacionadas y revisá su rendimiento a lo largo del tiempo."><Button><Icon name="layers" size="sm" /> Nueva suite</Button></PageHeading>
    <div className="suite-layout">
      <section className="panel suite-list"><div className="panel-head"><SearchField placeholder="Buscar suite..." /><Filter label="Último resultado" /></div>{suites.map(s => <div className={`suite-item ${selected === s[0] ? "selected" : ""}`} onClick={() => setSelected(s[0])} key={s[0]}><span className="suite-symbol"><Icon name="layers" /></span><div><strong>{s[0]}</strong><p>{s[1]}</p><small>{s[2]} pruebas · {s[6]}</small></div><StatusBadge status={s[3]} /><div className="suite-rate"><strong>{s[4]}</strong><small>Pass rate</small></div><code>{s[5]}</code><Icon name="chevron" size="sm" /></div>)}</section>
      <aside className="panel suite-detail"><div className="suite-detail-head"><span className="suite-symbol"><Icon name="layers" /></span><div><Badge tone="danger">2 recurrent failures</Badge><div className="heading-md">{selected}</div><p>Scheduling, confirmation and cancellation flows.</p></div><Button variant="icon" label="Más"><Icon name="menu" /></Button></div>
        <div className="suite-metrics"><div><small>TESTS</small><strong>12</strong></div><div><small>PASS RATE</small><strong>83%</strong></div><div><small>DURATION</small><strong>3m 42s</strong></div></div>
        <div className="suite-section"><div className="heading-sm">Últimas pruebas</div>{["Create a new appointment","Cancel active consultation","Persist confirmation after refresh"].map((x,i) => <div className="suite-test" key={x}><span className={i === 0 ? "test-state passed" : "test-state failed"}><Icon name={i === 0 ? "check" : "x"} size="sm" /></span><p><strong>{x}</strong><small>appointments.spec.ts</small></p><code>{i === 0 ? "8.2s" : "18.4s"}</code></div>)}</div>
        <div className="suite-section"><div className="heading-sm">Errores recurrentes</div><div className="recurring-error"><Icon name="bug" /><p><strong>State synchronization</strong><small>2 ocurrencias en las últimas 5 ejecuciones</small></p></div></div>
        <Button variant="secondary" className="full-button" onClick={() => navigate("specs")}>Abrir especificaciones relacionadas</Button>
      </aside>
    </div>
  </>;
}

const officeAgents = [
  { id: "orchestrator", initials: "CO", name: "Central Orchestrator", role: "Chief Architect", status: "Active", task: "Verifying expected result", tone: "agent", run: "#TR-1046" },
  { id: "explorer", initials: "EX", name: "Explorer QA Agent", role: "Product Explorer", status: "Active", task: "Testing /login flow", tone: "info", run: "#TR-1046" },
  { id: "telemetry", initials: "TA", name: "Telemetry Auditor", role: "Observability Analyst", status: "Blocked", task: "Inspecting 500 error", tone: "danger", run: "#TR-1047" },
  { id: "writer", initials: "SW", name: "Spec Writer", role: "Test Specification", status: "Completed", task: "Writing auth.spec.ts", tone: "success", run: "#TR-1048" },
] as const;

function AgentCharacter({ initials, tone }: { initials: string; tone: string }) {
  return <div className={`agent-character ${tone}`}><span className="agent-head"><i /><b>{initials}</b></span><span className="agent-body"><i /></span></div>;
}

function IsoPerson({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  return <div className={`iso-person person-${id} ${selected ? "selected" : ""}`} onClick={onSelect}>
    <span className="person-shadow" />
    <span className="person-legs"><i /><i /></span>
    <span className="person-torso"><i className="arm-left" /><i className="arm-right" /></span>
    <span className="person-head"><i className="person-hair" /><i className="person-face" /></span>
    <span className="person-select-ring" />
  </div>;
}

function OfficePage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi?: ReturnType<typeof useTobiState> }) {
  const [selectedId, setSelectedId] = useState<string | null>("orchestrator");
  const [phase, setPhase] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState("overview");
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setPhase(current => (current + 1) % 6), 5600);
    return () => window.clearInterval(timer);
  }, [paused]);

  const agentsList = tobi?.state.officeAgents || officeAgents;
  const selected = agentsList.find(agent => agent.id === selectedId) || null;
  const phases = [
    { title: "Planning the QA operation", detail: "Central Orchestrator is reviewing the task", progress: 12, active: "orchestrator" },
    { title: "Exploring the login flow", detail: "Explorer QA is navigating VetConnect Web", progress: 31, active: "explorer" },
    { title: "Evidence handoff", detail: "Explorer and Telemetry are meeting", progress: 48, active: "explorer" },
    { title: "Diagnosing the 500 response", detail: "Telemetry Auditor is correlating network evidence", progress: 66, active: "telemetry" },
    { title: "Writing a reproducible spec", detail: "Spec Writer is drafting auth.spec.ts", progress: 84, active: "writer" },
    { title: "Reviewing the result", detail: "Central Orchestrator is validating the handoff", progress: 96, active: "orchestrator" },
  ];
  const current = phases[phase];
  const isActive = (id: string) => id === "orchestrator" || id === current.active || (phase === 2 && id === "telemetry");
  const activeCount = phase === 2 ? 3 : current.active === "orchestrator" ? 1 : 2;
  const statusFor = (id: string) => phase === 2 && (id === "explorer" || id === "telemetry") ? "Collaborating" : id === current.active && phase === 3 ? "Analyzing" : isActive(id) ? "Working" : phase === 5 && id === "writer" ? "Completed" : "Waiting";
  return <>
    <PageHeading title="La Oficina" subtitle="Observá cómo los agentes investigan, colaboran y convierten evidencia en pruebas.">
      <Badge tone={tobi?.connected ? "success" : "neutral"}><span className="connection-dot" />{tobi?.connected ? "Live Agent Bridge (SSE)" : "Local Storage"}</Badge>
      <Button variant="secondary" onClick={() => setPaused(!paused)}><Icon name={paused ? "play" : "activity"} size="sm" />{paused ? "Reanudar" : "Pausar simulación"}</Button>
    </PageHeading>
    <div className="virtual-office">
      <div className="supervisor-bar">
        <div className="office-project"><span className="project-avatar">V</span><div><small>ACTIVE PROJECT</small><strong>{tobi?.state.project.name || "VetConnect Web"}</strong></div><Badge tone="success"><span className="connection-dot" />Office online</Badge></div>
        <div className="office-kpis"><span><i className="active" /><strong>{activeCount}</strong> active</span><span><i className="waiting" /><strong>{4 - activeCount}</strong> waiting</span><span><i className="blocked" /><strong>0</strong> blocked</span><span><Icon name="play" size="sm" /><strong>1</strong> task in progress</span></div>
        <div className="last-office-event"><small>LAST ACTIVITY</small><strong>{current.detail}</strong></div>
      </div>

      <div className="office-viewport">
        <div className="camera-controls">
          <Button variant="icon" label="Acercar" onClick={() => setZoom(Math.min(2, zoom + 1))}><span className="control-symbol">+</span></Button>
          <Button variant="icon" label="Alejar" onClick={() => setZoom(Math.max(0, zoom - 1))}><span className="control-symbol">−</span></Button>
          <span className="control-separator" />
          <Button variant="icon" label="Restablecer vista" onClick={() => { setZoom(1); setFocus("overview"); }}><Icon name="dashboard" size="sm" /></Button>
          <Button variant="icon" label="Enfocar agente seleccionado" onClick={() => selected && setFocus(selected.id)}><Icon name="eye" size="sm" /></Button>
        </div>
        <div className={`iso-camera zoom-${zoom} focus-${focus}`}>
          <div className={`iso-office phase-${phase} ${paused ? "paused" : ""}`}>
            <div className="iso-floor"><span className="floor-tile tile-a" /><span className="floor-tile tile-b" /><span className="floor-tile tile-c" /><span className="floor-tile tile-d" /></div>
            <div className="back-wall wall-left"><div className="office-window"><i /><i /><i /></div><div className="wall-sign"><Logo /></div></div>
            <div className="back-wall wall-right"><div className="office-window wide"><i /><i /><i /></div></div>

            <div className="zone-rug rug-qa" /><div className="zone-rug rug-telemetry" /><div className="zone-rug rug-specs" /><div className="zone-rug rug-central" />
            <div className="zone-label label-qa">QA EXPLORATION</div><div className="zone-label label-telemetry">TELEMETRY LAB</div><div className="zone-label label-specs">SPEC STUDIO</div>

            <div className="iso-workstation ws-qa"><div className="iso-desk"><span className="desk-face" /><span className="desk-side" /><span className="desk-leg l1" /><span className="desk-leg l2" /></div><div className="iso-monitor browser-screen"><span className="monitor-face"><i /><b /><em /></span><span className="monitor-side" /><span className="monitor-stand" /></div><div className="iso-chair"><span /><i /></div><div className="desk-prop tablet-prop"><span /></div></div>
            <div className="iso-workstation ws-telemetry"><div className="iso-desk"><span className="desk-face" /><span className="desk-side" /><span className="desk-leg l1" /><span className="desk-leg l2" /></div><div className="iso-monitor log-screen"><span className="monitor-face"><i /><i /><i className="error" /><i /></span><span className="monitor-side" /><span className="monitor-stand" /></div><div className="iso-monitor network-screen"><span className="monitor-face"><i /><b /><em /></span><span className="monitor-side" /><span className="monitor-stand" /></div><div className="iso-chair"><span /><i /></div></div>
            <div className="iso-workstation ws-specs"><div className="iso-desk wood"><span className="desk-face" /><span className="desk-side" /><span className="desk-leg l1" /><span className="desk-leg l2" /></div><div className="iso-monitor code-screen"><span className="monitor-face"><i /><i /><b /><i /><em /></span><span className="monitor-side" /><span className="monitor-stand" /></div><div className="iso-chair"><span /><i /></div><div className="paper-stack"><Icon name="file" size="sm" /><i /><i /></div></div>
            <div className="iso-whiteboard"><span className="board-face"><strong>Test plan</strong><i /><i /><i /><b /></span><span className="board-side" /><span className="board-leg left" /><span className="board-leg right" /></div>

            <div className="central-pod"><div className="pod-table"><span className="pod-top" /><span className="pod-base" /></div><div className="pod-screen screen-one"><span /><i /><i /></div><div className="pod-screen screen-two"><span /><i /><i /></div><div className="task-beacon"><Icon name="spark" size="sm" /><span /></div></div>
            <div className="meeting-zone"><div className="meeting-table"><span /><i /></div><div className="meeting-chair mc-one"><span /><i /></div><div className="meeting-chair mc-two"><span /><i /></div><div className="handoff-packet"><Icon name="file" size="sm" /></div></div>

            <div className="iso-sofa"><span className="sofa-back" /><span className="sofa-seat" /><i /><i /></div>
            <div className="iso-plant plant-a"><span /><i /><i /><i /></div><div className="iso-plant plant-b"><span /><i /><i /><i /></div>
            <div className="coffee-point"><span className="coffee-body" /><span className="coffee-top" /><i /></div>

            <IsoPerson id="orchestrator" selected={selectedId === "orchestrator"} onSelect={() => setSelectedId("orchestrator")} />
            <IsoPerson id="explorer" selected={selectedId === "explorer"} onSelect={() => setSelectedId("explorer")} />
            <IsoPerson id="telemetry" selected={selectedId === "telemetry"} onSelect={() => setSelectedId("telemetry")} />
            <IsoPerson id="writer" selected={selectedId === "writer"} onSelect={() => setSelectedId("writer")} />

            <div className="activity-bubble bubble-orchestrator"><span className="typing-dots"><i /><i /><i /></span>{agentsList.find(a => a.id === "orchestrator")?.bubble || (phase === 0 ? "Planning task" : phase === 5 ? "Reviewing result" : "Coordinating")}</div>
            <div className="activity-bubble bubble-explorer">{agentsList.find(a => a.id === "explorer")?.bubble || "Testing /login flow"}</div>
            <div className="activity-bubble bubble-telemetry">{agentsList.find(a => a.id === "telemetry")?.bubble || "Auditoría CDP activa"}</div>
            <div className="activity-bubble bubble-writer">{agentsList.find(a => a.id === "writer")?.bubble || "Writing auth.spec.ts"}</div>
          </div>
        </div>

        <div className="cycle-status">
          <div><Badge tone="agent"><span className="live-pulse" /> WORK CYCLE</Badge><strong>{current.title}</strong><p>{current.detail}</p></div>
          <div className="cycle-progress"><span><i style={{ width: `${current.progress}%` }} /></span><small>{current.progress}% · Step {phase + 1} of 6</small></div>
          <div className="cycle-steps">{phases.map((item, index) => <span className={index === phase ? "active" : index < phase ? "complete" : ""} key={item.title} onClick={() => setPhase(index)}>{index < phase ? <Icon name="check" size="sm" /> : index + 1}</span>)}</div>
        </div>

        {selected && <aside className="scene-agent-panel">
          <div className="scene-panel-head"><div><Badge tone={selected.tone}>{statusFor(selected.id)}</Badge><div className="heading-sm">{selected.name}</div><p>{selected.role}</p></div><Button variant="icon" label="Cerrar detalle" onClick={() => setSelectedId(null)}><Icon name="x" size="sm" /></Button></div>
          <div className="scene-agent-task"><small>ASSIGNED TASK</small><strong>{selected.id === current.active ? current.title : selected.task}</strong><div className="mini-progress"><span><i style={{ width: selected.id === current.active ? `${current.progress}%` : "24%" }} /></span><em>{selected.id === current.active ? current.progress : 24}%</em></div></div>
          <div className="scene-agent-facts"><div><small>LAST ACTIVITY</small><p>{selected.id === current.active ? current.detail : "Waiting for the next handoff"}</p></div><div><small>HANDOFF</small><p>{selected.id === "orchestrator" ? "To Explorer QA" : selected.id === "writer" ? "From Telemetry Auditor" : "From Central Orchestrator"}</p></div><div><small>LAST MOCK RESULT</small><p>{selected.id === "telemetry" ? "500 response correlated with submit action" : "Evidence package updated"}</p></div></div>
          <div className="scene-panel-actions"><Button variant="secondary" onClick={() => setFocus(selected.id)}><Icon name="eye" size="sm" /> Enfocar puesto</Button><Button variant="ghost">Historial <Icon name="arrow" size="sm" /></Button></div>
          <Button variant="ghost" className="related-scene-run" onClick={() => navigate(selected.run === "#TR-1046" ? "live-run" : "run-detail")}>Related run · {selected.run}<Icon name="chevron" size="sm" /></Button>
        </aside>}
      </div>

      <div className="mobile-office-agents">
        <div className="mobile-office-scene">
          <div className="mobile-scene-art"><div className="mobile-room"><span /><span /><span /></div>{agentsList.map(agent => <div className={`mobile-person mobile-${agent.id}`} key={agent.id} onClick={() => setSelectedId(agent.id)}><IsoPerson id={agent.id} selected={selectedId === agent.id} onSelect={() => setSelectedId(agent.id)} /></div>)}</div>
          <div><Badge tone="agent">SIMULATED OFFICE</Badge><div className="heading-sm">{current.title}</div><p>{current.detail}</p></div>
        </div>
        {agentsList.map(agent => <div className={`mobile-agent-row ${selectedId === agent.id ? "selected" : ""}`} key={agent.id} onClick={() => setSelectedId(agent.id)}><span className={`mobile-agent-avatar ${agent.tone}`}><i /><b>{agent.initials}</b></span><div><strong>{agent.name}</strong><small>{agent.role}</small><p>{agent.id === current.active ? current.title : "Waiting for next assignment"}</p></div><Badge tone={agent.id === current.active ? "agent" : "neutral"}>{statusFor(agent.id)}</Badge><Icon name="chevron" size="sm" /></div>)}
      </div>
    </div>
  </>;
}

const settingsNav = ["General","Projects / Targets","Test Execution","Agent Configuration","MCP Integrations","Notifications","Appearance","Account"];

function Toggle({ active = true, disabled = false }: { active?: boolean; disabled?: boolean }) {
  return <span className={`toggle ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}><i /></span>;
}

function SettingsPage() {
  const [section, setSection] = useState("MCP Integrations");
  const [integration, setIntegration] = useState<string | null>(null);
  return <>
    <PageHeading title="Settings & Integrations" subtitle="Configurá el workspace, los agentes y las conexiones conceptuales de TobiTests."><Badge tone="neutral">Prototype settings</Badge></PageHeading>
    <div className="settings-layout">
      <aside className="settings-nav panel">{settingsNav.map(item => <Button variant="ghost" className={section === item ? "active" : ""} onClick={() => setSection(item)} key={item}><Icon name={item.includes("MCP") ? "code" : item.includes("Agent") ? "spark" : item.includes("Project") ? "layers" : item === "Notifications" ? "bell" : "settings"} size="sm" />{item}<Icon name="chevron" size="sm" /></Button>)}</aside>
      <section className="settings-content panel">
        {section === "MCP Integrations" ? <McpSettings onDetail={setIntegration} /> : section === "Agent Configuration" ? <AgentSettings /> : section === "Projects / Targets" ? <ProjectSettings /> : <GeneralSettings section={section} />}
      </section>
    </div>
    <div className={`drawer-backdrop ${integration ? "show" : ""}`} onClick={() => setIntegration(null)} />
    <aside className={`integration-drawer ${integration ? "open" : ""}`}>{integration && <><div className="drawer-head"><div><Badge tone="success">CONNECTED</Badge><div className="heading-md">{integration}</div><p>Conceptual integration details</p></div><Button variant="icon" label="Cerrar" onClick={() => setIntegration(null)}><Icon name="x" /></Button></div><div className="integration-health"><span><Icon name="check" /></span><div><strong>Connection healthy</strong><p>Last conceptual check: Today, 14:42</p></div></div><div className="integration-details"><div><small>TRANSPORT</small><code>stdio</code></div><div><small>PERMISSIONS</small><strong>Browser · Network · DOM</strong></div><div><small>TARGET</small><strong>VetConnect Web · Preview</strong></div><div><small>VERSION</small><code>0.0.42</code></div></div><div className="mcp-trace-box"><div><span>LAST CHECK</span><Badge tone="success">184ms</Badge></div><code>initialize → success{"\n"}tools/list → 24 tools{"\n"}target/resolve → vetconnect-preview{"\n"}health → connected</code></div><div className="drawer-warning"><Icon name="help" /><p><strong>Frontend prototype</strong>These values represent the intended interface. No live MCP connection is being queried.</p></div><Button variant="secondary" className="full-button">Check connection</Button></>}</aside>
  </>;
}

function McpSettings({ onDetail }: { onDetail: (name: string) => void }) {
  return <><div className="settings-section-head"><div><div className="heading-md">MCP Integrations</div><p>Conectá herramientas especializadas al flujo de investigación de los agentes.</p></div><Button><Icon name="code" size="sm" /> Add integration</Button></div>
    <div className="integration-list">
      <div className="integration-item"><span className="integration-icon"><Icon name="play" /></span><div><div><strong>@playwright/mcp</strong><Badge tone="success">Connected</Badge></div><p>Browser automation, snapshots and deterministic interaction tools.</p><small>Last check · Today, 14:42</small></div><div className="health-bars"><i /><i /><i /><i /></div><Button variant="secondary" onClick={() => onDetail("@playwright/mcp")}>View details</Button></div>
      <div className="integration-item"><span className="integration-icon chrome"><Icon name="pulse" /></span><div><div><strong>@chromedevtools/chrome-devtools-mcp</strong><Badge tone="warning">Degraded</Badge></div><p>Console, network, performance and DOM inspection for Chromium.</p><small>Last check · Today, 14:38 · Network tool delayed</small></div><div className="health-bars degraded"><i /><i /><i /><i /></div><Button variant="secondary" onClick={() => onDetail("@chromedevtools/chrome-devtools-mcp")}>Inspect issue</Button></div>
    </div>
    <div className="settings-subhead"><div><div className="heading-sm">Connection states</div><p>Language shared across setup and troubleshooting flows.</p></div></div>
    <div className="connection-states">
      <div><span className="state-icon neutral"><Icon name="code" /></span><p><strong>No integrations</strong>Connect an MCP provider to enable technical tools.</p><Button variant="ghost">Browse integrations</Button></div>
      <div><span className="state-icon danger"><Icon name="x" /></span><p><strong>Disconnected</strong>The provider stopped responding.</p><Button variant="ghost">Reconnect</Button></div>
      <div><span className="state-icon warning"><Icon name="help" /></span><p><strong>Permissions insufficient</strong>Browser target access is restricted.</p><Button variant="ghost">Review permissions</Button></div>
      <div><span className="state-icon warning"><Icon name="search" /></span><p><strong>Target not found</strong>VetConnect Preview could not be resolved.</p><Button variant="ghost">Select target</Button></div>
      <div><span className="state-icon danger"><Icon name="bug" /></span><p><strong>Check failed</strong>Connection verification timed out.</p><Button variant="ghost">Try again</Button></div>
    </div>
  </>;
}

function AgentSettings() {
  return <><div className="settings-section-head"><div><div className="heading-md">Agent Configuration</div><p>Preferencias conceptuales para el comportamiento y la visibilidad de los agentes.</p></div><Button>Save changes</Button></div>
    <div className="agent-settings-list">{officeAgents.map((agent,i) => <div className="agent-setting" key={agent.id}><AgentCharacter initials={agent.initials} tone={agent.tone} /><div><strong>{agent.name}</strong><p>{agent.role} · {i === 2 ? "Telemetry and evidence review" : "Assigned to active workspace"}</p></div><Toggle active={i !== 3} /></div>)}</div>
    <div className="form-section"><div><div className="heading-sm">Execution preferences</div><p>Controls are visual representations and do not modify real agents.</p></div><div className="form-row"><div><strong>Telemetry detail</strong><p>Amount of console, network and DOM context attached.</p></div><Filter label="Detailed" /></div><div className="form-row"><div><strong>Automatic task handoff</strong><p>Allow agents to pass evidence to the next specialist.</p></div><Toggle /></div><div className="form-row disabled"><div><strong>Production execution</strong><p>Disabled for this demonstration workspace.</p></div><Toggle active={false} disabled /></div><div className="form-row"><div><strong>Agent notifications</strong><p>Notify when a task is blocked or completed.</p></div><Toggle /></div></div>
  </>;
}

function ProjectSettings() {
  return <><div className="settings-section-head"><div><div className="heading-md">Projects / Targets</div><p>Contexto de demostración utilizado por ejecuciones y agentes.</p></div><Button>Add target</Button></div><div className="target-detail"><div className="target-title"><span className="project-avatar">V</span><div><strong>VetConnect Web</strong><p>preview.vetconnect.app</p></div><Badge tone="success"><span className="connection-dot" />Available</Badge></div><div className="integration-details"><div><small>REFERENCE URL</small><code>https://preview.vetconnect.app</code></div><div><small>DEFAULT BRANCH</small><code>main</code></div><div><small>ENVIRONMENT</small><strong>Preview</strong></div><div><small>LAST EXECUTION</small><strong>#TR-1048 · Passed</strong></div></div></div></>;
}

function GeneralSettings({ section }: { section: string }) {
  return <><div className="settings-section-head"><div><div className="heading-md">{section}</div><p>Preferencias del workspace de demostración VetConnect Web.</p></div><Button>Save changes</Button></div><div className="form-section"><div className="form-row"><div><strong>Workspace name</strong><p>Visible to all members of this conceptual workspace.</p></div><div className="mock-form-input">TobiTests · VetConnect</div></div><div className="form-row"><div><strong>Product updates</strong><p>Receive informational notifications in the activity panel.</p></div><Toggle /></div><div className="form-row"><div><strong>Critical alerts</strong><p>Always show execution and connection errors.</p></div><Toggle /></div></div></>;
}

function NotificationPanel({ open, onClose, navigate }: { open: boolean; onClose: () => void; navigate: (view: AppView) => void }) {
  const notices = [
    ["danger","Prueba fallida","Appointment persists after refresh · #TR-1047","Hace 42 min","run-detail"],
    ["danger","Nueva incidencia","BUG-01 fue confirmado por Telemetry Auditor","Hace 38 min","bug-detail"],
    ["warning","Integración degradada","Chrome DevTools MCP presenta latencia elevada","Hace 24 min","settings"],
    ["success","Especificación generada","auth.spec.ts fue validado correctamente","Hace 12 min","specs"],
    ["info","Ejecución finalizada","#TR-1048 completó 48 pruebas","Hace 8 min","run-detail"],
  ] as const;
  return <><div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={onClose} /><aside className={`notification-panel ${open ? "open" : ""}`}><div className="notification-head"><div><div className="heading-md">Notificaciones</div><p>Actividad relevante de tu workspace.</p></div><Button variant="icon" label="Cerrar" onClick={onClose}><Icon name="x" /></Button></div><div className="notification-filter"><Button variant="ghost" className="active">Todas <Badge tone="info">5</Badge></Button><Button variant="ghost">Críticas</Button><Button variant="ghost">No leídas</Button></div><div className="notification-list">{notices.map(([tone,title,text,time,target]) => <div className={`notification-item ${tone}`} key={title} onClick={() => { navigate(target as AppView); onClose(); }}><span><Icon name={tone === "danger" ? "bug" : tone === "warning" ? "code" : tone === "success" ? "check" : "play"} /></span><div><div><strong>{title}</strong><small>{time}</small></div><p>{text}</p></div><Icon name="chevron" size="sm" /></div>)}</div><div className="notification-empty"><Icon name="bell" /><p><strong>Todo al día</strong>El estado vacío aparece cuando no hay actividad pendiente.</p></div></aside></>;
}

function Operations({ view, navigate, onHome, tobi }: { view: AppView; navigate: (view: AppView) => void; onHome: () => void; tobi: ReturnType<typeof useTobiState> }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const labels: Record<string,string> = { "test-runs":"Test Runs","run-detail":"Run #TR-1047","live-run":"Live Run","bug-tracker":"Bug Tracker","bug-detail":"BUG-01","diagnostic":"Diagnostic Studio",office:"La Oficina",specs:"Test Specs",suites:"Suites",settings:"Settings & Integrations" };
  const active = view.startsWith("run") || view === "live-run" ? "Test Runs" : view.startsWith("bug") ? "Bug Tracker" : view === "diagnostic" ? "Diagnostic Studio" : view === "office" ? "La Oficina" : view === "specs" ? "Test Specs" : view === "settings" ? "Settings" : "Suites";
  const content = view === "test-runs" ? <TestRunsPage navigate={navigate} /> : view === "run-detail" ? <RunDetailPage navigate={navigate} /> : view === "live-run" ? <LiveRunPage tobi={tobi} /> : view === "bug-tracker" ? <BugTrackerPage navigate={navigate} tobi={tobi} /> : view === "bug-detail" ? <BugDetailPage navigate={navigate} tobi={tobi} /> : view === "diagnostic" ? <DiagnosticPage navigate={navigate} /> : view === "office" ? <OfficePage navigate={navigate} tobi={tobi} /> : view === "specs" ? <SpecsPage navigate={navigate} /> : view === "settings" ? <SettingsPage /> : <SuitesPage navigate={navigate} />;
  return <div className="app operations-app">
    <div className={mobileNav ? "mobile-overlay show" : "mobile-overlay"} onClick={() => setMobileNav(false)} />
    <div className={mobileNav ? "sidebar-mobile open" : "sidebar-mobile"}><Sidebar compact={false} active={active} onCompact={() => setMobileNav(false)} onHome={onHome} onNavigate={navigate} /></div>
    <Sidebar compact={compact} active={active} onCompact={() => setCompact(!compact)} onHome={onHome} onNavigate={navigate} />
    <div className="app-main"><DashboardHeader title={labels[view]} onMenu={() => setMobileNav(true)} onTelemetry={() => navigate("live-run")} onToast={() => setNotifications(true)} /><main className="workspace operations-workspace">{content}</main></div>
    <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={navigate} />
  </div>;
}

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const tobi = useTobiState();

  if (view === "landing") return <Landing openDashboard={() => setView("dashboard")} />;
  if (view === "dashboard") return <Dashboard onHome={() => setView("landing")} onNavigate={setView} />;
  return <Operations view={view} navigate={setView} onHome={() => setView("landing")} tobi={tobi} />;
}
