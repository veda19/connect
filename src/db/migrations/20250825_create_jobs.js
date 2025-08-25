export async function up(knex) {
  await knex.schema.createTable("jobs", (table) => {
    table.uuid("id").primary();
    table.string("status").notNullable().defaultTo("pending"); 
    table.integer("total").defaultTo(0);
    table.integer("completed").defaultTo(0);
    table.jsonb("results").defaultTo("[]");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("jobs");
}
