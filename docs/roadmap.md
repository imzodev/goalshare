# Roadmap General

Este documento describe el plan general de desarrollo, iniciando por el punto 1 (Crear landing page) y continuando con el resto de fases. Principios transversales:

- Uso de `bun` para gestión de paquetes y scripts.
- Preferir `@/components/ui` (chadcn/ui) para componentes y estilos; diseño consistente con dark mode.
- Verificar documentación de librerías externas con el MCP Server Context7 antes de integrarlas.
- Arquitectura modular en `app/`, `components/`, `db/`, `lib/`, `config/` y prácticas de DX (lint, format, tests).

---

## 1) Crear landing page

- Objetivo: Presentar la propuesta de valor de GoalShare y convertir visitantes en usuarios (registro o prueba del producto).
- Entregables:
  - Estructura en `app/page.tsx`: Hero, Features, Social Proof (testimonios/logos), Pricing (opcional), CTA final y Footer.
  - `components/site-header.tsx` reutilizado y `components/site-footer.tsx` nuevo con enlaces clave (soporte, legal, redes).
  - SEO/metadatos en `app/layout.tsx` (title/description, Open Graph, Twitter). `app/robots.ts` y `app/sitemap.ts` si indexamos.
  - Imágenes/OG en `public/` y favicon listo.
  - Analíticas (Vercel Analytics/PostHog) y formulario de newsletter (stub) si aplica.
- Reglas de routing/CTA:
  - Si hay sesión: CTAs dirigen a `/dashboard`.
  - Si no hay sesión: CTAs dirigen a `/sign-in` (Clerk).
- Criterios de salida:
  - Lighthouse SEO/Accesibilidad ≥ 90. Hero/CTA visibles above-the-fold. Navegación funcional y responsive.

## 2) Crear dashboard

- Objetivo: Proveer un espacio privado para gestionar objetivos, con navegación clara y estados de carga.
- Entregables:
  - `app/dashboard/layout.tsx` (topbar/sidebar), navegación primaria, estados `Skeleton` (chadcn), estado vacío y onboarding corto.
  - Página inicial `app/dashboard/page.tsx` conectada a la sesión (Clerk), saludo/contexto y accesos rápidos.
- Criterios de salida:
  - UX consistente con tema, navegación accesible (keyboard), sin errores en SSR/CSR.

## 3) Autenticación y control de acceso

- Clerk integrado en `app/layout.tsx` y `middleware.ts` (matcher configurado). Páginas `sign-in`/`sign-up`.
- Protección de `/dashboard/**` y APIs; redirecciones adecuadas.
- Criterio: acceso al dashboard solo autenticado; estado de sesión disponible SSR/CSR.

## 4) Modelado de datos y migraciones (Drizzle + Supabase)

- Definir tablas: `users` (metadatos si aplica), `goals`, `goal_members`/permisos, `activities`.
- Migraciones en `drizzle/`, seeds en `scripts/seed/`.
- Criterio: migraciones ejecutan limpio; datos de ejemplo disponibles.

## 5) CRUD principal de objetivos

- Server Actions o rutas API para crear/leer/actualizar/eliminar objetivos.
- Validaciones (zod) y manejo de errores; UI en `app/dashboard/goals/` con chadcn (forms, dialogs, toasts).
- Criterio: flujo completo CRUD con estados vacíos y loading.

## 6) Colaboración básica (sharing)

- Invitar usuarios (por email/usuario) con roles (reader/editor/owner) en `goal_members`.
- UI para compartir y revocar permisos; auditoría mínima.
- Criterio: otro usuario puede ver/editar según permisos; cambios auditables.

## 7) Perfiles públicos y páginas compartibles

- Perfil público básico y páginas públicas de objetivos con control de visibilidad.
- Feed/descubrimiento inicial (opcional) y metadatos OG por página.
- Criterio: páginas públicas compartibles con previews correctos.

## 8) Notificaciones y registro de actividad

- Event log por objetivo; notificaciones in-app (toasts/badges) y opcional email.
- Criterio: eventos clave visibles y útiles en UX.

## 9) Integración social y SEO

- Botones de compartir, tarjetas OG/Twitter, `app/sitemap.ts`, `app/robots.ts`.
- Criterio: SEO ≥ 90, previews correctos al compartir.

## 10) Pagos y planes (Stripe)

- Planes Free/Pro; checkout y portal de clientes; límites por plan y gating.
- Criterio: upgrade/downgrade funcional; límites aplicados en UI/lógica.

## 11) Ajustes de cuenta/organización

- Perfil, preferencias (tema/idioma), seguridad (2FA opcional), equipos/organizaciones.
- Criterio: cambios persistentes y con permisos correctos.

## 12) Analíticas y telemetría

- Vercel Analytics/PostHog con eventos clave (signup, create goal, share, upgrade).
- Criterio: tablero de métricas básicas disponible.

## 13) Performance y accesibilidad

- Optimización de imágenes, lazy-loading, code-splitting; navegación por teclado, roles/ARIA.
- Criterio: Lighthouse Performance/Accessibility ≥ 90 en páginas clave.

## 14) QA: pruebas unitarias y e2e

- Vitest para lógica/UI crítica; Playwright para flujos auth y CRUD.
- Criterio: suite verde en CI, cobertura mínima acordada.

## 15) Seguridad y cumplimiento

- RLS y policies en Supabase, rate limiting en APIs, manejo de secrets y logs.
- Criterio: no es posible acceder a datos de otros; límites efectivos.

## 16) CI/CD y deploy

- Vercel con previsualizaciones por PR; Sentry para errores.
- Criterio: deploy automático estable; alertas activas.

## 17) Documentación y contenido

- README actualizado, docs internas (arquitectura/decisiones), quickstart local.
- Criterio: cualquier contribuidor puede levantar entorno sin fricción.

## 18) Marketing y lanzamiento

- Landing de pricing, changelog, anuncios y checklist de lanzamiento.
- Criterio: plan de go-to-market listo; métricas de adquisición definidas.

---

### Orden recomendado de ejecución

1) Autenticación y control de acceso  
2) Datos y migraciones  
3) CRUD de objetivos  
4) Colaboración  
5) Perfiles públicos + SEO/social  
6) Billing  
7) Ajustes, analíticas, perf/a11y, QA  
8) Seguridad, CI/CD  
9) Docs y lanzamiento
