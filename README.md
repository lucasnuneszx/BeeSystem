# 🐝 BEESYSTEM - Gestão Logística de Elite

Bem-vindo ao repositório oficial do **BEESYSTEM**, a solução definitiva para gestão logística corporativa premium. Este sistema foi desenvolvido do zero focado em alta performance, UX cinematográfica e conformidade total com requisitos de estoque e auditoria (RF01-RF16).

## 🚀 O Projeto

O BEESYSTEM não é apenas um dashboard; é um ecossistema completo para operações críticas. 

### O que entregamos aqui:
- **Segurança de Elite**: RBAC integrado (Gerente, Vendedor, Oficial) via Context API humanizada.
- **Vendas Inteligentes**: Fluxo completo de pedidos com estratégia FIFO (Primeiro que Entra, Primeiro que Sai) sugerida e bloqueios automáticos de itens vencidos.
- **Galpão Conectado**: Interface otimizada para terminais móveis, simulador de scanner QR e registro de disparidades em tempo real.
- **Inteligência de Gestão**: Auditoria temporal e monitoramento gerencial com justificativas obrigatórias para rejeições.

## 🛠️ Stack Tecnológica

Escolhemos o que há de mais moderno no mercado:
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Animações**: Framer Motion para microinterações fluidas.
- **Dados**: Prisma ORM (Atualmente configurado para SQLite para facilitar o deploy de teste).
- **Iconografia**: Lucide React.

## 📦 Como rodar localmente

1. Clone este repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Prepare o banco de dados (o projeto ja vem com um SQLite pré-configurado):
   ```bash
   npx prisma generate
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

Acesse em: [http://localhost:3000](http://localhost:3000)

## 🤝 Desenvolvido por

Este projeto foi construído com a paixão e o rigor técnico de uma equipe de desenvolvimento sênior. Cada linha de código foi escrita pensando na sustentabilidade, legibilidade e, acima de tudo, na experiência do usuário final.

---
*BEESYSTEM - Onde a logística encontra a sofisticação.*
