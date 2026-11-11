import { db } from "@/infrastructure/db/client";
import { buildApp } from "./app";
import { makeContainer } from "./container";

const container = makeContainer({ db });

const app = buildApp(container);

app
  .listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("Server is running at 3333!"))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
