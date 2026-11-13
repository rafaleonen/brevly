# Brev.ly Web

Aplicação Front-end para gerenciamento de URLs encurtadas, desenvolvida como desafio prático da pós-graduação em Engenharia de Software da Rocketseat.

---

## Funcionalidades

- Cadastro de links encurtados
- Validação de formulário
- Listagem dos links cadastrados
- Exclusão de links
- Download do relatório em CSV
- Redirecionamento para a URL original
- Página de link não encontrado
- Interface responsiva

---

## Arquitetura

A arquitetura seleciona é a `Feature Based` sem divisão por features (existe só uma):

```
brevly
├── web
│   └── src
|       ├── app (main.tsx, app.tsx)
|       ├── features (components, contansts, containers, mutations and queries)
|       ├── pages (montagem de containers e utilizados como rotas pelo useRouter)
|       ├── shared (api, assets, config, models, styles e ui)
│       ├── package.json
│       └── .env
│
├── docker-compose.yml
└── pnpm-lock.yaml
```

---

## Tecnologias

- React
- TypeScript
- Vite
- React Query
- React Hook Form
- Zod
- Axios
- Tailwind
