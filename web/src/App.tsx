import { useEffect, useState, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTobiState, type BugItem, type AuditScope } from "./hooks/useTobiState";
import { OfficeView } from "./components/OfficeView";
import { JourneyCanvas } from "./components/JourneyCanvas";
import { TestDetailModal, type TestCaseItem } from "./components/TestDetailModal";

type Tobi = ReturnType<typeof useTobiState>;

function isApiSpecOrTest(specOrName?: string, title?: string): boolean {
  const s = (specOrName || "").toLowerCase();
  const t = (title || "").toLowerCase();
  return (
    s.includes("api") ||
    t.includes("tc-api") ||
    t.includes("get /") ||
    t.includes("post /") ||
    t.includes("put /") ||
    t.includes("delete /") ||
    t.includes("apirequestcontext")
  );
}

function ScopeSwitcherBar({ tobi, compact = false }: { tobi: Tobi; compact?: boolean }) {
  const activeScope: AuditScope = tobi.auditScope || "fullstack";
  const options: { id: AuditScope; label: string }[] = [
    { id: "frontend", label: "🖥️ Frontend" },
    { id: "backend", label: "⚙️ Backend API" },
    { id: "fullstack", label: "🔗 Full-Stack" },
  ];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <div
        data-testid="audit-scope-switcher"
        role="group"
        aria-label="Selector de alcance de auditoría"
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "var(--bg-subtle, rgba(15, 23, 42, 0.75))",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 2,
          gap: 2,
        }}
      >
        {options.map((opt) => {
          const active = activeScope === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              data-testid={`scope-option-${opt.id}`}
              onClick={() => tobi.setAuditScope(opt.id)}
              style={{
                border: "none",
                borderRadius: 6,
                padding: compact ? "3px 8px" : "4px 10px",
                fontSize: compact ? 11 : 11.5,
                fontWeight: 600,
                cursor: "pointer",
                background: active ? "var(--primary, #6366f1)" : "transparent",
                color: active ? "#fff" : "var(--text-secondary, #94a3b8)",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        data-testid="reaudit-scope-btn"
        className="button button-secondary button-sm"
        onClick={() => tobi.runLiveAudit(activeScope)}
        title={`Ejecutar o re-auditar alcance ${activeScope.toUpperCase()} fusionando suites incrementalmente`}
        style={{ fontSize: compact ? 11 : 11.5, padding: compact ? "3px 8px" : "4px 10px" }}
      >
        ⚡ Re-auditar alcance
      </button>
    </div>
  );
}

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

function Sidebar({ compact, onCompact, onHome, activeView, onNavigate, tobi, onOpenAddProject }: {
  compact: boolean; onCompact: () => void; onHome: () => void; activeView: AppView; onNavigate: (v: AppView) => void; tobi: Tobi; onOpenAddProject?: () => void;
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
                  <div key={proj.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      type="button"
                      className={`button ${isSelected ? "button-primary" : "button-ghost"}`}
                      style={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        flex: 1,
                        minWidth: 0,
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
                    {tobi.availableProjects.length > 1 && (
                      <button
                        type="button"
                        style={{ padding: "6px 8px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", borderRadius: "4px" }}
                        title="Eliminar proyecto de la lista"
                        onClick={(e) => {
                          e.stopPropagation();
                          tobi.removeProject(proj.id);
                        }}
                      >
                        <Icon name="x" size="sm" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón Agregar Proyecto */}
            <button
              type="button"
              className="button button-ghost"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "8px 10px",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--primary)",
                marginBottom: 6,
                gap: 6
              }}
              onClick={() => {
                setProjectsOpen(false);
                onOpenAddProject?.();
              }}
            >
              <span>+ Agregar Proyecto</span>
            </button>

            {tobi.deletedProjects && tobi.deletedProjects.length > 0 && (
              <button
                type="button"
                className="button button-ghost"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "4px 8px",
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
                onClick={() => tobi.restoreDefaultProjects()}
              >
                Restaurar proyectos de demo
              </button>
            )}

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

function AppHeader({ title, onMenu, onNotifications, onLive, tobi, onOpenAddProject }: { title: string; onMenu: () => void; onNotifications: () => void; onLive: () => void; tobi: Tobi; onOpenAddProject?: () => void; }) {
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
              minWidth: 260,
              marginTop: 4,
              boxShadow: "var(--shadow-md)"
            }}
          >
            <div style={{ padding: "4px 6px 6px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
              <span className="mono t-muted" style={{ fontSize: 10, textTransform: "uppercase" }}>Seleccionar Proyecto</span>
            </div>
            {tobi.availableProjects.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <button
                  type="button"
                  className={`button ${tobi.activeProjectId === p.id ? "button-primary" : "button-ghost"}`}
                  style={{ flex: 1, justifyContent: "flex-start", padding: "6px 8px", fontSize: 12 }}
                  onClick={() => {
                    tobi.switchProject(p.id);
                    setHeaderProjOpen(false);
                  }}
                >
                  <span className="project-avatar" style={{ width: 18, height: 18, fontSize: 10, marginRight: 6 }}>{p.name.charAt(0)}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{p.name}</span>
                  {tobi.activeProjectId === p.id && <Icon name="check" size="sm" />}
                </button>
                {tobi.availableProjects.length > 1 && (
                  <button
                    type="button"
                    style={{ padding: "4px 6px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}
                    title={`Eliminar ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      tobi.removeProject(p.id);
                    }}
                  >
                    <Icon name="x" size="sm" />
                  </button>
                )}
              </div>
            ))}
            {/* Botón Agregar Proyecto en Header */}
            <button
              type="button"
              className="button button-ghost"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "6px 8px",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-sm)",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--primary)",
                marginTop: 4,
                gap: 4
              }}
              onClick={() => {
                setHeaderProjOpen(false);
                onOpenAddProject?.();
              }}
            >
              <span>+ Agregar Proyecto</span>
            </button>
          </div>
        )}
        <Icon name="chevron" size="sm" />
        <strong>{title}</strong>
      </nav>
      <div className="app-header-actions">
        <ScopeSwitcherBar tobi={tobi} compact />
        <span className="env-chip"><span className="connection-dot" />{project.environment} · {project.branch}</span>
        <Button variant="secondary" className="run-chip" onClick={onLive}>
          <span className="live-pulse" />Run {liveRun.id}
          <Badge tone="agent">{liveRun.currentStep + 1}/{liveRun.totalSteps}</Badge>
        </Button>
        <Button variant="icon" className="notify-btn" label="Notificaciones" onClick={onNotifications}><Icon name="bell" /><span className="notification-dot" /></Button>
        <div className="profile"><span>TB</span><div><strong>todotobi</strong><small>Lead Architect</small></div></div>
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
  const activeScope = tobi.auditScope || "fullstack";
  const allTests = (run?.tests || []) as unknown as TestItem[];
  const scopedTests = allTests.filter((t) => {
    if (activeScope === "frontend") return !isApiSpecOrTest(t.spec, t.name);
    if (activeScope === "backend") return isApiSpecOrTest(t.spec, t.name);
    return true;
  });

  return <>
    <PageHeading title="Dashboard" subtitle={`${project.name} · Rama ${project.branch} · Alcance ${activeScope.toUpperCase()}`}>
      <ScopeSwitcherBar tobi={tobi} />
      <Button variant="secondary" onClick={() => navigate("office")}><Icon name="spark" size="sm" />La Oficina ({working} activos)</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ver ejecución en vivo</Button>
    </PageHeading>

    <div className="stat-row">
      <Stat label="Tasa de aprobación" value={metrics.passRate} meta={`${scopedTests.length} tests visibles (${activeScope})`} tone="success" />
      <Stat label="Ejecuciones" value={String(metrics.totalRuns)} meta={`Rama ${project.branch}`} />
      <Stat label="Tests fallidos" value={String(metrics.failedTests)} meta="Requieren revisión" tone="danger" />
    </div>

    {runs.length === 0 && (
      <div
        className="panel"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(20,16,32,0.85) 100%)",
          border: "1px solid var(--primary, #6366f1)",
          padding: "20px 24px",
          marginBottom: 20,
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="live-pulse" />
              <strong style={{ fontSize: 16, color: "var(--fg)" }}>
                Frontend Vinculado en {project.url || "puerto local"} · Pendiente de Exploración
              </strong>
            </div>
            <p className="t-muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
              Tu servidor está corriendo. Presioná <strong>Iniciar Exploración del Frontend</strong> para que Antigravity y Explorer QA recorran tu aplicación con Playwright, extraigan rutas y capturen evidencia real con capturas y videos .webm.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="primary"
              onClick={() => {
                tobi.runLiveAudit(activeScope);
                navigate("live-run");
              }}
              style={{ padding: "10px 18px", fontSize: 13.5, fontWeight: 600 }}
            >
              <Icon name="play" size="sm" />
              ⚡ Iniciar Exploración del Frontend
            </Button>
          </div>
        </div>
      </div>
    )}

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
      <ScopeSwitcherBar tobi={tobi} />
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

const DEFAULT_SUITE_OPTIONS: [string, string][] = [
  ["vetconnect-auth.spec.ts", "Auth e identidad"],
  ["vetconnect-rbac.spec.ts", "RBAC y seguridad"],
  ["vetconnect-tutor-pets.spec.ts", "Tutor y mascotas"],
  ["vetconnect-doctor-clinic.spec.ts", "Médico y clínica"],
  ["vetconnect-appointments.spec.ts", "Consultas y mensajes"],
  ["vetconnect-compliance-a11y.spec.ts", "GDPR y accesibilidad"],
];

function resolveSuiteOptions(tobi: Tobi, tests: TestItem[]): [string, string][] {
  const suites = tobi.state.suites || [];
  const seen = new Map<string, string>();
  for (const s of suites) {
    if (s.specFile && !seen.has(s.specFile)) {
      const cleanName = s.name.replace(/^Suite\s+\d+:\s*/i, "").trim();
      seen.set(s.specFile, cleanName || s.specFile);
    }
  }
  for (const t of tests) {
    if (t.spec && !seen.has(t.spec)) {
      seen.set(t.spec, t.spec.replace(/\.spec\.ts$/i, ""));
    }
  }
  if (seen.size > 0) {
    return Array.from(seen.entries());
  }
  return DEFAULT_SUITE_OPTIONS;
}

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
  const allTests = run.tests as unknown as TestItem[];
  const activeScope = tobi.auditScope || "fullstack";
  const tests = allTests.filter((t) => {
    if (activeScope === "frontend") return !isApiSpecOrTest(t.spec, t.name);
    if (activeScope === "backend") return isApiSpecOrTest(t.spec, t.name);
    return true;
  });
  const suiteOptions = resolveSuiteOptions(tobi, tests).filter(([file]) => {
    if (activeScope === "frontend") return !isApiSpecOrTest(file);
    if (activeScope === "backend") return isApiSpecOrTest(file);
    return true;
  });
  const [filter, setFilter] = useState<"all" | "failed" | "passed">(run.failed > 0 ? "failed" : "all");
  const [query, setQuery] = useState("");
  const [suite, setSuite] = useState("all");
  const [page, setPage] = useState(1);
  const [media, setMedia] = useState<"snapshot" | "video">("snapshot");
  const [selected, setSelected] = useState<TestItem>(tests.find((t) => t.status === "Failed") || tests[0] || allTests[0]);
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
  const passedPct = (run.passed / Math.max(1, run.total)) * 100;

  return <>
    <div className="detail-back"><Button variant="ghost" onClick={() => navigate("test-runs")}><Icon name="chevron" size="sm" />Test Runs</Button></div>
    <PageHeading title={`Run ${run.id}`} subtitle={`${run.suite} · Alcance ${activeScope.toUpperCase()}`}>
      <ScopeSwitcherBar tobi={tobi} />
      <Button variant="secondary" onClick={() => tobi.downloadMasterBugReport()}><Icon name="download" size="sm" />Bug report (.md)</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Abrir Live Run</Button>
    </PageHeading>

    <section className="panel">
      <div className="result-banner">
        <div className="result-banner-main">
          <span className={`result-icon ${run.failed > 0 ? "failed" : "passed"}`}><Icon name={run.failed > 0 ? "alert" : "check"} size="lg" /></span>
          <div>
            <div className="heading-md">{run.passed} aprobados, {run.failed} {run.failed === 1 ? "fallido" : "fallidos"}</div>
            <p>{tests.length} tests visibles ({activeScope}) en {suiteOptions.length} suites</p>
          </div>
        </div>
        <div className="meter" role="img" aria-label={`${run.passed} aprobados y ${run.failed} fallidos de ${run.total}`}>
          <i className="ok" style={{ width: `${passedPct}%` }} /><i className="ko" style={{ width: `${100 - passedPct}%` }} />
        </div>
      </div>
      <div className="facts">
        <div><small>Estado</small><StatusBadge status={run.status} /></div>
        <div><small>Alcance</small><Badge tone="info">{activeScope.toUpperCase()}</Badge></div>
        <div><small>Duración</small><strong>{run.duration}</strong></div>
        <div><small>Rama</small><strong>{run.branch}</strong></div>
        <div><small>Commit</small><strong>{run.commit}</strong></div>
        <div><small>Fecha</small><strong>{run.date}</strong></div>
      </div>
    </section>

    <div className="detail-layout">
      <section className="panel">
        <div className="panel-head">
          <h2 className="heading-sm">Tests ({tests.length})</h2>
          <Tabs value={filter} onChange={reset(setFilter)} items={[
            { id: "all", label: "Todos", count: tests.length },
            { id: "failed", label: "Fallidos", count: tests.filter((t) => t.status === "Failed").length },
            { id: "passed", label: "Aprobados", count: tests.filter((t) => t.status === "Passed").length },
          ]} />
        </div>
        <div className="toolbar">
          <div className="grow"><SearchField placeholder="Buscar test o spec" value={query} onChange={reset(setQuery)} /></div>
          <select className="select" aria-label="Filtrar por suite" value={suite} onChange={(e) => reset(setSuite)(e.target.value)}>
            <option value="all">Todas las suites ({suiteOptions.length})</option>
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
              <span><strong>{t.name}</strong><small>{t.spec} · {isApiSpecOrTest(t.spec, t.name) ? "API HTTP" : "UI E2E"}</small></span>
              <code>{t.duration}</code>
            </button>
          ))}
          {visible.length === 0 && <div className="empty"><strong>Sin resultados</strong><span>Prueba con otro filtro, búsqueda o alcance.</span></div>}
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
          {media === "video" ? (
            selected?.videoUrl ? (
              <video key={selected.videoUrl} src={selected.videoUrl} controls muted loop playsInline />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180, background: "rgba(0,0,0,0.3)", color: "var(--muted)", gap: 6, padding: 16 }}>
                <Icon name="video" size="md" />
                <span style={{ fontSize: 12 }}>Sin grabación de video registrada para este test</span>
              </div>
            )
          ) : selected?.screenshot ? (
            <img src={selected.screenshot} alt={`Captura de ${selected.name}`} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180, background: "rgba(0,0,0,0.3)", color: "var(--muted)", gap: 6, padding: 16 }}>
              <Icon name="search" size="md" />
              <span style={{ fontSize: 12 }}>Sin captura disponible para este test</span>
            </div>
          )}
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
      <ScopeSwitcherBar tobi={tobi} />
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
          {mode === "screenshot" ? (
            step?.screenshot ? (
              <>
                <img src={step.screenshot} alt={step.description || "Ejecución en vivo"} />
                <div className="hud">
                  <div><Badge tone="agent"><Icon name="spark" size="sm" />{step.agent || "Explorer QA"}</Badge></div>
                  <strong>Paso {step.index} · {step.action}</strong>
                  <code>{step.target}</code>
                  <small>{step.description}</small>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, background: "rgba(0,0,0,0.35)", color: "var(--muted)", gap: 8, padding: 24 }}>
                <Icon name="search" size="lg" />
                <strong style={{ fontSize: 13, color: "var(--fg)" }}>Esperando capturas de {project.name}</strong>
                <span style={{ fontSize: 11, maxWidth: 360, textAlign: "center", lineHeight: 1.4 }}>
                  {liveRun.steps.length === 0
                    ? "No hay pasos ejecutados todavía. Hacé clic en 'Re-auditar alcance' para que los agentes naveguen tu frontend."
                    : `Paso ${step?.index || 1}: ${step?.action || "Esperando acción..."}`}
                </span>
              </div>
            )
          ) : (
            (liveRun.videoUrl || (tobi.activeProjectId === "tobitests" ? "/evidence/videos/tobitests-self-audit.webm" : null)) ? (
              <video
                key={liveRun.videoUrl || tobi.activeProjectId}
                src={liveRun.videoUrl || (tobi.activeProjectId === "tobitests" ? "/evidence/videos/tobitests-self-audit.webm" : "")}
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, background: "rgba(0,0,0,0.35)", color: "var(--muted)", gap: 8, padding: 24 }}>
                <Icon name="video" size="lg" />
                <strong style={{ fontSize: 13, color: "var(--fg)" }}>Sin video disponible para {project.name}</strong>
                <span style={{ fontSize: 11, maxWidth: 360, textAlign: "center", lineHeight: 1.4 }}>
                  Las grabaciones .webm se generan automáticamente al ejecutar la auditoría de Playwright sobre tu aplicación.
                </span>
              </div>
            )
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
  const activeScope = tobi.auditScope || "fullstack";
  const q = search.toLowerCase();
  const list = tobi.state.bugs.filter((b) => b.id.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || b.section.toLowerCase().includes(q));
  const open = (id: string) => { onSelectBug(id); navigate("bug-detail"); };

  return <>
    <PageHeading title="Bug Tracker" subtitle={`${list.length} incidentes documentados · Alcance ${activeScope.toUpperCase()}`}>
      <ScopeSwitcherBar tobi={tobi} />
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
              {(() => {
                const isTobiPrj = tobi.state.project.name.toLowerCase().includes("tobi");
                const isVetPrj = tobi.state.project.name.toLowerCase().includes("vet");
                const defaultIn = isTobiPrj
                  ? [diag.affectedFile || "web/src/components/OfficeView.tsx", "web/src/data/tobi-state.json"]
                  : isVetPrj
                  ? [diag.affectedFile || "web/src/pages/ClientApp.tsx"]
                  : [diag.affectedFile || "src/App.tsx"];
                const defaultOut = isTobiPrj
                  ? ["useAgentMotion.ts", "OfficeScene.tsx", "JourneyCanvas.tsx"]
                  : isVetPrj
                  ? ["web/src/context/AuthContext.tsx", "web/src/routes/ProtectedRoute.tsx", "web/src/services/api.ts"]
                  : ["package.json", "tsconfig.json", "vite.config.ts"];

                const scopeIn = (bug.diagnostic as any)?.scopeIn?.length ? (bug.diagnostic as any).scopeIn : defaultIn;
                const scopeOut = (bug.diagnostic as any)?.scopeOut?.length ? (bug.diagnostic as any).scopeOut : defaultOut;
                const affected = diag.affectedFile || scopeIn[0];
                const fix = diag.recommendedFix || "Minimal Fix estricto en el área del cerco";

                return `Esquema de Plantilla Estandarizado:
Definir el Escenario (Gherkin/BDD):
Nombre y sección (${bug.id}: ${bug.title}, sección: ${bug.section}).
Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}

Protocolo Anti-Regresiones con Blindaje:
Fase 1: Identificar el escenario & Aislamiento en Capas
- Capa UI/Vista: ${affected}
- Capa Hooks/Estado: Validación y sincronización de estado reactivo
- Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
- Capa Backend/API: Contratos de eventos preservados
- Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos

Fase 2: Diseño del "Cerco de Seguridad" (Plan Mode)
1. ARCHIVOS DENTRO DEL ALCANCE: [${scopeIn.join(", ")}]
2. ARCHIVOS FUERA DEL ALCANCE: [${scopeOut.join(", ")}]
3. EVALUACIÓN DE RIESGOS: Cero roturas en componentes externos preservando contratos retrocompatibles
4. ESTRATEGIA DE FIX: ${fix}

Fase 3: Análisis de Impacto Global
- Rastreo de Referencias Cruzadas (Find-All-References)
- Preservación estricta de contratos

Fase 4: El Quirófano
- Rama: bugfix/cerco-${bug.id.toLowerCase()}
- Minimal fix verificado

Fase 5: Validación
- Testing de Tres Capas (Unitario, Regresión e Integración)
- Verificación estricta de tipos (tsc --noEmit)`;
              })()}
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
  const allSpecs = tobi.state.specs;
  const activeScope = tobi.auditScope || "fullstack";
  const filteredSpecs = allSpecs.filter((s) => {
    if (activeScope === "frontend") return !isApiSpecOrTest(s.name, s.domain);
    if (activeScope === "backend") return isApiSpecOrTest(s.name, s.domain);
    return true;
  });
  const specs = filteredSpecs.length > 0 ? filteredSpecs : allSpecs;
  const [name, setName] = useState(specs[0]?.name || "");
  const [copied, setCopied] = useState(false);
  const spec = specs.find((s) => s.name === name) || specs[0];
  const lines = (spec?.code || "").split("\n");
  const total = specs.reduce((n, s) => n + s.testsCount, 0);
  const copy = () => { if (!spec) return; navigator.clipboard?.writeText(spec.code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return <>
    <PageHeading title="Test Specs" subtitle={`${specs.length} archivos Playwright (${activeScope.toUpperCase()})`}>
      <ScopeSwitcherBar tobi={tobi} />
      <Button variant="secondary" onClick={copy}><Icon name={copied ? "check" : "copy"} size="sm" />{copied ? "Copiado" : "Copiar código"}</Button>
      <Button onClick={() => navigate("live-run")}><Icon name="play" size="sm" />Ejecutar</Button>
    </PageHeading>
    <div className="stat-row">
      <Stat label="Specs" value={String(specs.length)} meta={`Alcance ${activeScope}`} />
      <Stat label="Casos de prueba" value={String(total)} meta="Definidos en alcance" />
      <Stat label="Aprobación" value={tobi.state.metrics.passRate} meta="Último run" tone="success" />
      <Stat label="Último run" value={tobi.state.metrics.activeRun} meta={tobi.state.project.lastAudit} />
    </div>
    <section className="panel workbench">
      <aside className="file-tree" aria-label="Archivos">
        <div className="file-tree-head">specs/ ({activeScope})</div>
        {specs.map((s) => (
          <button type="button" key={s.name} className={`nav-item ${s.name === spec?.name ? "active" : ""}`} onClick={() => setName(s.name)} title={s.name}>
            <Icon name="file" size="sm" /><span>{s.name}</span>
          </button>
        ))}
      </aside>
      <div className="editor">
        <div className="editor-bar">
          <span className="name"><Icon name="file" size="sm" />{spec?.name}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge tone={isApiSpecOrTest(spec?.name, spec?.domain) ? "info" : "agent"}>
              {isApiSpecOrTest(spec?.name, spec?.domain) ? "API HTTP" : "UI E2E"}
            </Badge>
            <Badge tone="success"><Icon name="check" size="sm" />{spec?.status}</Badge>
            <span className="t-muted">{spec?.testsCount} tests</span>
          </div>
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
  const allSuites = tobi.state.suites;
  const activeScope = tobi.auditScope || "fullstack";
  const filteredSuites = allSuites.filter((s) => {
    if (activeScope === "frontend") return !isApiSpecOrTest(s.specFile, s.name);
    if (activeScope === "backend") return isApiSpecOrTest(s.specFile, s.name);
    return true;
  });
  const suites = filteredSuites.length > 0 ? filteredSuites : allSuites;
  const [name, setName] = useState(suites[0]?.name || "");
  const current = suites.find((s) => s.name === name) || suites[0];
  const tests = (tobi.state.runs[0]?.tests as unknown as TestItem[]).filter((t) => t.spec === current?.specFile);

  return <>
    <PageHeading title="Suites" subtitle={`${suites.length} suites automatizadas (${activeScope.toUpperCase()})`}>
      <ScopeSwitcherBar tobi={tobi} />
      <Button onClick={() => navigate("specs")}><Icon name="file" size="sm" />Ver specs</Button>
    </PageHeading>
    <div className="suite-layout">
      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Suite</th><th>Alcance</th><th>Estado</th><th>Aprobación</th><th className="num">Tests</th><th className="num">Duración</th><th /></tr></thead>
            <tbody>
              {suites.map((s) => {
                const isApi = isApiSpecOrTest(s.specFile, s.name);
                return (
                  <tr key={s.name} className="clickable" onClick={() => setName(s.name)} style={s.name === current?.name ? { background: "var(--nav-selected)" } : undefined}>
                    <td><div className="cell-title"><strong>{s.name}</strong><small>{s.description}</small></div></td>
                    <td><Badge tone={isApi ? "info" : "agent"}>{isApi ? "API HTTP" : "UI E2E"}</Badge></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="rate-bar"><i style={{ width: s.passRate }} /></span><span className="rate">{s.passRate}</span></div></td>
                    <td className="num">{s.tests}</td>
                    <td className="num">{s.duration}</td>
                    <td className="cell-end"><Icon name="chevron" size="sm" /></td>
                  </tr>
                );
              })}
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

function AddProjectModal({ open, onClose, tobi, onNavigate }: { open: boolean; onClose: () => void; tobi: Tobi; onNavigate?: (v: AppView) => void }) {
  const [folderName, setFolderName] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [projectUrl, setProjectUrl] = useState("http://localhost:5173");
  const [env, setEnv] = useState("development");
  const [auditScope, setAuditScope] = useState<AuditScope>("fullstack");
  const [isPicking, setIsPicking] = useState(false);
  const [detectedPorts, setDetectedPorts] = useState<number[]>([]);
  const [autoStartAudit, setAutoStartAudit] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    fetch("/api/detect-local-ports")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.activePorts)) {
          const currentPort = window.location.port ? parseInt(window.location.port, 10) : 5180;
          const external = data.activePorts.filter((p: number) => p !== currentPort);
          setDetectedPorts(external);
          if (external.length > 0) {
            setProjectUrl(`http://localhost:${external[0]}`);
          }
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePickDirectory = async () => {
    setIsPicking(true);
    try {
      if ("showDirectoryPicker" in window) {
        // Modern Chromium File System Access API
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          const cleanName = dirHandle.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          setFolderName(cleanName);
          setRepoPath(`../projects/${dirHandle.name}`);
        }
      } else if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Folder picker error or dismissed:", err);
      }
    } finally {
      setIsPicking(false);
    }
  };

  const handleFileInputFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstPath = files[0].webkitRelativePath;
      const rootFolder = firstPath.split("/")[0] || "Mi Proyecto";
      const cleanName = rootFolder.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      setFolderName(cleanName);
      setRepoPath(`../projects/${rootFolder}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = folderName.trim() || "Nuevo Proyecto";
    const id = "custom-" + finalName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
    const defaultUrl = auditScope === "backend" ? "http://localhost:3000" : "http://localhost:5173";
    tobi.addProject({
      id,
      name: finalName,
      branch: "main",
      environment: env,
      repoPath: repoPath.trim() || `../projects/${finalName.toLowerCase().replace(/\s+/g, "-")}`,
      url: projectUrl.trim() || defaultUrl,
      isCustom: true,
      auditScope,
      autoRun: autoStartAudit,
    });
    onClose();
    if (autoStartAudit) {
      onNavigate?.("live-run");
    }
  };

  const scopeCards: { id: AuditScope; icon: string; title: string; desc: string }[] = [
    {
      id: "frontend",
      icon: "🖥️",
      title: "Frontend (UI & DOM E2E)",
      desc: "Navegación visual, selectores de accesibilidad, capturas y videos con @playwright/mcp.",
    },
    {
      id: "backend",
      icon: "⚙️",
      title: "Backend (API & Contratos HTTP)",
      desc: "Pruebas puras de endpoints REST/GraphQL, códigos HTTP, latencia y schemas JSON con APIRequestContext (sin navegador).",
    },
    {
      id: "fullstack",
      icon: "🔗",
      title: "Full-Stack (UI + API Combinados)",
      desc: "Auditoría integral de flujos visuales y contratos de red/backend.",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agregar Proyecto Local"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        padding: 16,
        overflowY: "auto"
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 580,
          background: "var(--bg-elevated, var(--bg))",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px var(--border)",
          padding: 24,
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 className="heading-md" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📁</span> Vincular Proyecto Local
            </h2>
            <p className="t-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              Seleccioná la carpeta de tu código fuente y definí el alcance de auditoría (UI, API pura o Full-Stack).
            </p>
          </div>
          <Button variant="icon" label="Cerrar modal" onClick={onClose}>
            <Icon name="x" size="sm" />
          </Button>
        </div>

        {/* Hidden fallback input for webkitdirectory */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          // @ts-ignore
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleFileInputFallback}
        />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* File Picker Action Box */}
          <div
            style={{
              padding: 14,
              background: "var(--bg-subtle, rgba(255,255,255,0.03))",
              border: "1px dashed var(--border-focus, var(--primary))",
              borderRadius: "var(--radius-md, 8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 24 }}>📂</div>
            <div>
              <strong style={{ fontSize: 13.5, display: "block" }}>
                {folderName ? `Carpeta seleccionada: "${folderName}"` : "Elegí el directorio raíz de tu proyecto"}
              </strong>
              <span className="t-muted" style={{ fontSize: 11.5 }}>
                Usamos la API de carpetas del explorador para detectar rutas y nombres.
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePickDirectory}
              disabled={isPicking}
            >
              <Icon name="search" size="sm" />
              {isPicking ? "Abriendo selector..." : "Seleccionar Carpeta en tu PC..."}
            </Button>
          </div>

          {/* 3-Card Audit Scope Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Alcance de Auditoría (auditScope)</label>
            <div
              data-testid="modal-audit-scope-selector"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
            >
              {scopeCards.map((card) => {
                const selected = auditScope === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    data-testid={`modal-scope-card-${card.id}`}
                    onClick={() => {
                      setAuditScope(card.id);
                      if (card.id === "backend" && projectUrl === "http://localhost:5173") {
                        setProjectUrl("http://localhost:3000");
                      } else if (card.id !== "backend" && projectUrl === "http://localhost:3000") {
                        setProjectUrl("http://localhost:5173");
                      }
                    }}
                    style={{
                      textAlign: "left",
                      padding: "10px 10px",
                      borderRadius: "var(--radius-md, 8px)",
                      border: selected ? "2px solid var(--primary, #6366f1)" : "1px solid var(--border)",
                      background: selected ? "rgba(99, 102, 241, 0.14)" : "var(--bg)",
                      color: "var(--fg)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 16 }}>{card.icon}</span>
                      {selected && <Badge tone="agent">Activo</Badge>}
                    </div>
                    <strong style={{ fontSize: 11.5, lineHeight: 1.25 }}>{card.title}</strong>
                    <span className="t-muted" style={{ fontSize: 10.5, lineHeight: 1.3 }}>
                      {card.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Nombre del Proyecto</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ej: Mi Super App / API Gateway"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Ruta del Repositorio Local</label>
            <input
              type="text"
              className="input mono"
              placeholder="Ej: ./workspace"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 12
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                {auditScope === "backend" ? "URL Base de API / Backend" : "URL de Desarrollo / Preview"}
              </label>
              <input
                type="text"
                className="input mono"
                placeholder={auditScope === "backend" ? "http://localhost:3000" : "http://localhost:5173"}
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 12
                }}
              />
              {detectedPorts.length > 0 && (
                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 11 }}>
                  <span style={{ color: "var(--success, #10b981)", fontWeight: 600 }}>🟢 Activo detectado:</span>
                  {detectedPorts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      style={{
                        padding: "2px 6px",
                        background: projectUrl === `http://localhost:${p}` ? "var(--primary)" : "rgba(255,255,255,0.06)",
                        color: projectUrl === `http://localhost:${p}` ? "#fff" : "var(--fg)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                      onClick={() => setProjectUrl(`http://localhost:${p}`)}
                    >
                      :{p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Entorno</label>
              <select
                className="input"
                value={env}
                onChange={(e) => setEnv(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 12
                }}
              >
                <option value="development">development (local)</option>
                <option value="staging">staging (preview)</option>
                <option value="production">production (smoke)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(99,102,241,0.25)" }}>
            <input
              type="checkbox"
              id="auto-start-audit-cb"
              checked={autoStartAudit}
              onChange={(e) => setAutoStartAudit(e.target.checked)}
              style={{ cursor: "pointer", width: 17, height: 17 }}
            />
            <label htmlFor="auto-start-audit-cb" style={{ fontSize: 12.5, cursor: "pointer", fontWeight: 600, color: "var(--fg)" }}>
              ⚡ Iniciar exploración y pruebas del frontend automáticamente al vincular
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              <Icon name="check" size="sm" />
              Vincular y Cargar Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Operations({ view, navigate, onHome, tobi }: { view: AppView; navigate: (v: AppView) => void; onHome: () => void; tobi: Tobi }) {
  const [compact, setCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [activeBugId, setActiveBugId] = useState("BUG-01");
  const [inspectedTest, setInspectedTest] = useState<TestCaseItem | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const go = (v: AppView) => { navigate(v); setMobileNav(false); };
  const labels: Record<AppView, string> = {
    landing: "Portada", dashboard: "Dashboard", journey: "Mapa de Flujos E2E", "test-runs": "Test Runs", "run-detail": `Run ${tobi.state.runs[0]?.id ?? ""}`,
    "live-run": "Live Run", "bug-tracker": "Bug Tracker", "bug-detail": activeBugId, diagnostic: "Diagnostic Studio",
    office: "La Oficina", specs: "Test Specs", suites: "Suites", integrations: "Integraciones", settings: "Settings",
  };

  const content =
    view === "dashboard" ? <DashboardPage navigate={go} tobi={tobi} /> :
      view === "journey" ? <JourneyCanvas tobi={tobi} antigravityLive={tobi.antigravityLive} navigate={go} onInspectTest={setInspectedTest} /> :
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
        <Sidebar
          compact={false}
          activeView={view}
          onCompact={() => setMobileNav(false)}
          onHome={onHome}
          onNavigate={go}
          tobi={tobi}
          onOpenAddProject={() => setIsAddProjectOpen(true)}
        />
      </div>
      <Sidebar
        compact={compact}
        activeView={view}
        onCompact={() => setCompact(!compact)}
        onHome={onHome}
        onNavigate={go}
        tobi={tobi}
        onOpenAddProject={() => setIsAddProjectOpen(true)}
      />
      <div className="app-main">
        <AppHeader
          title={labels[view]}
          onMenu={() => setMobileNav(true)}
          onNotifications={() => setNotifications(true)}
          onLive={() => go("live-run")}
          tobi={tobi}
          onOpenAddProject={() => setIsAddProjectOpen(true)}
        />
        <main className="workspace">{content}</main>
      </div>
      <NotificationPanel open={notifications} onClose={() => setNotifications(false)} navigate={go} tobi={tobi} />
      <TestDetailModal
        test={inspectedTest}
        bugs={tobi.state.bugs}
        auditScope={tobi.auditScope}
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
      <AddProjectModal
        open={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        tobi={tobi}
        onNavigate={go}
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
    { icon: "search" as IconName, title: "Explora tu app", text: "Los agentes leen tu código y recorren cada flujo como lo haría un operador." },
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
  const [view, setView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem("tobitests_current_view");
      if (saved && ["dashboard", "journey", "test-runs", "run-detail", "live-run", "bug-tracker", "bug-detail", "office", "specs", "suites", "integrations", "settings"].includes(saved)) {
        return saved as AppView;
      }
    } catch (e) {}
    return "dashboard";
  });
  const tobi = useTobiState();

  const handleNavigate = (v: AppView) => {
    setView(v);
    try {
      localStorage.setItem("tobitests_current_view", v);
    } catch (e) {}
  };

  if (view === "landing") return <Landing openDashboard={() => handleNavigate("dashboard")} openOffice={() => handleNavigate("office")} tobi={tobi} />;
  return <Operations view={view} navigate={handleNavigate} onHome={() => handleNavigate("landing")} tobi={tobi} />;
}