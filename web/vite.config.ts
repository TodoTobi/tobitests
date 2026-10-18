import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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
                agentStates: parsed.agentStates,
              };
            }
          }
        } catch (e) {}

        const defaultState = live?.isWorking ? 'exploring' : 'idle';
        return {
          ...(live || {}),
          conversationId: 'local-agent-session',
          blackboardState: existingBlackboard.blackboardState || defaultState,
          activeOrchestrator: existingBlackboard.activeOrchestrator || 'antigravity',
          handoffReady: existingBlackboard.handoffReady ?? false,
          currentPipelineStep: existingBlackboard.currentPipelineStep || 1,
          pipelineStepName: existingBlackboard.pipelineStepName || 'Bootstrap & Port/Stack Discovery',
          activeProject: existingBlackboard.activeProject || 'tobitests',
          auditScope: existingBlackboard.auditScope || 'fullstack',
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

        if (req.url === '/api/state' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const raw = fs.readFileSync(stateFilePath, 'utf8');
            res.end(raw);
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

        next();
      });
    }
  };
}

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

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
      port: parseInt(process.env.PORT || '5173'),
      strictPort: false,
      watch: {
        ignored: [
          '**/.figma/**',
        ],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '5173'),
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
