import fastifySwagger from "@fastify/swagger";
import scalarUI from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export function buildDocumentation(app: FastifyInstance) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Brev.ly Docs",
        version: "1.0.0",
      },
    },

    transform: jsonSchemaTransform,
  });

  app.get("/openai.json", () => app.swagger());

  app.register(scalarUI, {
    routePrefix: "/docs",
    configuration: {
      theme: "deepSpace",
    },
  });
}
