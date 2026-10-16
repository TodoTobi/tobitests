import { useState, useEffect, useCallback } from 'react';
import initialData from '../data/tobi-state.json';

export interface OfficeAgent {
  id: string;
  initials: string;
  name: string;
  role: string;
  status: string;
  bubble: string;
  task: string;
  tone: "agent" | "info" | "danger" | "success" | "neutral" | "warning";
  run: string;
}

export interface LiveStep {
  index: string;
  action: string;
  target: string;
  status: string;
  duration: string;
  description: string;
}

export interface TelemetryLog {
  time: string;
  level: string;
  message: string;
  source: string;
}

export interface BugItem {
  id: string;
  title: string;
  severity: string;
  status: string;
  section: string;
  runId: string;
  agent: string;
  assignee: string;
  date: string;
  scenario: string;
  dadoQue: string;
  cuando: string;
  entonces: string;
}

export interface TobiState {
  project: {
    name: string;
    url: string;
    branch: string;
    environment: string;
    lastAudit: string;
  };
  metrics: {
    passRate: string;
    totalRuns: number;
    failedTests: number;
    openBugs: number;
    avgDuration: string;
    activeRun: string;
  };
  officeAgents: OfficeAgent[];
  liveRun: {
    id: string;
    suite: string;
    target: string;
    status: string;
    currentStep: number;
    totalSteps: number;
    elapsedTime: string;
    steps: LiveStep[];
    telemetryLogs: TelemetryLog[];
  };
  bugs: BugItem[];
  specs: Array<{
    name: string;
    domain: string;
    status: string;
    testsCount: number;
    lastRun: string;
  }>;
}

export function useTobiState() {
  const [state, setState] = useState<TobiState>(initialData as unknown as TobiState);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: any = null;

    try {
      es = new EventSource('/api/stream');
      es.onopen = () => setConnected(true);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.payload) {
            setState(data.payload);
          }
        } catch (e) {
          console.warn('[TobiTests Bridge] Parse error:', e);
        }
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        // Fallback polling
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch('/api/state');
            if (res.ok) {
              const data = await res.json();
              setState(data);
              setConnected(true);
            }
          } catch (err) {}
        }, 3000);
      };
    } catch (e) {
      console.warn('[TobiTests Bridge] SSE failed, using local data');
    }

    return () => {
      es?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const updateState = useCallback(async (newState: Partial<TobiState>) => {
    const merged = { ...state, ...newState };
    setState(merged);
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    } catch (e) {
      console.warn('[TobiTests Bridge] Could not push state update:', e);
    }
  }, [state]);

  const copyBddToClipboard = useCallback((bug: BugItem) => {
    const text = `Escenario:
Nombre y sección: [${bug.id}]: ${bug.title}, sección: ${bug.section}

Pasos para reproducir:
Dado que ${bug.dadoQue}
Cuando ${bug.cuando}
Entonces ${bug.entonces}`;

    navigator.clipboard.writeText(text);
    return text;
  }, []);

  const downloadMasterBugReport = useCallback(() => {
    const content = `# Master Bug Report — ${state.project.name}
Generado automáticamente por TobiTests (Multi-Agent E2E Framework)
Fecha: ${new Date().toLocaleString()}

${state.bugs.map((bug, index) => `---
### ${index + 1}. [${bug.id}] ${bug.title}
* **Severidad:** ${bug.severity}
* **Estado:** ${bug.status}
* **Sección:** ${bug.section}
* **Agente Detector:** ${bug.agent}
* **Ejecución Asociada:** ${bug.runId}

#### Escenario (BDD / Gherkin):
**Nombre y sección:** [${bug.id}]: ${bug.title}, sección: ${bug.section}

**Pasos para reproducir:**
* **Dado que** ${bug.dadoQue}
* **Cuando** ${bug.cuando}
* **Entonces** ${bug.entonces}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `master-bug-report-${state.project.name.toLowerCase().replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state]);

  return {
    state,
    connected,
    updateState,
    copyBddToClipboard,
    downloadMasterBugReport,
  };
}
