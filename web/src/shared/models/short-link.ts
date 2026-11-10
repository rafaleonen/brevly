export interface ShortLink {
  id: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  deletedAt: Date | null;
}
