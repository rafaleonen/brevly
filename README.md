# Brev.ly

Aplicação Full Stack para gerenciamento de URLs encurtadas, desenvolvida como desafio prático da pós-graduação em Engenharia de Software da Rocketseat.

---

## Configurações

### Front-end

Crie um arquivo `.env` em `web/` seguindo as instruções do arquivo `.env.example`:

```env
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3333
```

### Back-end

Crie um arquivo `.env` em `server/` seguindo as instruções do arquivo `.env.example`

```env
PORT=3333

DATABASE_URL=postgres://...

FRONTEND_URL=http://localhost:5173

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_PUBLIC_URL=
```

---

## Como executar

### Forma 1 - Usando apenas Postgres com Docker

Na raiz do projeto:

```bash
docker compose up -d
pnpm dev
```

### Forma 2 - Usando Api (server) e Postgres com Docker

Na raiz do projeto:

```bash
docker compose -f docker-compose.full.yml up -d
pnpm dev:web
```

---

## Banco de Dados

### Migrações

Na raiz do projeto:

```bash
pnpm db:migrate
```

### Seed (opcional)

Na raiz do projeto:

```bash
pnpm db:seed
```

---

## Arquitetura, Funcionalidades e Ferramentas

## Web (Front-end)

Veja o [README do Web](./web/README.md).

### Server (Back-end)

Veja o [README do Server](./server/README.md).

---

## Autor

Desenvolvido por **Rafael Leonen** como desafio prático da pós-graduação da Rocketseat.
