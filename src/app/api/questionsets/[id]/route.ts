import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get a question set by id
// Use flexible typing for handler args to avoid strict framework type
// mismatches between Next.js versions during upgrades.
export async function GET(req: any, ctx: any) {
  const params = ctx?.params ?? {};
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const set = await prisma.questionSet.findUnique({
    where: { id },
    include: { questions: true }
  });
  if (!set) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  return NextResponse.json(set);
}
