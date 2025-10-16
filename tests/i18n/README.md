# i18n Tests

Tests para validar la implementación de internacionalización (i18n) en GoalShare.

## Estructura de Tests

### 1. `translations.test.ts`

Valida la estructura y completitud de los archivos de mensajes:

- ✅ Verifica que existan ambos archivos (ES y EN)
- ✅ Valida que tengan las mismas claves en ambos idiomas
- ✅ Verifica todos los namespaces principales
- ✅ Detecta strings vacíos o faltantes

### 2. `helpers.test.ts`

Prueba las funciones helper de i18n:

- ✅ `getGoalTypeKey()` - Conversión de tipos de meta
- ✅ `getGoalStatusKey()` - Conversión de estados
- ✅ `getDaysLeftKey()` - Etiquetas de días restantes
- ✅ `getRelativeTimeKey()` - Tiempo relativo
- ✅ Validación de formato de claves

### 3. `date-utils.test.ts`

Prueba las utilidades de fecha con i18n:

- ✅ `formatDeadline()` - Formato de fechas límite
- ✅ `formatRelativeTimeI18n()` - Tiempo relativo traducido
- ✅ Manejo de fechas inválidas

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test
# o
bun test

# Ejecutar solo tests de i18n
npm test tests/i18n
# o
bun test tests/i18n

# Ejecutar con coverage
npm test -- --coverage
# o
bun test --coverage
```

## Cobertura

Los tests cubren:

- ✅ 17 namespaces de traducción
- ✅ 300+ claves de traducción
- ✅ 8 funciones helper
- ✅ Validación de estructura
- ✅ Validación de completitud

## Agregar Nuevos Tests

Al agregar nuevas traducciones:

1. **Actualizar `translations.test.ts`**:

   ```typescript
   it("should have newNamespace keys in both languages", () => {
     expect(esMessages.newNamespace).toBeDefined();
     expect(enMessages.newNamespace).toBeDefined();
     // ...
   });
   ```

2. **Agregar tests para nuevas funciones helper**:
   ```typescript
   describe("newHelperFunction", () => {
     it("should return correct key", () => {
       expect(newHelperFunction("value")).toBe("expectedKey");
     });
   });
   ```

## Notas Importantes

- Los tests usan **Vitest** (ya configurado en el proyecto)
- Se valida la **estructura** de las traducciones, no el contenido
- Se verifica que ambos idiomas tengan las mismas claves
- Se detectan strings vacíos automáticamente
- Las funciones helper deben devolver claves sin el namespace completo

## Testing Componentes con i18n

Para componentes que usan `useTranslations`, usa el wrapper helper:

```typescript
import { render } from "@testing-library/react";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
import { YourComponent } from "./YourComponent";

it("should render component with translations", () => {
  const { getByText } = render(withI18n(<YourComponent />));
  // Your assertions here
});
```

El wrapper proporciona el contexto de `NextIntlClientProvider` necesario para que `useTranslations` funcione en tests.
