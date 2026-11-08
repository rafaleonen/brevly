import { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import { DeleteShortLinkByIdUseCase } from "@/application/use-cases/delete-short-link-by-id.use-case";
import { GetShortLinkBySlugUseCase } from "@/application/use-cases/get-short-link-by-slug.use-case";
import { IncrementShortLinkClickBySlugUseCase } from "@/application/use-cases/increment-short-link-click-by-slug.use-case";
import { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import { UuidIdGenerator } from "@/infrastructure/crypto/uuid-id-generator";
import type { Database } from "@/infrastructure/db/client";
import { DrizzleShortLinkRepository } from "@/infrastructure/db/repositories/drizzle-short-link.repository";
import { CreateShortLinkController } from "@/presentation/http/controllers/create-short-link.controller";
import { DeleteShortLinkByIdController } from "@/presentation/http/controllers/delete-short-link-by-id.controller";
import { GetShortLinkBySlugController } from "@/presentation/http/controllers/get-short-link-by-slug.controller";
import { IncrementShortLinkClickBySlugController } from "@/presentation/http/controllers/increment-short-link-by-slug.controller";
import { ListShortLinksController } from "@/presentation/http/controllers/list-short-links.controller";

interface ContainerDeps {
  db: Database;
}

export function makeContainer({ db }: ContainerDeps) {
  // ports
  const idGenerator = new UuidIdGenerator();

  // repositories
  const shortLinkRepository = new DrizzleShortLinkRepository(db);

  // use cases
  const createShortLink = new CreateShortLinkUseCase(
    shortLinkRepository,
    idGenerator
  );
  const deleteShortLinkById = new DeleteShortLinkByIdUseCase(
    shortLinkRepository
  );
  const getShortLinkBySlug = new GetShortLinkBySlugUseCase(shortLinkRepository);
  const incrementShortLinkClickBySlug =
    new IncrementShortLinkClickBySlugUseCase(shortLinkRepository);
  const listShortLinks = new ListShortLinksUseCase(shortLinkRepository);

  return {
    controllers: {
      createShortLink: new CreateShortLinkController(createShortLink),
      deleteShortLinkById: new DeleteShortLinkByIdController(
        deleteShortLinkById
      ),
      getShortLinkBySlug: new GetShortLinkBySlugController(getShortLinkBySlug),
      incrementShortLinkClickBySlug:
        new IncrementShortLinkClickBySlugController(
          incrementShortLinkClickBySlug
        ),
      listShortLinks: new ListShortLinksController(listShortLinks),
    },
  };
}

export type Container = ReturnType<typeof makeContainer>;
