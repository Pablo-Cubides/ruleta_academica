# ARCHITECTURE — Ruleta Académica

Este documento describe la arquitectura de la aplicación, decisiones de diseño, flujos de datos y cómo escalar/operar en producción.

Visión general
--------------
- Frontend: Next.js 14 (App Router) + React + TypeScript.
- UI: TailwindCSS, Framer Motion para animaciones.
- Persistencia: Prisma ORM con PostgreSQL opcional.

Capas y responsabilidades
-------------------------
1. Presentation (Client)
   - `src/app` pages y `src/components`.
   - Responsabilidad: manejo de UI, validación básica, parsing de archivos y UX (modales, navegación rápida).

2. API (Serverless/Server)
   - Endpoints en `src/app/api/questionsets`.
   - Responsabilidad: validación y persistencia (Zod + Prisma), manejo de errores.

3. Data Layer
   - Prisma Client generado en `src/generated/prisma`.
   - Modelos: QuestionSet, Question.

Decisiones importantes
----------------------
- Lazy init de Prisma: para evitar que Next.js intente validar datasource en entornos sin `DATABASE_URL`. Esto reduce el coste de onboarding en demos.
- sessionStorage para pasar preguntas temporales: evita pasar payloads grandes en la URL.
- localStorage fallback: mejora la experiencia cuando la DB no está presente en dev/demo.

Flujos de datos
--------------
1. Crear y guardar conjunto (Client -> API -> DB)
   - El cliente valida y transforma el archivo a `string[]`.
   - Llamada POST a `/api/questionsets` con `{ name, questions }`.
   - API valida con Zod y persiste con Prisma.
   - Error 503 cuando DB no disponible; cliente guarda localmente como fallback.

2. Jugar sin guardar (Client -> sessionStorage -> /ruleta)
   - Cuando el usuario hace "Jugar" con preguntas cargadas pero no guardadas, las preguntas se serializan en `sessionStorage` y se navega a `/ruleta?temp=1`.
   - `src/app/ruleta/page.tsx` lee `sessionStorage` en el cliente y muestra la ruleta.

Escalabilidad y despliegue
-------------------------
- Para producción, usar un proveedor PostgreSQL gestionado y configurar `DATABASE_URL`.
- Considerar un plan de escalado para la API: Next.js en Vercel/Render con serverless o un host Node tradicional.

Observabilidad y monitoreo
-------------------------
- Logs: capturar errores de API en un sistema central (Sentry/Datadog).
- Métricas: contadores de juegos iniciados, conjuntos creados, errores de parsing.

Mejoras propuestas
-------------------
- Autenticación (Auth0/Clerk/NextAuth) para endpoints.
- Background job para migrar localStorage a DB cuando `DATABASE_URL` se configure.
- Tests automatizados (unit, integration y E2E).
