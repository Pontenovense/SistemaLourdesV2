# Plano de Implementação - Backend Sistema Confeitaria Lourdes

## ✅ Etapa 1: Configuração do Supabase - CONCLUÍDA
- [x] Criar projeto no Supabase
- [x] Configurar tabelas do banco:
  - [x] `users` (usuários)
  - [x] `products` (produtos)
  - [x] `orders` (pedidos)
  - [x] `order_items` (itens dos pedidos)
- [x] Configurar Row Level Security (RLS)
- [x] Executar script `supabase-schema-final.sql`
- [ ] Obter chaves API (anon key e service role)
- [ ] Criar usuários no Supabase Auth

## ✅ Etapa 2: Estrutura do Projeto Vercel - CONCLUÍDA
- [x] Criar estrutura de pastas: `/api`
- [x] Instalar dependências: `@supabase/supabase-js`
- [x] Configurar variáveis de ambiente
- [x] Criar arquivo de configuração do Supabase

## ✅ Etapa 3: API de Autenticação - CONCLUÍDA
- [x] POST `/api/auth/login` - Login de usuário
- [x] POST `/api/auth/logout` - Logout
- [x] GET `/api/auth/session` - Verificar sessão
- [x] Migrar usuários hardcoded para Supabase Auth

## ✅ Etapa 4: API de Produtos - CONCLUÍDA
- [x] GET `/api/products` - Listar produtos
- [x] POST `/api/products` - Criar produto
- [x] PUT `/api/products/[id]` - Atualizar produto
- [x] DELETE `/api/products/[id]` - Excluir produto

## ✅ Etapa 5: API de Pedidos - CONCLUÍDA
- [x] GET `/api/orders` - Listar pedidos
- [x] POST `/api/orders` - Criar pedido
- [x] GET `/api/orders/[id]` - Buscar pedido específico
- [x] DELETE `/api/orders/[id]` - Cancelar pedido

## ⏳ Etapa 6: Atualização do Frontend - PENDENTE
- [ ] Substituir localStorage por chamadas API
- [ ] Atualizar funções de autenticação
- [ ] Atualizar funções de produtos
- [ ] Atualizar funções de pedidos
- [ ] Adicionar tratamento de erros de rede

## ⏳ Etapa 7: Deploy e Testes - PENDENTE
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
