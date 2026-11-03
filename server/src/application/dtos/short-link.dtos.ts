export interface CreateShortLinkInputDTO {
  url: string;
}

export interface CreateShortLinkOutputDTO {
  code: string;
  originalUrl: string;
  protocol: string;
}

export interface DeleteShortLinkByIdInputDTO {
  id: string;
}

export interface GetShortLinkByCodeInputDTO {
  code: string;
}

export interface IncrementShortLinkClickByCodeInputDTO {
  code: string;
}
