FROM node:24.22 AS base

RUN npm i -g pnpm

WORKDIR /usr/src/app

RUN printf 'allowBuilds:\n  esbuild: true\n' > pnpm-workspace.yaml

FROM base AS dependencies

COPY package.json ./

RUN pnpm install

FROM base AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod

FROM gcr.io/distroless/nodejs24-debian13 AS deploy

USER 1000

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 3333

CMD ["dist/main/server.js"]