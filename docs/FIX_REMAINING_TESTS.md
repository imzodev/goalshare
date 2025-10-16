# Instrucciones para Corregir Tests Restantes

## Estado Actual

- ✅ **88 tests pasando**
- ❌ **43 tests fallando**
- **Causa**: Los componentes ahora usan `useTranslations` pero los tests no tienen el provider de i18n

## Solución

Todos los tests que renderizan componentes que usan `useTranslations` necesitan el wrapper `withI18n`.

### Paso 1: Agregar Import

En cada archivo de test que falla, agregar después de los imports de vitest:

```typescript
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
```

### Paso 2: Envolver Componentes

Reemplazar todos los `render(<Component />)` por `render(withI18n(<Component />))`.

## Archivos que Necesitan Corrección

### ✅ Ya Corregidos

- `tests/unit/auth/login-form.test.tsx`
- `tests/unit/auth/sign-up-form.test.tsx`
- `tests/unit/components/goals/goal-card.test.tsx`

### ❌ Pendientes de Corregir

1. **CreateGoalForm.test.tsx**

   ```typescript
   // Agregar import
   import { withI18n } from "@/tests/helpers/i18n-test-wrapper";

   // Cambiar todos los render
   render(<CreateGoalForm {...props} />)
   // Por:
   render(withI18n(<CreateGoalForm {...props} />))
   ```

2. **CreateGoalPreview.test.tsx**

   ```typescript
   import { withI18n } from "@/tests/helpers/i18n-test-wrapper";

   render(<CreateGoalPreview {...props} />)
   // Por:
   render(withI18n(<CreateGoalPreview {...props} />))
   ```

3. **MilestonesList.test.tsx**

   ```typescript
   import { withI18n } from "@/tests/helpers/i18n-test-wrapper";

   render(<MilestonesList {...props} />)
   // Por:
   render(withI18n(<MilestonesList {...props} />))
   ```

4. **create-goal-sheet-flow.test.tsx**

   ```typescript
   import { withI18n } from "@/tests/helpers/i18n-test-wrapper";

   render(<CreateGoalSheet {...props} />)
   // Por:
   render(withI18n(<CreateGoalSheet {...props} />))
   ```

5. **Hooks Tests** (use-communities-topics, use-goal-management, use-milestone-weights)
   - Estos tests NO necesitan withI18n porque son hooks puros
   - Si fallan, es por otra razón (probablemente mocks)

## Script Automático (Opcional)

Puedes usar este comando para aplicar el fix automáticamente:

```bash
# Para un archivo específico
sed -i '/from "vitest"/a import { withI18n } from "@/tests/helpers/i18n-test-wrapper";' tests/unit/components/dashboard/create-goal/CreateGoalForm.test.tsx

# Reemplazar renders
sed -i 's/render(<\([A-Z][^>]*\)>)/render(withI18n(<\1>))/g' tests/unit/components/dashboard/create-goal/CreateGoalForm.test.tsx
```

## Verificar Corrección

Después de cada corrección, ejecutar:

```bash
bun test tests/unit/components/dashboard/create-goal/CreateGoalForm.test.tsx
```

## Notas Importantes

1. **No todos los tests necesitan withI18n**: Solo los que renderizan componentes que usan `useTranslations`
2. **Hooks puros no necesitan wrapper**: Los tests de hooks como `use-milestone-weights` no necesitan i18n
3. **Verificar imports**: Asegúrate de que el import esté después de los imports de vitest
4. **Componentes anidados**: Si un componente tiene children, asegúrate de envolver correctamente:
   ```typescript
   render(withI18n(
     <Parent>
       <Child />
     </Parent>
   ))
   ```

## Objetivo Final

Cuando todos los tests estén corregidos, deberías ver:

```
✅ 131 tests pasando
❌ 0 tests fallando
```

---

**Última actualización**: 16 de Octubre, 2025
