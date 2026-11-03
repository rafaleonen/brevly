import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import { buildCompilers } from "./adapters/compilers";
import { buildDocumentation } from "./adapters/documentation";
import { buildErrors } from "./adapters/errors";
import { buildRoutes } from "./adapters/routes";
import type { Container } from "./container";

export function buildApp(container: Container) {
  const app = fastify();

  app.register(fastifyCors, {
    origin: "*",
  });

  buildCompilers(app);
  buildDocumentation(app);
  buildErrors(app);

  buildRoutes(app, container);

  return app;
}
