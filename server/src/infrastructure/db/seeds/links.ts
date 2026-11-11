import { randomUUIDv7 } from "crypto";
import type { NewShortLinkRow } from "../schema/types";

export const commonLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "github",
    originalUrl: "https://github.com",
    clicks: 12,
  },
  {
    id: randomUUIDv7(),
    slug: "google",
    originalUrl: "https://google.com",
    clicks: 14,
  },
  {
    id: randomUUIDv7(),
    slug: "facebook",
    originalUrl: "https://www.facebook.com/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "instagram",
    originalUrl: "https://www.instagram.com/",
    clicks: 11,
  },
  {
    id: randomUUIDv7(),
    slug: "twitter-x",
    originalUrl: "https://x.com/",
    clicks: 9,
  },
  {
    id: randomUUIDv7(),
    slug: "removido",
    originalUrl: "https://example.com",
    clicks: 5,
    deletedAt: new Date(),
  },
];

export const iaLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "claude-ia",
    originalUrl: "https://claude.ai",
    clicks: 7,
  },
  {
    id: randomUUIDv7(),
    slug: "chat-gpt-ia",
    originalUrl: "https://chatgpt.com/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "grok-ia",
    originalUrl: "https://grok.com/",
    clicks: 4,
  },
  {
    id: randomUUIDv7(),
    slug: "gemini-ia",
    originalUrl: "https://gemini.google.com/",
    clicks: 4,
  },
];

export const docLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "drizzle-docs",
    originalUrl: "https://orm.drizzle.team",
    clicks: 1,
  },
  {
    id: randomUUIDv7(),
    slug: "tailwind-docs",
    originalUrl: "https://tailwindcss.com/docs/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "react-Hook-Form-docs",
    originalUrl: "https://react-hook-form.com/docs",
    clicks: 2,
  },
  {
    id: randomUUIDv7(),
    slug: "fastify-docs",
    originalUrl: "https://fastify.dev/docs/",
    clicks: 3,
  },
  {
    id: randomUUIDv7(),
    slug: "vite-docs",
    originalUrl: "https://vite.dev/guide/",
    clicks: 3,
  },
];

export const myLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "portfolio-dev",
    originalUrl: "https://rafael-portfolio.vercel.app/",
    clicks: 38,
  },
  {
    id: randomUUIDv7(),
    slug: "linkedin-profile",
    originalUrl: "https://www.linkedin.com/in/rafael-leonen/",
    clicks: 15,
  },
  {
    id: randomUUIDv7(),
    slug: "github-profile",
    originalUrl: "https://github.com/rafaleonen",
    clicks: 28,
  },
  {
    id: randomUUIDv7(),
    slug: "project-repository",
    originalUrl: "https://github.com/rafaleonen/brevly",
    clicks: 15,
  },
  {
    id: randomUUIDv7(),
    slug: "project-figma",
    originalUrl:
      "https://www.figma.com/design/JZgDz2EE7aM28Bc2CNJuqV/Encurtador-de-Links--Community-?node-id=3118-709&t=WZXX0oc7MmBvYRyb-1",
    clicks: 21,
  },
];
