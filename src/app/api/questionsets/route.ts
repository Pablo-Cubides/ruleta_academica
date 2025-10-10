import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    const body = await req.json();
    const parseResult = QuestionSetSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Payload inválido', details: parseResult.error.errors }, { status: 400 });
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
      return NextResponse.json(set);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Error creating question set:', error);
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
