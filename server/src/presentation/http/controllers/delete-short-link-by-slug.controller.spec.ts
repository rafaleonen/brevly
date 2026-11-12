import { DeleteShortLinkBySlugUseCase } from "@/application/use-cases/delete-short-link-by-slug.use-case";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { makeFakeReply, makeFakeRequest } from "@/tests/mocks/fake-reply";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteShortLinkBySlugController } from "./delete-short-link-by-slug.controller";

describe("DeleteShortLinkBySlugController", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let useCase: DeleteShortLinkBySlugUseCase;
  let sut: DeleteShortLinkBySlugController;

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    useCase = new DeleteShortLinkBySlugUseCase(shortLinkRepository);
    sut = new DeleteShortLinkBySlugController(useCase);
  });

  it("should respond 204 without a body and soft delete the link", async () => {
    await shortLinkRepository.create(makeShortLink({ slug: "my-link" }));
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      fake.reply
    );

    expect(fake.statusCode).toBe(204);
    expect(fake.payload).toBeUndefined();
    expect(shortLinkRepository.items[0]?.deletedAt).toBeInstanceOf(Date);
  });

  it("should pass the slug from the params to the use case", async () => {
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      makeFakeReply().reply
    );

    expect(executeSpy).toHaveBeenCalledWith({ slug: "my-link" });
  });

  it("should respond 404 NOT_FOUND when the slug does not exist", async () => {
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "missing" } }),
      fake.reply
    );

    expect(fake.statusCode).toBe(404);
    expect(fake.payload).toEqual({
      code: "NOT_FOUND",
      message: "Slug not found.",
    });
  });

  it("should respond 404 NOT_FOUND when the link is already deleted", async () => {
    await shortLinkRepository.create(
      makeShortLink({ slug: "my-link", deletedAt: new Date() })
    );
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ params: { slug: "my-link" } }),
      fake.reply
    );

    expect(fake.statusCode).toBe(404);
  });

  it.each([
    ["missing slug", {}],
    ["slug longer than 48 characters", { slug: "a".repeat(49) }],
  ])("should respond 400 VALIDATION_ERROR for %s", async (_, params) => {
    const fake = makeFakeReply();
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(makeFakeRequest({ params }), fake.reply);

    expect(fake.statusCode).toBe(400);
    expect(fake.payload.code).toBe("VALIDATION_ERROR");
    expect(fake.payload.issues[0].field).toBe("slug");
    expect(executeSpy).not.toHaveBeenCalled();
  });
});
