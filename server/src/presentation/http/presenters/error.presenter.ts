import type { DomainError } from "@/core/error";
import type { FastifyReply } from "fastify";
import type { ZodError } from "zod";

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_URL: 400,
  INVALID_SLUG: 400,
  INVALID_CURSOR: 400,
  NOT_FOUND: 404,
  SLUG_ALREADY_EXISTS: 409,
};

export function presentDomainError(error: DomainError, reply: FastifyReply) {
  const status = STATUS_BY_CODE[error.code] ?? 400;

  return reply.status(status).send({
    code: error.code,
    message: error.message,
  });
}

export function presentZodValidationError(
  zodError: ZodError<unknown>,
  reply: FastifyReply
) {
  return reply.status(400).send({
    code: "VALIDATION_ERROR",
    message: "Dados inválidos.",
    issues: zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}
