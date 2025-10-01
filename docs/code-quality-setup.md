# Code Quality Setup - GoalShare

Este documento describe el setup de herramientas de calidad de código implementado en el proyecto.

## 🛠️ Herramientas Configuradas

### 1. **Prettier** - Formateador de Código

Formatea automáticamente el código para mantener consistencia.

**Configuración**: `.prettierrc`

- `printWidth`: 120 caracteres
- `semi`: true (punto y coma)
- `singleQuote`: false (comillas dobles)
- `tabWidth`: 2 espacios
- `trailingComma`: "es5"

**Scripts disponibles**:

```bash
bun run format        # Formatea todos los archivos
bun run format:check  # Verifica formato sin modificar
```

### 2. **ESLint** - Linter

Detecta errores y malas prácticas en el código.

**Configuración**: `eslint.config.mjs`

**Plugins instalados**:

- `@typescript-eslint/eslint-plugin` - Reglas TypeScript
- `eslint-plugin-react-hooks` - Reglas de React Hooks
- `eslint-plugin-jsx-a11y` - Accesibilidad
- `eslint-config-prettier` - Integración con Prettier

**Scripts disponibles**:

```bash
bun run lint      # Ejecuta el linter
bun run lint:fix  # Arregla problemas automáticamente
```

### 3. **Husky + lint-staged** - Pre-commit Hooks

Ejecuta linter y formatter automáticamente antes de cada commit.

**Hooks configurados**:

- `.husky/pre-commit` - Ejecuta lint-staged
- `.husky/commit-msg` - Valida mensaje de commit

**Comportamiento**:

- Al hacer `git add` y `git commit`, automáticamente:
  1. Formatea archivos staged con Prettier
  2. Ejecuta ESLint en archivos staged
  3. Valida mensaje de commit con Commitlint

### 4. **Commitlint** - Convenciones de Commits

Valida que los mensajes de commit sigan el formato Conventional Commits.

**Configuración**: `commitlint.config.js`

## 📝 Conventional Commits

### Formato

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types Permitidos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Formato, espacios (no afecta código)
- **refactor**: Refactorización (no es feat ni fix)
- **perf**: Mejora de rendimiento
- **test**: Añadir/modificar tests
- **chore**: Tareas de mantenimiento (deps, config)
- **ci**: Cambios en CI/CD
- **build**: Cambios en build system

### Ejemplos Válidos

```bash
# Features
feat(goals): add edit and delete functionality
feat(communities): implement server-side search with debounce
feat(dashboard): add floating action button

# Fixes
fix(api): correct authentication middleware
fix(goals): fix deadline calculation bug
fix(communities): search debounce not working

# Refactoring
refactor(goals): extract magic strings to constants
refactor(utils): move date functions to separate file

# Documentation
docs(readme): update installation instructions
docs(api): add JSDoc comments to services

# Styles
style(dashboard): fix indentation in header component
style(landing): modernize design with gradients

# Performance
perf(api): optimize goals query with indexes
perf(dashboard): reduce re-renders with useMemo

# Tests
test(goals): add unit tests for date utils
test(api): add integration tests for goals endpoint

# Chores
chore(deps): update next to 15.5.3
chore: configure prettier and eslint
```

### Ejemplos Inválidos (Rechazados)

```bash
# ❌ Sin type
updated stuff

# ❌ Subject muy corto
fix bug

# ❌ No descriptivo
WIP
asdfasdf

# ❌ Subject en mayúsculas
feat: Add New Feature

# ❌ Type inválido
update(goals): change something
```

## 🚀 Flujo de Trabajo

### 1. Desarrollo Normal

```bash
# Editas archivos...
# Cuando termines:

git add .
git commit -m "feat(goals): add progress tracking feature"

# Automáticamente se ejecuta:
# 1. lint-staged → formatea y lintea archivos
# 2. commitlint → valida el mensaje
# 3. Si todo pasa → commit exitoso ✅
# 4. Si algo falla → commit rechazado ❌
```

### 2. Si el Commit es Rechazado

**Por formato de código**:

```bash
# Arregla manualmente
bun run format
bun run lint:fix

# Intenta de nuevo
git add .
git commit -m "feat(goals): add progress tracking feature"
```

**Por mensaje de commit**:

```bash
# Corrige el mensaje siguiendo Conventional Commits
git commit -m "feat(goals): add progress tracking with charts and metrics"
```

### 3. Formatear Todo el Proyecto

```bash
# Formatea todos los archivos
bun run format

# Verifica sin modificar
bun run format:check
```

### 4. Verificar Linting

```bash
# Ver todos los problemas
bun run lint

# Arreglar automáticamente
bun run lint:fix
```

## 🔧 TypeScript Strict Mode

El proyecto tiene configurado TypeScript en modo strict con opciones adicionales:

- `strict`: true
- `noUnusedLocals`: true - Error si hay variables sin usar
- `noUnusedParameters`: true - Error si hay parámetros sin usar
- `noFallthroughCasesInSwitch`: true - Error en switch sin break
- `noUncheckedIndexedAccess`: true - Acceso a arrays más seguro
- `forceConsistentCasingInFileNames`: true - Consistencia en imports

## 📦 Dependencias Instaladas

```json
{
  "devDependencies": {
    "prettier": "^3.6.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "@typescript-eslint/eslint-plugin": "^8.45.0",
    "@typescript-eslint/parser": "^8.45.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "husky": "^9.1.7",
    "lint-staged": "^16.2.3",
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0"
  }
}
```

## 🎯 Beneficios

1. **Código Consistente**: Prettier elimina discusiones sobre estilo
2. **Menos Bugs**: ESLint detecta errores antes de runtime
3. **Mejor Git History**: Conventional Commits hace el historial legible
4. **Changelog Automático**: Se puede generar con herramientas como `standard-version`
5. **Code Reviews Más Rápidos**: Código ya formateado y linted
6. **Onboarding Más Fácil**: Nuevos devs siguen las mismas reglas automáticamente

## 🔍 Troubleshooting

### El pre-commit hook no se ejecuta

```bash
# Reinstala husky
bun run prepare
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Prettier y ESLint en conflicto

Ya está configurado `eslint-config-prettier` para evitar conflictos. Si hay alguno:

```bash
# Prettier tiene prioridad
bun run format
```

### Quiero hacer commit sin validación (emergencia)

```bash
# NO RECOMENDADO - Solo en emergencias
git commit --no-verify -m "emergency fix"
```

## 📚 Referencias

- [Prettier Docs](https://prettier.io/docs/en/)
- [ESLint Docs](https://eslint.org/docs/latest/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Docs](https://typicode.github.io/husky/)
- [lint-staged Docs](https://github.com/lint-staged/lint-staged)
