import 'dotenv/config';
import prisma from '../lib/prisma';
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Iniciando limpeza do banco de dados...');
  await prisma.auditLog.deleteMany();
  await prisma.scannerEvent.deleteMany();
  await prisma.discrepancy.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productUnit.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('Iniciando seed corporativo do BeeSystem VoltGuard com MASSA DE DADOS...');

  const roles = [
    { name: 'ADMIN', description: 'Administrador do Sistema' },
    { name: 'MANAGER', description: 'Gerente Geral' },
    { name: 'SELLER', description: 'Vendedor' },
    { name: 'OFFICER', description: 'Oficial de Galpão / Auditor' },
  ];

  const createdRoles = {};
  for (const role of roles) {
    createdRoles[role.name] = await prisma.role.create({ data: role });
  }

  const passwordHash = await bcrypt.hash('BeeSystem@2026', 10);
  const passwordLucas = await bcrypt.hash('beesystem@2024', 10);
  
  const users = [
    { name: 'Admin Supremo', email: 'admin@voltguard.com', cpf: '00000000001', roleId: createdRoles['ADMIN'].id, password: passwordHash },
    { name: 'Gerente Operacional', email: 'gerente@voltguard.com', cpf: '00000000002', roleId: createdRoles['MANAGER'].id, password: passwordHash },
    { name: 'Vendedor Sênior', email: 'vendedor@voltguard.com', cpf: '00000000003', roleId: createdRoles['SELLER'].id, password: passwordHash },
    { name: 'Oficial de Expedição', email: 'oficial@voltguard.com', cpf: '00000000004', roleId: createdRoles['OFFICER'].id, password: passwordHash },
    // Re-adicionando o usuário antigo para evitar bloqueio no login
    { name: 'Lucas Nunes', email: 'lucas@beesystem.com', cpf: '99999999999', roleId: createdRoles['ADMIN'].id, password: passwordLucas },
  ];

  const createdUsers = {};
  for (const user of users) {
    createdUsers[user.email] = await prisma.user.create({ data: user });
  }

  const customers = [
    { name: 'Padaria Central', document: '11111111000111', email: 'contato@padariacentral.com' },
    { name: 'Supermercado Elite', document: '22222222000122', email: 'compras@elite.com' },
    { name: 'Exportadora Global', document: '33333333000133', email: 'logistica@global.com' },
    { name: 'Mel Distribuidora SA', document: '44444444000144', email: 'sac@meldistribuidora.com' },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    createdCustomers.push(await prisma.customer.create({ data: customer }));
  }

  const suppliers = [
    { name: 'VoltGuard Supply', document: '20202020000120', email: 'supply@voltguard.com' },
  ];

  const createdSuppliers = [];
  for (const supplier of suppliers) {
    createdSuppliers.push(await prisma.supplier.create({ data: supplier }));
  }

  const products = [
    { code: 'SKU-VG-CAP-01', name: 'Capacete VoltGuard Pro', category: 'EPI', price: 120.00, minStock: 50 },
    { code: 'SKU-VG-LUV-02', name: 'Luva Isolante Classe 0', category: 'EPI', price: 45.50, minStock: 100 },
  ];

  const createdProducts = {};
  for (const product of products) {
    createdProducts[product.code] = await prisma.product.create({ data: product });
  }

  const today = new Date();
  const nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
  const lastMonth = new Date(); lastMonth.setDate(today.getDate() - 30);
  const nextYear = new Date(); nextYear.setFullYear(today.getFullYear() + 1);

  const lots = [
    { code: 'LOTE-VG-001-ATIVO', productId: createdProducts['SKU-VG-CAP-01'].id, supplierId: createdSuppliers[0].id, quantity: 500, availableQuantity: 500, expirationDate: nextYear, status: 'ACTIVE', location: 'GALPÃO A - P01' },
    { code: 'LOTE-VG-002-VENCIDO', productId: createdProducts['SKU-VG-LUV-02'].id, supplierId: createdSuppliers[0].id, quantity: 150, availableQuantity: 150, expirationDate: lastMonth, status: 'EXPIRED', location: 'GALPÃO C - P12' },
    { code: 'LOTE-VG-003-PERIGO', productId: createdProducts['SKU-VG-CAP-01'].id, supplierId: createdSuppliers[0].id, quantity: 150, availableQuantity: 150, expirationDate: nextWeek, status: 'ACTIVE', location: 'GALPÃO A - P02' },
  ];

  const createdLots = [];
  for (const lot of lots) {
    createdLots.push(await prisma.lot.create({ data: lot }));
  }

  // Gerar MASSA de pedidos para popular os gráficos
  console.log('Gerando massa de pedidos falsos para os gráficos...');
  const statuses = ['APPROVED', 'PENDING', 'REJECTED'];
  const sellerId = createdUsers['vendedor@voltguard.com'].id;

  for (let i = 1; i <= 345; i++) {
    // Distribute statuses logically: 60% approved, 30% pending, 10% rejected
    const rand = Math.random();
    const status = rand < 0.6 ? 'APPROVED' : rand < 0.9 ? 'PENDING' : 'REJECTED';
    
    await prisma.order.create({
      data: {
        code: `PED-VG-${String(1000 + i).padStart(4, '0')}`,
        customerId: createdCustomers[i % createdCustomers.length].id,
        sellerId: sellerId,
        status: status,
        totalAmount: Math.floor(Math.random() * 5000) + 100
      }
    });
  }

  console.log('Seed corporativo finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
