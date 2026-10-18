# Master Bug Report — VetConnect
Generado automáticamente por TobiTests (Multi-Agent E2E Framework)
Fecha: 17/10/2026, 07:00:36

---
### 1. [BUG-01] Inconsistencia al cancelar consulta entre Mensajes y Mascotas
* **Severidad:** High
* **Estado:** Confirmed
* **Sección:** Mensajes / Consultas
* **Agente Detector:** Telemetry Auditor
* **Ejecución Asociada:** #RUN-01

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas, sección: Mensajes / Consultas).

Pasos para reproducir:
Dado que el operador tiene una consulta activa ('En curso' o 'Pendiente') registrada para una mascota.
Cuando el operador accede a la sección 'Agenda' (/client/appointments) o 'Mensajes' y cancela el turno activo.
Entonces la mutación cancela el turno en backend pero al navegar a 'Mis mascotas' (/client/pets), el badge de próximo turno sigue mostrando erróneamente el turno cancelado en lugar de 'Sin turno próximo'.

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: web/src/pages/ClientApp.tsx:1243
  - Capa Hooks/Estado: Validación y sincronización de estado reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [web/src/pages/ClientApp.tsx]
  2. ARCHIVOS FUERA DEL ALCANCE: [web/src/context/AuthContext.tsx, web/src/routes/ProtectedRoute.tsx, web/src/services/api.ts]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: Agregar queryClient.invalidateQueries({ queryKey: ['pets', 'mine'] }) dentro del handler onSuccess de cancelMutation en AppointmentsPage.
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: `bugfix/cerco-bug-01`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto

---
### 2. [BUG-02] Desfase de Matrícula Profesional en Ficha del Veterinario vs Modal de Receta Digital
* **Severidad:** Medium
* **Estado:** Confirmed
* **Sección:** Prescripciones / Portal Médico
* **Agente Detector:** Clinical Auditor
* **Ejecución Asociada:** #RUN-01

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (BUG-02: Desfase de Matrícula Profesional en Ficha del Veterinario vs Modal de Receta Digital, sección: Prescripciones / Portal Médico).

Pasos para reproducir:
Dado que el veterinario autenticado tiene configurada su matrícula profesional en su perfil (licenseNumber).
Cuando el profesional emite una receta desde PrescriptionModal o abre la vista previa en PrescriptionDoc.tsx.
Entonces el documento renderiza el valor por defecto 'MP-Oficial' en lugar de resolver la matrícula real registrada en prescription.vet.licenseNumber cuando el objeto vet no llega hidratado.

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: web/src/components/ui/PrescriptionDoc.tsx:26
  - Capa Hooks/Estado: Validación y sincronización de estado reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [web/src/components/ui/PrescriptionDoc.tsx, web/src/components/ui/PrescriptionModal.tsx]
  2. ARCHIVOS FUERA DEL ALCANCE: [web/src/context/AuthContext.tsx, web/src/vet/Prescriptions.tsx]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: Permitir recibir fallbackLicense como prop o resolver desde user.licenseNumber antes de caer en el fallback estático 'MP-Oficial'.
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: `bugfix/cerco-bug-02`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto

---
### 3. [BUG-03] Falla en Reintento de Conexión LiveKit SFU ante micro-desconexión de red
* **Severidad:** High
* **Estado:** Confirmed
* **Sección:** Telemedicina / Sala de Video
* **Agente Detector:** Telemetry Auditor
* **Ejecución Asociada:** #RUN-01

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (BUG-03: Falla en Reintento de Conexión LiveKit SFU ante micro-desconexión de red, sección: Telemedicina / Sala de Video).

Pasos para reproducir:
Dado que el tutor y el doctor se encuentran en una videoconsulta activa con LiveKitRoom en CallRoom.tsx.
Cuando la conexión de red sufre un microcorte transitorio o renegociación de token WebSocket.
Entonces la sala ejecuta onDisconnected disparando inmediatamente handleFinalize(), finalizando abruptamente la llamada en vez de entrar en estado 'reconnecting' y esperar reconexión del SFU.

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: web/src/vet/CallRoom.tsx:651
  - Capa Hooks/Estado: Validación y sincronización de estado reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [web/src/vet/CallRoom.tsx]
  2. ARCHIVOS FUERA DEL ALCANCE: [web/src/context/AuthContext.tsx, web/src/services/api.ts]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: Evaluar el motivo de desconexión o temporizar 5 segundos en estado 'reconnecting' antes de invocar handleFinalize() irrevocablemente.
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: `bugfix/cerco-bug-03`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto

---
### 4. [BUG-04] Falta de persistencia en filtro de estado de consultas en Portal Veterinario
* **Severidad:** Low
* **Estado:** Confirmed
* **Sección:** Triaje / Sala de Consultas
* **Agente Detector:** Clinical Auditor
* **Ejecución Asociada:** #RUN-01

#### 1. Esquema de Plantilla Estandarizado (Gherkin/BDD):
Nombre y sección (BUG-04: Falta de persistencia en filtro de estado de consultas en Portal Veterinario, sección: Triaje / Sala de Consultas).

Pasos para reproducir:
Dado que el veterinario filtra las consultas en '/vet/consultations' seleccionando la pestaña 'Activas' o una especie particular.
Cuando hace clic en 'Ver consulta' (/vet/consultations/:id) y luego presiona 'Volver a la consulta' o el botón del navegador.
Entonces el selector de pestañas se reinicia a 'Próximas' y los filtros de especie vuelven a 'Todas', perdiendo el contexto de trabajo del profesional.

#### 2. Protocolo de Cerco de Seguridad & Quirófano Anti-Regresiones:
* **Fase 1 (Aislamiento en Capas):**
  - Capa UI/Vista: web/src/vet/Consultations.tsx:11
  - Capa Hooks/Estado: Validación y sincronización de estado reactivo
  - Capa Red/Request: Verificado con DevTools CDP y Playwright MCP
  - Capa Backend/API: Contratos de eventos preservados
  - Capa Base de Datos / Persistencia: Estado sincronizado con el modelo de datos
* **Fase 2 (Cerco de Seguridad - Plan Mode):**
  1. ARCHIVOS DENTRO DEL ALCANCE: [web/src/vet/Consultations.tsx]
  2. ARCHIVOS FUERA DEL ALCANCE: [web/src/vet/CallRoom.tsx, web/src/vet/Patients.tsx]
  3. EVALUACIÓN DE RIESGOS: Mitigación de regresiones con parámetros opcionales y retrocompatibilidad
  4. ESTRATEGIA DE FIX: Leer y sincronizar el tab activo con searchParams o sessionStorage para mantener la selección al regresar de la ficha del paciente.
* **Fase 3 (Análisis de Impacto Global):**
  - Mapeo de referencias y preservación de firmas públicas
* **Fase 4 (El Quirófano):**
  - Rama: `bugfix/cerco-bug-04`
  - Minimal fix verificado
* **Fase 5 (Validación):**
  - Testing de tres capas y typechecking estricto

