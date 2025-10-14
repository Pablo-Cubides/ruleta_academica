import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { initSentry, captureException } from '@/lib/sentry';
import { isRateLimited } from '@/lib/rateLimiter';

const QuestionSetSchema = z.object({
  name: z.string().min(1).max(200),
  questions: z.array(z.string().min(1).max(2000)).min(1).max(1000)
});

// GET: List all question sets
export async function GET() {
  try {
    // If no DATABASE_URL is configured, return empty list to allow local dev without DB
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || !(dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
      return NextResponse.json([]);
    }

    // Dynamically import PrismaClient to avoid runtime validation on import
    const { PrismaClient } = await import('../../../generated/prisma');
    const prisma = new PrismaClient();
    try {
      const sets = await prisma.questionSet.findMany({ select: { id: true, name: true } });
      return NextResponse.json(sets);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    // Log error in server console to aid debugging
    console.error('Error loading question sets:', error);
    // Return 503 to indicate service unavailable instead of silently returning []
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
  }
}

// POST: Save a new question set
export async function POST(req: NextRequest) {
  try {
    // initialize Sentry if configured (no-op otherwise)
    try {
      initSentry();
    } catch (e) {
      console.error('Sentry init failed', e);
    }

    // Simple rate limit by IP for POSTs: default 5 requests per minute
    let rl: any = null;
    try {
      // NextRequest does not expose `ip`; prefer X-Forwarded-For header or fallback to unknown
      const ip = (req.headers.get('x-forwarded-for') || 'unknown') as string;
      rl = isRateLimited(`post:${ip}`, { windowMs: 60_000, max: Number(process.env.POST_RATE_LIMIT_MAX ?? 5) });
      if (rl.limited) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'X-RateLimit-Reset': String(rl.resetAt) }
        });
      }
    } catch (e) {
      // If rate limiter fails for any reason, continue but log
      console.error('Rate limiter error', e);
    }

    const body = await req.json();
    const parseResult = QuestionSetSchema.safeParse(body);
    if (!parseResult.success) {
      // Use `issues` which is the supported property on ZodError for structured details
      return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.issues }, { status: 400 });
    }

    const { name, questions } = parseResult.data;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || !(dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
    }

    const { PrismaClient } = await import('../../../generated/prisma');
    const prisma = new PrismaClient();
    try {
      const set = await prisma.questionSet.create({
        data: {
          name,
          questions: { createMany: { data: questions.map(q => ({ text: q })) } }
        },
        include: { questions: true }
      });
      const headers: Record<string, string> = {};
      if (rl) {
        headers['X-RateLimit-Remaining'] = String(rl.remaining ?? '');
        headers['X-RateLimit-Reset'] = String(rl.resetAt ?? '');
      }
      return new NextResponse(JSON.stringify(set), { status: 200, headers: { 'Content-Type': 'application/json', ...headers } });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Error creating question set:', error);
    // Report to Sentry if available but never throw
    try { captureException(error, { route: '/api/questionsets POST' }); } catch (_) {}
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Error al guardar. ¿Nombre repetido?' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
