import { db, pg } from "../client";
import { seedShortLinks } from "./short-links.seed";

async function main() {
  try {
    await seedShortLinks(db);
    console.log("Seed concluído.");
  } finally {
    await pg.end(); // sem isso o processo fica pendurado
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
