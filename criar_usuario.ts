import 'dotenv/config'; // Importação imediata com hoisting para carregar as variáveis de ambiente antes do Prisma!
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'lucas@voltguard.com';
  const plainPassword = 'Lucas3005#00';
  const passwordHash = bcrypt.hashSync(plainPassword, 10);
  
  // Find or create ADMIN role
  let role = await prisma.role.findUnique({
    where: { name: 'ADMIN' }
  });
  
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrador do Sistema'
      }
    });
  }
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      roleId: role.id,
      name: 'Lucas Nunes',
      cpf: '123.456.789-00',
      status: 'ACTIVE'
    },
    create: {
      email,
      password: passwordHash,
      roleId: role.id,
      name: 'Lucas Nunes',
      cpf: '123.456.789-00',
      status: 'ACTIVE'
    }
  });
  
  console.log('USUARIO_CRIADO_SUCESSO:', user.email);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
