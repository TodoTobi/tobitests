import { useEffect, useState, type ReactNode } from "react";
import { useTobiState, type OfficeAgent } from "./hooks/useTobiState";
import { OfficeView } from "./components/OfficeView";

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
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick} aria-label={label}>
      {children}
      {icon && <Icon name={icon} size="sm" />}
    </button>
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
  { icon: "search" as IconName, index: "01", title: "Exploración White-Box + E2E", text: "El Agente Central lee el código fuente real (rutas, Prisma, controladores) y guía a los subagentes." },
  { icon: "pulse" as IconName, index: "02", title: "Diagnóstico con Chrome DevTools MCP", text: "Logs de consola, trazas de red HTTP, caché y Core Web Vitals correlacionados con cada acción." },
  { icon: "file" as IconName, index: "03", title: "Plantilla BDD / Gherkin Estandarizada", text: "Cada hallazgo se documenta en formato Dado que / Cuando / Entonces listo para resolución." },
  { icon: "play" as IconName, index: "04", title: "Ejecución Nativa con Playwright MCP", text: "Interacción determinista sobre el árbol de accesibilidad y generación de specs .spec.ts reales." },
  { icon: "layers" as IconName, index: "05", title: "La Oficina Virtual en Tiempo Real", text: "Visualización en vivo del Agente Central y subagentes trabajando o descansando vía SSE." },
];

function ProductDemo({ tobi }: { tobi: ReturnType<typeof useTobiState> }) {
  const liveRun = tobi.state.liveRun;
  return (
    <div className="product-demo">
      <div className="demo-topbar">
        <div className="browser-dots"><span /><span /><span /></div>
        <div className="browser-url"><Icon name="check" size="sm" /> {tobi.state.project.url}/login</div>
        <Badge tone="success">Live SSE Bridge</Badge>
      </div>
      <div className="demo-body">
        <div className="demo-rail">
          <span className="rail-active"><Icon name="play" size="sm" /></span>
          <span><Icon name="search" size="sm" /></span>
          <span><Icon name="bug" size="sm" /></span>
          <span><Icon name="code" size="sm" /></span>
        </div>
        <div className="demo-browser real-screenshot-mirror">
          <img src="/evidence/runs/01-landing-audit.png" alt="VetConnect Live Audit" className="real-shot-img" />
          <div className="shot-overlay-tag">
            <Badge tone="agent"><Icon name="spark" size="sm" /> Explorer QA · @playwright/mcp</Badge>
          </div>
        </div>
        <div className="demo-inspector">
          <div className="inspector-tabs"><span className="active">Execution</span><span>Evidence</span></div>
          <div className="run-row">
            <span className="run-play"><Icon name="play" size="sm" /></span>
            <div><strong>{liveRun.suite}</strong><small>{liveRun.status} · {liveRun.steps.length} steps</small></div>
            <span className="timer">{liveRun.elapsedTime}</span>
          </div>
          <div className="steps">
            {liveRun.steps.map((s, idx) => (
              <div className={`step ${s.status === "Passed" ? "complete" : s.status === "Running" ? "active" : ""}`} key={s.index}>
                <span>{s.status === "Passed" ? <Icon name="check" size="sm" /> : idx + 1}</span>
                <p>{s.action}: {s.target}</p>
                <small>{s.duration}</small>
              </div>
            ))}
          </div>
          <div className="agent-note">
            <span className="agent-avatar"><Icon name="spark" size="sm" /></span>
            <div><strong>Antigravity Orchestrator</strong><p>Sincronizado con {tobi.state.project.repoPath}</p></div>
          </div>
        </div>
      </div>
      <div className="demo-code">
        <span className="line-no">01</span><code><i>await</i> page.goto(<em>'{tobi.state.project.url}/client/dashboard'</em>); <i>// Guard redirect check</i></code>
        <span className="code-status"><Icon name="check" size="sm" /> Real Spec</span>
      </div>
    </div>
  );
}

function MarketingHeader({ openDashboard, openOffice }: { openDashboard: () => void; openOffice: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="marketing-header-wrap">
      <div className="marketing-header">
        <Logo />
        <div className={`marketing-nav ${open ? "open" : ""}`}>
          <Button variant="ghost" onClick={openDashboard}>Dashboard</Button>
          <Button variant="ghost" onClick={openOffice}>La Oficina</Button>
          <Button variant="ghost" onClick={openDashboard}>Bug Tracker BDD</Button>
          <Button variant="ghost" onClick={openDashboard}>Playwright Specs</Button>
        </div>
        <div className="header-actions">
          <Button variant="ghost" onClick={openOffice}>Ver La Oficina</Button>
          <Button onClick={openDashboard}>Abrir Centro de Control <Icon name="arrow" size="sm" /></Button>
        </div>
        <Button variant="icon" className="mobile-menu" label="Abrir menú" onClick={() => setOpen(!open)}><Icon name={open ? "x" : "menu"} /></Button>
      </div>
    </div>
  );
}

function Landing({ openDashboard, openOffice, tobi }: { openDashboard: () => void; openOffice: () => void; tobi: ReturnType<typeof useTobiState> }) {
  const bug = tobi.state.bugs[0];
  return (
    <main className="landing">
      <MarketingHeader openDashboard={openDashboard} openOffice={openOffice} />
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <Badge tone="info"><Icon name="spark" size="sm" /> Multi-Agent Autonomous QA · Dual-MCP Engine</Badge>
          <div className="display">Orquestación de agentes reales con <span>Playwright + DevTools MCP.</span></div>
          <p className="hero-description">TobiTests coordina al Agente Central (Antigravity) y su escuadrón de subagentes para auditar el código de {tobi.state.project.name}, diagnosticar bugs con evidencia técnica y generar specs E2E reales.</p>
          <div className="hero-actions">
            <Button onClick={openDashboard}>Entrar al Workspace <Icon name="arrow" size="sm" /></Button>
            <Button variant="secondary" onClick={openOffice}>Entrar a La Oficina Virtual <Icon name="spark" size="sm" /></Button>
          </div>
          <div className="trust-line"><span><Icon name="check" size="sm" /> White-Box Repo Access</span><span><Icon name="check" size="sm" /> @playwright/mcp + CDP</span><span><Icon name="check" size="sm" /> Reportes BDD Estandarizados</span></div>
        </div>
        <ProductDemo tobi={tobi} />
      </section>

      <section className="capabilities section-shell">
        <SectionTitle eyebrow="ARQUITECTURA MULTI-AGENTE" title="Un motor conectado directamente a tu repositorio local." description="Sin datos simulados ni cajas negras: lectura directa de código, inspección de navegador y pruebas ejecutables." />
        <div className="capability-list">
          {capabilities.map((item) => (
            <div className="capability-row" key={item.title} onClick={openDashboard}>
              <span className="cap-index">{item.index}</span>
              <span className="cap-icon"><Icon name={item.icon} /></span>
              <div className="cap-copy"><div className="heading-sm">{item.title}</div><p>{item.text}</p></div>
              <Icon name="arrow" />
            </div>
          ))}
        </div>
      </section>

      {bug && (
        <section className="evidence-section section-shell">
          <div className="evidence-copy">
            <SectionTitle eyebrow="PLANTILLA BDD ESTANDARIZADA" title="Cada bug documentado con precisión quirúrgica." description="Todos los hallazgos respetan estrictamente el esquema Gherkin/BDD para que puedas enviárselos al agente y resolverlos en el acto." />
            <div className="evidence-points">
              <div><span>01</span><p><strong>Dado que (Contexto inicial)</strong>{bug.dadoQue}</p></div>
              <div><span>02</span><p><strong>Cuando (Acción ejecutada)</strong>{bug.cuando}</p></div>
              <div><span>03</span><p><strong>Entonces (Real vs. Esperado)</strong>{bug.entonces}</p></div>
            </div>
          </div>
          <div className="evidence-panel">
            <div className="evidence-panel-head"><div><Badge tone="danger">{bug.severity}</Badge><strong>{bug.title}</strong></div><span>{bug.id}</span></div>
            <div className="evidence-screenshot real-screenshot-container">
              <div className="shot-header"><span /><span /><span /><small>{tobi.state.project.url} · Captura CDP en Vivo</small></div>
              <div className="real-shot-wrapper">
                <img src="/evidence/bugs/bug-01-divergence-evidence.png" alt="Bug Evidence" className="real-shot-img" />
                <div className="shot-dialog-bubble">
                  <Icon name="bug" />
                  <strong>Divergencia confirmada en {bug.section}</strong>
                  <small>Detectado por {bug.agent}</small>
                </div>
              </div>
              <span className="evidence-pin">1</span>
            </div>
            <div className="evidence-error"><Icon name="terminal" /><div><small>DETECTADO POR · {bug.agent.toUpperCase()}</small><code>Sección: <em>{bug.section}</em> · Run {bug.runId}</code></div></div>
            <div className="evidence-spec"><Icon name="file" /><div><small>ASSOCIATED SPEC</small><strong>vetconnect-appointments.spec.ts</strong></div><Badge tone="info">Real Spec</Badge></div>
          </div>
        </section>
      )}

      <footer className="footer section-shell">
        <div className="footer-main"><div><Logo /><p>Framework Multi-Agente E2E impulsado por Antigravity,<br />Playwright MCP y Chrome DevTools MCP.</p></div><div className="footer-links"><Button variant="ghost" onClick={openDashboard}>Dashboard</Button><Button variant="ghost" onClick={openOffice}>La Oficina</Button><Button variant="ghost" onClick={openDashboard}>Bug Tracker</Button><Button variant="ghost" onClick={openDashboard}>Test Specs</Button></div></div>
        <div className="footer-bottom"><span>© 2026 TobiTests · Conectado a {tobi.state.project.name} ({tobi.state.project.repoPath})</span><span>Los agentes investigan. La evidencia explica. Playwright verifica.</span></div>
      </footer>
    </main>
  );
}

export type AppView =
  | "landing"
  | "dashboard"
  | "test-runs"
  | "run-detail"
  | "live-run"
  | "bug-tracker"
  | "bug-detail"
  | "diagnostic"
  | "office"
  | "specs"
  | "suites"
  | "integrations"
  | "settings";

const navItems: { label: string; view: AppView; icon: IconName; section?: boolean }[] = [
  { label: "Dashboard", view: "dashboard", icon: "dashboard" },
  { label: "Test Runs", view: "test-runs", icon: "play" },
  { label: "Bug Tracker", view: "bug-tracker", icon: "bug" },
  { label: "Diagnostic Studio", view: "diagnostic", icon: "pulse" },
  { label: "La Oficina", view: "office", icon: "spark" },
  { label: "Test Specs", view: "specs", icon: "file" },
  { label: "Suites", view: "suites", icon: "layers", section: true },
  { label: "Integraciones", view: "integrations", icon: "code" },
  { label: "Settings", view: "settings", icon: "settings", section: true },
];

export function resolveActiveNavLabel(view: AppView): string {
  switch (view) {
    case "dashboard":
      return "Dashboard";
    case "test-runs":
    case "run-detail":
    case "live-run":
      return "Test Runs";
    case "bug-tracker":
    case "bug-detail":
      return "Bug Tracker";
    case "diagnostic":
      return "Diagnostic Studio";
    case "office":
      return "La Oficina";
    case "specs":
      return "Test Specs";
    case "suites":
      return "Suites";
    case "integrations":
      return "Integraciones";
    case "settings":
      return "Settings";
    default:
      return "Dashboard";
  }
}

function Sidebar({
  compact,
  onCompact,
  onHome,
  activeView,
  onNavigate,
  tobi,
}: {
  compact: boolean;
  onCompact: () => void;
  onHome: () => void;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  tobi: ReturnType<typeof useTobiState>;
}) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const activeLabel = resolveActiveNavLabel(activeView);
  const { project, metrics, bugs, officeAgents } = tobi.state;
  const workingCount = officeAgents.filter((a) => a.status === "working").length;

  return (
    <aside className={`sidebar ${compact ? "compact" : ""}`}>
      <div className="sidebar-head">
        <Logo compact={compact} />
        <Button variant="icon" label="Contraer navegación" onClick={onCompact}><Icon name="chevron" /></Button>
      </div>
      <div className="project-select-wrap">
        <div className="project-select" onClick={() => setProjectsOpen(!projectsOpen)}>
          <span className="project-avatar">V</span>
          {!compact && <div><small>PROYECTO ACTIVO</small><strong>{project.name}</strong></div>}
          {!compact && <Icon name="chevron" size="sm" />}
        </div>
        {projectsOpen && !compact && (
          <div className="project-popover">
            <span className="nav-label">REPOSITORIO VINCULADO</span>
            <div className="project-option selected">
              <span className="project-avatar">V</span>
              <div><strong>{project.name}</strong><small>{project.repoPath || project.url}</small></div>
              <Icon name="check" size="sm" />
            </div>
            <div className="project-context">
              <div><small>RAMA</small><code>{project.branch}</code></div>
              <div><small>ENTORNO</small><Badge tone="success">{project.environment}</Badge></div>
              <div><small>EJECUCIÓN ACTIVA</small><strong>{metrics.activeRun}</strong></div>
              <div><small>BRIDGE SSE</small><span><i />{tobi.connected ? "Conectado" : "Local"}</span></div>
            </div>
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        {!compact && <span className="nav-label">WORKSPACE</span>}
        {navItems.map((item) => (
          <div key={item.label}>
            {item.section && !compact && <span className="nav-divider" />}
            <Button
              variant="ghost"
              className={item.label === activeLabel ? "active" : ""}
              label={compact ? item.label : undefined}
              onClick={() => onNavigate(item.view)}
            >
              <Icon name={item.icon} />
              {!compact && <span>{item.label}</span>}
              {item.label === "Bug Tracker" && !compact && bugs.length > 0 && <Badge tone="danger">{bugs.length}</Badge>}
              {item.label === "La Oficina" && !compact && <Badge tone="agent">{workingCount}/{officeAgents.length}</Badge>}
            </Button>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="usage-ring"><span>{metrics.passRate}</span></div>
        {!compact && <div><strong>Dual-MCP Engine</strong><small>Playwright + Chrome CDP</small></div>}
      </div>
      {!compact && <Button variant="ghost" className="back-site" onClick={onHome}>Volver a portada</Button>}
    </aside>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, "success" | "danger" | "warning" | "agent" | "neutral"> = {
    Passed: "success",
    Validated: "success",
    Failed: "danger",
    Running: "agent",
    Working: "agent",
    working: "agent",
    Idle: "neutral",
    idle: "neutral",
    Queued: "neutral",
    Cancelled: "neutral",
    Inconclusive: "warning",
  };
  return <Badge tone={tones[status] || "neutral"}><span className="status-dot" />{status}</Badge>;
}

function Metric({ label, value, meta, tone, chart }: { label: string; value: string; meta: string; tone?: string; chart?: boolean }) {
  return (
    <div className={`metric ${tone || ""}`}>
      <span className="metric-label">{label}</span>
      <div className="metric-main">
        <strong>{value}</strong>
        {chart && <div className="spark-bars">{[60, 72, 75, 80, 82, 85, 85, 86].map((v, i) => <i key={i} style={{ "--bar": `${v}%` } as React.CSSProperties} />)}</div>}
      </div>
      <span className="metric-meta">{meta}</span>
    </div>
  );
}

function DashboardHeader({
  onMenu,
  onTelemetry,
  onToast,
  title = "Dashboard",
  tobi,
}: {
  onMenu: () => void;
  onTelemetry: () => void;
  onToast: () => void;
  title?: string;
  tobi: ReturnType<typeof useTobiState>;
}) {
  const { project, liveRun } = tobi.state;
  return (
    <header className="app-header">
      <Button variant="icon" className="app-mobile-menu" label="Abrir navegación" onClick={onMenu}><Icon name="menu" /></Button>
      <div className="breadcrumbs"><span>{project.name}</span><Icon name="chevron" size="sm" /><strong>{title}</strong></div>
      <div className="app-header-actions">
        <div className="environment"><span className="connection-dot" />{project.environment} ({project.branch})</div>
        <Button variant="secondary" className="active-run" onClick={onTelemetry}>
          <span className="live-pulse" />Run {liveRun.id} <Badge tone="agent">{liveRun.currentStep + 1} / {liveRun.totalSteps}</Badge>
        </Button>
        <Button variant="icon" label="Notificaciones" onClick={onToast}><Icon name="bell" /><span className="notification-dot" /></Button>
        <div className="profile"><span>TB</span><div><strong>Tobías</strong><small>Lead Architect</small></div></div>
      </div>
    </header>
  );
}

function Dashboard({ onHome, onNavigate, tobi }: { onHome: () => void; onNavigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const { project, metrics, runs, officeAgents, bugs, liveRun, specs } = tobi.state;
  const activeAgentsCount = officeAgents.filter((a) => a.status === "working").length;

  return (
    <div className="app">
      <div className={mobileNav ? "mobile-overlay show" : "mobile-overlay"} onClick={() => setMobileNav(false)} />
      <div className={mobileNav ? "sidebar-mobile open" : "sidebar-mobile"}>
        <Sidebar compact={false} activeView="dashboard" onCompact={() => setMobileNav(false)} onHome={onHome} onNavigate={onNavigate} tobi={tobi} />
      </div>
      <Sidebar compact={compact} activeView="dashboard" onCompact={() => setCompact(!compact)} onHome={onHome} onNavigate={onNavigate} tobi={tobi} />
      <div className="app-main">
        <DashboardHeader title="Dashboard" onMenu={() => setMobileNav(true)} onTelemetry={() => setTelemetry(true)} onToast={() => setNotifications(true)} tobi={tobi} />
        <main className="workspace">
          <div className="workspace-heading">
            <div>
              <div className="heading-lg">Dashboard · {project.name}</div>
              <p>Estado real del repositorio <code>{project.repoPath}</code>, ejecuciones Playwright y actividad del escuadrón de agentes.</p>
            </div>
            <div>
              <Button variant="secondary" onClick={() => onNavigate("office")}><Icon name="spark" size="sm" /> Ver La Oficina ({activeAgentsCount} trabajando)</Button>
              <Button onClick={() => onNavigate("live-run")}><Icon name="play" size="sm" /> Ver Ejecución en Vivo</Button>
            </div>
          </div>

          <div className="overview">
            <div className="metrics-primary">
              <Metric label="TASA DE APROBACIÓN" value={metrics.passRate} meta={`Sobre ${runs[0]?.total || 6} pruebas reales en ${project.name}`} chart />
              <Metric label="EJECUCIONES REGISTRADAS" value={String(metrics.totalRuns)} meta={`Rama ${project.branch} · ${project.environment}`} />
            </div>
            <div className="metrics-secondary">
              <Metric label="PRUEBAS FALLIDAS" value={String(metrics.failedTests)} meta="Sincronización Mensajes / Mascotas" tone="danger" />
              <Metric label="BUGS ABIERTOS (BDD)" value={String(metrics.openBugs)} meta="Documentados en plantilla Gherkin" tone="warning" />
              <Metric label="DURACIÓN PROMEDIO" value={metrics.avgDuration} meta="Chromium Headless" />
              <Metric label="EJECUCIÓN ACTIVA" value={metrics.activeRun} meta={project.lastAudit} tone="success" />
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="runs-panel panel">
              <div className="panel-head">
                <div><div className="heading-sm">Ejecuciones de {project.name}</div><p>Resultados verificables sobre el proyecto real</p></div>
                <Button variant="ghost" onClick={() => onNavigate("test-runs")}>Ver detalle <Icon name="arrow" size="sm" /></Button>
              </div>
              <div className="table-wrap">
                <div className="run-table">
                  <div className="table-row table-head"><span>ID</span><span>SUITE / RAMA</span><span>ESTADO</span><span>RESULTADOS</span><span>DURACIÓN</span><span>FECHA</span><span /></div>
                  {runs.map((run) => (
                    <div className="table-row" key={run.id}>
                      <strong>{run.id}</strong>
                      <span className="suite-cell"><strong>{run.suite}</strong><small>{run.branch} · {run.commit}</small></span>
                      <StatusBadge status={run.status} />
                      <span className="results"><i>{run.passed} passed</i>{run.failed > 0 && <em>{run.failed} failed</em>}</span>
                      <code>{run.duration}</code>
                      <span className="date-cell">{run.date}</span>
                      <Button variant="icon" label={`Ver ${run.id}`} onClick={() => onNavigate("run-detail")}><Icon name="chevron" size="sm" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="table-footer">
                <span>Mostrando {runs.length} ejecución real auditada · {specs.length} archivos .spec.ts vinculados</span>
              </div>
            </section>

            <aside className="agents-panel panel">
              <div className="panel-head">
                <div><div className="heading-sm">Escuadrón de Agentes</div><p>{officeAgents.length} agentes configurados</p></div>
                <span className="agents-online"><i />{activeAgentsCount} trabajando</span>
              </div>
              <div className="agent-list">
                {officeAgents.map((agent) => (
                  <div className="agent-item" key={agent.id} onClick={() => onNavigate("office")} style={{ cursor: "pointer" }}>
                    <span className={`agent-initials ${agent.status}`}>{agent.initials}<i /></span>
                    <div>
                      <strong>{agent.name}</strong>
                      <p>{agent.status === "working" ? agent.task : "En descanso en su escritorio"}</p>
                      <small>{agent.employment} · {agent.status === "working" ? `💬 "${agent.bubble}"` : `☕ "${agent.idleBubble || "Descansando"}"`}</small>
                    </div>
                    <Icon name="chevron" size="sm" />
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="full-button" onClick={() => onNavigate("office")}>Ir a La Oficina Virtual <Icon name="arrow" size="sm" /></Button>
            </aside>

            <section className="findings-panel panel">
              <div className="panel-head">
                <div><div className="heading-sm">Hallazgos BDD confirmados</div><p>Errores detectados en {project.name}</p></div>
                <Button variant="ghost" onClick={() => onNavigate("bug-tracker")}>Abrir Bug Tracker <Icon name="arrow" size="sm" /></Button>
              </div>
              <div className="finding-list">
                {bugs.map((bug) => (
                  <div className="finding critical" key={bug.id} onClick={() => onNavigate("bug-detail")} style={{ cursor: "pointer" }}>
                    <span><Icon name="bug" /></span>
                    <div>
                      <Badge tone="danger">{bug.severity.toUpperCase()}</Badge>
                      <strong>{bug.id}: {bug.title}</strong>
                      <p>{bug.entonces}</p>
                      <small>{bug.section} · Detectado por {bug.agent} · {bug.runId}</small>
                    </div>
                    <Icon name="chevron" />
                  </div>
                ))}
              </div>
            </section>

            <section className="timeline-panel panel">
              <div className="panel-head">
                <div><div className="heading-sm">Telemetría en vivo</div><p>Eventos recientes del bus MCP</p></div>
                <Button variant="ghost" onClick={() => onNavigate("live-run")}>Live Run <Icon name="arrow" size="sm" /></Button>
              </div>
              <div className="timeline">
                {liveRun.telemetryLogs.map((log, i) => (
                  <div key={i}>
                    <span className={`timeline-icon ${log.level === "SUCCESS" ? "success" : log.level === "WARN" ? "danger" : "agent"}`}>
                      <Icon name={log.level === "SUCCESS" ? "check" : log.level === "WARN" ? "bug" : "spark"} size="sm" />
                    </span>
                    <p>
                      <strong>[{log.source}] {log.level}</strong>
                      {log.message}
                      <small>{log.time}</small>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <div className={`drawer-backdrop ${telemetry ? "show" : ""}`} onClick={() => setTelemetry(false)} />
      <aside className={`telemetry-drawer ${telemetry ? "open" : ""}`}>
        <div className="drawer-head">
          <div><Badge tone="agent"><span className="live-pulse" />{liveRun.status.toUpperCase()}</Badge><div className="heading-sm">Run {liveRun.id}</div><p>{liveRun.suite}</p></div>
          <Button variant="icon" label="Cerrar" onClick={() => setTelemetry(false)}><Icon name="x" /></Button>
        </div>
        <div className="drawer-progress">
          <div><span>Paso {liveRun.currentStep + 1} de {liveRun.totalSteps}</span><strong>{Math.round(((liveRun.currentStep + 1) / liveRun.totalSteps) * 100)}%</strong></div>
          <span><i style={{ width: `${Math.round(((liveRun.currentStep + 1) / liveRun.totalSteps) * 100)}%` }} /></span>
        </div>
        <div className="telemetry-stream">
          <span className="nav-label">PASOS EN EJECUCIÓN</span>
          {liveRun.steps.map((step) => (
            <div key={step.index}>
              <span className={step.status === "Passed" ? "success" : "active"}>
                {step.status === "Passed" ? <Icon name="check" size="sm" /> : <span />}
              </span>
              <p><strong>{step.action} · {step.target}</strong><small>{step.duration} — {step.description}</small></p>
            </div>
          ))}
        </div>
        <div className="console-box">
          {liveRun.telemetryLogs.map((log, i) => (
            <div key={i} style={{ display: "contents" }}>
              <span>{log.time}</span><code>{log.message}</code>
            </div>
          ))}
        </div>
      </aside>
      <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={onNavigate} tobi={tobi} />
    </div>
  );
}

function SearchField({ placeholder = "Buscar...", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div className="search-field">
      <Icon name="search" size="sm" />
      <input
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}

function Filter({ label }: { label: string }) {
  return <Button variant="secondary" className="filter-button">{label}<Icon name="chevron" size="sm" /></Button>;
}

function PageHeading({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return <div className="workspace-heading operation-heading"><div><div className="heading-lg">{title}</div><p>{subtitle}</p></div><div>{children}</div></div>;
}

function TestRunsPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const { runs, project } = tobi.state;
  return <>
    <PageHeading title="Test Runs" subtitle={`Historial real de ejecuciones auditadas en ${project.name} (${project.repoPath}).`}>
      <Button variant="secondary" onClick={() => navigate("specs")}><Icon name="file" size="sm" /> Ver Specs (.spec.ts)</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" /> Ver Ejecución Activa</Button>
    </PageHeading>
    <section className="panel operation-table-panel">
      <div className="panel-head">
        <div><div className="heading-sm">Ejecuciones registradas</div><p>{runs.length} ejecución real · Conectado vía SSE Bridge</p></div>
        <Badge tone="success">Datos Reales</Badge>
      </div>
      <div className="table-wrap">
        <div className="operation-table">
          <div className="op-table-row op-table-head"><span>ID</span><span>SUITE / PROYECTO</span><span>ESTADO</span><span>TOTAL</span><span>PASS</span><span>FAIL</span><span>SKIP</span><span>DURACIÓN</span><span>RAMA / FECHA</span><span /></div>
          {runs.map((run) => (
            <div className="op-table-row" key={run.id} onClick={() => navigate("run-detail")} style={{ cursor: "pointer" }}>
              <strong>{run.id}</strong>
              <span className="suite-cell"><strong>{run.suite}</strong><small>{project.name} · {project.environment}</small></span>
              <StatusBadge status={run.status} />
              <code>{run.total}</code>
              <span className="cell-success">{run.passed}</span>
              <span className={run.failed > 0 ? "cell-danger" : ""}>{run.failed}</span>
              <span>{run.skipped}</span>
              <code>{run.duration}</code>
              <span className="suite-cell"><strong>{run.branch}</strong><small>{run.date}</small></span>
              <Button variant="icon" label={`Abrir ${run.id}`} onClick={() => navigate("run-detail")}><Icon name="chevron" size="sm" /></Button>
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer">
        <span>Mostrando {runs.length} de {runs.length} ejecuciones reales</span>
      </div>
    </section>
  </>;
}

function RunDetailPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const run = tobi.state.runs[0];
  const [filter, setFilter] = useState<"all" | "failed" | "passed">("all");
  const filteredTests = run.tests.filter((t) =>
    filter === "all" ? true : filter === "failed" ? t.status === "Failed" : t.status === "Passed"
  );

  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("test-runs")}><Icon name="arrow" size="sm" /> Volver a Test Runs</Button></div>
    <PageHeading title={`Run ${run.id}`} subtitle={`${run.suite} · ${tobi.state.project.name} · Rama ${run.branch}`}>
      <Button variant="secondary" onClick={() => tobi.downloadMasterBugReport()}><Icon name="file" size="sm" /> Descargar Master Bug Report</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" /> Abrir Live Run</Button>
    </PageHeading>
    <div className="run-summary panel">
      <div className="result-hero">
        <span className="result-icon failed"><Icon name={run.failed > 0 ? "bug" : "check"} /></span>
        <div>
          <StatusBadge status={run.status} />
          <div className="heading-md">{run.passed} aprobadas · {run.failed} con hallazgo confirmado</div>
          <p>Auditoría White-Box sobre rutas públicas, guardas RBAC y sincronización de estado en {tobi.state.project.name}.</p>
        </div>
      </div>
      <div className="summary-facts">
        {[
          ["TOTAL", String(run.total)],
          ["PASSED", String(run.passed)],
          ["FAILED", String(run.failed)],
          ["DURATION", run.duration],
          ["BRANCH", run.branch],
          ["COMMIT", run.commit],
        ].map(([k, v]) => <div key={k}><small>{k}</small><strong>{v}</strong></div>)}
      </div>
    </div>
    <div className="detail-layout">
      <section className="panel test-results">
        <div className="panel-head">
          <div><div className="heading-sm">Pruebas ejecutadas</div><p>{run.tests.length} casos en Playwright</p></div>
          <div className="segmented">
            <Button variant="ghost" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todas ({run.total})</Button>
            <Button variant="ghost" className={filter === "failed" ? "active" : ""} onClick={() => setFilter("failed")}>Fallidas ({run.failed})</Button>
            <Button variant="ghost" className={filter === "passed" ? "active" : ""} onClick={() => setFilter("passed")}>Aprobadas ({run.passed})</Button>
          </div>
        </div>
        {filteredTests.map((t) => (
          <div className={`test-result ${t.status === "Failed" ? "selected" : ""}`} key={t.name}>
            <span className={t.status === "Passed" ? "test-state passed" : "test-state failed"}>
              <Icon name={t.status === "Passed" ? "check" : "x"} size="sm" />
            </span>
            <div><strong>{t.name}</strong><small>{t.spec} · Chromium</small></div>
            <code>{t.duration}</code>
            <StatusBadge status={t.status} />
            <Icon name="chevron" size="sm" />
          </div>
        ))}
      </section>
      <aside className="panel run-inspector">
        <div className="panel-head"><div><div className="heading-sm">Inspección del Fallo</div><p>Detectado por Telemetry Auditor</p></div></div>
        <div className="error-callout">
          <Badge tone="danger">STATE DESYNC DETECTED</Badge>
          <code>Mensajes (Cancelado) !== Mascotas ("En consulta")</code>
          <p>Al cancelar la consulta en Mensajes, la vista de Mascotas no invalida ni sincroniza el estado.</p>
        </div>
        <div className="inspector-shot real-screenshot-container">
          <div className="shot-header"><span /><span /><span /><small>{tobi.state.project.url}/client/dashboard · Real Trace</small></div>
          <div className="real-shot-wrapper">
            <img src="/evidence/runs/03-rbac-guard-redirect.png" alt="RBAC Inspection" className="real-shot-img" />
            <div className="shot-dialog-bubble">
              <strong>Mascotas → Tus consultas</strong>
              <small>Estado: "En consulta" (Esperado: "Cancelado")</small>
            </div>
          </div>
        </div>
        <div className="evidence-links">
          <Button variant="secondary" onClick={() => navigate("diagnostic")}><Icon name="pulse" size="sm" /> Diagnostic Studio</Button>
          <Button variant="secondary" onClick={() => navigate("specs")}><Icon name="code" size="sm" /> Ver Spec</Button>
        </div>
        <Button className="full-button" onClick={() => navigate("bug-detail")}>Abrir reporte BDD · BUG-01 <Icon name="arrow" size="sm" /></Button>
      </aside>
    </div>
  </>;
}

function LiveRunPage({ tobi }: { navigate?: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const [tab, setTab] = useState("Console");
  const [selected, setSelected] = useState(0);
  const [viewMode, setViewMode] = useState<"screenshot" | "video">("screenshot");
  const { liveRun, project } = tobi.state;
  const activeStep = liveRun.steps[selected] || liveRun.steps[0];

  return <>
    <PageHeading title={`Live Run · ${liveRun.id}`} subtitle={`${liveRun.suite} · ${project.url} · Playwright MCP + Chrome DevTools MCP`}>
      <Badge tone="agent"><span className="live-pulse" /> {liveRun.status.toUpperCase()}</Badge>
    </PageHeading>
    <div className="live-status">
      <div>
        <span className="connection-dot" />
        <strong>{tobi.connected ? "SSE Stream Conectado en Tiempo Real" : "Modo Local Sincronizado"}</strong>
        <small>Target: {liveRun.target} · Repo: {project.repoPath}</small>
      </div>
      <div className="live-progress">
        <span><i style={{ width: `${Math.round(((liveRun.currentStep + 1) / liveRun.totalSteps) * 100)}%` }} /></span>
        <strong>{liveRun.currentStep + 1} / {liveRun.totalSteps} pasos</strong>
        <code>{liveRun.elapsedTime}</code>
      </div>
    </div>
    <div className="live-layout">
      <section className="browser-mirror panel">
        <div className="mirror-bar">
          <div className="browser-dots"><span /><span /><span /></div>
          <div className="mirror-url"><Icon name="check" size="sm" /> {liveRun.target}{activeStep?.target.startsWith("/") ? activeStep.target : "/login"}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              className={`account-pill-btn ${viewMode === "screenshot" ? "active" : ""}`}
              onClick={() => setViewMode("screenshot")}
              style={{ padding: "3px 8px" }}
            >
              📸 Capturas de Paso
            </button>
            <button
              className={`account-pill-btn ${viewMode === "video" ? "active" : ""}`}
              onClick={() => setViewMode("video")}
              style={{ padding: "3px 8px" }}
            >
              📹 Video Replay (.webm)
            </button>
            <Badge tone="success">Playwright MCP</Badge>
          </div>
        </div>
        <div className="live-real-mirror">
          {viewMode === "screenshot" ? (
            <>
              <img
                src={activeStep?.screenshot || "/evidence/runs/02-login-inspection.png"}
                alt={activeStep?.description || "Live Execution"}
                className="real-mirror-img"
              />
              <div className="live-agent-hud">
                <span className="hud-badge"><Icon name="spark" size="sm" /> {activeStep?.agent || "Explorer QA"} · @playwright/mcp</span>
                <div className="hud-info">
                  <strong>Paso {activeStep?.index}: {activeStep?.action}</strong>
                  <code>{activeStep?.target}</code>
                  <small>{activeStep?.description}</small>
                </div>
                <Badge tone={activeStep?.status === "Passed" ? "success" : "agent"}>
                  {activeStep?.status} ({activeStep?.duration})
                </Badge>
              </div>
              <div className="step-pointer-live">
                <span>{activeStep?.index}</span>
                <p>{activeStep?.action} · {activeStep?.target}</p>
              </div>
            </>
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#090d16", display: "flex", flexDirection: "column" }}>
              <video
                src="/evidence/videos/bug-01-cancellation-replay.webm"
                controls
                autoPlay
                loop
                muted
                playsInline
                className="real-mirror-img"
                style={{ objectFit: "contain", maxHeight: 420 }}
              />
              <div className="live-agent-hud">
                <span className="hud-badge"><Icon name="play" size="sm" /> Playwright Chromium Video · 1280x720</span>
                <div className="hud-info">
                  <strong>Grabación real de ejecución de pruebas en VetConnect</strong>
                  <code>Cuentas: tobias@gmail.com (Tutor) · doctor@gmail.com (Doctor)</code>
                  <small>Verificado con @playwright/test en Chromium headless shell</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <aside className="step-panel panel">
        <div className="panel-head"><div><div className="heading-sm">Step Timeline</div><p>Pasos reales ejecutados por los agentes</p></div><Badge tone="info">{liveRun.steps.length} steps</Badge></div>
        {liveRun.steps.map((step, i) => (
          <div className={`live-step ${selected === i ? "selected" : ""}`} key={step.index} onClick={() => setSelected(i)}>
            <span className={`step-state ${step.status.toLowerCase()}`}>
              {step.status === "Passed" ? <Icon name="check" size="sm" /> : step.index}
            </span>
            <div>
              <small>{step.action}</small>
              <code>{step.target}</code>
              <p>{step.description}</p>
            </div>
            <span><StatusBadge status={step.status} /><code>{step.duration}</code></span>
          </div>
        ))}
        {activeStep && (
          <div className="step-detail">
            <span className="nav-label">PASO SELECCIONADO ({activeStep.index})</span>
            <div><small>ACCIÓN</small><strong>{activeStep.description}</strong></div>
            <div><small>TARGET</small><code>{activeStep.target}</code></div>
          </div>
        )}
      </aside>
    </div>
    <section className="telemetry-panel panel">
      <div className="telemetry-tabs">
        {["Console", "Network", "DOM", "MCP Trace"].map((t) => (
          <Button variant="ghost" className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t}
            {t === "Console" && <Badge tone="neutral">{liveRun.telemetryLogs.length}</Badge>}
          </Button>
        ))}
      </div>
      <div className="light-console">
        {liveRun.telemetryLogs.map((log, idx) => (
          <div key={idx}>
            <span>{log.time}</span>
            <Badge tone={log.level === "SUCCESS" ? "success" : log.level === "WARN" ? "warning" : log.level === "ACTION" ? "agent" : "info"}>{log.level}</Badge>
            <code>{log.message}</code>
            <small style={{ marginLeft: "auto", opacity: 0.7 }}>{log.source}</small>
          </div>
        ))}
      </div>
    </section>
  </>;
}

function BugTrackerPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const bugList = tobi.state.bugs.filter(
    (b) =>
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.section.toLowerCase().includes(search.toLowerCase())
  );

  return <>
    <PageHeading title="Bug Tracker (Plantilla BDD Estandarizada)" subtitle="Todos los bugs documentados estrictamente con Dado que / Cuando / Entonces para resolución directa.">
      <Button variant="secondary" onClick={() => setReportOpen(true)}><Icon name="file" size="sm" /> Previsualizar Master Report</Button>
      <Button onClick={() => tobi.downloadMasterBugReport()}><Icon name="bug" size="sm" /> Descargar Master Bug Report (.md)</Button>
    </PageHeading>
    <div className="filter-bar panel">
      <SearchField placeholder="Buscar por ID (ej. BUG-01), título o sección..." value={search} onChange={setSearch} />
      <div className="filter-group">
        <Badge tone="info">Esquema Gherkin / BDD Obligatorio Activo</Badge>
      </div>
      {search && <Button variant="ghost" onClick={() => setSearch("")}>Limpiar búsqueda</Button>}
    </div>
    <section className="panel bug-list">
      <div className="panel-head">
        <div><div className="heading-sm">Hallazgos Reales en {tobi.state.project.name}</div><p>{bugList.length} incidencia registrada</p></div>
      </div>
      <div className="table-wrap">
        <div className="bug-table">
          <div className="bug-row bug-head"><span>BUG / TÍTULO</span><span>SEVERIDAD</span><span>ESTADO</span><span>SECCIÓN AFECTADA</span><span>EJECUCIÓN</span><span>AGENTE DETECTOR</span><span>RESPONSABLE</span><span /></div>
          {bugList.map((bug) => (
            <div className="bug-row" key={bug.id} onClick={() => navigate("bug-detail")} style={{ cursor: "pointer" }}>
              <div><strong>{bug.id}</strong><p>{bug.title}</p><small>{tobi.state.project.name} · {bug.date}</small></div>
              <Badge tone={bug.severity === "Critical" || bug.severity === "High" ? "danger" : "warning"}>{bug.severity}</Badge>
              <Badge tone="agent">{bug.status}</Badge>
              <span>{bug.section}</span>
              <Button variant="ghost" onClick={() => navigate("run-detail")}>{bug.runId}</Button>
              <span>{bug.agent}</span>
              <span>{bug.assignee}</span>
              <Button variant="icon" label={`Abrir ${bug.id}`} onClick={() => navigate("bug-detail")}><Icon name="chevron" size="sm" /></Button>
            </div>
          ))}
        </div>
      </div>
    </section>
    {reportOpen && (
      <div className="modal-backdrop show" onClick={() => setReportOpen(false)}>
        <div className="master-report panel" onClick={(event) => event.stopPropagation()}>
          <div className="modal-head">
            <div><Badge tone="info">MARKDOWN BDD EXPORT</Badge><div className="heading-md">Master Bug Report — {tobi.state.project.name}</div><p>Documento listo para copiar o descargar y enviar al Agente Central para su corrección.</p></div>
            <Button variant="icon" label="Cerrar" onClick={() => setReportOpen(false)}><Icon name="x" /></Button>
          </div>
          <div className="report-summary">
            <div><small>INCIDENCIAS</small><strong>{bugList.length}</strong></div>
            <div><small>PROYECTO</small><strong>{tobi.state.project.name}</strong></div>
            <div><small>ESTRUCTURA</small><strong>Gherkin / BDD</strong></div>
            <div><small>REPOSITORIO</small><strong>Local Monorepo</strong></div>
          </div>
          <div className="report-preview">
            <div className="preview-head"><span>master-bug-report-vetconnect.md</span><Badge tone="success">Plantilla Oficial</Badge></div>
            <code>{bugList.map((b) => `Escenario:\nNombre y sección (${b.id}: ${b.title}, seccion: ${b.section}).\nPasos para reproducir:\nDado que ${b.dadoQue}\nCuando ${b.cuando}\nEntonces ${b.entonces}`).join("\n\n---\n\n")}</code>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cerrar</Button>
            <Button onClick={() => { tobi.downloadMasterBugReport(); setReportOpen(false); }}><Icon name="file" size="sm" /> Descargar Master Bug Report (.md)</Button>
          </div>
        </div>
      </div>
    )}
  </>;
}

function BugDetailPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const [evidence, setEvidence] = useState("Visual State");
  const [copied, setCopied] = useState(false);
  const [activeAccount, setActiveAccount] = useState<"tutor" | "doctor">("tutor");
  const bug = tobi.state.bugs[0];

  const activeVideo = activeAccount === "tutor"
    ? (bug.videoUrl || "/evidence/videos/bug-01-cancellation-replay.webm")
    : (bug.doctorVideoUrl || "/evidence/videos/doctor-portal-audit.webm");

  const handleCopy = () => {
    tobi.copyBddToClipboard(bug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return <>
    <div className="detail-back">
      <Button variant="ghost" onClick={() => navigate("bug-tracker")}>
        <Icon name="arrow" size="sm" /> Volver a Bug Tracker
      </Button>
    </div>

    <PageHeading
      title={`${bug.id} · ${bug.title}`}
      subtitle={`Sección: ${bug.section} · Proyecto: ${tobi.state.project.name}`}
    >
      <Button variant={copied ? "primary" : "secondary"} onClick={handleCopy}>
        <Icon name="file" size="sm" /> {copied ? "✓ ¡Copiado con formato BDD!" : "Copiar Plantilla BDD"}
      </Button>
      <Button onClick={() => tobi.downloadMasterBugReport()}>
        <Icon name="spark" size="sm" /> Exportar Master Report (.md)
      </Button>
    </PageHeading>

    <div className="bug-meta panel">
      <div><small>SEVERIDAD</small><Badge tone="danger">{bug.severity}</Badge></div>
      <div><small>ESTADO</small><Badge tone="agent">{bug.status}</Badge></div>
      <div><small>SECCIÓN / MÓDULO</small><strong>{bug.section}</strong></div>
      <div><small>EJECUCIÓN</small><Button variant="ghost" onClick={() => navigate("run-detail")}>{bug.runId}</Button></div>
      <div><small>SPEC ASOCIADO</small><Button variant="ghost" onClick={() => navigate("specs")}>vetconnect-appointments.spec.ts</Button></div>
    </div>

    {/* Video Replay Container (Top Priority) */}
    <section className="panel bug-video-hero-panel">
      <div className="panel-head">
        <div className="video-head-titles">
          <div className="heading-sm">
            <span className="video-rec-dot" /> Reproducción de Video E2E · Grabación Real de Playwright
          </div>
          <p>Captura real en Chromium durante la ejecución automatizada del bug en VetConnect</p>
        </div>
        <div className="account-switcher-pills">
          <button
            className={`account-pill-btn ${activeAccount === "tutor" ? "active" : ""}`}
            onClick={() => setActiveAccount("tutor")}
          >
            <span className="role-tag tutor">TUTOR</span>
            <strong>tobias@gmail.com</strong>
            <small>Pass: Tobias123+</small>
          </button>
          <button
            className={`account-pill-btn ${activeAccount === "doctor" ? "active" : ""}`}
            onClick={() => setActiveAccount("doctor")}
          >
            <span className="role-tag doc">DOC</span>
            <strong>doctor@gmail.com</strong>
            <small>Pass: Doctor 123+</small>
          </button>
        </div>
      </div>

      <div className="bug-video-viewport">
        <video
          key={activeVideo}
          src={activeVideo}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="real-playwright-video-player"
        />
        <div className="video-viewport-badge">
          <span className="live-pulse" />
          <span>PLAYWRIGHT WEBM REPLAY · 1280x720 · {activeAccount === "tutor" ? "Cuenta Tutor (tobias@gmail.com)" : "Cuenta Doctor (doctor@gmail.com)"}</span>
        </div>
      </div>
    </section>

    {/* Directamente Debajo del Video: Esquema de Plantilla Estandarizado */}
    <div className="bug-detail-grid" style={{ marginTop: 18 }}>
      <div>
        <section className="panel bdd-panel">
          <div className="panel-head">
            <div>
              <div className="heading-sm">Esquema de Plantilla Estandarizado:</div>
              <p>Definir el Escenario (Gherkin/BDD):</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button variant="secondary" onClick={handleCopy}>
                <Icon name="file" size="sm" /> {copied ? "✓ Copiado" : "Copiar Plantilla BDD"}
              </Button>
              <Badge tone="info">BDD Oficial</Badge>
            </div>
          </div>

          <div className="standard-bdd-card">
            <div className="bdd-line bdd-title-line">
              <span className="bdd-lbl">Definir el Escenario (Gherkin/BDD):</span>
            </div>

            <div className="bdd-line bdd-name-line">
              <span className="bdd-lbl">Nombre y sección:</span>
              <p className="bdd-val">
                <strong>({bug.id}: {bug.title}, seccion: {bug.section}).</strong>
              </p>
            </div>

            <div className="bdd-line bdd-steps-header">
              <span className="bdd-lbl">Pasos para reproducir:</span>
            </div>

            <div className="bdd-steps-list">
              <div className="bdd-step-row">
                <span className="gherkin-tag dado">Dado que</span>
                <p>{bug.dadoQue}</p>
              </div>

              <div className="bdd-step-row">
                <span className="gherkin-tag cuando">Cuando</span>
                <p>{bug.cuando}</p>
              </div>

              <div className="bdd-step-row">
                <span className="gherkin-tag entonces">Entonces</span>
                <p>{bug.entonces}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel content-panel" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <div className="heading-sm">Contraste de Comportamiento Técnico</div>
          </div>
          <div className="prose">
            <div className="fact-pair">
              <div>
                <small>RESULTADO REAL OBTENIDO</small>
                <p>
                  El mensaje es removido de la bandeja (resultado real obtenido), pero al navegar a{" "}
                  <strong>"Mascotas → Tus consultas"</strong>, el registro de la consulta sigue figurando erróneamente en estado{" "}
                  <strong>"En consulta"</strong> (resultado real obtenido).
                </p>
              </div>
              <div>
                <small>RESULTADO ESPERADO</small>
                <p>
                  El registro de la consulta debería figurar como <strong>cancelado</strong> o haber sido eliminado de forma sincronizada en ambas secciones (resultado esperado).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="panel evidence-browser">
        <div className="evidence-tabs">
          {["Visual State", "Console & Network", "Playwright Spec"].map((t) => (
            <Button variant="ghost" className={evidence === t ? "active" : ""} onClick={() => setEvidence(t)} key={t}>{t}</Button>
          ))}
        </div>
        {evidence === "Visual State" && (
          <div className="bug-screenshot real-screenshot-container">
            <div className="shot-header"><span /><span /><span /><small>{tobi.state.project.url} · Evidencia Capturada en Vivo</small></div>
            <div className="real-shot-wrapper">
              <img src="/evidence/bugs/bug-01-divergence-evidence.png" alt="Bug Divergence" className="real-shot-img" />
              <div className="shot-dialog-bubble">
                <Icon name="bug" />
                <strong>Divergencia confirmada: Mensajes ↔ Mascotas</strong>
                <small>Capturado por Telemetry Auditor con Chrome DevTools MCP</small>
              </div>
            </div>
          </div>
        )}
        {evidence === "Console & Network" && (
          <div className="report-preview" style={{ margin: 14 }}>
            <code>{`[Playwright MCP] Action: click button "Cancelar" in /client/messages\n[Chrome DevTools MCP] State check: Bandeja de mensajes actualizada.\n[Playwright MCP] Navigate -> Mascotas -> Tus consultas\n[Assertion Error] Expected state "Cancelado", but found "En consulta"`}</code>
          </div>
        )}
        {evidence === "Playwright Spec" && (
          <div className="report-preview" style={{ margin: 14 }}>
            <code>{tobi.state.specs[1]?.code || "// Spec"}</code>
          </div>
        )}
        <div className="evidence-caption">
          <span>Cuentas de Prueba Testeadas</span>
          <p>Tutor: <code>tobias@gmail.com</code> (Tobias123+) · Doctor: <code>doctor@gmail.com</code> (Doctor 123+)</p>
        </div>
        <div className="evidence-actions">
          <Button variant="secondary" onClick={() => tobi.downloadMasterBugReport()}>Descargar .md</Button>
          <Button onClick={handleCopy}>{copied ? "✓ Copiado" : "Copiar BDD"}</Button>
        </div>
      </aside>
    </div>
  </>;
}

function DiagnosticPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const bug = tobi.state.bugs[0];
  const { project, liveRun } = tobi.state;
  const sections = [
    ["Hechos observados", "success", `En ${project.name}, al cancelar desde la bandeja de Mensajes el ítem desaparece localmente, pero la vista de Mascotas -> Tus consultas mantiene el estado "En consulta".`],
    ["Hipótesis técnica (White-Box)", "agent", "La mutación de cancelación en Mensajes actualiza la bandeja de conversación pero no sincroniza ni invalida el estado del turno/consulta asociado a la mascota."],
    ["Verificación E2E", "info", "Documentado en specs/vetconnect-appointments.spec.ts y correlacionado con la plantilla BDD estandarizada."],
    ["Acción recomendada", "warning", "Unificar la cancelación en el controlador backend y refrescar el estado compartido de consultas en el cliente React."],
  ];
  return <>
    <PageHeading title={`Diagnostic Studio · ${bug.id}`} subtitle={`${project.name} · ${bug.runId} · ${bug.section}`}>
      <Button variant="secondary" onClick={() => navigate("bug-detail")}>Ver Plantilla BDD</Button>
      <Button onClick={() => navigate("specs")}>Abrir Spec en Código <Icon name="arrow" size="sm" /></Button>
    </PageHeading>
    <div className="diagnostic-layout">
      <div className="diagnostic-main">
        <section className="panel diagnostic-summary">
          <div>
            <Badge tone="danger">{bug.severity.toUpperCase()} IMPACT</Badge>
            <div className="heading-md">{bug.title}</div>
            <p>{bug.entonces}</p>
          </div>
          <div className="diagnostic-score"><span>100%</span><small>BDD Verified</small></div>
        </section>
        <div className="diagnostic-browser panel real-screenshot-container">
          <div className="mirror-bar"><div className="browser-dots"><span /><span /><span /></div><div className="mirror-url">{project.url}/terms · Inspección CDP</div><Badge tone="agent">White-Box + CDP</Badge></div>
          <div className="real-shot-wrapper diag-real-wrapper">
            <img src="/evidence/bugs/bug-01-divergence-evidence.png" alt="Diagnostic Viewport" className="real-shot-img" />
            <div className="shot-dialog-bubble">
              <strong>Divergencia: {bug.section}</strong>
              <small>Mascotas → Tus consultas: Sigue figurando como "En consulta" tras cancelar en Mensajes</small>
            </div>
            <div className="diag-highlight"><span>BUG-01</span></div>
          </div>
        </div>
        <section className="panel analysis-grid">
          {sections.map(([title, tone, text], i) => (
            <div className={`analysis-block ${tone}`} key={title}>
              <span>{i + 1}</span>
              <div><div className="heading-sm">{title}</div><p>{text}</p></div>
            </div>
          ))}
        </section>
        <section className="panel trace-panel">
          <div className="panel-head"><div><div className="heading-sm">Línea temporal de eventos MCP</div><p>Eventos reales registrados en {liveRun.id}</p></div></div>
          <div className="trace-list">
            {liveRun.telemetryLogs.map((log, i) => (
              <div key={i}>
                <code>{log.time}</code>
                <Badge tone={log.level === "WARN" ? "danger" : log.level === "SUCCESS" ? "success" : "info"}>{log.level}</Badge>
                <p><strong>[{log.source}]</strong> {log.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <aside className="diagnostic-context panel">
        <div className="panel-head"><div className="heading-sm">Contexto del Repositorio</div></div>
        <div className="context-agent"><span>TA</span><div><small>AGENTE DETECTOR</small><strong>{bug.agent}</strong><p>Con acceso a Chrome DevTools MCP</p></div></div>
        <div className="context-section">
          <small>HERRAMIENTAS MCP ACTIVAS</small>
          {["@playwright/mcp (Accessibility Tree)", "@chromedevtools/chrome-devtools-mcp", "Repo White-Box Access"].map((x) => <p key={x}><Icon name="check" size="sm" />{x}</p>)}
        </div>
        <div className="context-section">
          <small>ARCHIVOS VINCULADOS</small>
          <code>{project.repoPath}/web/src/App.tsx</code>
          <code>specs/vetconnect-auth.spec.ts</code>
          <code>specs/vetconnect-appointments.spec.ts</code>
        </div>
        <Button variant="secondary" className="full-button" onClick={() => navigate("specs")}>Inspeccionar código del Spec</Button>
      </aside>
    </div>
  </>;
}

function SpecsPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const specs = tobi.state.specs;
  const [selectedName, setSelectedName] = useState(specs[0]?.name || "vetconnect-auth.spec.ts");
  const [copied, setCopied] = useState(false);
  const currentSpec = specs.find((s) => s.name === selectedName) || specs[0];
  const lines = (currentSpec?.code || "").split("\n");
  const totalTests = specs.reduce((acc, s) => acc + s.testsCount, 0);

  const copySpec = () => {
    if (!currentSpec) return;
    navigator.clipboard.writeText(currentSpec.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return <>
    <PageHeading title="Test Specs (Playwright)" subtitle={`Archivos .spec.ts reales generados en C:/Users/usuario/Documents/tobitests/specs para ${tobi.state.project.name}.`}>
      <Button variant="secondary" onClick={copySpec}><Icon name="code" size="sm" /> {copied ? "✓ Código copiado" : "Copiar Spec"}</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" /> Ejecutar con Playwright</Button>
    </PageHeading>
    <div className="spec-stats">
      {[
        [String(specs.length), "ARCHIVOS .SPEC.TS REALES"],
        [String(totalTests), "CASOS DE PRUEBA"],
        [tobi.state.metrics.passRate, "TASA DE APROBACIÓN"],
        [tobi.state.metrics.activeRun, "ÚLTIMA EJECUCIÓN"],
      ].map(([v, k]) => <div className="panel" key={k}><small>{k}</small><strong>{v}</strong></div>)}
    </div>
    <div className="spec-workbench panel">
      <aside className="file-tree">
        <div className="file-tree-head"><strong>EXPLORER · /specs</strong></div>
        <div className="tree-root"><Icon name="chevron" size="sm" /><Icon name="layers" size="sm" /><strong>tobitests</strong></div>
        <div className="tree-folder"><Icon name="chevron" size="sm" /><span>specs</span></div>
        {specs.map((s) => (
          <Button variant="ghost" className={selectedName === s.name ? "active" : ""} onClick={() => setSelectedName(s.name)} key={s.name}>
            <Icon name="file" size="sm" />{s.name}
          </Button>
        ))}
      </aside>
      <section className="code-editor">
        <div className="editor-tabs">
          <span><Icon name="file" size="sm" />{currentSpec?.name}<i /></span>
          <div>
            <Badge tone="success"><Icon name="check" size="sm" /> {currentSpec?.status.toUpperCase()}</Badge>
            <Button variant="ghost" onClick={copySpec}>{copied ? "✓ Copiado" : "Copy Code"}</Button>
          </div>
        </div>
        <div className="editor-breadcrumb">tobitests <Icon name="chevron" size="sm" /> specs <Icon name="chevron" size="sm" /> {currentSpec?.name} — {currentSpec?.domain}</div>
        <div className="code-lines">
          {lines.map((line, i) => (
            <div key={i}>
              <span>{i + 1}</span>
              <code className={line.includes("expect(") ? "code-highlight" : ""}>{line}</code>
              {line.includes("expect(") && <Badge tone="info">assert</Badge>}
            </div>
          ))}
        </div>
        <div className="editor-results">
          <div>
            <span className="test-state passed"><Icon name="check" size="sm" /></span>
            <p><strong>Archivo real en disco: specs/{currentSpec?.name}</strong><small>{currentSpec?.testsCount} pruebas definidas · Run {currentSpec?.lastRun}</small></p>
          </div>
          <Button variant="secondary" onClick={() => navigate("run-detail")}>Ver resultados de ejecución</Button>
        </div>
      </section>
      <aside className="change-history">
        <div className="panel-head"><div className="heading-sm">Trazabilidad del Spec</div></div>
        <div><span><i /></span><p><small>Activo ahora</small><strong>Generado por Spec Writer</strong><em>Vinculado a {tobi.state.project.name}</em></p></div>
        <div><span><i /></span><p><small>White-Box Audit</small><strong>Rutas extraídas de web/src/App.tsx</strong><em>Antigravity Orchestrator</em></p></div>
        <div><span><i /></span><p><small>BDD Coverage</small><strong>Cubre escenario BUG-01</strong><em>Telemetry Auditor</em></p></div>
      </aside>
    </div>
  </>;
}

function SuitesPage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const suites = tobi.state.suites;
  const [selectedName, setSelectedName] = useState(suites[0]?.name || "");
  const currentSuite = suites.find((s) => s.name === selectedName) || suites[0];
  const suiteTests = tobi.state.runs[0]?.tests.filter((t) => t.spec === currentSuite?.specFile) || [];

  return <>
    <PageHeading title="Suites de Pruebas" subtitle={`Agrupación funcional de specs reales para ${tobi.state.project.name}.`}>
      <Button onClick={() => navigate("specs")}><Icon name="file" size="sm" /> Ver Archivos .spec.ts</Button>
    </PageHeading>
    <div className="suite-layout">
      <section className="panel suite-list">
        <div className="panel-head"><div><div className="heading-sm">Suites Activas</div><p>{suites.length} suites vinculadas a specs reales</p></div></div>
        {suites.map((s) => (
          <div className={`suite-item ${selectedName === s.name ? "selected" : ""}`} onClick={() => setSelectedName(s.name)} key={s.name}>
            <span className="suite-symbol"><Icon name="layers" /></span>
            <div><strong>{s.name}</strong><p>{s.description}</p><small>{s.tests} pruebas · {s.specFile}</small></div>
            <StatusBadge status={s.status} />
            <div className="suite-rate"><strong>{s.passRate}</strong><small>Pass rate</small></div>
            <code>{s.duration}</code>
            <Icon name="chevron" size="sm" />
          </div>
        ))}
      </section>
      {currentSuite && (
        <aside className="panel suite-detail">
          <div className="suite-detail-head">
            <span className="suite-symbol"><Icon name="layers" /></span>
            <div>
              <StatusBadge status={currentSuite.status} />
              <div className="heading-md">{currentSuite.name}</div>
              <p>{currentSuite.description}</p>
            </div>
          </div>
          <div className="suite-metrics">
            <div><small>TESTS</small><strong>{currentSuite.tests}</strong></div>
            <div><small>PASS RATE</small><strong>{currentSuite.passRate}</strong></div>
            <div><small>DURATION</small><strong>{currentSuite.duration}</strong></div>
          </div>
          <div className="suite-section">
            <div className="heading-sm">Pruebas en {currentSuite.specFile}</div>
            {suiteTests.map((t) => (
              <div className="suite-test" key={t.name}>
                <span className={t.status === "Passed" ? "test-state passed" : "test-state failed"}>
                  <Icon name={t.status === "Passed" ? "check" : "x"} size="sm" />
                </span>
                <p><strong>{t.name}</strong><small>{t.spec}</small></p>
                <code>{t.duration}</code>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="full-button" onClick={() => navigate("specs")}>Abrir {currentSuite.specFile}</Button>
        </aside>
      )}
    </div>
  </>;
}

function OfficePage({ navigate, tobi }: { navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  return (
    <OfficeView
      navigate={navigate}
      tobi={tobi}
      Badge={Badge}
      Button={Button}
      Icon={Icon}
      PageHeading={PageHeading}
    />
  );
}

function IntegrationsPage({ tobi }: { tobi: ReturnType<typeof useTobiState> }) {
  const { project } = tobi.state;
  return <>
    <PageHeading title="Integraciones MCP & Repositorio" subtitle="Estado de los motores Model Context Protocol y acceso White-Box que potencian a los agentes.">
      <Badge tone="success"><span className="connection-dot" /> Dual-MCP Activo</Badge>
    </PageHeading>
    <div className="panel" style={{ padding: 20 }}>
      <div className="integration-list">
        <div className="integration-item">
          <span className="integration-icon"><Icon name="play" /></span>
          <div>
            <div><strong>@playwright/mcp (Microsoft Official)</strong><Badge tone="success">Connected</Badge></div>
            <p>Automatización determinista sobre el árbol de accesibilidad, navegación multi-rol y generación de specs en <code>C:/Users/usuario/Documents/tobitests/specs</code>.</p>
            <small>Transporte: stdio · Navegador: Chromium</small>
          </div>
          <div className="health-bars"><i /><i /><i /><i /></div>
          <Badge tone="info">Motor de Acción</Badge>
        </div>
        <div className="integration-item">
          <span className="integration-icon chrome"><Icon name="pulse" /></span>
          <div>
            <div><strong>@chromedevtools/chrome-devtools-mcp</strong><Badge tone="success">Connected</Badge></div>
            <p>Inspección profunda vía CDP: errores de consola, peticiones HTTP fallidas, estado de caché y métricas de rendimiento.</p>
            <small>Transporte: stdio · Protocolo: Chrome DevTools Protocol</small>
          </div>
          <div className="health-bars"><i /><i /><i /><i /></div>
          <Badge tone="agent">Motor de Diagnóstico</Badge>
        </div>
        <div className="integration-item">
          <span className="integration-icon"><Icon name="code" /></span>
          <div>
            <div><strong>Repositorio White-Box ({project.name})</strong><Badge tone="success">Mounted</Badge></div>
            <p>Acceso de lectura directa al código fuente en <code>{project.repoPath}</code> (Frontend en <code>{project.url}</code> y Backend Express/Prisma en <code>{project.backendUrl || "http://localhost:3001"}</code>).</p>
            <small>Rama activa: {project.branch}</small>
          </div>
          <div className="health-bars"><i /><i /><i /><i /></div>
          <Badge tone="success">White-Box</Badge>
        </div>
      </div>
    </div>
  </>;
}

function SettingsPage({ tobi }: { tobi: ReturnType<typeof useTobiState> }) {
  const { project, officeAgents } = tobi.state;
  return <>
    <PageHeading title="Settings" subtitle={`Configuración real del workspace TobiTests para ${project.name}.`}>
      <Badge tone="info">Workspace Config</Badge>
    </PageHeading>
    <div className="panel" style={{ padding: 20 }}>
      <div className="settings-section-head">
        <div>
          <div className="heading-md">Proyecto y Rutas Locales</div>
          <p>Parámetros utilizados por el Agente Central y Playwright Runner.</p>
        </div>
      </div>
      <div className="target-detail">
        <div className="target-title">
          <span className="project-avatar">V</span>
          <div><strong>{project.name}</strong><p>{project.repoPath}</p></div>
          <Badge tone="success"><span className="connection-dot" /> Vinculado</Badge>
        </div>
        <div className="integration-details">
          <div><small>FRONTEND URL</small><code>{project.url}</code></div>
          <div><small>BACKEND API URL</small><code>{project.backendUrl || "http://localhost:3001"}</code></div>
          <div><small>RAMA GIT</small><code>{project.branch}</code></div>
          <div><small>PLANTILLA DE BUGS</small><strong>Gherkin / BDD Español (Obligatoria)</strong></div>
        </div>
      </div>

      <div className="settings-section-head" style={{ marginTop: 20 }}>
        <div>
          <div className="heading-md">Control Rápido de Agentes ({officeAgents.length})</div>
          <p>Alterná el estado operativo de cada agente en La Oficina.</p>
        </div>
      </div>
      <div className="agent-settings-list">
        {officeAgents.map((agent) => (
          <div className="agent-setting" key={agent.id}>
            <span className={`agent-initials ${agent.status}`}>{agent.initials}</span>
            <div>
              <strong>{agent.name} ({agent.employment})</strong>
              <p>{agent.role} · {agent.mcp}</p>
            </div>
            <Button variant="secondary" onClick={() => tobi.toggleAgentStatus(agent.id)}>
              {agent.status === "working" ? "⚡ Trabajando" : "☕ Descansando"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  </>;
}

function NotificationPanel({ open, onClose, navigate, tobi }: { open: boolean; onClose: () => void; navigate: (view: AppView) => void; tobi: ReturnType<typeof useTobiState> }) {
  const { bugs, specs, runs } = tobi.state;
  const notices = [
    ["danger", `Bug confirmado: ${bugs[0]?.id || "BUG-01"}`, bugs[0]?.title || "Inconsistencia al cancelar consulta", "Activo ahora", "bug-detail"],
    ["success", "Specs Playwright verificados", `${specs.length} archivos .spec.ts listos en /specs`, "Hoy", "specs"],
    ["info", `Ejecución ${runs[0]?.id || "#RUN-01"}`, `${runs[0]?.passed || 5} aprobadas, ${runs[0]?.failed || 1} con hallazgo`, "Hoy", "run-detail"],
  ] as const;

  return (
    <>
      <div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`notification-panel ${open ? "open" : ""}`}>
        <div className="notification-head">
          <div><div className="heading-md">Actividad del Workspace</div><p>Eventos reales de {tobi.state.project.name}</p></div>
          <Button variant="icon" label="Cerrar" onClick={onClose}><Icon name="x" /></Button>
        </div>
        <div className="notification-list">
          {notices.map(([tone, title, text, time, target]) => (
            <div className={`notification-item ${tone}`} key={title} onClick={() => { navigate(target as AppView); onClose(); }}>
              <span><Icon name={tone === "danger" ? "bug" : tone === "success" ? "check" : "play"} /></span>
              <div><div><strong>{title}</strong><small>{time}</small></div><p>{text}</p></div>
              <Icon name="chevron" size="sm" />
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function Operations({ view, navigate, onHome, tobi }: { view: AppView; navigate: (view: AppView) => void; onHome: () => void; tobi: ReturnType<typeof useTobiState> }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const labels: Record<AppView, string> = {
    landing: "Portada",
    dashboard: "Dashboard",
    "test-runs": "Test Runs",
    "run-detail": `Run ${tobi.state.runs[0]?.id || "#RUN-01"}`,
    "live-run": "Live Run",
    "bug-tracker": "Bug Tracker",
    "bug-detail": tobi.state.bugs[0]?.id || "BUG-01",
    diagnostic: "Diagnostic Studio",
    office: "La Oficina",
    specs: "Test Specs",
    suites: "Suites",
    integrations: "Integraciones",
    settings: "Settings",
  };

  const content =
    view === "test-runs" ? <TestRunsPage navigate={navigate} tobi={tobi} /> :
    view === "run-detail" ? <RunDetailPage navigate={navigate} tobi={tobi} /> :
    view === "live-run" ? <LiveRunPage tobi={tobi} /> :
    view === "bug-tracker" ? <BugTrackerPage navigate={navigate} tobi={tobi} /> :
    view === "bug-detail" ? <BugDetailPage navigate={navigate} tobi={tobi} /> :
    view === "diagnostic" ? <DiagnosticPage navigate={navigate} tobi={tobi} /> :
    view === "office" ? <OfficePage navigate={navigate} tobi={tobi} /> :
    view === "specs" ? <SpecsPage navigate={navigate} tobi={tobi} /> :
    view === "suites" ? <SuitesPage navigate={navigate} tobi={tobi} /> :
    view === "integrations" ? <IntegrationsPage tobi={tobi} /> :
    <SettingsPage tobi={tobi} />;

  return (
    <div className="app operations-app">
      <div className={mobileNav ? "mobile-overlay show" : "mobile-overlay"} onClick={() => setMobileNav(false)} />
      <div className={mobileNav ? "sidebar-mobile open" : "sidebar-mobile"}>
        <Sidebar compact={false} activeView={view} onCompact={() => setMobileNav(false)} onHome={onHome} onNavigate={navigate} tobi={tobi} />
      </div>
      <Sidebar compact={compact} activeView={view} onCompact={() => setCompact(!compact)} onHome={onHome} onNavigate={navigate} tobi={tobi} />
      <div className="app-main">
        <DashboardHeader title={labels[view]} onMenu={() => setMobileNav(true)} onTelemetry={() => navigate("live-run")} onToast={() => setNotifications(true)} tobi={tobi} />
        <main className="workspace operations-workspace">{content}</main>
      </div>
      <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={navigate} tobi={tobi} />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const tobi = useTobiState();

  if (view === "landing") return <Landing openDashboard={() => setView("dashboard")} openOffice={() => setView("office")} tobi={tobi} />;
  if (view === "dashboard") return <Dashboard onHome={() => setView("landing")} onNavigate={setView} tobi={tobi} />;
  return <Operations view={view} navigate={setView} onHome={() => setView("landing")} tobi={tobi} />;
}
