# Guía de Migración: Rate Limiter a Producción

## Estado Actual

El rate limiter implementado en `src/lib/rateLimiter.ts` es una solución **in-memory** que:
- ✅ Funciona correctamente en desarrollo y single-instance
- ❌ NO escala en entornos multi-instancia (Vercel, múltiples servidores)
- ❌ Se pierde el estado en cada redeploy/reinicio

## Problema en Producción

En un entorno serverless o con múltiples instancias:
```
Usuario → Request → Instancia A (contador: 1)
Usuario → Request → Instancia B (contador: 1) ❌ Debería ser 2
```

Cada instancia mantiene su propio contador en memoria, permitiendo bypassing del límite.

## Solución Recomendada: Upstash Redis

### Opción 1: Upstash (Recomendado - Free tier disponible)

#### Paso 1: Crear cuenta en Upstash

```bash
# 1. Ir a https://upstash.com
# 2. Crear database Redis
# 3. Copiar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN
```

#### Paso 2: Instalar dependencias

```bash
npm install @upstash/ratelimit @upstash/redis
```

#### Paso 3: Configurar variables de entorno

```bash
# .env.local
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

#### Paso 4: Reemplazar implementación

Crear `src/lib/rateLimiterUpstash.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Usar Redis de Upstash si está configurado, sino fallback a in-memory
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

// Helper para usar en API routes
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (!ratelimit) {
    // Fallback a permitir si no hay Redis configurado
    return { success: true, limit: 5, remaining: 5, reset: Date.now() };
  }

  const result = await ratelimit.limit(identifier);
  return result;
}
```

#### Paso 5: Actualizar API routes

```typescript
// src/app/api/questionsets/route.ts
import { checkRateLimit } from '@/lib/rateLimiterUpstash';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining, reset } = await checkRateLimit(`post:${ip}`);

  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    );
  }

  // ... resto del código
}
```

### Opción 2: Redis Auto-hospedado

Si prefieres Redis propio:

```bash
# Docker
docker run -d -p 6379:6379 redis:alpine

# Variables de entorno
REDIS_URL="redis://localhost:6379"
```

Usar `ioredis` con same Ratelimit library:

```bash
npm install ioredis @upstash/ratelimit
```

```typescript
import { Redis } from "ioredis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis(process.env.REDIS_URL!);

export const ratelimit = new Ratelimit({
  redis: redis as any, // Adapter para usar con ioredis
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});
```

### Opción 3: Vercel KV (Si deployeas en Vercel)

```bash
npm install @vercel/kv
```

```typescript
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});
```

## Comparación de Opciones

| Opción | Costo | Setup | Escalabilidad | Mantenimiento |
|--------|-------|-------|---------------|---------------|
| Upstash | Free tier | ⭐⭐⭐ Fácil | ⭐⭐⭐ Excelente | ⭐⭐⭐ Cero |
| Redis self-hosted | Hosting | ⭐⭐ Medio | ⭐⭐ Buena | ⭐ Manual |
| Vercel KV | Desde $0 | ⭐⭐⭐ Fácil | ⭐⭐⭐ Excelente | ⭐⭐⭐ Cero |
| In-memory (actual) | $0 | ⭐⭐⭐ Ya está | ❌ No escala | ⭐⭐⭐ Ninguno |

## Recomendación

**Para producción: Usar Upstash (Opción 1)**

Ventajas:
- ✅ Free tier generoso (10K requests/día)
- ✅ Setup en 5 minutos
- ✅ Cero mantenimiento
- ✅ Funciona perfecto con Vercel/Netlify/cualquier plataforma
- ✅ Dashboard con analytics incluido

## Fallback Strategy

Mantener ambas implementaciones con detección automática:

```typescript
// src/lib/rateLimiter.ts (exporta ambas)
export { isRateLimited } from './rateLimiterMemory';
export { checkRateLimit } from './rateLimiterUpstash';

// En API routes
const rateLimitResult = process.env.UPSTASH_REDIS_REST_URL
  ? await checkRateLimit(key)
  : isRateLimited(key, opts);
```

## Testing

No olvides actualizar tests después de migrar:

```typescript
// Mockear Upstash en tests
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(() => ({
    limit: vi.fn(() => Promise.resolve({
      success: true,
      remaining: 5,
      reset: Date.now() + 60000
    }))
  }))
}));
```

## Monitoreo

Upstash incluye dashboard para ver:
- Rate limit hits
- IPs bloqueadas
- Patrones de uso
- Alertas

Dashboard: https://console.upstash.com

## Migración sin Downtime

1. Deploy con ambas implementaciones
2. Configurar Upstash en staging
3. Verificar funcionamiento
4. Añadir env vars a producción
5. Reiniciar instancias
6. Verificar logs
7. Remover código in-memory después de 1 semana

## Referencias

- Upstash Docs: https://upstash.com/docs/redis/features/ratelimiting
- @upstash/ratelimit: https://github.com/upstash/ratelimit
- Vercel KV: https://vercel.com/docs/storage/vercel-kv
