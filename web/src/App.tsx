import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTobiState, type BugItem } from "./hooks/useTobiState";
import { OfficeView } from "./components/OfficeView";
import { JourneyCanvas } from "./components/JourneyCanvas";
import { TestDetailModal, type TestCaseItem } from "./components/TestDetailModal";

type Tobi = ReturnType<typeof useTobiState>;

/* ==========================================================================
   Icons
   ========================================================================== */
type IconName =
  | "activity" | "alert" | "arrow" | "bell" | "bug" | "check" | "chevron" | "code" | "copy"
  | "dashboard" | "download" | "eye" | "file" | "help" | "image" | "layers" | "menu" | "play"
  | "pulse" | "search" | "settings" | "spark" | "terminal" | "video" | "x";

const iconPaths: Record<IconName, ReactNode> = {
  activity: <path d="M4 12h3l2-6 4 12 2-6h5" />,
  alert: <path d="M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  bug: <><path d="M8 2l1.5 2h5L16 2M9 9h6M8 13H3m18 0h-5M8 17H4m16 0h-4" /><rect x="8" y="4" width="8" height="17" rx="4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-10-4 14" />,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 21h16" />,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" /><circle cx="12" cy="12" r="2.5" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 3.6 2.1c-.8.4-1.3 1-1.3 1.9m0 4h.01" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-9 9" /></>,
  layers: <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  spark: <path d="m12 2 1.4 5.1L18 10l-4.6 2.9L12 18l-1.4-5.1L6 10l4.6-2.9L12 2Zm7 14 .6 2.2L22 19.5l-2.4 1.3L19 23l-.6-2.2-2.4-1.3 2.4-1.3L19 16ZM4.5 3l.7 2.3L7.5 6.5 5.2 7.7 4.5 10l-.7-2.3-2.3-1.2 2.3-1.2L4.5 3Z" />,
  terminal: <path d="m4 6 5 5-5 5m7 0h9" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, size = "md" }: { name: IconName; size?: "sm" | "md" | "lg" }) {
  return (
    <svg className={`icon icon-${size}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

/* ==========================================================================
   Shared primitives (OfficeView receives these as props: keep signatures)
   ========================================================================== */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="TobiTests">
      <span className="logo-mark"><span /><span /><span /></span>
      {!compact && <span className="logo-word">Tobi<span>Tests</span></span>}
    </div>
  );
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  icon?: IconName;
  label?: string;
  small?: boolean;
  onClick?: (e: any) => void;
};

function Button({ children, variant = "primary", icon, className = "", label, small, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={`button button-${variant} ${small ? "button-sm" : ""} ${className}`} aria-label={label} {...rest}>
      {children}
      {icon && <Icon name={icon} size="sm" />}
    </button>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "agent" | "info";

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, Tone> = {
    Passed: "success", Validated: "success", Completed: "success",
    Failed: "danger",
    Running: "agent", Working: "agent", working: "agent",
    Inconclusive: "warning", Confirmed: "danger",
  };
  const tone = tones[status] || "neutral";
  const icon: IconName | null = tone === "success" ? "check" : tone === "danger" ? "x" : null;
  return <Badge tone={tone}>{icon ? <Icon name={icon} size="sm" /> : <span className="status-dot" />}{status}</Badge>;
}

function PageHeading({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="workspace-heading">
      <div>
        <h1 className="heading-lg">{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SearchField({ placeholder = "Buscar", value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="search-field">
      <Icon name="search" size="sm" />
      <input placeholder={placeholder} aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value ? (
        <button type="button" className="button button-icon button-sm" style={{ width: 22, minHeight: 22 }} aria-label="Limpiar búsqueda" onClick={() => onChange("")}><Icon name="x" size="sm" /></button>
      ) : (
        <kbd className="kbd" style={{ fontSize: 10, padding: "2px 5px", pointerEvents: "none" }}>⌘K</kbd>
      )}
    </label>
  );
}

function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; count?: number }[] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button key={it.id} type="button" role="tab" aria-selected={value === it.id} className={`tab ${value === it.id ? "active" : ""}`} onClick={() => onChange(it.id)}>
          {it.label}{it.count !== undefined && <span className="count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, meta, tone }: { label: string; value: string; meta: string; tone?: "danger" | "warning" | "success" }) {
  return (
    <div className={`stat ${tone || ""}`}>
      <span className="label">{label}</span>
      <span className="stat-value">{value}</span>
      <small>{meta}</small>
    </div>
  );
}

/* ---------- data helpers ---------- */
interface Diagnostic {
  observedFact?: string;
  whiteBoxHypothesis?: string;
  reproductionSpec?: string;
  affectedFile?: string;
  recommendedFix?: string;
  impact?: string;
}
type BugWithDiag = BugItem & { diagnostic?: Diagnostic };
const diagOf = (b: BugItem): Diagnostic => (b as BugWithDiag).diagnostic || {};
const severityTone = (s: string): Tone => (s === "Critical" || s === "High" ? "danger" : "warning");

interface StepItem { step?: number; action: string; target: string; status: string; duration: string; expected?: string; actual?: string }
interface TestItem { name: string; spec: string; status: string; duration: string; screenshot?: string; videoUrl?: string; steps?: StepItem[] }

function Severity({ value }: { value: string }) {
  return <span className={`severity ${value.toLowerCase()}`}><i />{value}</span>;
}

/* ==========================================================================
   Navigation
   ========================================================================== */
export type AppView =
  | "landing" | "dashboard" | "journey" | "test-runs" | "run-detail" | "live-run" | "bug-tracker" | "bug-detail"
  | "diagnostic" | "office" | "specs" | "suites" | "integrations" | "settings";

type NavItem = { label: string; view: AppView; icon: IconName };
const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operaciones", items: [
      { label: "Dashboard", view: "dashboard", icon: "dashboard" },
      { label: "Mapa de Flujos", view: "journey", icon: "activity" },
      { label: "Test Runs", view: "test-runs", icon: "play" },
      { label: "Live Run", view: "live-run", icon: "pulse" },
      { label: "Suites", view: "suites", icon: "layers" },
    ]
  },
  {
    title: "Calidad y Agentes", items: [
      { label: "Bug Tracker", view: "bug-tracker", icon: "bug" },
      { label: "La Oficina", view: "office", icon: "spark" },
      { label: "Test Specs", view: "specs", icon: "file" },
    ]
  },
];
const settingsItem: NavItem = { label: "Settings", view: "settings", icon: "settings" };

export function resolveActiveNavLabel(view: AppView): string {
  switch (view) {
    case "dashboard": return "Dashboard";
    case "journey": return "Mapa de Flujos";
    case "test-runs":
    case "run-detail": return "Test Runs";
    case "live-run": return "Live Run";
    case "bug-tracker":
    case "bug-detail":
    case "diagnostic": return "Bug Tracker";
    case "office": return "La Oficina";
    case "specs": return "Test Specs";
    case "suites": return "Suites";
    case "integrations":
    case "settings": return "Settings";
    default: return "Dashboard";
  }
}

function SideStatusCard({ tobi }: { tobi: Tobi }) {
  const { runs, project } = tobi.state as any;
  const latest = Array.isArray(runs) ? runs[0] : undefined;
  if (!latest) return null;
  const total = Math.max(1, (latest.passed || 0) + (latest.failed || 0));
  return (
    <div className="side-card" aria-label="Estado del sistema">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <small><span className="connection-dot" />{project.environment}</small>
        <span className="mono t-muted" style={{ fontSize: 11 }}>{latest.id}</span>
      </div>
      <div className="side-bar" role="img" aria-label={`${latest.passed} ok, ${latest.failed} falló`}>
        <i className="ok" style={{ width: `${((latest.passed || 0) / total) * 100}%` }} />
        {(latest.failed || 0) > 0 && <i className="bad" style={{ width: `${((latest.failed || 0) / total) * 100}%` }} />}
      </div>
    </div>
  );
}

function Sidebar({ compact, onCompact, onHome, activeView, onNavigate, tobi }: {
  compact: boolean; onCompact: () => void; onHome: () => void; activeView: AppView; onNavigate: (v: AppView) => void; tobi: Tobi;
}) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const activeLabel = resolveActiveNavLabel(activeView);
  const { project, metrics, bugs, officeAgents } = tobi.state;
  const working = officeAgents.filter((a) => a.status === "working").length;

  const item = (it: NavItem) => (
    <button key={it.label} type="button" className={`nav-item ${it.label === activeLabel ? "active" : ""}`} aria-current={it.label === activeLabel ? "page" : undefined} title={compact ? it.label : undefined} aria-label={compact ? it.label : undefined} onClick={() => onNavigate(it.view)}>
      <Icon name={it.icon} />
      {!compact && <span>{it.label}</span>}
      {!compact && it.label === "Live Run" && <span className="nav-count agent">en vivo</span>}
      {!compact && it.label === "Bug Tracker" && bugs.length > 0 && <span className="nav-count danger">{bugs.length}</span>}
      {!compact && it.label === "La Oficina" && <span className="nav-count agent">{working}/{officeAgents.length}</span>}
    </button>
  );

  return (
    <aside className={`sidebar ${compact ? "compact" : ""}`}>
      <div className="sidebar-head">
        <Logo compact={compact} />
        <Button variant="icon" className="sidebar-collapse" label="Contraer navegación" onClick={onCompact}><Icon name="chevron" /></Button>
      </div>
      <div className="project-select-wrap">
        <button type="button" className="project-select" aria-expanded={projectsOpen} onClick={() => setProjectsOpen(!projectsOpen)} title={compact ? project.name : undefined}>
          <span className="project-avatar">{project.name.charAt(0)}</span>
          {!compact && <div><small>Proyecto</small><strong>{project.name}</strong></div>}
          {!compact && <Icon name="chevron" size="sm" />}
        </button>
        {projectsOpen && !compact && (
          <div className="project-popover">
            <div style={{ padding: "6px 8px 8px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
              <span className="mono t-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cambiar de Proyecto</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {tobi.availableProjects.map((proj) => {
                const isSelected = tobi.activeProjectId === proj.id;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    className={`button ${isSelected ? "button-primary" : "button-ghost"}`}
                    style={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-md)",
                      width: "100%",
                      fontSize: 13
                    }}
                    onClick={() => {
                      tobi.switchProject(proj.id);
                      setProjectsOpen(false);
                    }}
                  >
                    <span className="project-avatar" style={{ width: 22, height: 22, fontSize: 11, marginRight: 8 }}>
                      {proj.name.charAt(0)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {proj.name}
                      </div>
                      <small className="t-muted" style={{ fontSize: 10 }}>{proj.environment}</small>
                    </div>
                    {isSelected && <Icon name="check" size="sm" />}
                  </button>
                );
              })}
            </div>
            <dl style={{ margin: 0, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
              <dt>Rama</dt><dd><code>{project.branch}</code></dd>
              <dt>Entorno</dt><dd>{project.environment}</dd>
              <dt>Último run</dt><dd>{metrics.activeRun}</dd>
              <dt>Conexión</dt><dd><span className="connection-dot" />{tobi.connected ? "En vivo" : "Local"}</dd>
            </dl>
          </div>
        )}
      </div>
      <nav className="sidebar-nav" aria-label="Principal">
        {navGroups.map((g) => (
          <div className="nav-group" key={g.title}>
            <span className="nav-label">{g.title}</span>
            {g.items.map(item)}
          </div>
        ))}
      </nav>
      <SideStatusCard tobi={tobi} />
      <div className="sidebar-foot">
        {item(settingsItem)}
        {!compact && <button type="button" className="nav-item" onClick={onHome}><Icon name="arrow" /><span>Volver a la portada</span></button>}
      </div>
    </aside>
  );
}

function AppHeader({ title, onMenu, onNotifications, onLive, tobi }: { title: string; onMenu: () => void; onNotifications: () => void; onLive: () => void; tobi: Tobi }) {
  const { project, liveRun } = tobi.state;
  const [headerProjOpen, setHeaderProjOpen] = useState(false);

  return (
    <header className="app-header">
      <Button variant="icon" className="app-mobile-menu" label="Abrir navegación" onClick={onMenu}><Icon name="menu" /></Button>
      <nav className="breadcrumbs" aria-label="Ubicación" style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setHeaderProjOpen(!headerProjOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: "var(--fg)",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
            font: "inherit"
          }}
          title="Cambiar proyecto"
        >
          <span>{project.name}</span>
          <Icon name="chevron" size="sm" />
        </button>
        {headerProjOpen && (
          <div
            className="project-popover"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 100,
              minWidth: 240,
              marginTop: 4,
              boxShadow: "var(--shadow-md)"
            }}
          >
            <div style={{ padding: "4px 6px 6px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
              <span className="mono t-muted" style={{ fontSize: 10, textTransform: "uppercase" }}>Seleccionar Proyecto</span>
            </div>
            {tobi.availableProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`button ${tobi.activeProjectId === p.id ? "button-primary" : "button-ghost"}`}
                style={{ width: "100%", justifyContent: "flex-start", padding: "6px 8px", fontSize: 12, marginBottom: 4 }}
                onClick={() => {
                  tobi.switchProject(p.id);
                  setHeaderProjOpen(false);
                }}
              >
                <span className="project-avatar" style={{ width: 18, height: 18, fontSize: 10, marginRight: 6 }}>{p.name.charAt(0)}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{p.name}</span>
                {tobi.activeProjectId === p.id && <Icon name="check" size="sm" />}
              </button>
            ))}
          </div>
        )}
        <Icon name="chevron" size="sm" />
        <strong>{title}</strong>
      </nav>
      <div className="app-header-actions">
        <span className="env-chip"><span className="connection-dot" />{project.environment} · {project.branch}</span>
        <Button variant="secondary" className="run-chip" onClick={onLive}>
          <span className="live-pulse" />Run {liveRun.id}
          <Badge tone="agent">{liveRun.currentStep + 1}/{liveRun.totalSteps}</Badge>
        </Button>
        <Button variant="icon" className="notify-btn" label="Notificaciones" onClick={onNotifications}><Icon name="bell" /><span className="notification-dot" /></Button>
        <div className="profile"><span>TB</span><div><strong>Tobías</strong><small>Lead Architect</small></div></div>
      </div>
    </header>
  );
}

/* ==========================================================================
   Dashboard
   ========================================================================== */
function RunsTable({ tobi, onOpen }: { tobi: Tobi; onOpen: () => void }) {
  const { runs } = tobi.state;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Run</th><th className="col-main">Suite</th><th>Estado</th><th>Resultado</th><th className="num">Duración</th><th>Fecha</th><th /></tr></thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="clickable" onClick={onOpen}>
              <td className="nowrap"><strong>{run.id}</strong></td>
              <td className="col-main"><div className="cell-title"><strong>{run.suite}</strong><small>{run.branch} · {run.commit}</small></div></td>
              <td><StatusBadge status={run.status} /></td>
              <td><span className="t-success">{run.passed} ok</span>{run.failed > 0 && <> <span className="t-muted">/</span> <span className="t-danger">{run.failed} falló</span></>}</td>
              <td className="num">{run.duration}</td>
              <td>{run.date}</td>
              <td className="cell-end"><Icon name="chevron" size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardPage({ navigate, tobi }: { navigate: (v: AppView) => void; tobi: Tobi }) {
  const { project, metrics, runs, officeAgents, bugs, liveRun } = tobi.state;
  const run = runs[0];
  const working = officeAgents.filter((a) => a.status === "working").length;

  return <>
    <PageHeading title="Dashboard" subtitle={`${project.name} · Rama ${project.branch}`}>
      <Button variant="secondary" onClick={() => navigate("office")}><Icon name="spark" size="sm" />La Oficina ({working} activos)</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ver ejecución en vivo</Button>
    </PageHeading>

    <div className="stat-row">
      <Stat label="Tasa de aprobación" value={metrics.passRate} meta={`${run?.passed ?? 0} de ${run?.total ?? 0} tests`} tone="success" />
      <Stat label="Ejecuciones" value={String(metrics.totalRuns)} meta={`Rama ${project.branch}`} />
      <Stat label="Tests fallidos" value={String(metrics.failedTests)} meta="Requieren revisión" tone="danger" />
      <Stat label="Bugs abiertos" value={String(metrics.openBugs)} meta="Documentados en BDD" tone="warning" />
    </div>

    <div className="dashboard-grid">
      <div className="stack">
        <section className="panel">
          <div className="panel-head">
            <h2 className="heading-sm">Ejecuciones recientes</h2>
            <Button variant="ghost" small onClick={() => navigate("test-runs")}>Ver todas<Icon name="arrow" size="sm" /></Button>
          </div>
          <RunsTable tobi={tobi} onOpen={() => navigate("run-detail")} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="heading-sm">Bugs confirmados</h2>
            <Button variant="ghost" small onClick={() => navigate("bug-tracker")}>Abrir tracker<Icon name="arrow" size="sm" /></Button>
          </div>
          <div className="row-list">
            {bugs.map((bug) => (
              <button type="button" className="row-item" key={bug.id} onClick={() => navigate("bug-detail")}>
                <span className="row-icon danger"><Icon name="bug" size="sm" /></span>
                <span className="row-main">
                  <strong>{bug.id} · {bug.title}</strong>
                  <span>{bug.section} · {bug.agent}</span>
                </span>
                <Badge tone={severityTone(bug.severity)}>{bug.severity}</Badge>
                <span className="row-chevron"><Icon name="chevron" size="sm" /></span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="stack">
        <section className="panel">
          <div className="panel-head">
            <h2 className="heading-sm">Agentes</h2>
            <Badge tone="agent"><span className="live-pulse" />{working} trabajando</Badge>
          </div>
          <div className="row-list">
            {officeAgents.map((agent) => (
              <button type="button" className="row-item" key={agent.id} onClick={() => navigate("office")}>
                <span className={`agent-initials ${agent.status}`}>{agent.initials}<i /></span>
                <span className="row-main">
                  <strong>{agent.name}</strong>
                  <span className="clamp">{agent.status === "working" ? agent.task : "En descanso"}</span>
                </span>
                <span className="row-chevron"><Icon name="chevron" size="sm" /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="heading-sm">Actividad reciente</h2>
            <Button variant="ghost" small onClick={() => navigate("live-run")}>Live Run<Icon name="arrow" size="sm" /></Button>
          </div>
          <LogList logs={liveRun.telemetryLogs.slice(0, 5)} compact />
        </section>
      </div>
    </div>
  </>;
}

function LogList({ logs, compact = false }: { logs: Tobi["state"]["liveRun"]["telemetryLogs"]; compact?: boolean }) {
  const tone = (l: string): Tone => (l === "SUCCESS" ? "success" : l === "WARN" ? "warning" : l === "ACTION" ? "agent" : "info");
  if (logs.length === 0) return <div className="empty"><strong>Sin eventos</strong><span>No hay eventos para este filtro.</span></div>;
  return (
    <div className="log-list">
      {logs.map((log, i) => (
        <div className="log-row" key={i} style={compact ? { gridTemplateColumns: "84px minmax(0,1fr)" } : undefined}>
          <span className="log-time">{log.time}</span>
          {!compact && <Badge tone={tone(log.level)}>{log.level}</Badge>}
          <span className="log-msg">{log.message}<small>{log.source}</small></span>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   Test runs
   ========================================================================== */
function TestRunsPage({ navigate, tobi }: { navigate: (v: AppView) => void; tobi: Tobi }) {
  const { runs, project } = tobi.state;
  return <>
    <PageHeading title="Test Runs" subtitle={`${runs.length} ejecuciones registradas en ${project.name}`}>
      <Button variant="secondary" onClick={() => navigate("specs")}><Icon name="file" size="sm" />Ver specs</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ejecución activa</Button>
    </PageHeading>
    <section className="panel">
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Run</th><th className="col-main">Suite</th><th>Estado</th><th className="num">Total</th><th className="num">Pass</th><th className="num">Fail</th><th className="num">Skip</th><th className="num">Duración</th><th>Rama</th><th /></tr></thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="clickable" onClick={() => navigate("run-detail")}>
                <td className="nowrap"><strong>{run.id}</strong></td>
                <td className="col-main"><div className="cell-title"><strong>{run.suite}</strong><small>{run.date}</small></div></td>
                <td><StatusBadge status={run.status} /></td>
                <td className="num">{run.total}</td>
                <td className="num t-success">{run.passed}</td>
                <td className={`num ${run.failed > 0 ? "t-danger" : "t-muted"}`}>{run.failed}</td>
                <td className="num t-muted">{run.skipped}</td>
                <td className="num">{run.duration}</td>
                <td><div className="cell-title"><strong>{run.branch}</strong><small className="mono">{run.commit}</small></div></td>
                <td className="cell-end"><Icon name="chevron" size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel-foot"><span>{runs.length} ejecución{runs.length === 1 ? "" : "es"}</span></div>
    </section>
  </>;
}

const suiteOptions = [
  ["vetconnect-auth.spec.ts", "Auth e identidad"],
  ["vetconnect-rbac.spec.ts", "RBAC y seguridad"],
  ["vetconnect-tutor-pets.spec.ts", "Tutor y mascotas"],
  ["vetconnect-doctor-clinic.spec.ts", "Médico y clínica"],
  ["vetconnect-appointments.spec.ts", "Consultas y mensajes"],
  ["vetconnect-compliance-a11y.spec.ts", "GDPR y accesibilidad"],
];

function StepList({ steps }: { steps: StepItem[] }) {
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const ok = s.status === "Passed";
        const kind = s.action === "Assert" ? "assert" : s.action === "Click" ? "click" : "";
        return (
          <div className={`step-row ${ok ? "" : "failed"}`} key={i}>
            <span className={`test-state ${ok ? "passed" : "failed"}`}><Icon name={ok ? "check" : "x"} size="sm" /></span>
            <span className={`action-tag ${kind}`}>{s.action}</span>
            <code title={s.target}>{s.target}</code>
            <span className="dur">{s.duration}</span>
          </div>
        );
      })}
    </div>
  );
}

function RunDetailPage({ navigate, tobi, onInspectTest }: { navigate: (v: AppView) => void; tobi: Tobi; onInspectTest?: (test: any) => void }) {
  const run = tobi.state.runs[0];
  const tests = run.tests as unknown as TestItem[];
  const [filter, setFilter] = useState<"all" | "failed" | "passed">(run.failed > 0 ? "failed" : "all");
  const [query, setQuery] = useState("");
  const [suite, setSuite] = useState("all");
  const [page, setPage] = useState(1);
  const [media, setMedia] = useState<"snapshot" | "video">("snapshot");
  const [selected, setSelected] = useState<TestItem>(tests.find((t) => t.status === "Failed") || tests[0]);
  const pageSize = 12;

  const filtered = tests.filter((t) => {
    if (filter === "failed" && t.status !== "Failed") return false;
    if (filter === "passed" && t.status !== "Passed") return false;
    if (suite !== "all" && t.spec !== suite) return false;
    const q = query.trim().toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.spec.toLowerCase().includes(q);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };

  const failed = selected?.status === "Failed";
  const bug = failed ? tobi.state.bugs.find((b) => selected.name.includes(b.id)) || tobi.state.bugs[0] : undefined;
  const diag = bug ? diagOf(bug) : {};
  const failedStep = selected?.steps?.find((s) => s.status === "Failed");
  const steps: StepItem[] = selected?.steps?.length ? selected.steps : [
    { action: "Navigate", target: "/login", status: "Passed", duration: "180ms" },
    { action: "Assert", target: "expect().toBeVisible()", status: "Passed", duration: "35ms" },
  ];
  const passedPct = (run.passed / run.total) * 100;

  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("test-runs")}><Icon name="chevron" size="sm" />Test Runs</Button></div>
    <PageHeading title={`Run ${run.id}`} subtitle={run.suite}>
      <Button variant="secondary" onClick={() => tobi.downloadMasterBugReport()}><Icon name="download" size="sm" />Bug report (.md)</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Abrir Live Run</Button>
    </PageHeading>

    <section className="panel">
      <div className="result-banner">
        <div className="result-banner-main">
          <span className={`result-icon ${run.failed > 0 ? "failed" : "passed"}`}><Icon name={run.failed > 0 ? "alert" : "check"} size="lg" /></span>
          <div>
            <div className="heading-md">{run.passed} aprobados, {run.failed} {run.failed === 1 ? "fallido" : "fallidos"}</div>
            <p>{run.total} tests en {suiteOptions.length} suites</p>
          </div>
        </div>
        <div className="meter" role="img" aria-label={`${run.passed} aprobados y ${run.failed} fallidos de ${run.total}`}>
          <i className="ok" style={{ width: `${passedPct}%` }} /><i className="ko" style={{ width: `${100 - passedPct}%` }} />
        </div>
      </div>
      <div className="facts">
        <div><small>Estado</small><StatusBadge status={run.status} /></div>
        <div><small>Duración</small><strong>{run.duration}</strong></div>
        <div><small>Rama</small><strong>{run.branch}</strong></div>
        <div><small>Commit</small><strong>{run.commit}</strong></div>
        <div><small>Fecha</small><strong>{run.date}</strong></div>
      </div>
    </section>

    <div className="detail-layout">
      <section className="panel">
        <div className="panel-head">
          <h2 className="heading-sm">Tests</h2>
          <Tabs value={filter} onChange={reset(setFilter)} items={[
            { id: "all", label: "Todos", count: run.total },
            { id: "failed", label: "Fallidos", count: run.failed },
            { id: "passed", label: "Aprobados", count: run.passed },
          ]} />
        </div>
        <div className="toolbar">
          <div className="grow"><SearchField placeholder="Buscar test o spec" value={query} onChange={reset(setQuery)} /></div>
          <select className="select" aria-label="Filtrar por suite" value={suite} onChange={(e) => reset(setSuite)(e.target.value)}>
            <option value="all">Todas las suites</option>
            {suiteOptions.map(([file, label]) => <option key={file} value={file}>{label}</option>)}
          </select>
        </div>
        <div className="test-list-body">
          {visible.map((t) => (
            <button
              type="button"
              key={t.name}
              className={`test-result ${selected?.name === t.name ? "selected" : ""}`}
              onClick={() => {
                setSelected(t);
                if (onInspectTest) onInspectTest(t);
              }}
            >
              <span className={`test-state ${t.status === "Passed" ? "passed" : "failed"}`}><Icon name={t.status === "Passed" ? "check" : "x"} size="sm" /></span>
              <span><strong>{t.name}</strong><small>{t.spec}</small></span>
              <code>{t.duration}</code>
            </button>
          ))}
          {visible.length === 0 && <div className="empty"><strong>Sin resultados</strong><span>Prueba con otro filtro o búsqueda.</span></div>}
        </div>
        <div className="panel-foot">
          <span>{filtered.length === 0 ? "0 tests" : `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, filtered.length)} de ${filtered.length}`}</span>
          <div className="pagination">
            <Button variant="secondary" small disabled={current <= 1} onClick={() => setPage(current - 1)}>Anterior</Button>
            <span>{current}/{pages}</span>
            <Button variant="secondary" small disabled={current >= pages} onClick={() => setPage(current + 1)}>Siguiente</Button>
          </div>
        </div>
      </section>

      <aside className="panel inspector" aria-label="Detalle del test">
        <div className="inspector-title">
          <div className="inspector-meta"><StatusBadge status={selected?.status || "Passed"} /><span className="mono">{selected?.duration}</span><span className="mono">{selected?.spec}</span></div>
          <h3>{selected?.name}</h3>
        </div>
        <div className="media-bar">
          <Tabs value={media} onChange={setMedia} items={[{ id: "snapshot", label: "Captura" }, { id: "video", label: "Video" }]} />
          <span className="url-pill">{selected?.spec}</span>
        </div>
        <div className="media">
          {media === "video"
            ? <video key={selected?.videoUrl} src={selected?.videoUrl || "/evidence/videos/doctor-portal-audit.webm"} controls muted loop playsInline />
            : <img src={selected?.screenshot || "/evidence/runs/05-tutor-dashboard.png"} alt={`Captura de ${selected?.name}`} />}
        </div>

        {failed && (
          <div className="callout danger">
            <div className="callout-title"><Icon name="alert" size="sm" />Por qué falló{bug ? ` · ${bug.id}` : ""}</div>
            {failedStep?.expected && (
              <div className="compare">
                <div className="good"><small>Esperado</small><code>{failedStep.expected}</code></div>
                <div className="bad"><small>Obtenido</small><code>{failedStep.actual}</code></div>
              </div>
            )}
            {diag.whiteBoxHypothesis && <p>{diag.whiteBoxHypothesis}</p>}
            {diag.recommendedFix && <p><strong>Cómo arreglarlo: </strong>{diag.recommendedFix}</p>}
          </div>
        )}

        <div className="section-label"><span>Pasos ({steps.length})</span><Badge tone="agent">Playwright</Badge></div>
        <StepList steps={steps} />

        <div className="inspector-actions">
          <Button small onClick={() => onInspectTest && onInspectTest(selected)}><Icon name="eye" size="sm" />Ver Detalle Studio</Button>
          <Button variant="secondary" small onClick={() => navigate("diagnostic")}><Icon name="pulse" size="sm" />Diagnóstico</Button>
          <Button variant="secondary" small onClick={() => navigate("specs")}><Icon name="code" size="sm" />Ver spec</Button>
          {bug && <Button small onClick={() => navigate("bug-detail")}>Abrir {bug.id}<Icon name="arrow" size="sm" /></Button>}
        </div>
      </aside>
    </div>
  </>;
}

/* ==========================================================================
   Live run
   ========================================================================== */
function LiveRunPage({ tobi }: { tobi: Tobi }) {
  const [filter, setFilter] = useState<"all" | "ACTION" | "WARN">("all");
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<"screenshot" | "video">("screenshot");
  const { liveRun, project } = tobi.state;
  const step = liveRun.steps[selected] || liveRun.steps[0];
  const pct = Math.round(((liveRun.currentStep + 1) / liveRun.totalSteps) * 100);
  const logs = liveRun.telemetryLogs.filter((l) => filter === "all" || l.level === filter);
  const stepState = (s: string) => (s === "Passed" ? "passed" : s === "Failed" ? "failed" : s === "Running" ? "running" : "queued");

  return <>
    <PageHeading title={`Live Run ${liveRun.id}`} subtitle={liveRun.suite}>
      <Badge tone="agent"><span className="live-pulse" />{liveRun.status}</Badge>
    </PageHeading>

    <section className="panel live-status">
      <div className="live-status-main">
        <span className="connection-dot" />
        <strong>{tobi.connected ? "Conectado en tiempo real" : "Modo local"}</strong>
        <span className="t-muted">{liveRun.target}</span>
      </div>
      <div className="progress">
        <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
        <strong>{liveRun.currentStep + 1}/{liveRun.totalSteps} pasos</strong>
        <code>{liveRun.elapsedTime}</code>
      </div>
    </section>

    <div className="live-layout">
      <section className="panel">
        <div className="media-bar">
          <div className="browser-dots"><span /><span /><span /></div>
          <span className="url-pill">{liveRun.target}{step?.target.startsWith("/") ? step.target : ""}</span>
          <Tabs value={mode} onChange={setMode} items={[{ id: "screenshot", label: "Captura" }, { id: "video", label: "Video" }]} />
        </div>
        <div className="media" style={{ borderBottom: 0 }}>
          {mode === "screenshot" ? <>
            <img src={step?.screenshot || "/evidence/runs/tobi-01-landing.png"} alt={step?.description || "Ejecución en vivo"} />
            <div className="hud">
              <div><Badge tone="agent"><Icon name="spark" size="sm" />{step?.agent || "Explorer QA"}</Badge></div>
              <strong>Paso {step?.index} · {step?.action}</strong>
              <code>{step?.target}</code>
              <small>{step?.description}</small>
            </div>
          </> : (
            <video
              key={tobi.activeProjectId}
              src={tobi.activeProjectId === "tobitests" ? "/evidence/videos/tobitests-self-audit.webm" : "/evidence/videos/bug-01-cancellation-replay.webm"}
              controls
              autoPlay
              loop
              muted
              playsInline
            />
          )}
        </div>
      </section>

      <aside className="panel">
        <div className="panel-head"><h2 className="heading-sm">Pasos</h2><Badge tone="info">{liveRun.steps.length}</Badge></div>
        {liveRun.steps.map((s, i) => (
          <button type="button" className={`live-step ${selected === i ? "selected" : ""}`} key={s.index} onClick={() => setSelected(i)}>
            <span className={`step-state ${stepState(s.status)}`}>{s.status === "Passed" ? <Icon name="check" size="sm" /> : s.index}</span>
            <span><small>{s.action}</small><code>{s.target}</code><p>{s.description}</p></span>
            <span className="dur">{s.duration}</span>
          </button>
        ))}
      </aside>
    </div>

    <section className="panel">
      <div className="panel-head">
        <h2 className="heading-sm">Consola</h2>
        <Tabs value={filter} onChange={setFilter} items={[{ id: "all", label: "Todo", count: liveRun.telemetryLogs.length }, { id: "ACTION", label: "Acciones" }, { id: "WARN", label: "Alertas" }]} />
      </div>
      <div className="console"><LogList logs={logs} /></div>
      <div className="panel-foot"><span>Proyecto {project.name}</span><span className="mono">{project.url}</span></div>
    </section>
  </>;
}

/* ==========================================================================
   Bugs
   ========================================================================== */
function BugTrackerPage({ navigate, tobi, onSelectBug }: { navigate: (v: AppView) => void; tobi: Tobi; onSelectBug: (id: string) => void }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();
  const list = tobi.state.bugs.filter((b) => b.id.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || b.section.toLowerCase().includes(q));
  const open = (id: string) => { onSelectBug(id); navigate("bug-detail"); };

  return <>
    <PageHeading title="Bug Tracker" subtitle={`${list.length} incidentes documentados`}>
      <Button variant="secondary" onClick={() => setReportOpen(true)}><Icon name="eye" size="sm" />Vista previa</Button>
      <Button onClick={() => tobi.downloadMasterBugReport()}><Icon name="download" size="sm" />Descargar reporte (.md)</Button>
    </PageHeading>
    <section className="panel">
      <div className="toolbar">
        <SearchField placeholder="Buscar por ID, título o sección" value={search} onChange={setSearch} />
        <span className="t-muted">{list.length} {list.length === 1 ? "bug" : "bugs"}</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Bug</th><th>Severidad</th><th>Estado</th><th>Sección</th><th>Run</th><th>Detectado por</th><th /></tr></thead>
          <tbody>
            {list.map((bug) => (
              <tr key={bug.id} className="clickable" onClick={() => open(bug.id)}>
                <td><div className="cell-title"><strong>{bug.id} · {bug.title}</strong><small>{bug.date}</small></div></td>
                <td><Severity value={bug.severity} /></td>
                <td><StatusBadge status={bug.status} /></td>
                <td>{bug.section}</td>
                <td className="mono">{bug.runId}</td>
                <td>{bug.agent}</td>
                <td className="cell-end"><Icon name="chevron" size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty"><strong>Sin resultados</strong><span>Ningún bug coincide con “{search}”.</span></div>}
      </div>
    </section>

    {reportOpen && (
      <div className="modal-backdrop" onClick={() => setReportOpen(false)}>
        <div className="panel modal" role="dialog" aria-modal="true" aria-label="Vista previa del reporte" onClick={(e) => e.stopPropagation()}>
          <div className="panel-head">
            <div><h2 className="heading-md">Reporte de bugs</h2><p>{list.length} bugs · {tobi.state.project.name}</p></div>
            <Button variant="icon" label="Cerrar" onClick={() => setReportOpen(false)}><Icon name="x" /></Button>
          </div>
          <pre className="pre">{list.map((b) => `Escenario:\nNombre y sección: ${b.id}: ${b.title}, sección: ${b.section}\n\nPasos para reproducir:\nDado que ${b.dadoQue}\nCuando ${b.cuando}\nEntonces ${b.entonces}`).join("\n\n---\n\n")}</pre>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setReportOpen(false)}>Cerrar</Button>
            <Button onClick={() => { tobi.downloadMasterBugReport(); setReportOpen(false); }}><Icon name="download" size="sm" />Descargar (.md)</Button>
          </div>
        </div>
      </div>
    )}
  </>;
}

function BugDetailPage({ navigate, tobi, selectedBugId }: { navigate: (v: AppView) => void; tobi: Tobi; selectedBugId?: string }) {
  const [evidence, setEvidence] = useState<"capture" | "console" | "diag" | "spec" | "plantillas">("capture");
  const [mode, setMode] = useState<"video" | "snapshot">("video");
  const [copied, setCopied] = useState(false);
  const bug = tobi.state.bugs.find((b) => b.id === selectedBugId) || tobi.state.bugs[0];
  const diag = diagOf(bug);
  const isTobi = tobi.activeProjectId === "tobitests" || tobi.state.project.name.toLowerCase().includes("tobi");
  const video = bug.videoUrl || (isTobi ? "/evidence/videos/tobitests-bug-01-replay.webm" : "/evidence/videos/bug-01-cancellation-replay.webm");

  const copy = () => { tobi.copyBddToClipboard(bug); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const blocks: { title: string; tone: string; text: string }[] = [
    { title: "Qué se observó", tone: "success", text: diag.observedFact || bug.entonces },
    { title: "Causa probable", tone: "agent", text: diag.whiteBoxHypothesis || (isTobi ? "El feed no resetea su búfer al alternar el agente seleccionado." : "Divergencia entre estado local y caché del cliente.") },
    { title: "Verificación", tone: "info", text: diag.reproductionSpec ? `Cubierto por ${diag.reproductionSpec}.` : "Sin spec asociado." },
    { title: "Solución recomendada", tone: "warning", text: diag.recommendedFix || "Sincronizar mutaciones en un store global o invalidar query." },
  ];

  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("bug-tracker")}><Icon name="chevron" size="sm" />Bug Tracker</Button></div>
    <PageHeading title={`${bug.id} · ${bug.title}`} subtitle={`${bug.section} · ${tobi.state.project.name}`}>
      <Button variant="secondary" onClick={copy}><Icon name={copied ? "check" : "copy"} size="sm" />{copied ? "Copiado" : "Copiar Plantillas BDD & Quirófano"}</Button>
      <Button onClick={() => tobi.downloadMasterBugReport()}><Icon name="download" size="sm" />Exportar reporte</Button>
    </PageHeading>

    <section className="panel kv">
      <div><small>Severidad</small><Severity value={bug.severity} /></div>
      <div><small>Estado</small><StatusBadge status={bug.status} /></div>
      <div><small>Sección</small><strong>{bug.section}</strong></div>
      <div><small>Run</small><Button variant="ghost" small onClick={() => navigate("run-detail")}>{bug.runId}</Button></div>
      <div><small>Detectado por</small><strong>{bug.agent}</strong></div>
    </section>

    <div className="bug-layout">
      <div className="stack">
        <section className="panel">
          <div className="media-bar">
            <Icon name="video" size="sm" />
            <strong className="heading-sm">Reproducción del Incidente</strong>
            <span className="url-pill" style={{ marginLeft: 8 }}>{tobi.state.project.url} · {bug.section}</span>
            <Tabs value={mode} onChange={setMode} items={[{ id: "video", label: "Video Replay" }, { id: "snapshot", label: "Captura de Pantalla" }]} />
          </div>
          <div className="media" style={{ borderBottom: 0 }}>
            {mode === "video" ? (
              <video key={video} src={video} controls autoPlay loop muted playsInline />
            ) : (
              <img src={bug.screenshot || (isTobi ? "/evidence/bugs/tobi-bug-01-detail.png" : "/evidence/bugs/bug-01-divergence-evidence.png")} alt={`Evidencia de ${bug.id}`} />
            )}
          </div>
        </section>

        <section className="panel bdd">
          <div className="bdd-title">
            <span className="label">Escenario para Reproducir</span>
            <h2 className="heading-md">{bug.title}</h2>
            <p>{bug.id} · sección {bug.section}</p>
          </div>
          <div className="bdd-step"><span className="gherkin dado">Dado que</span><p>{bug.dadoQue}</p></div>
          <div className="bdd-step"><span className="gherkin cuando">Cuando</span><p>{bug.cuando}</p></div>
          <div className="bdd-step"><span className="gherkin entonces">Entonces</span><p>{bug.entonces}</p></div>
        </section>

        <section className="panel analysis">
          <div className="panel-head">
            <h2 className="heading-sm">Diagnóstico y Causa Raíz</h2>
            <Badge tone="agent">Análisis Técnico</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, padding: "16px 20px" }}>
            {blocks.map((b) => (
              <div key={b.title}>
                <div className="analysis-title"><span className={`dot ${b.tone}`} /><h3 className="heading-sm">{b.title}</h3></div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg)", lineHeight: 1.5 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="panel">
        <div className="tabs-line" role="tablist">
          {([["capture", "Captura"], ["console", "Consola"], ["diag", "Solución"], ["spec", "Spec"], ["plantillas", "Plantillas BDD"]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={evidence === id} className={evidence === id ? "active" : ""} onClick={() => setEvidence(id)}>{label}</button>
          ))}
        </div>
        {evidence === "capture" && (
          <div className="media"><img src={bug.screenshot || (isTobi ? "/evidence/bugs/tobi-bug-01-detail.png" : "/evidence/bugs/bug-01-divergence-evidence.png")} alt={`Evidencia de ${bug.id}`} /></div>
        )}
        {evidence === "console" && (
          <pre className="pre">{isTobi
            ? `[Playwright] Entrar a La Oficina en http://localhost:5173\n[DevTools CDP] Escuchando bus de eventos en WebSocket 9222\n[Explorer QA] Click agente pausado\n[Telemetry] Divergencia: eventos previos no limpiados en consola`
            : `[Playwright] click "Cancelar" en /client/messages\n[DevTools] Bandeja de mensajes actualizada\n[Playwright] navegar a Mascotas → Tus consultas\n[Assertion] Esperado "Cancelado", obtenido "En consulta"`}</pre>
        )}
        {evidence === "diag" && (
          <div style={{ padding: 16 }}>
            {blocks.map((b) => (
              <div key={b.title} style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 13, display: "block", marginBottom: 3 }}>{b.title}</strong>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{b.text}</p>
              </div>
            ))}
            {diag.affectedFile && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <small className="t-muted">Archivo afectado:</small>
                <div style={{ marginTop: 2 }}><code className="mono">{diag.affectedFile}</code></div>
              </div>
            )}
          </div>
        )}
        {evidence === "spec" && <pre className="pre">{tobi.state.specs[1]?.code || tobi.state.specs[0]?.code || "// Sin spec asociado"}</pre>}
        {evidence === "plantillas" && (
          <div style={{ padding: 14, fontSize: 11, lineHeight: 1.45 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>📋 BDD & Quirófano de Código</strong>
              <Button small variant="secondary" onClick={copy}>
                <Icon name={copied ? "check" : "copy"} size="sm" />
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
            <pre className="pre" style={{ maxHeight: 360, overflowY: "auto", fontSize: 11, lineHeight: 1.4 }}>
              {`Esquema de Plantilla Estandarizado:
Definir el Escenario (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, seccion: ${bug.section}).
Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

Protocolo Anti-Regresiones con Blindaje:
Fase 1: Identificar el escenario & Aislamiento en Capas
- Capa UI/Vista: ${diag.affectedFile || "web/src/components/OfficeView.tsx"}
- Capa Hooks/Estado: Búfer reactivo aislado por agentId
- Capa Red/Request: Verificado con DevTools CDP y Playwright
- Capa Backend/API: Contratos preservados retrocompatibles
- Capa Base de Datos: Sincronizado en tobi-state.json

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode)
1. ARCHIVOS DENTRO DEL ALCANCE: [${diag.affectedFile || "web/src/components/OfficeView.tsx"}, tobi-state.json]
2. ARCHIVOS FUERA DEL ALCANCE: [useAgentMotion.ts, OfficeScene.tsx, JourneyCanvas.tsx]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos
4. ESTRATEGIA DE FIX: ${diag.recommendedFix || "Minimal Fix estricto"}

Fase 3: Análisis de Impacto Global
- Rastreo de Referencias Cruzadas (Find-All-References)
- Preservación estricta de contratos

Fase 4: El Quirófano
- Rama: bugfix/cerco-${bug.id.toLowerCase()}
- Minimal fix verificado

Fase 5: Validación
- Testing de Tres Capas (Unitario, Regresión e Integración)
- Verificación estricta de tipos (tsc --noEmit)`}
            </pre>
          </div>
        )}
        <div className="inspector-actions">
          <Button variant="secondary" small onClick={() => navigate("specs")}><Icon name="code" size="sm" />Abrir spec</Button>
          <Button small onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ver Live Run</Button>
        </div>
      </aside>
    </div>
  </>;
}

/* ==========================================================================
   Specs & suites
   ========================================================================== */
function SpecsPage({ navigate, tobi }: { navigate: (v: AppView) => void; tobi: Tobi }) {
  const specs = tobi.state.specs;
  const [name, setName] = useState(specs[0]?.name || "");
  const [copied, setCopied] = useState(false);
  const spec = specs.find((s) => s.name === name) || specs[0];
  const lines = (spec?.code || "").split("\n");
  const total = specs.reduce((n, s) => n + s.testsCount, 0);
  const copy = () => { if (!spec) return; navigator.clipboard?.writeText(spec.code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return <>
    <PageHeading title="Test Specs" subtitle={`${specs.length} archivos Playwright generados`}>
      <Button variant="secondary" onClick={copy}><Icon name={copied ? "check" : "copy"} size="sm" />{copied ? "Copiado" : "Copiar código"}</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ejecutar</Button>
    </PageHeading>
    <div className="stat-row">
      <Stat label="Specs" value={String(specs.length)} meta="Archivos .spec.ts" />
      <Stat label="Casos de prueba" value={String(total)} meta="Definidos en total" />
      <Stat label="Aprobación" value={tobi.state.metrics.passRate} meta="Último run" tone="success" />
      <Stat label="Último run" value={tobi.state.metrics.activeRun} meta={tobi.state.project.lastAudit} />
    </div>
    <section className="panel workbench">
      <aside className="file-tree" aria-label="Archivos">
        <div className="file-tree-head">specs/</div>
        {specs.map((s) => (
          <button type="button" key={s.name} className={`nav-item ${s.name === spec?.name ? "active" : ""}`} onClick={() => setName(s.name)} title={s.name}>
            <Icon name="file" size="sm" /><span>{s.name}</span>
          </button>
        ))}
      </aside>
      <div className="editor">
        <div className="editor-bar">
          <span className="name"><Icon name="file" size="sm" />{spec?.name}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Badge tone="success"><Icon name="check" size="sm" />{spec?.status}</Badge><span className="t-muted">{spec?.testsCount} tests</span></div>
        </div>
        <div className="code-lines">
          {lines.map((line, i) => (
            <div key={i} className="code-line-row">
              <span className="line-num">{i + 1}</span>
              <code className={`line-code ${line.includes("expect(") ? "code-highlight" : ""}`}>{line}</code>
            </div>
          ))}
        </div>
        <div className="editor-foot">
          <span className="t-muted">{spec?.domain} · {spec?.lastRun}</span>
          <Button variant="secondary" small onClick={() => navigate("run-detail")}>Ver resultados</Button>
        </div>
      </div>
      <aside className="timeline-col" style={{ borderLeft: "1px solid var(--border)" }}>
        <div className="panel-head"><h2 className="heading-sm">Historial</h2></div>
        <div className="timeline">
          <div><span className="dot" /><p><small>Ahora</small><strong>Generado por Spec Writer</strong><em>{tobi.state.project.name}</em></p></div>
          <div><span className="dot" /><p><small>Auditoría</small><strong>Rutas extraídas del código</strong><em>Orchestrator</em></p></div>
          <div><span className="dot" /><p><small>Cobertura BDD</small><strong>Cubre BUG-01</strong><em>Telemetry Auditor</em></p></div>
        </div>
      </aside>
    </section>
  </>;
}

function SuitesPage({ navigate, tobi, onInspectTest }: { navigate: (v: AppView) => void; tobi: Tobi; onInspectTest?: (test: any) => void }) {
  const suites = tobi.state.suites;
  const [name, setName] = useState(suites[0]?.name || "");
  const current = suites.find((s) => s.name === name) || suites[0];
  const tests = (tobi.state.runs[0]?.tests as unknown as TestItem[]).filter((t) => t.spec === current?.specFile);

  return <>
    <PageHeading title="Suites" subtitle={`${suites.length} suites automatizadas`}>
      <Button onClick={() => navigate("specs")}><Icon name="file" size="sm" />Ver specs</Button>
    </PageHeading>
    <div className="suite-layout">
      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Suite</th><th>Estado</th><th>Aprobación</th><th className="num">Tests</th><th className="num">Duración</th><th /></tr></thead>
            <tbody>
              {suites.map((s) => (
                <tr key={s.name} className="clickable" onClick={() => setName(s.name)} style={s.name === current?.name ? { background: "var(--nav-selected)" } : undefined}>
                  <td><div className="cell-title"><strong>{s.name}</strong><small>{s.description}</small></div></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="rate-bar"><i style={{ width: s.passRate }} /></span><span className="rate">{s.passRate}</span></div></td>
                  <td className="num">{s.tests}</td>
                  <td className="num">{s.duration}</td>
                  <td className="cell-end"><Icon name="chevron" size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {current && (
        <aside className="panel">
          <div className="inspector-title">
            <div className="inspector-meta"><StatusBadge status={current.status} /><span className="mono">{current.specFile}</span></div>
            <h3>{current.name}</h3>
            <p>{current.description}</p>
          </div>
          <div className="facts">
            <div><small>Tests</small><strong>{current.tests}</strong></div>
            <div><small>Aprobación</small><strong>{current.passRate}</strong></div>
            <div><small>Duración</small><strong>{current.duration}</strong></div>
          </div>
          <div className="row-list">
            {tests.map((t) => (
              <div
                className="row-item clickable"
                key={t.name}
                style={{ cursor: "pointer" }}
                onClick={() => onInspectTest && onInspectTest(t)}
              >
                <span className={`test-state ${t.status === "Passed" ? "passed" : "failed"}`}><Icon name={t.status === "Passed" ? "check" : "x"} size="sm" /></span>
                <span className="row-main"><strong>{t.name}</strong></span>
                <code className="t-muted">{t.duration}</code>
              </div>
            ))}
            {tests.length === 0 && <div className="empty"><strong>Sin tests en el último run</strong></div>}
          </div>
          <div className="inspector-actions"><Button variant="secondary" small onClick={() => navigate("specs")}>Abrir {current.specFile}</Button></div>
        </aside>
      )}
    </div>
  </>;
}

/* ==========================================================================
   Office (unchanged component), integrations, settings
   ========================================================================== */
function OfficePage({ navigate, tobi }: { navigate: (v: AppView) => void; tobi: Tobi }) {
  return <OfficeView navigate={navigate} tobi={tobi} Badge={Badge} Button={Button} Icon={Icon} PageHeading={PageHeading} />;
}

function IntegrationsPage({ tobi }: { tobi: Tobi }) {
  const { project } = tobi.state;
  const items = [
    { icon: "play" as IconName, tone: "", name: "@playwright/mcp", role: "Ejecuta las pruebas", text: "Navega la app usando el árbol de accesibilidad y escribe los specs.", badge: "Motor de acción" },
    { icon: "pulse" as IconName, tone: "agent", name: "@chromedevtools/chrome-devtools-mcp", role: "Diagnostica", text: "Lee consola, red y rendimiento mientras corren las pruebas.", badge: "Motor de diagnóstico" },
    { icon: "code" as IconName, tone: "success", name: `Repositorio ${project.name}`, role: "Código fuente", text: project.repoPath || project.url, badge: `Rama ${project.branch}` },
  ];
  return <>
    <PageHeading title="Integraciones" subtitle="Herramientas conectadas a los agentes.">
      <Badge tone="success"><span className="connection-dot" />Todo conectado</Badge>
    </PageHeading>
    <section className="panel">
      {items.map((it) => (
        <div className="integration" key={it.name}>
          <span className={`integration-icon ${it.tone}`}><Icon name={it.icon} /></span>
          <div>
            <h3>{it.name}<Badge tone="success">Conectado</Badge></h3>
            <p><strong>{it.role}.</strong> {it.text}</p>
          </div>
          <Badge tone="info">{it.badge}</Badge>
        </div>
      ))}
    </section>
  </>;
}

function SettingsPage({ tobi }: { tobi: Tobi }) {
  const { project, officeAgents } = tobi.state;
  const items = [
    { icon: "play" as IconName, tone: "", name: "@playwright/mcp", role: "Ejecución de pruebas", text: "Navega la app usando el árbol de accesibilidad y escribe los specs.", badge: "Motor de acción" },
    { icon: "pulse" as IconName, tone: "agent", name: "@chromedevtools/chrome-devtools-mcp", role: "Telemetría y DevTools", text: "Lee consola, red y rendimiento mientras corren las pruebas.", badge: "Motor de diagnóstico" },
    { icon: "code" as IconName, tone: "success", name: `Repositorio ${project.name}`, role: "Código fuente", text: project.repoPath || project.url, badge: `Rama ${project.branch}` },
  ];
  return <>
    <PageHeading title="Settings" subtitle={`Configuración y herramientas de ${project.name}`} />
    <section className="panel">
      <div className="panel-head"><h2 className="heading-sm">Proyecto</h2><Badge tone="success"><span className="connection-dot" />Vinculado</Badge></div>
      <div className="defs">
        <div><small>Frontend</small><code>{project.url}</code></div>
        <div><small>Backend</small><code>{project.backendUrl || "http://localhost:3001"}</code></div>
        <div><small>Rama</small><code>{project.branch}</code></div>
        <div><small>Repositorio</small><code>{project.repoPath}</code></div>
      </div>
    </section>

    <section className="panel">
      <div className="panel-head"><h2 className="heading-sm">Herramientas MCP e Integraciones</h2><Badge tone="success"><span className="connection-dot" />Conectado</Badge></div>
      {items.map((it) => (
        <div className="integration" key={it.name}>
          <span className={`integration-icon ${it.tone}`}><Icon name={it.icon} /></span>
          <div>
            <h3>{it.name}</h3>
            <p><strong>{it.role}:</strong> {it.text}</p>
          </div>
          <Badge tone="info">{it.badge}</Badge>
        </div>
      ))}
    </section>

    <section className="panel">
      <div className="panel-head"><h2 className="heading-sm">Agentes de prueba</h2><span className="t-muted">{officeAgents.length} configurados</span></div>
      <div className="row-list">
        {officeAgents.map((a) => (
          <div className="row-item" key={a.id}>
            <span className={`agent-initials ${a.status}`}>{a.initials}<i /></span>
            <span className="row-main"><strong>{a.name}</strong><span>{a.role}</span></span>
            <Button variant="secondary" small onClick={() => tobi.toggleAgentStatus(a.id)}>{a.status === "working" ? "Pausar" : "Activar"}</Button>
          </div>
        ))}
      </div>
    </section>
  </>;
}

/* ==========================================================================
   Shell
   ========================================================================== */
function NotificationPanel({ open, onClose, navigate, tobi }: { open: boolean; onClose: () => void; navigate: (v: AppView) => void; tobi: Tobi }) {
  const { bugs, specs, runs } = tobi.state;
  const notices: { tone: "danger" | "success" | "info"; icon: IconName; title: string; text: string; target: AppView }[] = [
    { tone: "danger", icon: "bug", title: `Bug confirmado ${bugs[0]?.id ?? ""}`, text: bugs[0]?.title ?? "", target: "bug-detail" },
    { tone: "success", icon: "check", title: "Specs verificados", text: `${specs.length} archivos listos`, target: "specs" },
    { tone: "info", icon: "play", title: `Run ${runs[0]?.id ?? ""}`, text: `${runs[0]?.passed ?? 0} aprobados, ${runs[0]?.failed ?? 0} fallidos`, target: "run-detail" },
  ];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return <>
    <div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={onClose} />
    <aside className={`notification-panel ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Notificaciones">
      <div className="panel-head"><h2 className="heading-md">Actividad</h2><Button variant="icon" label="Cerrar" onClick={onClose}><Icon name="x" /></Button></div>
      <div className="row-list">
        {notices.map((n) => (
          <button type="button" className="row-item" key={n.title} onClick={() => { navigate(n.target); onClose(); }}>
            <span className={`row-icon ${n.tone}`}><Icon name={n.icon} size="sm" /></span>
            <span className="row-main"><strong>{n.title}</strong><span>{n.text}</span></span>
            <span className="row-chevron"><Icon name="chevron" size="sm" /></span>
          </button>
        ))}
      </div>
    </aside>
  </>;
}

function Operations({ view, navigate, onHome, tobi }: { view: AppView; navigate: (v: AppView) => void; onHome: () => void; tobi: Tobi }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [activeBugId, setActiveBugId] = useState("BUG-01");
  const [inspectedTest, setInspectedTest] = useState<TestCaseItem | null>(null);

  const go = (v: AppView) => { navigate(v); setMobileNav(false); };
  const labels: Record<AppView, string> = {
    landing: "Portada", dashboard: "Dashboard", journey: "Mapa de Flujos E2E", "test-runs": "Test Runs", "run-detail": `Run ${tobi.state.runs[0]?.id ?? ""}`,
    "live-run": "Live Run", "bug-tracker": "Bug Tracker", "bug-detail": activeBugId, diagnostic: "Diagnostic Studio",
    office: "La Oficina", specs: "Test Specs", suites: "Suites", integrations: "Integraciones", settings: "Settings",
  };

  const content =
    view === "dashboard" ? <DashboardPage navigate={go} tobi={tobi} /> :
      view === "journey" ? <JourneyCanvas tobi={tobi} navigate={go} onInspectTest={setInspectedTest} /> :
        view === "test-runs" ? <TestRunsPage navigate={go} tobi={tobi} /> :
          view === "run-detail" ? <RunDetailPage navigate={go} tobi={tobi} onInspectTest={setInspectedTest} /> :
            view === "live-run" ? <LiveRunPage tobi={tobi} /> :
              view === "bug-tracker" ? <BugTrackerPage navigate={go} tobi={tobi} onSelectBug={setActiveBugId} /> :
                view === "bug-detail" || view === "diagnostic" ? <BugDetailPage navigate={go} tobi={tobi} selectedBugId={activeBugId} /> :
                  view === "office" ? <OfficePage navigate={go} tobi={tobi} /> :
                    view === "specs" ? <SpecsPage navigate={go} tobi={tobi} /> :
                      view === "suites" ? <SuitesPage navigate={go} tobi={tobi} onInspectTest={setInspectedTest} /> :
                        view === "integrations" ? <IntegrationsPage tobi={tobi} /> :
                          <SettingsPage tobi={tobi} />;

  return (
    <div className="app">
      <div className={mobileNav ? "mobile-overlay show" : "mobile-overlay"} onClick={() => setMobileNav(false)} />
      <div className={mobileNav ? "sidebar-mobile open" : "sidebar-mobile"}>
        <Sidebar compact={false} activeView={view} onCompact={() => setMobileNav(false)} onHome={onHome} onNavigate={go} tobi={tobi} />
      </div>
      <Sidebar compact={compact} activeView={view} onCompact={() => setCompact(!compact)} onHome={onHome} onNavigate={go} tobi={tobi} />
      <div className="app-main">
        <AppHeader title={labels[view]} onMenu={() => setMobileNav(true)} onNotifications={() => setNotifications(true)} onLive={() => go("live-run")} tobi={tobi} />
        <main className="workspace">{content}</main>
      </div>
      <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={go} tobi={tobi} />
      <TestDetailModal
        test={inspectedTest}
        bugs={tobi.state.bugs}
        onClose={() => setInspectedTest(null)}
        onCreateBug={(t) => {
          const bugMatch = tobi.state.bugs.find((b) => (t?.name && t.name.includes(b.id)) || (t?.spec?.includes("office") && b.id === "BUG-01"));
          if (bugMatch) {
            setActiveBugId(bugMatch.id);
          } else {
            setActiveBugId("BUG-01");
          }
          setInspectedTest(null);
          go("bug-detail");
        }}
        onRunTest={(passedTest) => {
          tobi.rerunTest(passedTest.name);
        }}
      />
    </div>
  );
}

/* ==========================================================================
   Landing
   ========================================================================== */
function Landing({ openDashboard, openOffice, tobi }: { openDashboard: () => void; openOffice: () => void; tobi: Tobi }) {
  const [menu, setMenu] = useState(false);
  const { liveRun, project } = tobi.state;
  const bug = tobi.state.bugs[0];
  const features = [
    { icon: "search" as IconName, title: "Explora tu app", text: "Los agentes leen tu código y recorren cada flujo como lo haría un usuario." },
    { icon: "pulse" as IconName, title: "Encuentra la causa", text: "Consola, red y rendimiento quedan ligados al paso exacto donde falla." },
    { icon: "file" as IconName, title: "Deja tests listos", text: "Cada flujo validado se guarda como un spec de Playwright para tu CI." },
  ];

  return (
    <main className="landing">
      <header className="site-header">
        <div className="site-header-in">
          <Logo />
          <nav className="site-nav" aria-label="Secciones">
            <Button variant="ghost" onClick={openDashboard}>Dashboard</Button>
            <Button variant="ghost" onClick={openOffice}>La Oficina</Button>
          </nav>
          <div className="site-actions">
            <Button onClick={openDashboard}>Entrar al workspace<Icon name="arrow" size="sm" /></Button>
          </div>
          <Button variant="icon" className="mobile-menu" label="Menú" onClick={() => setMenu(!menu)}><Icon name={menu ? "x" : "menu"} /></Button>
        </div>
        {menu && <div className="site-header-in" style={{ height: "auto", padding: "8px 24px 12px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}><Button variant="ghost" onClick={openDashboard}>Dashboard</Button><Button variant="ghost" onClick={openOffice}>La Oficina</Button></div>}
      </header>

      <section className="hero">
        <div className="hero-copy">
          <Badge tone="info"><Icon name="spark" size="sm" />Testing con agentes de IA</Badge>
          <h1 className="heading-xl">Prueba tu web con agentes que la usan de verdad</h1>
          <p>Exploración automatizada de flujos, detección de fallos con DevTools y generación de tests deterministas en Playwright.</p>
          <div className="hero-actions">
            <Button onClick={openDashboard}>Entrar al workspace<Icon name="arrow" size="sm" /></Button>
            <Button variant="secondary" onClick={openOffice}><Icon name="spark" size="sm" />Conocer La Oficina</Button>
          </div>
        </div>

        <div className="product-frame" aria-label="Vista previa del producto">
          <div className="media-bar">
            <div className="browser-dots"><span /><span /><span /></div>
            <span className="url-pill">{project.url}</span>
            <Badge tone="success"><span className="connection-dot" />En vivo</Badge>
          </div>
          <div className="product-body">
            <div className="media"><img src={liveRun.steps[0]?.screenshot || "/evidence/runs/tobi-01-landing.png"} alt={`Auditoría de ${project.name}`} /></div>
            <div>
              <div className="panel-head"><h2 className="heading-sm">{liveRun.suite}</h2><code>{liveRun.elapsedTime}</code></div>
              <div className="row-list">
                {liveRun.steps.slice(0, 5).map((s) => (
                  <div className="row-item" key={s.index}>
                    <span className={`step-state ${s.status === "Passed" ? "passed" : s.status === "Running" ? "running" : "queued"}`}>{s.status === "Passed" ? <Icon name="check" size="sm" /> : s.index}</span>
                    <span className="row-main"><strong>{s.action}</strong><span className="clamp">{s.description}</span></span>
                    <code className="t-muted">{s.duration}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <div className="feature-in">
          <h2>Del primer clic al test automatizado</h2>
          <div className="feature-grid">
            {features.map((f) => (
              <button type="button" className="feature" key={f.title} onClick={openDashboard}>
                <span className="row-icon"><Icon name={f.icon} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {bug && (
        <section className="bug-showcase">
          <div>
            <h2>Cada bug, explicado paso a paso</h2>
            <section className="panel bdd">
              <div className="bdd-step"><span className="gherkin dado">Dado que</span><p>{bug.dadoQue}</p></div>
              <div className="bdd-step"><span className="gherkin cuando">Cuando</span><p>{bug.cuando}</p></div>
            </section>
          </div>
          <div className="panel">
            <div className="panel-head"><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge tone="danger">{bug.severity}</Badge><strong>{bug.id}</strong></div><span className="t-muted">{bug.section}</span></div>
            <div className="media" style={{ borderBottom: 0 }}><img src={bug.screenshot || "/evidence/bugs/tobi-bug-01-detail.png"} alt={`Evidencia de ${bug.id}`} /></div>
          </div>
        </section>
      )}

      <footer className="site-footer">
        <div className="site-footer-in"><Logo /><span>© 2026 TobiTests · Playwright MCP + Chrome DevTools MCP</span></div>
      </footer>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const tobi = useTobiState();
  if (view === "landing") return <Landing openDashboard={() => setView("dashboard")} openOffice={() => setView("office")} tobi={tobi} />;
  return <Operations view={view} navigate={setView} onHome={() => setView("landing")} tobi={tobi} />;
}