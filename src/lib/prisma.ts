import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Parse DATABASE_URL manually to bypass pg-connection-string SSL deprecation warning
function createPool() {
  const url = new URL(process.env.DATABASE_URL!);
  const p = new Pool({
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // remove leading /
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000, // 20s allows Neon serverless cold starts
    keepAlive: true,
  });

  // Catch idle client errors so they do not crash the Node process
  p.on('error', (err) => {
    console.error('[Prisma PG Pool] Idle client connection error:', err.message || err);
  });

  return p;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

const pool = globalForPrisma.pool ?? createPool();
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
  globalForPrisma.adapter = adapter;
}

export default prisma;
