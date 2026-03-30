// @ts-ignore - PrismaClient pode não estar disponível até que o comando 'generate' seja executado com sucesso no ambiente local.
import { PrismaClient } from '@prisma/client';

// Configuração do Singleton do Prisma para Next.js (Evita múltiplas instâncias em desenvolvimento)
const criarInstanciaPrisma = () => {
  // @ts-ignore
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof criarInstanciaPrisma>;
}

// Inicializando o cliente ou reutilizando o existente
const prisma = globalThis.prisma ?? criarInstanciaPrisma();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
