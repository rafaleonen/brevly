import { setTimeout } from "node:timers/promises";
import { db, pg } from "../client";
import { commonLinks, docLinks, iaLinks, myLinks } from "./links";
import { seedShortLinks } from "./short-links.seed";

const links = [commonLinks, iaLinks, docLinks, myLinks];

async function main() {
  try {
    for (const link of links) {
      await seedShortLinks(db, link);
      await setTimeout(500);
    }
    console.log("Seed concluído.");
  } finally {
    await pg.end(); // sem isso o processo fica pendurado
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
