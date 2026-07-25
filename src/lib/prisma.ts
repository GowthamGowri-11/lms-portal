import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';
import path from 'path';

// Resolve the SQLite file path relative to the project root
// DATABASE_URL is "file:./dev.db" — strip the "file:" prefix
const dbUrl = (process.env.DATABASE_URL ?? 'file:./prisma/dev.db').replace(/^file:/, '');
const dbPath = path.isAbsolute(dbUrl)
  ? dbUrl
  : path.resolve(process.cwd(), dbUrl);

const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
