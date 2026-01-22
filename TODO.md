# Plano de Implementação - Backend Sistema Confeitaria Lourdes

## ✅ Etapa 1: Configuração do Supabase
- [ ] Criar projeto no Supabase
- [ ] Configurar tabelas do banco:
  - `users` (usuários)
  - `products` (produtos)
  - `orders` (pedidos)
  - `order_items` (itens dos pedidos)
- [ ] Configurar Row Level Security (RLS)
- [ ] Obter chaves API (anon key e service role)

## ✅ Etapa 2: Estrutura do Projeto Vercel
- [ ] Criar estrutura de pastas: `/api`
- [ ] Instalar dependências: `@supabase/supabase-js`
- [ ] Configurar variáveis de ambiente
- [ ] Criar arquivo de configuração do Supabase

## ✅ Etapa 3: API de Autenticação
- [ ] POST `/api/auth/login` - Login de usuário
- [ ] POST `/api/auth/logout` - Logout
- [ ] GET `/api/auth/session` - Verificar sessão
- [ ] Migrar usuários hardcoded para Supabase Auth

## ✅ Etapa 4: API de Produtos
- [ ] GET `/api/products` - Listar produtos
- [ ] POST `/api/products` - Criar produto
- [ ] PUT `/api/products/[id]` - Atualizar produto
- [ ] DELETE `/api/products/[id]` - Excluir produto

## ✅ Etapa 5: API de Pedidos
- [ ] GET `/api/orders` - Listar pedidos
- [ ] POST `/api/orders` - Criar pedido
- [ ] GET `/api/orders/[id]` - Buscar pedido específico
- [ ] DELETE `/api/orders/[id]` - Cancelar pedido

## ✅ Etapa 6: Atualização do Frontend
- [ ] Substituir localStorage por chamadas API
- [ ] Atualizar funções de autenticação
- [ ] Atualizar funções de produtos
- [ ] Atualizar funções de pedidos
- [ ] Adicionar tratamento de erros de rede

## ✅ Etapa 7: Deploy e Testes
- [ ] Deploy no Vercel
- [ ] Testar todas as funcionalidades
- [ ] Configurar domínio (opcional)
- [ ] Otimizações finais

## 📋 Dados Atuais (localStorage)
- **Usuários**: francielle, lourdes, lorenzo, isabella (hardcoded)
- **Produtos**: Array com ~47 produtos pré-definidos
- **Pedidos**: Array vazio inicialmente
- **Kits Festa**: Dados hardcoded no JavaScript

## 🔧 Tecnologias
- **Frontend**: HTML, CSS (Tailwind), JavaScript vanilla
- **Backend**: Vercel Serverless Functions (Node.js)
- **Banco**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Hosting**: Vercel

## 🎯 Funcionalidades Principais
1. Sistema de login/logout
2. CRUD de produtos
3. Calculadora de preços com regras promocionais
4. Sistema de kits para festas
5. Gestão de pedidos com comandas de produção
6. Impressão/cópia de comandas
