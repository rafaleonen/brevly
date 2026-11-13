import type { FastifyReply, FastifyRequest } from "fastify";
import { vi } from "vitest";

// Minimal stand-in for FastifyReply: records the status code and payload so
// controller tests can assert on them without starting a server.
export function makeFakeReply() {
  const state: { statusCode: number | undefined; payload: unknown } = {
    statusCode: undefined,
    payload: undefined,
  };

  const reply = {
    status: vi.fn((code: number) => {
      state.statusCode = code;
      return reply;
    }),
    send: vi.fn((payload?: unknown) => {
      state.payload = payload;
      return reply;
    }),
  };

  return {
    reply: reply as unknown as FastifyReply,
    status: reply.status,
    send: reply.send,
    get statusCode() {
      return state.statusCode;
    },
    get payload() {
      return state.payload as any;
    },
  };
}

// Includes a stub logger so controllers can call request.log.* safely.
export function makeFakeRequest(
  parts: Partial<Pick<FastifyRequest, "body" | "params" | "query">>
): FastifyRequest {
  const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };

  return { log, ...parts } as unknown as FastifyRequest;
}
