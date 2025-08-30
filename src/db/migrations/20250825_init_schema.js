// migrations/20250825120000_init_schema.js
export async function up(knex) {
  // ENUM types first (Postgres only)
  await knex.schema.raw(`CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'tenant_user')`);
  await knex.schema.raw(`CREATE TYPE job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled')`);
  await knex.schema.raw(`CREATE TYPE log_status AS ENUM ('pending', 'sent', 'delivered', 'failed')`);

  // tenants
  await knex.schema.createTable("tenants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable().unique(); // unique tenant name
    table.string("whatsapp_phone_number").unique();
    table.timestamps(true, true);
  });

  // users
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    table.string("email").notNullable();
    table.string("password_hash").notNullable();
    table.enu("role", ["super_admin", "tenant_admin", "tenant_user"], { useNative: true, enumName: "user_role" })
         .notNullable()
         .defaultTo("tenant_user");
    table.timestamps(true, true);

    // each tenant cannot have duplicate emails
    table.unique(["tenant_id", "email"]);
    table.index(["tenant_id", "role"]); // for filtering users quickly
  });

  // tenant_configs
  await knex.schema.createTable("tenant_configs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("tenant_id").references("id").inTable("tenants").onDelete("CASCADE").notNullable();
    table.text("whatsapp_token").notNullable();
    table.string("phone_number_id").notNullable();
    table.string("template_name").notNullable();
    table.string("language_code").defaultTo("en");
    table.string("graph_api_version").defaultTo("v21.0");
    table.timestamps(true, true);

    // one tenant should not have duplicate config for same phone number
    table.unique(["tenant_id", "phone_number_id"]);
  });

  // jobs
  await knex.schema.createTable("jobs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("tenant_id").references("id").inTable("tenants").onDelete("CASCADE").notNullable();
    table.uuid("created_by").references("id").inTable("users").onDelete("SET NULL");
    table.enu("status", ["queued", "running", "completed", "failed", "cancelled"], { useNative: true, enumName: "job_status" })
         .notNullable()
         .defaultTo("queued");
    table.integer("total_numbers").notNullable();
    table.integer("processed_numbers").defaultTo(0);
    table.text("message").notNullable();
    table.timestamp("started_at");
    table.timestamp("finished_at");
    table.timestamps(true, true);

    table.index(["tenant_id", "status"]);
    table.index(["created_by"]);
  });

  // job_logs
  await knex.schema.createTable("job_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE").notNullable();
    table.string("phone_number").notNullable();
    table.enu("status", ["pending", "sent", "delivered", "failed"], { useNative: true, enumName: "log_status" })
         .notNullable()
         .defaultTo("pending");
    table.text("error_message");
    table.timestamps(true, true);

    // prevent duplicate phone number per job
    table.unique(["job_id", "phone_number"]);

    // indexes for queries like "find logs by job and status"
    table.index(["job_id", "status"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("job_logs");
  await knex.schema.dropTableIfExists("jobs");
  await knex.schema.dropTableIfExists("tenant_configs");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("tenants");

  // drop enums last
  await knex.schema.raw(`DROP TYPE IF EXISTS log_status`);
  await knex.schema.raw(`DROP TYPE IF EXISTS job_status`);
  await knex.schema.raw(`DROP TYPE IF EXISTS user_role`);
}
