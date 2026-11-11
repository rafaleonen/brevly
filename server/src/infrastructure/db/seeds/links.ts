import { randomUUIDv7 } from "crypto";
import type { NewShortLinkRow } from "../schema/types";

export const commonLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "Github",
    originalUrl: "https://github.com",
    clicks: 12,
  },
  {
    id: randomUUIDv7(),
    slug: "Google",
    originalUrl: "https://google.com",
    clicks: 14,
  },
  {
    id: randomUUIDv7(),
    slug: "Facebook",
    originalUrl: "https://www.facebook.com/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "Instagram",
    originalUrl: "https://www.instagram.com/",
    clicks: 11,
  },
  {
    id: randomUUIDv7(),
    slug: "Twitter-X",
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
    slug: "Claude-IA",
    originalUrl: "https://claude.ai",
    clicks: 7,
  },
  {
    id: randomUUIDv7(),
    slug: "Chat-GPT-IA",
    originalUrl: "https://chatgpt.com/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "Grok-IA",
    originalUrl: "https://grok.com/",
    clicks: 4,
  },
  {
    id: randomUUIDv7(),
    slug: "Gemini-IA",
    originalUrl: "https://gemini.google.com/",
    clicks: 4,
  },
];

export const docLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "Drizzle-Docs",
    originalUrl: "https://orm.drizzle.team",
    clicks: 1,
  },
  {
    id: randomUUIDv7(),
    slug: "Tailwind-Docs",
    originalUrl: "https://tailwindcss.com/docs/",
    clicks: 5,
  },
  {
    id: randomUUIDv7(),
    slug: "React-Hook-Form-Docs",
    originalUrl: "https://react-hook-form.com/docs",
    clicks: 2,
  },
  {
    id: randomUUIDv7(),
    slug: "Fastify-Docs",
    originalUrl: "https://fastify.dev/docs/",
    clicks: 3,
  },
  {
    id: randomUUIDv7(),
    slug: "Vite-Docs",
    originalUrl: "https://vite.dev/guide/",
    clicks: 3,
  },
];

export const myLinks: NewShortLinkRow[] = [
  {
    id: randomUUIDv7(),
    slug: "Portfolio-Dev",
    originalUrl: "https://rafael-portfolio.vercel.app/",
    clicks: 38,
  },
  {
    id: randomUUIDv7(),
    slug: "Linkedin-Profile",
    originalUrl: "https://www.linkedin.com/in/rafael-leonen/",
    clicks: 15,
  },
  {
    id: randomUUIDv7(),
    slug: "Github-Profile",
    originalUrl: "https://github.com/rafaleonen",
    clicks: 28,
  },
  {
    id: randomUUIDv7(),
    slug: "Project-Repository",
    originalUrl: "https://github.com/rafaleonen/brevly",
    clicks: 15,
  },
  {
    id: randomUUIDv7(),
    slug: "Project-Figma",
    originalUrl:
      "https://www.figma.com/design/JZgDz2EE7aM28Bc2CNJuqV/Encurtador-de-Links--Community-?node-id=3118-709&t=WZXX0oc7MmBvYRyb-1",
    clicks: 21,
  },
];
