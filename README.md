# Sistema Confeitaria Lourdes

Sistema de gerenciamento completo para confeitaria com funcionalidades de produtos, kits para festas, pedidos e comandas de produção.

## 🚀 Funcionalidades

- **Autenticação de usuários** com Supabase Auth
- **Gerenciamento de produtos** (CRUD completo)
- **Sistema de kits para festas** com personalização
- **Gestão de pedidos** com cálculo automático de preços
- **Comandas de produção** para cozinha
- **Interface responsiva** otimizada para desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Banco de dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Hospedagem**: Vercel

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com)

## 🚀 Configuração e Deploy

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá para "SQL Editor" no painel lateral
4. Execute o script `supabase-schema.sql` que está neste repositório
5. Vá para "Authentication > Users" e crie os usuários:
   - `francielle@lourdes.com` (senha: Franebella31)
   - `lourdes@lourdes.com` (senha: senhalourdes)
   - `lorenzo@lourdes.com` (senha: Lorenzo1289)
   - `isabella@lourdes.com` (senha: Victor44)
6. Anote as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: chave pública
   - **Service Role Key**: chave privada (mantenha segura!)

### 2. Configurar Vercel

1. Faça fork ou clone este repositório
2. Acesse [vercel.com](https://vercel.com) e conecte seu GitHub
3. Importe o projeto
4. Configure as variáveis de ambiente:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anonima
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```
5. Deploy automático será feito

### 3. Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev
```

## 📁 Estrutura do Projeto

```
/
├── index.html              # Página de login
├── sistema.html            # Sistema principal
├── script.js               # Lógica do frontend
├── styles.css              # Estilos CSS
├── api/                    # Serverless functions
│   ├── _supabase.js        # Configuração Supabase
│   ├── auth/
│   │   ├── login.js        # API de login
│   │   ├── session.js      # Verificação de sessão
│   │   └── logout.js       # Logout
│   ├── products.js         # CRUD produtos
│   ├── products/[id].js    # Produto específico
│   ├── orders.js           # CRUD pedidos
│   └── orders/[id].js      # Pedido específico
├── supabase-schema.sql     # Schema do banco
├── vercel.json            # Configuração Vercel
└── package.json           # Dependências
```

## 🔧 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/session` - Verificar sessão
- `POST /api/auth/logout` - Logout

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/[id]` - Atualizar produto
- `DELETE /api/products/[id]` - Excluir produto

### Pedidos
- `GET /api/orders` - Listar pedidos do usuário
- `POST /api/orders` - Criar pedido
- `GET /api/orders/[id]` - Buscar pedido específico
- `DELETE /api/orders/[id]` - Cancelar pedido

## 🎨 Funcionalidades do Sistema

### Produtos
- Cadastro de produtos com preço e descrição
- Categorias automáticas
- Regras de preço promocional para salgados

### Kits para Festas
- Kits pré-definidos (10, 15, 20, 30, 40, 50 pessoas)
- Personalização de sabores de bolo
- Seleção de salgados (sortidos ou escolha específica)
- Cálculo automático de preços

### Pedidos
- Interface intuitiva para criação de pedidos
- Cálculo automático de totais
- Sistema de depósitos/parciais
- Observações especiais
- Comandas de produção para cozinha

### Comandas
- Impressão otimizada
- Modo cópia para imagem
- Formatação específica para cozinha

## 🔒 Segurança

- Autenticação baseada em JWT
- Row Level Security (RLS) no Supabase
- Dados criptografados em trânsito
- Controle de acesso por usuário

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- Desktop
- Tablet
- Mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Confeitaria Lourdes** © 2025. Todos os direitos reservados.
