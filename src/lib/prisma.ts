import { PrismaClient } from '../generated/prisma';

// Only instantiate PrismaClient when a DATABASE_URL is configured.
// This prevents Prisma from validating the datasource on import when
// running the app in a demo/dev mode without a database.
let prisma: PrismaClient | null = null;
if (process.env.DATABASE_URL) {
	prisma = new PrismaClient();
}

export default prisma;
