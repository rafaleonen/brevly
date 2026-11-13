import { CreateShortLinkUseCase } from "@/application/use-cases/create-short-link.use-case";
import { DeleteShortLinkBySlugUseCase } from "@/application/use-cases/delete-short-link-by-slug.use-case";
import { ExportShortLinksUseCase } from "@/application/use-cases/export-short-links.use-case";
import { GetShortLinkBySlugUseCase } from "@/application/use-cases/get-short-link-by-slug.use-case";
import { IncrementShortLinkClickBySlugUseCase } from "@/application/use-cases/increment-short-link-click-by-slug.use-case";
import { ListShortLinksUseCase } from "@/application/use-cases/list-short-links.use-case";
import { UuidIdGenerator } from "@/infrastructure/crypto/uuid-id-generator";
import type { Database } from "@/infrastructure/db/client";
import { DrizzleShortLinkRepository } from "@/infrastructure/db/repositories/drizzle-short-link.repository";
import { R2StorageProvider } from "@/infrastructure/storage/r2-storage";
import { CreateShortLinkController } from "@/presentation/http/controllers/create-short-link.controller";
import { DeleteShortLinkBySlugController } from "@/presentation/http/controllers/delete-short-link-by-slug.controller";
import { ExportShortLinksController } from "@/presentation/http/controllers/export-short-links.controller";
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

  // storage
  const storageProvider = new R2StorageProvider();

  // use cases
  const createShortLink = new CreateShortLinkUseCase(
    shortLinkRepository,
    idGenerator
  );
  const deleteShortLinkBySlug = new DeleteShortLinkBySlugUseCase(
    shortLinkRepository
  );
  const getShortLinkBySlug = new GetShortLinkBySlugUseCase(shortLinkRepository);
  const incrementShortLinkClickBySlug =
    new IncrementShortLinkClickBySlugUseCase(shortLinkRepository);
  const listShortLinks = new ListShortLinksUseCase(shortLinkRepository);
  const exportShortLinks = new ExportShortLinksUseCase(
    shortLinkRepository,
    storageProvider
  );

  return {
    controllers: {
      createShortLink: new CreateShortLinkController(createShortLink),
      deleteShortLinkBySlug: new DeleteShortLinkBySlugController(
        deleteShortLinkBySlug
      ),
      getShortLinkBySlug: new GetShortLinkBySlugController(getShortLinkBySlug),
      incrementShortLinkClickBySlug:
        new IncrementShortLinkClickBySlugController(
          incrementShortLinkClickBySlug
        ),
      listShortLinks: new ListShortLinksController(listShortLinks),
      exportShortLinks: new ExportShortLinksController(exportShortLinks),
    },
  };
}

export type Container = ReturnType<typeof makeContainer>;
