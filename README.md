# WEB POINT — E-commerce SSR

> Plataforma de e-commerce completa construída com **Next.js 16** e **React 19**, utilizando Server-Side Rendering, Server Components e Server Actions. Projeto didático que demonstra uma arquitetura moderna e organizada do App Router.

---

## ✨ Funcionalidades

- **Loja** — grid de produtos com busca, filtro por categoria e carrinho lateral
- **Pedidos** — criação, histórico e acompanhamento de status
- **Autenticação** — registro, login e logout com cookie HTTP-Only (`wp_session`)
- **Painel Admin** — dashboard com métricas, gestão de produtos e pedidos
- **Controle de estoque** — atualizado automaticamente ao finalizar pedido
- **Roles** — perfis `USER` e `ADMIN` com proteção de rotas

---

## 🗂️ Estrutura do Projeto

```
webpoint-ssr/
├── app/                        # Rotas e páginas (Next.js App Router)
│   ├── api/                    # API Routes
│   │   ├── auth/               #   login · logout · register · me
│   │   ├── products/           #   CRUD de produtos
│   │   └── pedidos/            #   criar · listar · atualizar status
│   ├── admin/                  # Páginas do painel admin (SSR)
│   │   ├── pedidos/
│   │   └── produtos/
│   ├── loja/                   # Loja pública (Client Component)
│   ├── pedidos/                # Histórico de pedidos do usuário
│   ├── login/
│   ├── register/
│   ├── styles/
│   │   └── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Redireciona para /loja
│
├── components/                 # Componentes de UI reutilizáveis
│   ├── Navbar.tsx
│   ├── ProductForm.tsx
│   └── ProductList.tsx
│
├── lib/                        # Lógica server-side (nunca exposta ao cliente)
│   ├── db.ts                   # Leitura/escrita de arquivos JSON
│   ├── auth.ts                 # Autenticação, sessão, guards
│   ├── products.ts             # CRUD de produtos
│   ├── orders.ts               # Criação e gestão de pedidos
│   └── types.ts                # Interfaces TypeScript
│
├── .data/                      # Banco de dados em JSON (gerado em runtime)
│   ├── users.json
│   ├── products.json
│   └── orders.json
│
└── public/                     # Assets estáticos
```

---

## 🏗️ Arquitetura

O projeto adota uma separação clara entre camadas:

```
Browser (Client)  →  Next.js (Server)  →  lib/  →  .data/ (JSON)
```

- **`app/`** contém apenas rotas — pages e API routes
- **`lib/`** concentra toda a lógica de servidor (`'use server'`), nunca enviada ao browser
- **`components/`** contém os componentes de UI reutilizáveis
- Pages marcadas como Server Components buscam dados diretamente via `lib/`, sem fetch extra

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Linguagem | TypeScript 5 (strict) |
| Estilo | CSS Variables puro (zero Tailwind no runtime) |
| Banco de dados | JSON flat files via `fs/promises` |
| Autenticação | Cookie HTTP-Only com token assinado |

---

## 🚀 Como rodar

**Pré-requisitos:** Node.js 18+

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/webpoint-ssr.git
cd webpoint-ssr

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)** — você será redirecionado para `/loja`.

### Criar conta admin

O sistema não cria um admin automaticamente. Para testar o painel admin, edite o arquivo `.data/users.json` após criar uma conta e altere o campo `"tipo"` de `"USER"` para `"ADMIN"`.

---

## 📋 Rotas disponíveis

### Páginas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/loja` | Client | Loja com carrinho |
| `/login` | Client | Login de usuário |
| `/register` | Client | Cadastro |
| `/pedidos` | Server | Histórico de pedidos |
| `/admin` | Server | Dashboard admin |
| `/admin/pedidos` | Server | Gestão de pedidos |
| `/admin/produtos` | Server | Gestão de produtos |

### API Routes

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/products` | GET, POST, PUT, DELETE | CRUD de produtos |
| `/api/pedidos` | GET, POST | Listar e criar pedidos |
| `/api/pedidos/[id]/status` | PATCH | Atualizar status do pedido |
| `/api/auth/register` | POST | Cadastro |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Usuário autenticado |

---

## ⚠️ Avisos de Segurança

Este projeto é **didático**. Para uso em produção, substitua:

- **Hash de senha** — o projeto usa base64 por não ter dependências externas. Use `bcrypt` ou `argon2`
- **Assinatura de token** — o segredo de sessão está fixo no código. Use variável de ambiente + `crypto` nativo ou `jose`
- **Banco de dados** — JSON flat files não suportam concorrência. Use SQLite ou PostgreSQL
- **Validação de inputs** — adicione `zod` nas Server Actions e API routes

---

## 📦 Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Verifica o código com ESLint
```

---

## 📄 Licença

MIT
