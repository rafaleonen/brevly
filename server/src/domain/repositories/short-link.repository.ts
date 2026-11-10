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

export interface ShortLinkRepository {
  find(props: ShortLinkFindProps): Promise<PaginatedResult<ShortLink>>;
  findById(id: string): Promise<ShortLink | null>;
  findBySlug(slug: string): Promise<ShortLink | null>;
  create(shortLink: ShortLink): Promise<void>;
  update(shortLink: ShortLink): Promise<void>;
}
