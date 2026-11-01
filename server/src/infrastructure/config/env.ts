import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import scalarUI from "@scalar/fastify-api-reference";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Example API Docs",
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

app
  .listen({ port: 3333 })
  .then(() => console.log("Server is running at 3333!"));
