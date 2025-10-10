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