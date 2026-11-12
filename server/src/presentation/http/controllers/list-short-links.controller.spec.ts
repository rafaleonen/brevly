import { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import { InvalidCursor } from "@/domain/errors/short-link.error";
import { makeShortLink } from "@/tests/factories/make-short-link";
import { makeFakeReply, makeFakeRequest } from "@/tests/mocks/fake-reply";
import { InMemoryShortLinkRepository } from "@/tests/repositories/in-memory-short-link.repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListShortLinksController } from "./list-short-links.controller";

describe("ListShortLinksController", () => {
  let shortLinkRepository: InMemoryShortLinkRepository;
  let useCase: ListShortLinksUseCase;
  let sut: ListShortLinksController;

  async function seed(count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await shortLinkRepository.create(
        makeShortLink({ id: `link-${i}`, slug: `link-${i}`, clicks: i })
      );
    }
  }

  const ids = (payload: { items: { id: string }[] }) =>
    payload.items.map((item) => item.id);

  beforeEach(() => {
    shortLinkRepository = new InMemoryShortLinkRepository();
    useCase = new ListShortLinksUseCase(shortLinkRepository);
    sut = new ListShortLinksController(useCase);
  });

  it("should respond 200 with an empty list", async () => {
    const fake = makeFakeReply();

    await sut.handle(makeFakeRequest({ query: {} }), fake.reply);

    expect(fake.statusCode).toBe(200);
    expect(fake.payload).toEqual({ items: [], nextCursor: null });
  });

  it("should present every item", async () => {
    const createdAt = new Date("2025-06-01T00:00:00.000Z");
    await shortLinkRepository.create(
      makeShortLink({
        id: "link-1",
        slug: "my-link",
        originalUrl: "http://example.com/",
        clicks: 2,
        createdAt,
      })
    );
    const fake = makeFakeReply();

    await sut.handle(makeFakeRequest({ query: {} }), fake.reply);

    expect(fake.payload.items).toEqual([
      {
        id: "link-1",
        slug: "my-link",
        clicks: 2,
        originalUrl: "http://example.com/",
        protocol: "http",
        hasTLS: false,
        createdAt,
        deletedAt: null,
      },
    ]);
  });

  it("should apply the query defaults", async () => {
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(makeFakeRequest({ query: {} }), makeFakeReply().reply);

    expect(executeSpy).toHaveBeenCalledWith({
      limit: 10,
      sort: "id_desc",
      cursor: undefined,
    });
  });

  it("should coerce limit from a query string", async () => {
    await seed(3);
    const executeSpy = vi.spyOn(useCase, "execute");
    const fake = makeFakeReply();

    await sut.handle(
      makeFakeRequest({ query: { limit: "2", sort: "clicks_asc" } }),
      fake.reply
    );

    expect(executeSpy).toHaveBeenCalledWith({
      limit: 2,
      sort: "clicks_asc",
      cursor: undefined,
    });
    expect(ids(fake.payload)).toEqual(["link-1", "link-2"]);
    expect(fake.payload.nextCursor).toEqual(expect.any(String));
  });

  it("should return the next page when given the cursor", async () => {
    await seed(3);
    const first = makeFakeReply();
    await sut.handle(
      makeFakeRequest({ query: { limit: "2", sort: "clicks_asc" } }),
      first.reply
    );

    const second = makeFakeReply();
    await sut.handle(
      makeFakeRequest({
        query: {
          limit: "2",
          sort: "clicks_asc",
          cursor: first.payload.nextCursor,
        },
      }),
      second.reply
    );

    expect(second.statusCode).toBe(200);
    expect(ids(second.payload)).toEqual(["link-3"]);
    expect(second.payload.nextCursor).toBeNull();
  });

  it.each([
    ["an unknown sort", { sort: "name_asc" }, "sort"],
    ["a non numeric limit", { limit: "abc" }, "limit"],
  ])("should respond 400 VALIDATION_ERROR for %s", async (_, query, field) => {
    const fake = makeFakeReply();
    const executeSpy = vi.spyOn(useCase, "execute");

    await sut.handle(makeFakeRequest({ query }), fake.reply);

    expect(fake.statusCode).toBe(400);
    expect(fake.payload.code).toBe("VALIDATION_ERROR");
    expect(fake.payload.issues[0].field).toBe(field);
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it("should let InvalidCursor propagate to the error handler", async () => {
    await expect(
      sut.handle(
        makeFakeRequest({ query: { cursor: "invalid" } }),
        makeFakeReply().reply
      )
    ).rejects.toBeInstanceOf(InvalidCursor);
  });
});
