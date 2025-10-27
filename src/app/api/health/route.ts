import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is not cached

/**
 * Health check endpoint for monitoring and load balancers.
 * Returns 200 if the service is healthy, 503 if degraded.
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
    },
  };

  try {
    // Check if DATABASE_URL is configured
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      health.checks.database = 'not_configured';
      health.status = 'degraded';
      return NextResponse.json(health, { status: 200 }); // Still return 200 as app works without DB
    }

    // Try to import and ping database
    const { PrismaClient } = await import('../../../generated/prisma');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'connected';
      await prisma.$disconnect();
    } catch (dbError) {
      health.checks.database = 'disconnected';
      health.status = 'degraded';
      await prisma.$disconnect();
      return NextResponse.json(health, { status: 503 });
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    health.status = 'error';
    health.checks.database = 'error';
    return NextResponse.json(health, { status: 503 });
  }
}
