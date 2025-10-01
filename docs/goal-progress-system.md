# Sistema de Progreso de Metas - Resumen

## 🎯 Objetivo

Sistema flexible que soporta **4 tipos de metas** con cálculo dinámico de progreso, eliminando redundancia de datos.

---

## 📋 Los 4 Tipos de Metas

| Tipo          | Uso               | Ejemplo                          | Cálculo                               |
| ------------- | ----------------- | -------------------------------- | ------------------------------------- |
| **Metric**    | Acumular cantidad | Leer 12 libros (5/12 = 41.67%)   | `(currentValue / targetValue) * 100`  |
| **Milestone** | Completar hitos   | Aprender inglés (4 hitos de 25%) | Suma de `weight` de hitos completados |
| **Checkin**   | Repetir acción    | Meditar 30 días (18/30 = 60%)    | `(currentValue / targetValue) * 100`  |
| **Manual**    | Subjetivo         | Aumentar autoestima (35%)        | Usuario lo establece                  |

---

## 🔧 Cambios en el Schema

### Tabla `goals` - Agregados:

```typescript
goalType: "metric" | "milestone" | "checkin" | "manual";
targetValue: numeric; // Para metric y checkin
targetUnit: text; // Para metric y checkin
currentValue: numeric; // Para metric y checkin
currentProgress: integer; // Para manual (0-100)
```

### Tabla `goal_milestones` - Agregado:

```typescript
weight: integer; // Porcentaje del hito (0-100)
```

### Tabla `goal_entries` - Limpieza:

- ❌ **Eliminados:** `progressValue`, `metricValue`, `metricUnit`
- ✅ **Agregado:** `progressSnapshot` (historial opcional)

---

## 💡 Principio Clave

**Sin Redundancia:**

- **Progreso real** → Solo en `goals.currentValue/currentProgress` o `milestones.weight`
- **goal_entries** → Solo para feed social y historial

**Progreso calculado dinámicamente** con `calculateGoalProgress()` en `utils/progress-utils.ts`

---

## 📁 Archivos Modificados

| Archivo                                     | Cambio                                        |
| ------------------------------------------- | --------------------------------------------- |
| `db/schema.ts`                              | Nuevos campos y enums                         |
| `drizzle/0001_add_goal_progress_system.sql` | Migración SQL                                 |
| `types/goals.ts`                            | Tipo `GoalType` y campos en `UserGoalSummary` |
| `constants/goals.ts`                        | `GOAL_TYPE`, labels y descripciones           |
| `utils/progress-utils.ts`                   | Función `calculateGoalProgress()`             |
| `services/goals-service.ts`                 | Cálculo dinámico de progreso                  |
| `app/api/goals/route.ts`                    | Schema POST actualizado                       |
| `app/api/goals/[id]/route.ts`               | Schema PUT actualizado                        |

---

## 🚀 Para Aplicar

```bash
# 1. Aplicar migración
bun drizzle-kit push

# 2. Verificar compilación
bunx tsc --noEmit

# 3. Iniciar desarrollo
bun run dev
```

---

## 📝 Próximos Pasos (TODOs)

### APIs Faltantes:

- [ ] CRUD de milestones (`/api/goals/[id]/milestones`)
- [ ] API para crear entries (feed social)

### UI Pendiente:

- [ ] Selector de tipo de meta en formulario de creación
- [ ] Formulario dinámico según tipo seleccionado
- [ ] Vista de hitos en detalle de meta
- [ ] Botón "Registrar progreso" según tipo
- [ ] Gráfica de progreso histórico

### Validaciones:

- [ ] Requerir `targetValue` para tipos "metric" y "checkin"
- [ ] Requerir al menos 1 hito para tipo "milestone"
- [ ] Auto-completar meta al llegar a 100%

---

## ✅ Ventajas

✅ **Cero redundancia** - Una sola fuente de verdad  
✅ **Flexible** - 4 tipos diferentes de metas  
✅ **Dinámico** - Progreso siempre actualizado  
✅ **Auditable** - Historial completo  
✅ **Escalable** - Fácil agregar nuevos tipos
