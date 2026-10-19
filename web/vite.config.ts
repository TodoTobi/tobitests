import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

import siteConfiguration from './.figma/make/site.json'

function sanitizeTelemetryText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[a-zA-Z]:[\\/][^\s"'`<>|]+/g, './workspace')
    .replace(/\/(?:Users|home)\/[^\s"'`<>|]+/gi, './workspace')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'local-agent-session');
}

function getAntigravityLiveStatus() {
  try {
    const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
    const brainDir = path.join(home, '.gemini', 'antigravity', 'brain');
    if (!fs.existsSync(brainDir)) return null;

    const dirs = fs.readdirSync(brainDir, { withFileTypes: true })
      .filter((d: any) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d: any) => {
        const p = path.join(brainDir, d.name, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(p)) {
          return { dir: d.name, path: p, mtime: fs.statSync(p).mtimeMs };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.mtime - a.mtime);

    if (dirs.length === 0 || !dirs[0]) return null;
    const activeTranscript = dirs[0].path;

    const stat = fs.statSync(activeTranscript);
    const bufferSize = Math.min(stat.size, 65536);
    const fd = fs.openSync(activeTranscript, 'r');
    const buffer = Buffer.alloc(bufferSize);
    fs.readSync(fd, buffer, 0, bufferSize, Math.max(0, stat.size - bufferSize));
    fs.closeSync(fd);

    const rawLines = buffer.toString('utf8').trim().split('\n');
    const items: any[] = [];
    for (let i = rawLines.length - 1; i >= 0 && items.length < 25; i--) {
      try {
        items.push(JSON.parse(rawLines[i]));
      } catch (e) {}
    }

    const latest = items[0];
    if (!latest) return null;

    const now = Date.now();
    const latestTime = new Date(latest.created_at || now).getTime();
    const secondsAgo = Math.max(0, Math.round((now - latestTime) / 1000));

    let action = 'En guardia · Mesa de Comando';
    let detail = 'Puesto listo para recibir órdenes';
    let icon = '⚡';
    let isWorking = true;
    let timeLabel = `Live · ${secondsAgo}s`;

    const lastToolCall = items.find((it: any) => it.tool_calls && it.tool_calls.length > 0);
    const lastThought = items.find((it: any) => it.thinking && it.thinking.trim().length > 0);

    if (latest.type === 'USER_INPUT') {
      action = 'Leyendo solicitud del Operator...';
      const cleanMsg = latest.content ? sanitizeTelemetryText(latest.content.replace(/<[^>]+>/g, '').trim()) : '';
      detail = cleanMsg ? `"${cleanMsg.slice(0, 80)}..."` : 'Analizando requerimiento recibido en chat';
      icon = '📖';
      isWorking = true;
      timeLabel = `Leyendo · ${secondsAgo}s`;
    } else if (latest.type === 'PLANNER_RESPONSE' && latest.tool_calls && latest.tool_calls.length > 0) {
      const tc = latest.tool_calls[0];
      const rawAction = sanitizeTelemetryText(tc.args?.toolAction?.replace(/"/g, '') || tc.args?.toolSummary?.replace(/"/g, '') || tc.name);
      action = rawAction;

      if (tc.name === 'run_command') {
        icon = '💻';
        detail = sanitizeTelemetryText(tc.args?.CommandLine?.replace(/"/g, '')?.slice(0, 85)) || 'Ejecutando comando en consola';
      } else if (tc.name === 'view_file') {
        icon = '🔍';
        const file = tc.args?.AbsolutePath?.replace(/"/g, '')?.split(/[\\/]/).pop();
        detail = file ? `Inspeccionando ${sanitizeTelemetryText(file)}` : 'Leyendo archivo del proyecto';
      } else if (tc.name === 'replace_file_content' || tc.name === 'write_to_file') {
        icon = '✏️';
        const file = (tc.args?.TargetFile || tc.args?.AbsolutePath)?.replace(/"/g, '')?.split(/[\\/]/).pop();
        detail = file ? `Escribiendo cambios en ${sanitizeTelemetryText(file)}` : 'Modificando código del sistema';
      } else if (tc.name === 'call_mcp_tool') {
        icon = '🔌';
        detail = `MCP ${tc.args?.ServerName} › ${tc.args?.ToolName}`;
      } else {
        icon = '🛠️';
        detail = sanitizeTelemetryText(tc.args?.toolSummary?.replace(/"/g, '')) || 'Procesando paso de ingeniería';
      }
      isWorking = true;
      timeLabel = `Ejecutando · ${secondsAgo}s`;
    } else if (latest.type === 'GENERIC' && latest.source === 'MODEL') {
      if (lastToolCall && lastToolCall.tool_calls) {
        const tc = lastToolCall.tool_calls[0];
        const rawAction = sanitizeTelemetryText(tc.args?.toolAction?.replace(/"/g, '') || tc.name);
        action = `Procesando: ${rawAction}`;
        icon = '🧠';
        detail = 'Evaluando respuesta técnica y preparando siguiente paso';
      } else {
        action = 'Razonando arquitectura...';
        icon = '🧠';
        detail = 'Evaluando lógica y verificando reglas';
      }
      isWorking = true;
      timeLabel = `Pensando · ${secondsAgo}s`;
    } else if (latest.type === 'PLANNER_RESPONSE' && !latest.tool_calls) {
      if (secondsAgo < 30) {
        action = 'Respuesta entregada al Operator';
        detail = 'Esperando revisión y nueva indicación';
        icon = '💬';
        isWorking = true;
        timeLabel = `Reciente · ${secondsAgo}s`;
      } else {
        action = 'En guardia · Mesa de Comando';
        detail = 'Esperando nuevo requerimiento o consulta';
        icon = '☕';
        isWorking = false;
        timeLabel = `Standby · ${Math.round(secondsAgo / 60)}m`;
      }
    }

    let thoughtSnippet: string | null = null;
    if (lastThought && lastThought.thinking) {
      thoughtSnippet = sanitizeTelemetryText(lastThought.thinking.trim().slice(0, 160).replace(/\n+/g, ' '));
    }

    return {
      conversationId: 'local-agent-session',
      stepIndex: latest.step_index,
      type: latest.type,
      source: latest.source,
      secondsAgo,
      isWorking,
      action: sanitizeTelemetryText(action),
      detail: sanitizeTelemetryText(detail),
      icon,
      timeLabel,
      thoughtSnippet,
      history: items.filter((it: any) => it.tool_calls || it.type === 'USER_INPUT').slice(0, 8).map((it: any) => {
        let title = 'Acción de agente';
        let actIcon = '🛠️';
        if (it.type === 'USER_INPUT') {
          title = 'Mensaje del Operator';
          actIcon = '👤';
        } else if (it.tool_calls && it.tool_calls[0]) {
          const tc = it.tool_calls[0];
          title = sanitizeTelemetryText(tc.args?.toolAction?.replace(/"/g, '') || tc.args?.toolSummary?.replace(/"/g, '') || tc.name);
          actIcon = tc.name === 'run_command' ? '💻' : tc.name === 'view_file' ? '🔍' : (tc.name.includes('write') || tc.name.includes('replace')) ? '✏️' : '🛠️';
        }
        return {
          step: it.step_index,
          type: it.type,
          time: it.created_at,
          action: title,
          icon: actIcon
        };
      })
    };
  } catch (err) {
    return null;
  }
}

function detectEnvironmentAgents(): string[] {
  const detected: string[] = [];
  const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
  const repoRoot = path.resolve(__dirname, '..');

  // 1. Antigravity: ~/.gemini/antigravity or AGY environment
  const agyBrain = path.join(home, '.gemini', 'antigravity');
  if (fs.existsSync(agyBrain) || process.env.ANTIGRAVITY || process.env.AGY_VERSION) {
    detected.push('antigravity');
  }

  // 2. OpenCode: opencode.json in repo or ~/.opencode
  const opencodeJson = path.join(repoRoot, 'opencode.json');
  const opencodeHome = path.join(home, '.opencode');
  if (fs.existsSync(opencodeJson) || fs.existsSync(opencodeHome)) {
    detected.push('opencode');
  }

  // 3. Claude Code: CLAUDE.md in repo or ~/.claude
  const claudeMd = path.join(repoRoot, 'CLAUDE.md');
  const claudeHome = path.join(home, '.claude');
  if (fs.existsSync(claudeMd) || fs.existsSync(claudeHome)) {
    detected.push('claude-code');
  }

  // 4. Cursor: .cursorrules or .cursor in repo or home
  const cursorRules = path.join(repoRoot, '.cursorrules');
  const cursorDir = path.join(repoRoot, '.cursor');
  if (fs.existsSync(cursorRules) || fs.existsSync(cursorDir)) {
    detected.push('cursor');
  }

  // 5. Codex: CODEX.md or .codex
  const codexMd = path.join(repoRoot, 'CODEX.md');
  const codexDir = path.join(repoRoot, '.codex');
  if (fs.existsSync(codexMd) || fs.existsSync(codexDir)) {
    detected.push('codex');
  }

  // 6. Windsurf: .windsurfrules or .codeium
  const windsurfRules = path.join(repoRoot, '.windsurfrules');
  const codeiumHome = path.join(home, '.codeium');
  if (fs.existsSync(windsurfRules) || fs.existsSync(codeiumHome)) {
    detected.push('windsurf');
  }

  // 7. Custom agent engine is always supported
  detected.push('custom');

  return detected;
}

function tobiTestsBridgePlugin(): Plugin {
  return {
    name: 'tobitests-bridge',
    configureServer(server) {
      const stateFilePath = path.resolve(__dirname, './src/data/tobi-state.json');
      const publicLivePath = path.resolve(__dirname, './public/data/antigravity-live.json');
      const sseClients = new Set<any>();

      // Helper to merge live transcript status with Shared Blackboard state
      const getMergedLivePayload = () => {
        const live = getAntigravityLiveStatus();
        let existingBlackboard: Record<string, any> = {};
        try {
          if (fs.existsSync(publicLivePath)) {
            const parsed = JSON.parse(fs.readFileSync(publicLivePath, 'utf8'));
            if (parsed && typeof parsed === 'object') {
              existingBlackboard = {
                blackboardState: parsed.blackboardState,
                activeOrchestrator: parsed.activeOrchestrator,
                handoffReady: parsed.handoffReady,
                currentPipelineStep: parsed.currentPipelineStep,
                pipelineStepName: parsed.pipelineStepName,
                activeProject: parsed.activeProject,
                auditScope: parsed.auditScope,
                orchestrationConfig: parsed.orchestrationConfig,
                agentStates: parsed.agentStates,
              };
            }
          }
        } catch (e) {}

        const defaultState = live?.isWorking ? 'exploring' : 'idle';
        const detected = detectEnvironmentAgents();
        let existingOrchestration = existingBlackboard.orchestrationConfig;
        if (!existingOrchestration || typeof existingOrchestration !== 'object') {
          existingOrchestration = {
            mode: 'dual',
            primaryAgent: existingBlackboard.activeOrchestrator || 'antigravity',
            secondaryAgent: 'opencode',
            detectedAgents: detected,
          };
        } else {
          existingOrchestration = {
            ...existingOrchestration,
            detectedAgents: detected,
          };
        }

        return {
          ...(live || {}),
          conversationId: 'local-agent-session',
          blackboardState: existingBlackboard.blackboardState || defaultState,
          activeOrchestrator: existingOrchestration.primaryAgent || existingBlackboard.activeOrchestrator || 'antigravity',
          handoffReady: existingBlackboard.handoffReady ?? false,
          currentPipelineStep: existingBlackboard.currentPipelineStep || 1,
          pipelineStepName: existingBlackboard.pipelineStepName || 'Bootstrap & Port/Stack Discovery',
          activeProject: existingBlackboard.activeProject || 'tobitests',
          auditScope: existingBlackboard.auditScope || 'fullstack',
          orchestrationConfig: existingOrchestration,
          agentStates: existingBlackboard.agentStates || {
            orchestrator: live?.isWorking ? 'working' : 'idle',
            explorer: 'standby',
            telemetry: 'standby',
            writer: 'standby',
            opencode: 'standby',
          },
        };
      };

      // Periodically sync live Antigravity telemetry to SSE clients
      const liveInterval = setInterval(() => {
        try {
          const merged = getMergedLivePayload();
          if (merged) {
            sseClients.forEach((client) => {
              try {
                client.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: merged })}\n\n`);
              } catch (e) {}
            });
          }
        } catch (e) {}
      }, 1200);

      server.httpServer?.on('close', () => clearInterval(liveInterval));

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/antigravity/live' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          const merged = getMergedLivePayload();
          res.end(JSON.stringify(merged || { error: 'No live telemetry' }));
          return;
        }

        if (req.url === '/api/antigravity/scope' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const nextScope = payload.auditScope || 'fullstack';
              const nextProj = payload.project || undefined;
              const current = getMergedLivePayload() || {};
              const updated = {
                ...current,
                ...(nextProj ? { activeProject: nextProj } : {}),
                auditScope: nextScope,
              };
              fs.writeFileSync(publicLivePath, JSON.stringify(updated, null, 2), 'utf8');
              sseClients.forEach((client) => {
                try {
                  client.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: updated })}\n\n`);
                } catch (e) {}
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, auditScope: nextScope }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/antigravity/orchestration' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const current = getMergedLivePayload() || {};
              const detected = detectEnvironmentAgents();
              const updatedConfig = {
                mode: payload.mode || current.orchestrationConfig?.mode || 'dual',
                primaryAgent: payload.primaryAgent || current.orchestrationConfig?.primaryAgent || 'antigravity',
                secondaryAgent: payload.mode === 'single' ? null : (payload.secondaryAgent ?? current.orchestrationConfig?.secondaryAgent ?? 'opencode'),
                detectedAgents: detected,
              };
              const updated = {
                ...current,
                activeOrchestrator: updatedConfig.primaryAgent,
                orchestrationConfig: updatedConfig,
              };
              fs.writeFileSync(publicLivePath, JSON.stringify(updated, null, 2), 'utf8');
              sseClients.forEach((client) => {
                try {
                  client.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: updated })}\n\n`);
                } catch (e) {}
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, orchestrationConfig: updatedConfig }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/audit/trigger' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const proj = payload.project || 'tobitests';
              const targetUrl = payload.url || 'http://localhost:5173';
              const repo = payload.repoPath || '.';
              const scope = payload.auditScope || 'fullstack';

              // 1. Immediately wake up all agents on the blackboard
              const current = getMergedLivePayload() || {};
              const exploringState = {
                ...current,
                blackboardState: 'exploring',
                isWorking: true,
                activeProject: proj,
                auditScope: scope,
                currentPipelineStep: 1,
                pipelineStepName: 'Bootstrap & Port/Stack Discovery',
                agentStates: {
                  orchestrator: 'working',
                  explorer: 'working',
                  telemetry: 'working',
                  writer: 'working',
                  opencode: 'working',
                },
              };
              fs.writeFileSync(publicLivePath, JSON.stringify(exploringState, null, 2), 'utf8');
              sseClients.forEach((client) => {
                try {
                  client.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: exploringState })}\n\n`);
                } catch (e) {}
              });

              // 2. Universal Agent Execution: Synthesize Specs & Run Playwright
              const repoRoot = path.resolve(__dirname, '..');
              const specFile = `specs/${proj}.spec.ts`;
              const customSpecFile = `specs/custom-${proj}.spec.ts`;
              let specTarget: string | null = null;

              if (proj !== 'tobitests') {
                if (fs.existsSync(path.resolve(repoRoot, customSpecFile))) {
                  specTarget = customSpecFile;
                } else if (fs.existsSync(path.resolve(repoRoot, specFile))) {
                  specTarget = specFile;
                }
              }

              const broadcastUpdate = () => {
                const projStateFile = path.resolve(__dirname, `./public/data/${proj}-state.json`);
                if (fs.existsSync(projStateFile)) {
                  try {
                    const updatedPayload = JSON.parse(fs.readFileSync(projStateFile, 'utf8'));
                    sseClients.forEach((client) => {
                      try {
                        client.write(`data: ${JSON.stringify({ type: 'UPDATE', payload: updatedPayload })}\n\n`);
                      } catch (e) {}
                    });
                  } catch (e) {}
                }

                const finalBlackboard = {
                  ...exploringState,
                  blackboardState: 'standup_meeting',
                  currentPipelineStep: 8,
                  pipelineStepName: 'Final Gherkin Report & Selector Self-Healing',
                  handoffReady: true,
                  agentStates: {
                    orchestrator: 'idle',
                    explorer: 'idle',
                    telemetry: 'idle',
                    writer: 'idle',
                    opencode: 'idle',
                  },
                };
                fs.writeFileSync(publicLivePath, JSON.stringify(finalBlackboard, null, 2), 'utf8');
                sseClients.forEach((client) => {
                  try {
                    client.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: finalBlackboard })}\n\n`);
                  } catch (e) {}
                });
              };

              const executePlaywright = (targetSpec: string | null) => {
                const ingestArgs = [
                  'scripts/ingest_playwright_results.py',
                  '--project', proj,
                  '--run-playwright',
                  ...(targetSpec ? ['--spec', targetSpec] : []),
                  '--scope', scope,
                ];
                const pwProc = spawn('python', ingestArgs, { cwd: repoRoot, stdio: 'pipe' });
                pwProc.on('close', () => {
                  broadcastUpdate();
                });
              };

              if (proj === 'tobitests') {
                executePlaywright(null);
              } else if (specTarget) {
                executePlaywright(specTarget);
              } else {
                // Synthesize PRD, Matrix, and physical specs/<proj>.spec.ts via Steps 1-5 first, then run Playwright
                const initArgs = [
                  'scripts/tobitests_cli.py',
                  '--project', proj,
                  '--repo', repo,
                  '--url', targetUrl,
                  '--scope', scope,
                  '--status', 'exploring',
                  '--step', '1',
                ];
                const initProc = spawn('python', initArgs, { cwd: repoRoot, stdio: 'pipe' });
                initProc.on('close', () => {
                  const createdSpec = `specs/${proj}.spec.ts`;
                  const resolvedCreated = fs.existsSync(path.resolve(repoRoot, createdSpec)) ? createdSpec : null;
                  executePlaywright(resolvedCreated);
                });
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, status: 'started', project: proj }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/stream') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });
          sseClients.add(res);
          req.on('close', () => sseClients.delete(res));
          try {
            const raw = fs.readFileSync(stateFilePath, 'utf8');
            res.write(`data: ${JSON.stringify({ type: 'INIT', payload: JSON.parse(raw) })}\n\n`);
            const live = getAntigravityLiveStatus();
            if (live) {
              res.write(`data: ${JSON.stringify({ type: 'ANTIGRAVITY_LIVE', payload: live })}\n\n`);
            }
          } catch (e) {}
          return;
        }

        if (req.url?.startsWith('/api/state') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const projParam = urlObj.searchParams.get('project');
            const targetStateFile = projParam && projParam !== 'tobitests' && projParam !== 'tobi'
              ? path.resolve(__dirname, `./public/data/${projParam}-state.json`)
              : stateFilePath;

            if (fs.existsSync(targetStateFile)) {
              const raw = fs.readFileSync(targetStateFile, 'utf8');
              res.end(raw);
            } else {
              const raw = fs.readFileSync(stateFilePath, 'utf8');
              res.end(raw);
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }

        if (req.url === '/api/state' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              fs.writeFileSync(stateFilePath, body, 'utf8');
              try {
                fs.writeFileSync(path.resolve(__dirname, './public/data/tobi-state.json'), body, 'utf8');
              } catch (e) {}
              const parsed = JSON.parse(body);
              sseClients.forEach(client => {
                client.write(`data: ${JSON.stringify({ type: 'UPDATE', payload: parsed })}\n\n`);
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/detect-local-ports' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');

          const commonPorts = [5173, 3000, 8080, 8000, 4173, 4200, 5000];
          const checks = commonPorts.map((p) => {
            return new Promise<{ port: number; active: boolean }>((resolve) => {
              const socket = new net.Socket();
              socket.setTimeout(350);
              socket.on('connect', () => {
                socket.destroy();
                resolve({ port: p, active: true });
              });
              socket.on('timeout', () => {
                socket.destroy();
                resolve({ port: p, active: false });
              });
              socket.on('error', () => {
                resolve({ port: p, active: false });
              });
              socket.connect(p, '127.0.0.1');
            });
          });

          Promise.all(checks).then((results) => {
            const active = results.filter((r) => r.active).map((r) => r.port);
            res.end(JSON.stringify({ activePorts: active }));
          });
          return;
        }

        next();
      });
    }
  };
}

function isPortAvailable(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function resolveDevPort(preferred: number, host = '127.0.0.1'): Promise<number> {
  for (let i = 0; i < 25; i++) {
    const target = preferred + i;
    if (await isPortAvailable(target, host)) {
      if (i > 0) {
        console.log(`\n\x1b[33m[TobiTests Port Guard]\x1b[0m Puerto ${preferred} en uso por otra aplicación. Cambiando automáticamente a http://localhost:${target} para evitar colisión.\n`);
      }
      return target;
    }
  }
  return preferred;
}

// Vite config — https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'
  const preferredPort = parseInt(process.env.PORT || '5180', 10)
  const resolvedPort = await resolveDevPort(preferredPort)

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      tobiTestsBridgePlugin(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: resolvedPort,
      strictPort: false,
      watch: {
        ignored: [
          '**/.figma/**',
        ],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: resolvedPort,
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  // Imported HTML keeps its own favicon; new Makes default to the Make product icon.
  const favicon = config.icons?.icon ?? '/favicon.svg'
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  type ModuleNode = import('vite').ModuleNode
  const hadRefreshBoundary = new Map<string, boolean>()
  const lostRefreshBoundaries = new Set<string>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    handleHotUpdate({ modules, server, timestamp }) {
      if (lostRefreshBoundaries.size === 0) return

      const visited = new Set<ModuleNode>()
      const pending = [...modules]
      while (pending.length > 0) {
        const current = pending.pop()
        if (!current || visited.has(current)) continue
        visited.add(current)

        const moduleId = current.id?.split('?')[0]
        if (moduleId && lostRefreshBoundaries.has(moduleId)) {
          const invalidated = new Set<ModuleNode>()
          for (const updatedModule of modules) {
            server.moduleGraph.invalidateModule(updatedModule, invalidated, timestamp, true)
          }
          sendFullReload?.()
          return []
        }

        pending.push(...current.importers)
      }
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (hasRefreshBoundary) lostRefreshBoundaries.delete(moduleId)
      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        lostRefreshBoundaries.add(moduleId)
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}
