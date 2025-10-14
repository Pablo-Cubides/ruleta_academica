import { PrismaClient } from '../generated/prisma';

// Create a singleton PrismaClient to avoid exhausting connections during
// hot-reloads in development or serverless re-invocations.
const g: any = globalThis as any;
const prisma: PrismaClient = g.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma;

export default prisma;
