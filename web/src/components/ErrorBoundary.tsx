import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[TobiTests ErrorBoundary Caught]", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: 24,
            margin: "20px auto",
            maxWidth: 800,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 12,
            color: "var(--fg, #f8fafc)",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f87171" }}>
                {this.props.fallbackTitle || "Error inesperado en este componente"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
                TobiTests aisló el fallo para proteger el resto de la sesión.
              </p>
            </div>
          </div>

          {this.state.error && (
            <pre
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                overflowX: "auto",
                color: "#fca5a5",
                fontFamily: "var(--font-mono, monospace)",
                margin: "12px 0",
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </pre>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                background: "var(--primary, #6366f1)",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Reintentar componente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "transparent",
                color: "var(--text-secondary, #94a3b8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
