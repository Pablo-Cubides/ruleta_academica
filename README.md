<!--
High-quality README authored with a senior engineer voice. Covers quickstart, architecture, data model, endpoints, deployment, troubleshooting and operational notes.
-->
# Ruleta Académica — Documentación técnica

Resumen
-------
Ruleta Académica es una aplicación web para crear, guardar y jugar conjuntos de preguntas en formato "ruleta". Está construida con Next.js (App Router), TypeScript y Prisma y está pensada para ser una base sólida para demos educativas o integraciones en aulas y eventos.

Objetivo de este documento
-------------------------
Proveer una guía completa, práctica y accionable para desarrollar, probar, desplegar y operar la aplicación. Está escrita desde la perspectiva de un desarrollador senior: enfocada en claridad, decisiones de diseño, riesgos conocidos y pasos reproducibles.

Contenido rápido
----------------
- Repositorio: https://github.com/Pablo-Cubides/ruleta_academica
- Stack: Next.js 14 (App Router), TypeScript, TailwindCSS, Prisma (Postgres), Framer Motion.
- Estado: funcional en local con fallback a localStorage cuando no hay DB.

Requisitos
----------
- Node.js 18+ (recomiendo Node 18.17.1 o Node 20.x LTS)
- npm 9+ (o pnpm/yarn según preferencia)
- (Opcional) PostgreSQL 14+ si deseas persistir conjuntos

Archivos clave
-------------
- `src/app` — Rutas de la aplicación (App Router): `inicio`, `ruleta`, `api/questionsets`.
- `src/components` — Componentes UI reutilizables (`QuestionWheel`, `file-input`, etc.).
- `src/lib/prisma.ts` — proveedor de Prisma (lazy init; evita errores si DB no configurada en dev).
- `prisma/schema.prisma` — modelos `QuestionSet` y `Question`.
- `public/sample-questions.csv` — ejemplo de archivo para descarga.

Quick start (desarrollo)
------------------------
1. Clona el repositorio:

```powershell
git clone https://github.com/Pablo-Cubides/ruleta_academica.git
cd ruleta_academica
```

2. Instala dependencias (esto ejecuta `prisma generate` en postinstall):

```powershell
npm install
```

3. (Opcional) Conecta una base de datos PostgreSQL y crea `.env`:

```text
# .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

4. Ejecuta en modo desarrollo:

```powershell
npm run dev
# Abrir http://localhost:3000/inicio
```

Modo demo (sin DB)
-------------------
Si no pones `DATABASE_URL`, la app funcionará en modo demo. Guardados intentados hacia la API devolverán `503` y los conjuntos se almacenarán en `localStorage` para mantener la experiencia.

Estructura y decisiones técnicas
--------------------------------

1) Separación cliente/servidor
- El código sigue el patrón App Router de Next.js. Los endpoints de persistencia están en `src/app/api/questionsets`.
- Componentes que usan browser APIs (sessionStorage/localStorage, eventos DOM) se marcan con `"use client"`.

2) Persistencia y resiliencia
- Prisma Client se inicializa de forma lazy (ver `src/lib/prisma.ts`). Esto evita que Next.js falle en dev cuando `DATABASE_URL` no está presente.
- El endpoint POST `/api/questionsets` usa validación con Zod y responde con códigos HTTP apropiados. Si no hay DB configurada, devuelve `503 Service Unavailable`.
- Se implementó un fallback en cliente: si el POST falla por ausencia de DB, el conjunto se guarda en `localStorage` con un id negativo temporal.

3) Pasaje rápido de preguntas al juego
- Para evitar consultas pesadas o serializar grandes objetos en la URL se usa `sessionStorage` para pasar preguntas temporales al componente de ruleta durante la navegación (param `?temp=1`).

4) Parsing de archivos
- `FileInput` usa `papaparse` para CSV y `xlsx` para Excel. El parser produce un arreglo simple de strings (preguntas).

Modelos (extracto de `prisma/schema.prisma`)
-------------------------------------------
```prisma
model QuestionSet {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  questions Question[]
  createdAt DateTime  @default(now())
}

model Question {
  id           Int         @id @default(autoincrement())
  text         String
  questionSet  QuestionSet @relation(fields: [questionSetId], references: [id])
  questionSetId Int
}
```

API Endpoints (resumen)
-----------------------
- GET `/api/questionsets` — lista conjuntos (dev: devuelve [] si no hay DB)
- GET `/api/questionsets/:id` — obtiene conjunto con preguntas
- POST `/api/questionsets` — crea un conjunto; payload validado con Zod: { name: string, questions: string[] }

Operación y despliegue
----------------------

Recomendaciones para deployment (Vercel / Netlify / Render):
- Establece `DATABASE_URL` en las variables de entorno del proyecto.
- Habilita `postinstall` para que Prisma Client se genere.
- Para migraciones en ambientes gestionados, usa `prisma migrate deploy` durante el pipeline de CI/CD.

Riesgos conocidos y mitigaciones
--------------------------------
- Dependencia de Prisma: cuando `DATABASE_URL` no existe, la app usa fallbacks, pero la experiencia de guardado es limitada. Mitigación: documentar el comportamiento y añadir un mecanismo opcional para sincronizar localStorage -> DB cuando se configure la DB.
- Handling de archivos: CSV/XLSX heterogéneos pueden producir preguntas vacías. El parser descarta entradas vacías y normaliza espacios.
- Seguridad: los endpoints actuales son públicos. Para entornos reales, añade autenticación (JWT/OAuth) y autorización por recurso.

Pruebas recomendadas
--------------------
- Unit tests: parser (CSV/XLSX), utilidades de normalización, Zod schemas.
- Integration tests: endpoints API usando SQLite de prueba o un container Postgres.
- E2E: navegar flujo completo (upload -> save -> play) con Playwright.

Contribuir
---------
Lee `CONTRIBUTING.md` en el repo para guías de flujo de trabajo, convenciones de commits y cómo abrir PRs.

Contacto y mantenimiento
-----------------------
Si quieres que prepare:
- Un pipeline CI (GitHub Actions) que ejecute lint, tests y `prisma migrate deploy`.
- Un script para migrar contenidos del localStorage a la DB cuando se configure `DATABASE_URL`.

---
Fin del README. Para detalles operativos y API documentada, revisa los archivos `ARCHITECTURE.md` y `API.md` en la raíz del repo.
# Ruleta Académica

Resumen
--------
Ruleta Académica es una aplicación web interactiva construida con Next.js (App Router) que permite crear y jugar rondas de preguntas en formato de "ruleta". La app soporta la carga masiva de preguntas (CSV / XLSX), guardado de conjuntos en base de datos mediante Prisma y una interfaz de juego con animación y selección aleatoria. Está pensada para uso educativo, dinámicas de aula, entrevistas técnicas rápidas o actividades de team building.

Por qué es interesante para un reclutador
--------------------------------------
- Trabajo con stack moderno: Next.js 14 (App Router), TypeScript, TailwindCSS y Prisma.
- Implementa buenas prácticas: separación cliente/servidor, manejo de errores del backend, UX enfocada y componentes reutilizables.
- Consideraciones reales de despliegue y persistencia (Prisma, migraciones y postinstall).
- Código orientado a producción y experiencia: subida y parseo robusto de CSV/XLSX, animaciones con Framer Motion, y cuidado en accesibilidad básica.

Casos de uso
-----------
- Profesores que quieran dinámicas interactivas en el aula.
- Entrevistas técnicas o dinámicas rápidas en procesos de selección.
- Sesiones de repaso en grupos (quiz en vivo).
- Team building y reuniones para romper el hielo.

Características principales
--------------------------
- Carga de preguntas desde CSV o Excel (.xlsx) con previsualización.
- Guardado de conjuntos (Prisma + PostgreSQL) con endpoint API REST.
- Ruleta interactiva con animación y selección aleatoria.
- Componentes reutilizables y estructura con App Router de Next.js.
- Modal accesible que muestra la pregunta completa cuando la ruleta se detiene.
- Ejemplo de archivo de preguntas incluido en `public/sample-questions.csv`.

Tecnologías
----------
- Frontend: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Framer Motion
- Backend/DB: Prisma ORM, PostgreSQL (opcional para persistencia)
- Utilidades: PapaParse (CSV), xlsx (Excel parsing)

Cómo ejecutar en local
----------------------
Requisitos:
- Node 18+
- (Opcional) PostgreSQL si deseas persistir conjuntos

Pasos:

1. Clona el repositorio:

```powershell
git clone https://github.com/Pablo-Cubides/ruleta_academica.git
cd ruleta_academica
```

2. Instala dependencias (genera Prisma Client automáticamente):

```powershell
npm install
```

3. (Opcional) Si usarás base de datos local, añade `.env` con `DATABASE_URL` y ejecuta migraciones:

```powershell
# .env
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"

npm run prisma:migrate
```

4. Ejecuta en modo desarrollo:

```powershell
npm run dev
# Abre http://localhost:3000/inicio
```

Uso rápido sin DB
-----------------
Si no configuras una base de datos, puedes probar la ruleta pasando preguntas por URL:

```
http://localhost:3000/ruleta?questions=["Pregunta 1","Pregunta 2","Pregunta 3"]
```

Formato de datos de ejemplo
--------------------------
En `public/sample-questions.csv` hay 10 líneas (Preguntas 1..10). El parser acepta CSV con una pregunta por línea o un Excel con la primera hoja en formato de lista.

Estructura del proyecto (resumen)
--------------------------------
- `src/app` – Rutas principales (App Router): `inicio`, `ruleta`, `api/questionsets`
- `src/components` – Componentes UI (`QuestionWheel`, `file-input`, etc.)
- `src/lib/prisma.ts` – cliente Prisma importado desde `src/generated/prisma`
- `prisma/schema.prisma` – definición del modelo `QuestionSet` y `Question`
- `public/sample-questions.csv` – ejemplo descargable

Detalles técnicos relevantes
--------------------------
- El componente `QuestionWheel` dibuja la ruleta con SVG y en lugar del texto largo muestra un número por segmento; cuando la ruleta se detiene abre un modal con la pregunta completa (mejora de UX para preguntas largas).
- `FileInput` usa PapaParse y `xlsx` para un parsing más robusto según el tipo de archivo.
- Se añadió protección para que la app funcione en modo desarrollo sin `DATABASE_URL` (la lista de conjuntos devuelve `[]` en lugar de fallar), útil para demostraciones rápidas.

Mejoras futuras (sugerencias)
----------------------------
- Autenticación y permisos para proteger endpoints de creación/edición.
- Tests unitarios / integración para parsing y componentes clave.
- Soporte multi-idioma y mejoras de accesibilidad (ARIA, focus management más exhaustivo).
- Dashboard para estadísticas (número de veces jugadas, preguntas más frecuentes).

Contacto
--------
Si quieres que lo despliegue y conecte a una base de datos gestionada, o que prepare un README en inglés orientado a reclutadores internacionales, dímelo y lo preparo.
# Question Wheel

Aplicación Next.js (App Router) para cargar conjuntos de preguntas (CSV/XLSX) y jugar una ruleta que selecciona preguntas al azar.

## Requisitos
- Node 18+
- Base de datos (PostgreSQL) opcional para persistencia con Prisma

## Scripts
- `npm run dev` – desarrollo
- `npm run build && npm start` – producción local
- `npm run prisma:migrate` – migraciones en desarrollo
- `npm run prisma:deploy` – aplicar migraciones en deploy

## Variables de entorno
Crea `.env` con:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

Observabilidad (Sentry)
-----------------------
La aplicación soporta captura de errores con Sentry. Es opcional en local/CI. Para habilitarla configure la variable de entorno `SENTRY_DSN` en su entorno de despliegue o en los Secrets del repositorio. Opcionalmente use `SENTRY_TRACES_SAMPLE_RATE` (0..1) para activar traces.

Ejemplo:
```
SENTRY_DSN="https://...@o0.ingest.sentry.io/0"
SENTRY_TRACES_SAMPLE_RATE=0.05
```

Rate limiting
-------------
Se añadió un limitador simple en memoria para endpoints POST críticos (por ejemplo `POST /api/questionsets`) con valores conservadores por defecto (5 requests/minuto). Este limitador es intencionalmente simple: funciona por IP y protege contra envíos masivos desde un único origen. Para producción en múltiples instancias, reemplace por un store centralizado (Redis, Memcached) y ajuste límites según necesidades.

## Desarrollo rápido (sin DB)
- Puedes pasar preguntas por URL sin configurar DB:
  - `http://localhost:3000/ruleta?questions=["Pregunta 1","Pregunta 2"]`

## Desarrollo con DB
1. Configura `DATABASE_URL` en `.env`.
2. `npm install` (genera Prisma Client automáticamente).
3. `npm run prisma:migrate`.
4. `npm run dev`.

## Despliegue en Vercel
1. Conecta el repo en Vercel.
2. En Project Settings > Environment Variables, agrega `DATABASE_URL`.
3. Build Command por defecto (`next build`), Output (`.next`).
4. Opcional: en "Serverless Functions" usa un proveedor gestionado (Neon/PlanetScale) para la DB.
5. Prisma ya se genera con `postinstall`. Para migraciones, usa un paso de Deploy Hook/cron o ejecuta `prisma migrate deploy` manualmente si tu proveedor lo permite.

## Notas
- El endpoint `GET /api/questionsets` tolera ausencia de DB devolviendo `[]` en dev.
- Se evita división por cero en la ruleta cuando no hay preguntas.
- Import de Prisma unificado desde `src/lib/prisma`.