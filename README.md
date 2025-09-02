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