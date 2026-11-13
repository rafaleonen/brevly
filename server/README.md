# Brev.ly Server

Aplicação Back-end para gerenciamento de URLs encurtadas, desenvolvida como desafio prático da pós-graduação em Engenharia de Software da Rocketseat.

---

## Funcionalidades

- Criação de links encurtados
- Validação de URL e código encurtado
- Exclusão de links
- Listagem paginada
- Incremento automático da quantidade de acessos
- Exportação de relatório em CSV
- Upload do CSV para Cloudflare R2
- Disponibilização do arquivo através de URL pública

---

## Arquitetura

A arquitetura seleciona é a `Clean Architecture` sem divisão por módulos:

```
brevly
├── server
│   └── src
|       ├── core - Base da aplicação (either.ts, error.ts, entity.ts)
|       ├── domain - Definição de entidades e regas (entities, errors, value-objects e definição de repositórios)
|       ├── application - Funcionamento (use cases, dtos e definição de ports)
|       ├── infrastructure - Integração (db/drizzle, config/env, crypto e storage/r2)
│       ├── presentation/http - HTTP (controllers, routes e presenters)
│       ├── main - Principal (container.ts, server.ts, app.ts e adapters)
│       ├── tests - Testes (factories, in-memory, mocks e helpers para teste unitário, integração e e2e)
│       └── .env
│
├── docker-compose.yml
└── pnpm-lock.yaml
```

---

## Cursor based pagination

Para a listagem de links encurtador foi utilizado a páginação baseado em cursor usando UUIDv7. Também foi implementado o campo `sort`, alterando a forma em que o cursor realiza a páginação por meio do `nextCursor`

---

## SOLID

### S — Single Responsibility Principle (Responsabilidade Única)

Uma classe ou módulo deve ter um único motivo para mudar. Um caso de uso que cria um usuário não deve também enviar e-mail, formatar HTTP e escrever SQL.

Ná prática:
Entidade valida dados, caso de uso orquestra, controller traduz HTTP, repositório persiste. Cada um tem um só motivo para mudar.

### O — Open/Closed Principle (Aberto/Fechado)

O código deve estar aberto para extensão e fechado para modificação. Você adiciona comportamento novo criando novas implementações, sem editar o que já funciona.

Ná prática:
Trocar R2 por S3 significa criar S3StorageProvider. O StorageProvider.update não muda.

### L — Liskov Substitution Principle (Substituição de Liskov)

Qualquer implementação de uma abstração deve poder substituir outra sem quebrar quem a usa. Se ShortLinkRepository promete retornar null quando não acha o usuário, a versão Postgres e a versão em memória precisam cumprir o mesmo contrato.

Ná prática:
InMemoryShortLinkRepository e DrizzleShortLinkRepository são intercambiáveis. Os testes rodam com um e a produção com o outro.

### I — Interface Segregation Principle (Segregação de Interfaces)

É melhor ter várias interfaces pequenas e específicas do que uma interface grande. Um caso de uso que só lê dados não deve depender de uma interface com delete, update etc.

Ná prática:
Portas pequenas (findById, create). Um caso de uso de listagem não depende de save.

### D — Dependency Inversion Principle (Inversão de Dependência)

Módulos de alto nível (regras de negócio) não devem depender de módulos de baixo nível (banco, framework). Os dois dependem de abstrações. Esse é o princípio central da Clean Architecture.

Ná prática:
`application/` não importa nada de `infrastructure/`. Quem conhece as implementações concretas é só o `main/`.

---

## Tecnologias

- Fastify
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod
- AWS SDK (Cloudflare R2)
- Vitest
- Testcontainer
- CSV strinfigy
- Swagger
- Scalar UI

---

## Documentação

Open API usando swagger e scalar:

```
http://localhost:3333/docs
```

---

## Testes

### Unitários

São rodados a partir de:

```bash
pnpm test
pnpm test:watch
```

Abordam os seguintes arquivos:

- domain/entities
- domain/value-objects
- application/use-cases
- presentation/http/controllers

### Integração

São rodados a partir de:

```bash
pnpm test-int
pnpm test-int:watch
```

Abordam os seguintes arquivos:

- infrastructure/db/repositories

### E2E (Testam a aplicação como todo)

São rodados a partir de:

```bash
pnpm test-int
pnpm test-int:watch
```

Se encontram na pasta:

- tests/e2e
