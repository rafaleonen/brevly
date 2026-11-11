import type { ShortLink } from "@/domain/entities/short-link.entity";

export const ShortLinkPresenter = {
  toHttp(shortLink: ShortLink) {
    return {
      id: shortLink.id,
      slug: shortLink.slug.value,
      clicks: shortLink.clicks,
      originalUrl: shortLink.originalUrl.value,
      protocol: shortLink.originalUrl.protocol,
      hasTLS: shortLink.originalUrl.hasTLS,
      createdAt: shortLink.createdAt,
      deletedAt: shortLink.deletedAt,
    };
  },
};
