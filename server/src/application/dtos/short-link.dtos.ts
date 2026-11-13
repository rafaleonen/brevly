import type { ShortLinkSort } from "@/domain/repositories/short-link.repository";

export interface CreateShortLinkInputDTO {
  slug: string;
  url: string;
}

export interface CreateShortLinkOutputDTO {
  slug: string;
  originalUrl: string;
  protocol: string;
}

export interface DeleteShortLinkBySlugInputDTO {
  slug: string;
}

export interface GetShortLinkBySlugInputDTO {
  slug: string;
}

export interface IncrementShortLinkClickBySlugInputDTO {
  slug: string;
}

export interface ListShortLinksInputDTO {
  limit?: number;
  cursor?: string | null | undefined;
  sort?: ShortLinkSort;
}

export interface ExportShortLinksOutputDTO {
  key: string;
  url: string;
}
