# Build context: the monorepo root (see docker-compose.full.yml), so the
# workspace pnpm-lock.yaml is available. Only the server package is copied
# and installed; see Dockerfile.dockerignore for what enters the context.
FROM node:24.22 AS base

RUN npm i -g pnpm@10.12.4

ENV PNPM_STORE_DIR=/pnpm/store

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/

FROM base AS build

# --filter server installs only the server importer from the lockfile, not web.
RUN pnpm install --frozen-lockfile --filter server

COPY server/ ./server/

RUN pnpm --filter server build

FROM base AS prod-dependencies

RUN pnpm install --frozen-lockfile --filter server --prod

FROM gcr.io/distroless/nodejs24-debian13 AS deploy

USER 1000

WORKDIR /usr/src/app

COPY --from=prod-dependencies /usr/src/app/node_modules ./node_modules
COPY --from=prod-dependencies /usr/src/app/server/node_modules ./server/node_modules
COPY --from=build /usr/src/app/server/dist ./server/dist
COPY server/package.json ./server/package.json

WORKDIR /usr/src/app/server

EXPOSE 3333

CMD ["dist/main/server.js"]
