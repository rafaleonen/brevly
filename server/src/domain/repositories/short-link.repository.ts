import type { ShortLink } from "../entities/short-link.entity";

export interface ShortLinkRepository {
  find(): Promise<ShortLink[]>;
  findById(id: string): Promise<ShortLink | null>;
  findByCode(code: string): Promise<ShortLink | null>;
  create(shortLink: ShortLink): Promise<void>;
  update(shortLink: ShortLink): Promise<void>;
}
