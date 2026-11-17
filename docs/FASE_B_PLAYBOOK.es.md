# Playbook de Ejecución — Fase B (TobiTests) 🚀

Este documento es el **manual operativo paso a paso para el usuario humano** para ejecutar la **Fase B** del lanzamiento de **TobiTests** y la postulación al programa **Claude for Open Source**.

Toda la preparación técnica, código, tests, CI, releases y borradores (Fase A y M3) ya están completados y validados. Las tareas de este playbook son exclusivamente aquellas que requieren interacción manual con interfaces de usuario, credenciales personales secretas o publicación en plataformas externas.

---

## Índice de Tareas de Fase B

1. [Paso 1: Configuración Visual del Perfil de GitHub (@TodoTobi)](#paso-1-configuración-visual-del-perfil-de-github-todotobi)
2. [Paso 2: Publicación Oficial del Paquete en PyPI](#paso-2-publicación-oficial-del-paquete-en-pypi)
3. [Paso 3: Grabación y Reemplazo del GIF Demo con Recordly](#paso-3-grabación-y-reemplazo-del-gif-demo-con-recordly)
4. [Paso 4: Calendario de Publicación Escalonada (Launch Sequence)](#paso-4-calendario-de-publicación-escalonada-launch-sequence)
5. [Paso 5: Apertura del Pull Request en `awesome-mcp-servers`](#paso-5-apertura-del-pull-request-en-awesome-mcp-servers)
6. [Paso 6: Postulación al Programa Claude for Open Source (Anthropic)](#paso-6-postulación-al-programa-claude-for-open-source-anthropic)

---

## Paso 1: Configuración Visual del Perfil de GitHub (@TodoTobi)

El token de `gh CLI` disponible en tu entorno local posee alcances (`gist`, `read:org`, `repo`, `workflow`), pero **no tiene el alcance `user`** necesario para modificar la biografía por CLI, y GitHub no expone una API pública para fijar repositorios (pinning). Por lo tanto, estos dos ajustes se realizan en **menos de 2 minutos** desde la interfaz web de GitHub:

### 1.1 Actualizar la Biografía Pública
1. Iniciá sesión en [GitHub](https://github.com).
2. Dirigite a **Settings > Public profile**: [https://github.com/settings/profile](https://github.com/settings/profile).
3. En el campo **Bio**, ingresá el siguiente texto (optimizado para posicionamiento profesional en OSS e IA):
   ```text
   Creator of TobiTests · Local-first autonomous multi-agent E2E QA & visual telemetry framework with native MCP server · Full-Stack & AI Systems
   ```
4. Verificá que en **Social accounts** o **URL** figure tu perfil de LinkedIn o sitio personal.
5. Hacé clic en el botón verde **"Update profile"** al final de la página.

### 1.2 Fijar el Repositorio `tobitests` (Pinning)
1. Navegá a la página principal de tu perfil público: [https://github.com/TodoTobi](https://github.com/TodoTobi).
2. En la sección **Pinned** (debajo de la biografía), hacé clic en el enlace **"Customize your pins"** (o **"Edit pins"** si ya tenés repositorios fijados).
3. En el buscador emergente, escribí `tobitests`.
4. Marcá la casilla de verificación junto a **`tobitests`** y asegurate de ubicarlo en la **primera posición**.
5. Hacé clic en **"Save pins"**.
> **Resultado:** Al ingresar a `github.com/TodoTobi`, cualquier evaluador o visitante verá `tobitests` como tu proyecto insignia destacado.

---

## Paso 2: Publicación Oficial del Paquete en PyPI

Los artefactos ya fueron compilados y validados localmente en el directorio `dist/`:
- `dist/tobitests-1.0.0-py3-none-any.whl`
- `dist/tobitests-1.0.0.tar.gz`

### 2.1 Requisitos Previos en PyPI
1. Si aún no tenés cuenta, registrate en [https://pypi.org/account/register/](https://pypi.org/account/register/).
2. Activá Two-Factor Authentication (2FA) en PyPI (requerido obligatoriamente por PyPI).
3. Creá un **API Token**:
   - Andá a **Account settings > API tokens**: [https://pypi.org/manage/account/token/](https://pypi.org/manage/account/token/).
   - Nombre del token: `tobitests-release`.
   - Scope: `Entire account (all projects)` (o restringido a `tobitests` si el proyecto ya fue reservado).
   - Copiá el token generado (comienza con `pypi-...`).

### 2.2 Opcional: Configurar `~/.pypirc` para no tipear credenciales
Podés crear un archivo en tu carpeta de usuario (`C:\Users\usuario\.pypirc`):
```ini
[distutils]
index-servers =
    pypi

[pypi]
username = __token__
password = pypi-TU_TOKEN_COMPLETO_AQUI
```

### 2.3 Subida con Twine
Abrí una terminal de PowerShell en `C:\Users\usuario\Documents\tobitests`:
```powershell
# 1. Instalar o actualizar twine
pip install --upgrade twine

# 2. Validar que la metadata del paquete sea 100% válida
twine check dist/*

# 3. Subir el paquete a PyPI
twine upload dist/*
```
*Si no configuraste `.pypirc`*, Twine te pedirá:
- **Username:** `__token__`
- **Password:** Pegá tu API token `pypi-...` (el texto no se mostrará por seguridad).

### 2.4 Verificación de la Instalación Pública
Una vez finalizada la subida, verificá en una consola limpia:
```powershell
pip install tobitests
tobitests --help
tobitests-mcp --help
```
Confirmá que ambos comandos salgan con código 0 y muestren las opciones esperadas.

---

## Paso 3: Grabación y Reemplazo del GIF Demo con Recordly

El repositorio ya cuenta con una versión funcional de `docs/assets/tobitests-demo.gif` (3.76 MB). Si deseás regrabarla para capturar la última versión de la interfaz y del flujo de VetConnect:

1. Seguí al pie de la letra la guía detallada en:
   ```
   docs/RECORDLY_GUIDE.es.md
   ```
2. Asegurate de mostrar:
   - Dashboard en `http://localhost:5180`.
   - La Oficina 2.5D con los agentes en standup.
   - La terminal ejecutando `python scripts/tobitests_cli.py --project vetconnect --url http://localhost:5173 --run-pipeline`.
   - La tarjeta de **BUG-01** (divergencia de estado en citas de VetConnect) con su causa raíz en `web/src/pages/ClientApp.tsx:1243`.
3. Guardá el archivo exportado (< 5 MB) en:
   ```
   C:\Users\usuario\Documents\tobitests\docs\assets\tobitests-demo.gif
   ```
4. Comiteá y pusheá la actualización si hubo cambios:
   ```powershell
   git add docs/assets/tobitests-demo.gif
   git commit -m "docs: refresh 60-second quickstart demo gif"
   git push origin main
   ```

---

## Paso 4: Calendario de Publicación Escalonada (Launch Sequence)

> ⚠️ **REGLA DE ORO DE DIFUSIÓN:**  
> **NUNCA publiques en todos los canales el mismo día ni uses el mismo texto copiado y pegado.** Las plataformas (especialmente Reddit y Hacker News) detectan envíos masivos simultáneos como spam y aplican *shadowbans* algorítmicos.  
> Los borradores en `docs/launch/` fueron redactados específicamente con enfoques técnicos distintos para cada comunidad.

Seguí este cronograma escalonado:

| Día | Plataforma | Archivo de Borrador | Enfoque Principal |
| :--- | :--- | :--- | :--- |
| **Día 1** | **dev.to** | `docs/launch/devto-post.en.md` | Artículo técnico largo (~800 palabras): arquitectura del 3-Layer Oracle, BUG-01 real de VetConnect y llamado a contribuciones. |
| **Día 2 (+24h)** | **Reddit r/Playwright** | `docs/launch/reddit-r-playwright.en.md` | Enfoque en pipelines de testing: cómo se generan specs semánticas con `getByRole`, ejecución aislada y auto-healing de selectores. |
| **Día 3 (+24h)** | **Reddit r/ClaudeAI** | `docs/launch/reddit-r-claudeai.en.md` | Enfoque en MCP: integración de `@playwright/mcp` + `@chromedevtools/chrome-devtools-mcp` + `tobitests-mcp` sin gastar tokens de visión. |
| **Día 4 (+24h)** | **MCP Discord** | `docs/launch/mcp-discord.en.md` | Anuncio de lanzamiento en canales `#projects` o `#show-and-tell` con bloque `.mcp.json` listo para usar. |
| **Día 5 (+24h)** | **Hacker News (Show HN)** | `docs/launch/show-hn.en.md` | Publicación formal en Show HN: título sobrio y directo, enlace al repo y 3 comandos del quickstart. |

---

## Paso 5: Apertura del Pull Request en `awesome-mcp-servers`

Para que la comunidad global de Model Context Protocol descubra TobiTests, debemos listarlo en el catálogo curado más importante (`punkpeye/awesome-mcp-servers`).

El texto exacto del PR y de la entrada ya está listo en:
```
docs/launch/awesome-mcp-servers-pr.en.md
```

### Instrucciones para abrir el PR:
1. En tu navegador, ingresá a [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers).
2. Hacé clic en **"Fork"** en la esquina superior derecha (hacia tu cuenta `@TodoTobi`).
3. En tu fork, creá una nueva rama llamada `add-tobitests`.
4. Abrí el archivo `README.md` y buscá la sección de **Testing** o **Testing / QA**.
5. Insertá la siguiente línea respetando el orden alfabético estricto:
   ```markdown
   - [tobitests](https://github.com/TodoTobi/tobitests) - Autonomous multi-agent E2E QA framework combining Playwright MCP and Chrome DevTools MCP. Generates, runs, and triages Playwright tests with a 3-Layer Bug Detection Oracle. MIT license.
   ```
6. Hacé commit del cambio:
   ```text
   Add tobitests to Testing / QA
   ```
7. Abrí el Pull Request hacia `punkpeye/awesome-mcp-servers:main`.
8. Copiá el título y cuerpo descriptivo provistos en `docs/launch/awesome-mcp-servers-pr.en.md`.

---

## Paso 6: Postulación al Programa Claude for Open Source (Anthropic)

Anthropic ofrece créditos de API y soporte para proyectos de código abierto estratégicos.

- **Formulario de postulación:** [https://claude.com/contact-sales/claude-for-oss](https://claude.com/contact-sales/claude-for-oss)
- **Términos de referencia:** [https://www.anthropic.com/claude-for-oss-terms](https://www.anthropic.com/claude-for-oss-terms)
- **Reporte técnico completo de elegibilidad:** `docs/CLAUDE_FOR_OSS_REPORT.es.md`

### Guía de Llenado Campo por Campo:

1. **First Name / Last Name:** Tus datos personales reales.
2. **Work Email:** Tu correo electrónico principal vinculado a tu cuenta de GitHub (@TodoTobi).
3. **Project Name:** `TobiTests`
4. **Project GitHub URL:** `https://github.com/TodoTobi/tobitests`
5. **Project License:** `MIT License (OSI-approved)`
6. **Your Role in the Project:** `Lead Maintainer & Creator`
7. **Which track are you applying under? (Track de Elegibilidad):**
   - Seleccioná: **Ecosystem Impact Track (Sección 2.2 de los Términos)**.
   - *Por qué:* Como el proyecto acaba de lanzar su versión v1.0.0, aún no alcanza el umbral de 1.000 estrellas de la Sección 2.1 (métrica cuantitativa). La Sección 2.2 prevé explícitamente proyectos con alto valor arquitectónico para el ecosistema de Claude y MCP que impulsan nuevas categorías de herramientas de desarrollo.
8. **Project Description & Ecosystem Impact (Alcance e Impacto):**
   Pegá una síntesis honesta y sólida como la siguiente:
   ```text
   TobiTests (https://github.com/TodoTobi/tobitests) is an open-source, local-first autonomous multi-agent E2E testing framework built natively on Anthropic's Model Context Protocol (MCP).

   Unlike black-box "computer-use" agents that rely on expensive 1080p vision tokens and pixel-coordinate clicking, TobiTests pairs @playwright/mcp and @chromedevtools/chrome-devtools-mcp with a custom orchestrator server (tobitests-mcp). It performs white-box AST route discovery, generates deterministic Playwright specs using accessible locators (getByRole), and uses a 3-Layer Bug Detection Oracle (CDP telemetry + state divergence + Axe-core A11y) to detect real application flaws.

   Status & Traction:
   - Shipped v1.0.0 release with 85 merged PRs, 127 passing test suites, and bilingual docs (EN, ES, PT, ZH).
   - Fully open source under the MIT License.
   - We are applying under the Ecosystem Impact Track (Section 2.2) to demonstrate cutting-edge MCP multi-agent collaboration in developer tooling.
   - Anthropic API credits will be used strictly to fund autonomous multi-agent CI pipelines, regression triage agents, and community testing workflows powered by Claude 3.5 Sonnet.
   ```
9. **How would Claude API credits help your project?**
   ```text
   API credits will power our automated GitHub Actions CI triage bot and community benchmark runner, allowing TobiTests to run continuous multi-agent E2E verification across open-source web repositories using Claude 3.5 Sonnet and MCP tools without financial barriers.
   ```
10. **Aceptación de Términos:** Marcá la casilla aceptando los términos de Claude for Open Source y enviá el formulario.

---

## Checklist de Cierre de Fase B

- [ ] Bio de GitHub actualizada en `@TodoTobi`.
- [ ] Repositorio `tobitests` fijado en la primera posición del perfil público.
- [ ] Paquete `tobitests` publicado en PyPI y verificado con `pip install tobitests`.
- [ ] Demo visual en `docs/assets/tobitests-demo.gif` confirmada.
- [ ] Posts publicados en orden escalonado (dev.to -> r/Playwright -> r/ClaudeAI -> MCP Discord -> Show HN).
- [ ] PR abierto en `punkpeye/awesome-mcp-servers`.
- [ ] Formulario de Claude for Open Source enviado con el encuadre de Ecosystem Impact Track.
