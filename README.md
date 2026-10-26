# BeeSystem

Sistema de gestão logística para controle de galpão, estoque, vendas e auditoria. Rastreia unidades por QR Code, aplica saída por FIFO com bloqueio de itens vencidos e controla o acesso por perfil (admin, gerente, vendedor, oficial).

## Stack

- Next.js 16 (App Router, Server Actions), React 19, TypeScript
- Tailwind CSS 4, Framer Motion, Recharts, TanStack Table
- Prisma 7 com PostgreSQL (adapter `pg`)
- Supabase Auth para login
- SheetJS (`xlsx`) para exportar relatórios

## Estrutura

Monorepo com npm workspaces:

```
backend/    schema do Prisma, seed e scripts de administração (criar/ativar usuários)
frontend/   aplicação Next.js
  app/            páginas, server actions (app/actions) e rotas de API do scanner
  components/     AppShell, leitor de QR Code e componentes da landing
  context/        contextos de autenticação e notificação
  lib/            clientes do Prisma e do Supabase, SSE do scanner
```

## Como rodar

Requisitos: Node.js 20+ e um banco PostgreSQL.

```bash
npm install

# crie um .env em backend/ e outro em frontend/ com as variáveis abaixo

npm run gerar-db   # gera o Prisma Client
npm run db:push    # cria as tabelas
npm run db:seed    # opcional: dados de exemplo
npm run dev        # http://localhost:3000
```

Para criar um usuário admin: `npm run criar-usuario`.

## Variáveis de ambiente

| Nome | Onde |
| --- | --- |
| `DATABASE_URL` | backend e frontend |
| `NEXT_PUBLIC_SUPABASE_URL` | frontend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend |
