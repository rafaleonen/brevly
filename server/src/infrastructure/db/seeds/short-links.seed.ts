import { randomUUIDv7 } from "node:crypto";
import type { Database } from "../client";
import { shortLinks } from "../schema";

type NewShortLink = typeof shortLinks.$inferInsert;

export async function seedShortLinks(db: Database) {
  const data: NewShortLink[] = [
    {
      id: randomUUIDv7(),
      slug: "Google",
      originalUrl: "https://google.com",
      clicks: 120,
    },
    {
      id: randomUUIDv7(),
      slug: "Github",
      originalUrl: "https://github.com",
      clicks: 87,
    },
    {
      id: randomUUIDv7(),
      slug: "Docs",
      originalUrl: "https://orm.drizzle.team",
      clicks: 0,
    },
    {
      id: randomUUIDv7(),
      slug: "removido",
      originalUrl: "https://example.com",
      clicks: 5,
      deletedAt: new Date(),
    },
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

  await db
    .insert(shortLinks)
    .values(data)
    .onConflictDoNothing({ target: shortLinks.slug });
}
