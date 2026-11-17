# Guía de Grabación con Recordly — TobiTests 🎬

Esta guía detalla el paso a paso exacto para capturar una demostración visual de **60 segundos** de **TobiTests** auditando una aplicación real (**VetConnect / Huellicam**) utilizando la herramienta de captura **Recordly** (o ScreenToGif / OBS / CleanShot).

El objetivo es generar un artefacto de alta fidelidad (`docs/assets/tobitests-demo.gif`) optimizado para renderizar de forma instantánea en el `README.md` de GitHub sin superar el límite recomendado de **5 MB**.

---

## 1. Configuración Previa (Pre-Recording Setup)

Antes de abrir Recordly, asegurate de tener ambos entornos levantados y sincronizados en local:

### Terminal 1: Servidor de la Aplicación bajo Prueba (VetConnect)
VetConnect debe estar ejecutándose en su puerto habitual (`http://localhost:5173`):
```powershell
# Desde el directorio de VetConnect
cd C:\Users\usuario\Documents\VetConnect
npm run dev
```
> **Verificación:** Abrí `http://localhost:5173` en Chrome/Brave y comprobá que la landing de VetConnect cargue correctamente.

### Terminal 2: Dashboard Visual de TobiTests
Levantá el portal de observabilidad de TobiTests (`web/` en `http://localhost:5180`):
```powershell
# Desde el directorio de tobitests
cd C:\Users\usuario\Documents\tobitests
npm run dev:web
```
> **Verificación:** Abrí `http://localhost:5180` y confirmá que renderice el Journey Map, la barra de herramientas y la vista de "La Oficina".

### Terminal 3: Lista para disparar el CLI de TobiTests
Tené lista una terminal de PowerShell en `C:\Users\usuario\Documents\tobitests` con el comando CLI listo para ejecutar (sin presionar Enter todavía):
```powershell
python scripts/tobitests_cli.py --project vetconnect --url http://localhost:5173 --run-pipeline
```

---

## 2. Configuración de Recordly (Settings)

Para que el GIF mantenga nitidez en tipografías y no genere saltos de compresión:

* **Modo de Captura:** **Window Capture (Captura de Ventana)** o **Área Fija** seleccionando la ventana del navegador. *Evitá captura de pantalla completa (Full Screen)* para evitar mostrar la barra de tareas de Windows, notificaciones o pestañas no deseadas.
* **Resolución Recomendada:** 
  - Resolución de grabación: **1280 x 720 px (720p)** o **1440 x 810 px (16:9)**.
  - Si tu monitor es 1080p o 4K, reducí la ventana del navegador al 75% o 80% de zoom para que el texto y los nodos del Journey Canvas se lean perfectamente.
* **Tasa de Cuadros (FPS):** **15 a 20 FPS** (es el balance ideal entre fluidez y peso liviano para GIFs de GitHub).
* **Formato de Exportación:** 
  - **GIF** (prioridad para `README.md`): Paleta optimizada con dithering suave (NeuQuant / Octree).
  - **MP4 (H.264)**: Opcional como respaldo en video de alta calidad.
* **Duración Objetivo:** **60 segundos exactos** (Storyline comprimida).

---

## 3. Guion de Grabación Segundo a Segundo (Storyline)

Seguí este guion cronometrado para contar la historia técnica completa en 1 minuto:

| Tiempo | Qué Mostrar en Pantalla | Acción del Operador |
| :--- | :--- | :--- |
| **00:00 – 00:10** | **Dashboard Visual (Journey Canvas)** | Mostrá la pantalla de `http://localhost:5180`. Pasá el mouse sobre 2 nodos del mapa de rutas (`/login`, `/client/appointments`) mostrando los conteos de tests y las conexiones en curva Bezier. |
| **00:10 – 00:20** | **La Oficina 2.5D (Agent Office)** | Hacé clic en la pestaña **"La Oficina"**. Mostrá a los agentes simulados (Antigravity, Explorer QA, Telemetry Auditor, Spec Writer) trabajando en sus escritorios con el estado del Blackboard en vivo. |
| **00:20 – 00:35** | **Disparo del Pipeline Autónomo** | Alterná a la terminal de PowerShell (split screen o superpuesta) y ejecutá:<br>`python scripts/tobitests_cli.py --project vetconnect --url http://localhost:5173 --run-pipeline`<br>Mostrá el avance de las 8 fases (Bootstrap -> PRD -> Matrix -> Specs -> Playwright -> Triaje 3-Layer Oracle). |
| **00:35 – 00:50** | **Actualización Reactiva & Ficha de Bug** | Volvé al navegador. El dashboard se actualiza automáticamente. Entrá al **Bug Tracker** y hacé clic en **`[BUG-01] Inconsistencia al cancelar consulta entre Mensajes y Mascotas`**. Mostrá la tarjeta Gherkin (*Dado que... Cuando... Entonces...*) y la causa raíz en `web/src/pages/ClientApp.tsx:1243`. |
| **00:50 – 01:00** | **Reproducción de Evidencia & Protocolo Quirófano** | Mostrá la reproducción del video `.webm` integrado dentro del modal de detalle de bug (`TestDetailModal`) y el botón para copiar el prompt de **Cerco de Seguridad / Quirófano Anti-Regresiones**. |

---

## 4. Guardado y Reemplazo del Archivo

Una vez finalizada la grabación y exportación en Recordly:

1. **Ruta destino del archivo:**
   Guardá o mové el GIF a la ruta exacta del repositorio:
   ```
   C:\Users\usuario\Documents\tobitests\docs\assets\tobitests-demo.gif
   ```
2. **Control de Peso:**
   - Comprobá que el archivo pese **menos de 5 MB** (el actual pesa ~3.76 MB).
   - Si pesa más de 5 MB, podés optimizarlo con `gifsicle` o ffmpeg:
     ```powershell
     # Optimización con ffmpeg si está instalado
     ffmpeg -i docs/assets/tobitests-demo.gif -vf "fps=15,scale=1080:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" docs/assets/tobitests-demo-opt.gif
     Move-Item -Force docs/assets/tobitests-demo-opt.gif docs/assets/tobitests-demo.gif
     ```

---

## 5. Actualización de Enlaces en la Documentación

Si conservás el nombre `tobitests-demo.gif`, **no hace falta modificar ningún link**, ya que todos los archivos `README` ya apuntan a esa ruta:

- `README.md` (línea 46): `![TobiTests Demo — Visual QA & Huellicam (workspaces/vetconnect) audit](docs/assets/tobitests-demo.gif)`
- `README.es.md` (línea 46): `![TobiTests Demo — Visual QA & Huellicam (workspaces/vetconnect) audit](docs/assets/tobitests-demo.gif)`
- `README.pt.md` (línea 46): `![TobiTests Demo — Visual QA & Huellicam (workspaces/vetconnect) audit](docs/assets/tobitests-demo.gif)`
- `README.zh.md` (línea 46): `![TobiTests Demo — Visual QA & Huellicam (workspaces/vetconnect) audit](docs/assets/tobitests-demo.gif)`

Si decidís exportar un video MP4 complementario (`docs/assets/tobitests-demo.mp4`), podés agregar un hipervínculo en el bloque de tip de cada README:
```markdown
> 🎥 **¿Preferís video en alta resolución?** [Ver demo en MP4 (1080p)](./docs/assets/tobitests-demo.mp4)
```

---

## 6. Checklist de Validación Final

- [ ] VetConnect y TobiTests Web levantados sin errores 500 en consola.
- [ ] Grabación realizada en ventana limpia (sin marcadores personales ni extensiones visibles).
- [ ] Duración de la demo entre 50 y 65 segundos.
- [ ] BUG-01 de VetConnect legible con su causa raíz (`ClientApp.tsx:1243`).
- [ ] Archivo guardado en `docs/assets/tobitests-demo.gif` con peso < 5 MB.
- [ ] Commit y push sincronizados con `TodoTobi/tobitests`.
