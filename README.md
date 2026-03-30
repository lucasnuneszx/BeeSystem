<div align="center">
  <img src="https://img.shields.io/badge/BeeSystem-Logística_Corporativa-FFB800?style=for-the-badge&logoColor=black" alt="BeeSystem Logo" />
  <h1>🐝 BeeSystem</h1>
  <p><b>A Plataforma Premium de Gestão Logística e Corporativa</b></p>
  
  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-módulos-do-sistema">Módulos</a> •
    <a href="#-como-rodar">Como Rodar</a> •
    <a href="#-autor">Autor</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/status-ativo-success.svg?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/versão-1.0.0-blue.svg?style=flat-square" alt="Versão" />
    <img src="https://img.shields.io/badge/licença-MIT-green.svg?style=flat-square" alt="Licença" />
  </p>
</div>

---

## 📖 Sobre o Projeto

**BeeSystem** é um sistema empresarial de ponta, desenvolvido para orquestrar operações logísticas, controle de galpões, gestão de vendas e monitoramento gerencial através de uma interface moderna e intuitiva. O projeto busca solucionar problemas de integridade de dados ("disparidade"), conciliação de pagamentos e fornecimento de métricas logísticas (indicadores de performance) em tempo real.

O sistema conta com um ecossistema completo para lidar com fluxos de estoque diários, controle de acessos (painel corporativo), painel de administrador centralizadoiz, etc. Tudo focado na máxima velocidade, com arquitetura Server Actions e componentes de interface impecáveis.

## 🚀 Tecnologias

A aplicação foi baseada no que há de mais moderno no ecossistema Web, garantindo performance, segurança e uma experiência de usuário (UX) excepcional.

<div align="center">
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br>

**Bibliotecas Principais:**
- **[Framer Motion](https://www.framer.com/motion/):** Para transições e animações ricas e engajadoras (Micro-interaões de ponta).
- **[Recharts](https://recharts.org/):** Para criação de gráficos detalhados de KPIs de processos gerenciais.
- **[TanStack Table](https://tanstack.com/table/):** Manipulação e rederização eficiente de altas cargas de dados logísticos (arquivos XLSX, etc.).
- **[XLSX (SheetJS)](https://sheetjs.com/):** Validação de Importação e Exportação de planilhas locais para gestão de disparidade de galpões.

## 🧩 Módulos do Sistema

| Módulo | Descrição |
| :--- | :--- |
| 🛡️ **Admin** | Painel restrito de gerenciamento de usuários globais e configurações de todo o serviço, criação de permissões. |
| 📊 **Dashboard** | Resumo em tempo real de toda a frota, atividades de vendas e status gerais do galpão gerencial. |
| 🏢 **Gerencial** | Focado nos gestores. Comporta seções de análise de relatórios, acompanhamento financeiro, e controle administrativo de ponta a ponta. |
| 📦 **Galpão** | Módulo focado na verificação logística; possui o "Disparidade", para encontrar discrepâncias e erros de mercadorias no fluxo. |
| 💰 **Vendas** | Gerenciamento de funil, transações e Saídas. Interface baseada em conversão de metas rápidas. |

## ⚙️ Como Rodar

Para executar este projeto na sua máquina de desenvolvimento, siga os passos abaixo:

**Pré-requisitos:** Node.js v18+ e um banco de dados PostgreSQL configurado.

```bash
# 1. Clone o repositório
git clone https://github.com/lucasnuneszx/BeeSystem.git
cd BeeSystem

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com base no seu DB:
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/beesystem_db"

# 4. Gere as tabelas do Prisma no banco de dados
npx prisma db push
# Ou utilize as migrações: npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 👨‍💻 Autor

Desenvolvido por **[Lucas Nunes (lucasnuneszx)](https://github.com/lucasnuneszx)**

<a href="https://github.com/lucasnuneszx">
  <img src="https://img.shields.io/github/followers/lucasnuneszx?label=Follow&style=social" alt="GitHub followers" />
</a>
<br/>
<br/>

> *"Inovação logística, desenhada para uma performance enterprise."*

---
<p align="center">Copyright © 2026 BeeSystem. Todos os direitos reservados.</p>
