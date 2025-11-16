# Especificación de Funcionalidad: Accionables para Metas e Hitos

## Descripción de la Funcionalidad

Esta funcionalidad introduce el concepto de "Accionables", que son tareas pequeñas y recurrentes diseñadas para ayudar a los usuarios a progresar hacia sus metas e hitos. Esto permitirá a los usuarios desglosar sus objetivos en acciones manejables y repetibles que se pueden seguir en el calendario.

## Conceptos Clave

- **Meta (Goal):** El objetivo principal que el usuario quiere alcanzar.
- **Hito (Milestone):** Un logro significativo y puntual que forma parte de una meta más grande.
- **Accionable (Actionable):** Una tarea pequeña y recurrente que ayuda a completar un hito o una meta directamente.

La jerarquía será: **Meta -> [Hito] -> Accionable**.

## Detalles de Implementación

### 1. Cambios en el Esquema de la Base de Datos (`db/schema.ts`)

Se debe crear una nueva tabla, `goal_actionables`.

- **Nombre de la tabla:** `goal_actionables`
- **Columnas:**
  - `id`: `uuid`, clave primaria, `default gen_random_uuid()`
  - `goalId`: `uuid`, clave foránea a `goals.id` (NO NULO, `onDelete: "cascade"`)
  - `milestoneId`: `uuid`, clave foránea a `goal_milestones.id` (NULO, `onDelete: "set null"`)
  - `title`: `text` (NO NULO)
  - `description`: `text` (NULO)
  - `recurrence`: `text` (NULO). Almacenará una cadena en formato [RRULE](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html) (ej: `FREQ=WEEKLY;BYDAY=MO,WE`).
  - `startDate`: `date` (NULO)
  - `endDate`: `date` (NULO)
  - `createdAt`: `timestamp`, `default now()`
- **Índices:**
  - Índice en `goalId`.
  - Índice en `milestoneId`.

### 2. Endpoints de la API del Backend

Se requerirán nuevos endpoints en la API para gestionar los accionables.

- **`POST /api/goals/{goalId}/actionables`** o **`POST /api/milestones/{milestoneId}/actionables`**
  - Crea un nuevo accionable vinculado a una meta o un hito.
  - El cuerpo de la solicitud contendrá los datos del accionable (`title`, `recurrence`, etc.).

- **`POST /api/goals/{goalId}/generate-actionables`**
  - Toma el título y la descripción de la meta.
  - Llama a un modelo de IA generativa (Gemini) para sugerir una lista de accionables (título y regla de recurrencia).
  - Devuelve las sugerencias al cliente para que el usuario las revise.

- **`GET /api/calendar-events`** (o un endpoint existente similar)
  - Este endpoint debe ser actualizado.
  - Además de las metas y los hitos, ahora debe consultar `goal_actionables`.
  - Para cada accionable con una regla de `recurrence`, debe calcular las ocurrencias de eventos individuales dentro del rango de fechas solicitado y devolverlas para mostrarlas en el calendario.

- **`PUT /api/actionables/{actionableId}`**
  - Actualiza un accionable existente.

- **`DELETE /api/actionables/{actionableId}`**
  - Elimina un accionable.

### 3. Interfaz de Usuario (UI/UX)

- **Ubicación Central:** La gestión de accionables se centrará en la página del calendario (`/dashboard/calendar`).
- **Botón de Acceso:** Se añadirá un botón en la página del calendario (ej. "Crear Accionable").
- **Panel Lateral (Side Panel):**
  - Al hacer clic en este botón, se abrirá un panel lateral en el lado derecho de la pantalla. Este panel será el centro de mando para crear y gestionar accionables.
- **Flujo de Creación en el Panel Lateral:**
  1.  **Selección de Contexto:** El usuario primero seleccionará la **Meta** (y, opcionalmente, el **Hito**) a la que se asociará el accionable.
  2.  **Generación con IA:** Un botón "Generar Plan con IA" utilizará la meta/hito seleccionado para obtener sugerencias de la IA. Las sugerencias se mostrarán en una lista dentro del panel para que el usuario las apruebe, edite o descarte.
  3.  **Creación Manual:** Un formulario permitirá al usuario añadir accionables manualmente, especificando título, descripción y regla de recurrencia.
  4.  **Lista de Accionables:** El panel también mostrará los accionables existentes para el contexto seleccionado, permitiendo su edición y eliminación.
- **Interacción con el Calendario:**
  - Los eventos correspondientes a los accionables creados/aprobados en el panel aparecerán en el calendario en tiempo real.
  - Hacer clic en un evento de accionable en el calendario podría resaltar el accionable en el panel lateral (si está abierto).

### 4. Criterios de Aceptación

1.  La tabla `goal_actionables` está creada en la base de datos a través de una migración de Drizzle.
2.  Los endpoints de la API para crear, leer, actualizar y eliminar accionables están implementados y probados.
3.  El endpoint de generación por IA sugiere correctamente accionables basados en el título de una meta.
4.  El calendario muestra correctamente los eventos recurrentes de los accionables.
5.  Los usuarios pueden crear, editar y eliminar accionables manualmente desde la interfaz de usuario.
6.  Los accionables pueden vincularse directamente a una meta (`milestoneId` es NULO).
7.  Los accionables pueden vincularse a un hito específico.
