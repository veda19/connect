import knex from "knex";

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "./src/db/migrations",
  },
});

export default db;
