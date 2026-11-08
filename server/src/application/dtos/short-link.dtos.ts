export interface CreateShortLinkInputDTO {
  slug: string;
  url: string;
}

export interface CreateShortLinkOutputDTO {
  slug: string;
  originalUrl: string;
  protocol: string;
}

export interface DeleteShortLinkByIdInputDTO {
  id: string;
}

export interface GetShortLinkBySlugInputDTO {
  slug: string;
}

export interface IncrementShortLinkClickBySlugInputDTO {
  slug: string;
}
