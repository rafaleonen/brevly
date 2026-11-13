import type { ShortLink } from "../entities/short-link.entity";

export type ShortLinkSort = "id_asc" | "id_desc" | "clicks_desc" | "clicks_asc";

export interface ShortLinkFindProps {
  limit: number;
  cursor?: string | undefined;
  sort?: ShortLinkSort;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ShortLinkExportData {
  id: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface ShortLinkRepository {
  find(props: ShortLinkFindProps): Promise<PaginatedResult<ShortLink>>;
  findById(id: string): Promise<ShortLink | null>;
  findBySlug(slug: string): Promise<ShortLink | null>;
  create(shortLink: ShortLink): Promise<void>;
  update(shortLink: ShortLink): Promise<void>;
  streamForExport(): AsyncIterable<ShortLinkExportData>;
}
