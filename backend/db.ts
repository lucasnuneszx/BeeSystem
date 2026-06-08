import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
let pool: Pool;

try {
  const url = new URL(connectionString);
  pool = new Pool({
    user: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    host: url.hostname || undefined,
    port: url.port ? parseInt(url.port) : 5432,
    database: url.pathname ? url.pathname.substring(1) : undefined,
    ssl: connectionString.includes('supabase') || connectionString.includes('.co') ? { rejectUnauthorized: false } : undefined
  });
} catch (e) {
  pool = new Pool({ connectionString });
}

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({
  adapter,
  log: ['query'],
});

export default prisma;
