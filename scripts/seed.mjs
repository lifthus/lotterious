import pg from "pg";

import { seedArticles } from "./db/seed_article.mjs"

const { Client } = pg;

const client = new Client({
  connectionString: process.env.PG_CONNECTION_STRING,
});
client.connect();

try {
await client.query("BEGIN TRANSACTION");

await seedArticles(client);

await client.query("COMMIT");
} catch (e) {
await client.query("ROLLBACK");
}

client.end();