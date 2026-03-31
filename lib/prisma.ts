import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const criarInstanciaPrisma = () => {
  const dbPath = path.join(process.cwd(), 'dev.db');
  console.log('[Prisma] Inicializando com adapter BetterSQLite3:', dbPath);
  try {
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.error('[Prisma] Erro ao criar adapter/client:', e);
    throw e;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof criarInstanciaPrisma>;
}

// Inicializando o cliente ou reutilizando o existente
const prisma = globalThis.prisma ?? criarInstanciaPrisma();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
