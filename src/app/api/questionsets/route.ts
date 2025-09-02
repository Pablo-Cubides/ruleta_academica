import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all question sets
export async function GET() {
  try {
    const sets = await prisma.questionSet.findMany({
      select: { id: true, name: true }
    });
    return NextResponse.json(sets);
  } catch (error) {
    // If database is not configured in dev, don't hard-crash the page
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Save a new question set
export async function POST(req: NextRequest) {
  try {
    const { name, questions } = await req.json();
    
    if (!name || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Nombre y preguntas requeridos' }, { status: 400 });
    }
    
    const set = await prisma.questionSet.create({
      data: {
        name,
        questions: { createMany: { data: questions.map(q => ({ text: q })) } }
      },
      include: { questions: true }
    });
    
    return NextResponse.json(set);
  } catch (error) {
    if ((error as any)?.code === 'P2002') {
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
