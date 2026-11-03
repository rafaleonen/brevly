import { DomainError } from "@/core/error";
import { presentDomainError } from "@/presentation/http/presenters/error.presenter";
import type { FastifyError, FastifyInstance } from "fastify";

export function buildErrors(app: FastifyInstance) {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    // Erro de domínio que escapou (ex.: lançado pelo repositório).
    if (error instanceof DomainError) {
      return presentDomainError(error, reply);
    }

    // Erro 4xx de plugin ou do próprio Fastify (rate limit, JSON inválido...).
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    // Qualquer outra coisa é bug ou infra: loga completo, responde genérico.
    request.log.error({ err: error }, "error not handled");
    return reply
      .status(500)
      .send({ code: "INTERNAL_ERROR", message: "Internal Error." });
  });
}
