# GoalShare – Documento de Especificaciones (Actualizado)

## 1. Overview
- **App Name:** GoalShare
- **Descripción:** GoalShare es una aplicación web para definir, seguir y compartir metas personales. Los usuarios pueden crear hasta 5 metas de forma gratuita, dar seguimiento a su progreso y marcarlas como completadas. Además, los usuarios pueden unirse a comunidades relacionadas con sus metas y compartir publicaciones con imágenes.
- **Objetivo:** Proporcionar una forma sencilla y atractiva de establecer, rastrear y celebrar logros personales, mientras se construye una comunidad de apoyo.

## 2. Requisitos Funcionales

### 2.1 Registro y Autenticación
- **Proveedor:** Clerk (autenticación y gestión de usuarios)
- **Métodos soportados:** email/password, Google, Facebook y otros proveedores sociales
- **Roles de usuario:**
  - Free: hasta 5 metas, acceso limitado en comunidad
  - Premium: metas ilimitadas, acceso completo a comunidad
- **Gestión de roles:** Clerk gestionará autenticación y roles de usuario

### 2.2 Creación y Seguimiento de Metas
- **Límites por plan:**
  - Free: hasta 5 metas
  - Premium: metas ilimitadas
- **Estructura de la meta:**
  - Título (string)
  - Descripción (string)
  - Fecha límite (date, opcional)
  - Estado: pendiente | completada
- **Perfil:** metas completadas aparecen en el perfil del usuario

### 2.3 Comunidad
- **Posts:** todos los usuarios pueden crear posts en comunidades de metas; posts con texto + imagen (opcional)
- **Reglas por plan:**
  - Free: puede crear posts, pero solo comentar en posts de amigos
  - Premium: puede crear posts y comentar en cualquier post
- **Grupos basados en metas:**
  - Subgrupo de usuarios que aún trabajan en la meta
  - Subgrupo de usuarios que ya la completaron

### 2.4 Amigos
- **Flujo:** los usuarios pueden enviar solicitudes de amistad
- **Restricciones por plan:**
  - Free: comentarios limitados a posts de amigos
  - Premium: comentarios abiertos a toda la comunidad

### 2.5 Suscripción
- **Plan Premium:** $2 USD/mes
- **Pagos:** Stripe
- **Gestión de estado:** Clerk + Supabase gestionarán el estado de suscripción y roles de usuario

## 3. Requisitos No Funcionales

### 3.1 Rendimiento
- Manejar hasta 10,000 usuarios en fase MVP
- Optimización mobile-first con diseño responsive

### 3.2 Seguridad
- Clerk para autenticación segura
- Supabase con políticas RLS (Row Level Security) para proteger datos
- HTTPS obligatorio en todos los entornos

### 3.3 Escalabilidad
- Infraestructura en Vercel para frontend + API Routes de Next.js
- Supabase como base de datos y backend en tiempo real
- Integración serverless que escala automáticamente con la demanda

### 3.4 Usabilidad
- shadcn-ui para UI moderna y accesible
- Interfaz simple, intuitiva y enfocada en la productividad

## 4. Tech Stack
- **Framework:** Next.js (App Router + API Routes)
- **UI:** shadcn-ui + TailwindCSS
- **Autenticación:** Clerk
- **Base de datos y tiempo real:** Supabase (Postgres + RLS + Storage)
- **Pagos:** Stripe
- **Infraestructura:** Vercel (hosting y serverless functions)
- **Versionado:** Git + GitHub
