import { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import { DeleteShortLinkByIdUseCase } from "@/application/use-cases/delete-short-link-by-id.use-case";
import { GetShortLinkByCodeUseCase } from "@/application/use-cases/get-short-link-by-code.use-case";
import { IncrementShortLinkClickByCodeUseCase } from "@/application/use-cases/increment-short-link-click-by-code.use-case";
import { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import { UuidIdGenerator } from "@/infrastructure/crypto/uuid-id-generator";
import type { Database } from "@/infrastructure/db/client";
import { DrizzleShortLinkRepository } from "@/infrastructure/db/repositories/drizzle-short-link.repository";
import { CreateShortLinkController } from "@/presentation/http/controllers/create-short-link.controller";
import { DeleteShortLinkByIdController } from "@/presentation/http/controllers/delete-short-link-by-id.controller";
import { GetShortLinkByCodeController } from "@/presentation/http/controllers/get-short-link-by-code.controller";
import { IncrementShortLinkClickByCodeController } from "@/presentation/http/controllers/increment-short-link-by-code.controller";
import { ListShortLinkByCodeController } from "@/presentation/http/controllers/list-short-links.controller";

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
  const getShortLinkByCode = new GetShortLinkByCodeUseCase(shortLinkRepository);
  const incrementShortLinkClickByCode =
    new IncrementShortLinkClickByCodeUseCase(shortLinkRepository);
  const listShortLinks = new ListShortLinksUseCase(shortLinkRepository);

  return {
    controllers: {
      createShortLink: new CreateShortLinkController(createShortLink),
      deleteShortLinkById: new DeleteShortLinkByIdController(
        deleteShortLinkById
      ),
      getShortLinkByCode: new GetShortLinkByCodeController(getShortLinkByCode),
      incrementShortLinkClickByCode:
        new IncrementShortLinkClickByCodeController(
          incrementShortLinkClickByCode
        ),
      listShortLinks: new ListShortLinkByCodeController(listShortLinks),
    },
  };
}

export type Container = ReturnType<typeof makeContainer>;
