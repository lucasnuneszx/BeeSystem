import 'dotenv/config';
import prisma from './db';

async function main() {
  console.log('Buscando e ativando todos os usuários no banco...');
  
  // Atualiza todos para ACTIVE
  const updateResult = await prisma.user.updateMany({
    data: {
      status: 'ACTIVE'
    }
  });
  
  console.log(`Status de ${updateResult.count} usuários atualizado para 'ACTIVE'.`);
  
  // Lista todos os usuários
  const users = await prisma.user.findMany({
    include: {
      role: true
    }
  });
  
  console.log('\n--- LISTA DE USUÁRIOS DISPONÍVEIS ---');
  users.forEach((u, i) => {
    console.log(`${i + 1}. Nome: ${u.name}`);
    console.log(`   E-mail: ${u.email}`);
    console.log(`   CPF: ${u.cpf}`);
    console.log(`   Perfil (Role): ${u.role.name}`);
    console.log(`   Status: ${u.status}`);
    console.log('------------------------------------');
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
