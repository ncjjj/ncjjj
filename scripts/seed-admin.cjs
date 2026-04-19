const bcrypt = require("bcryptjs");
const postgres = require("postgres");

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
  });

  const adminEmail = "admin@example.com";
  const rawPassword = "Admin@123";
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const existing = await sql`
    select id from users where email = ${adminEmail} limit 1
  `;

  if (existing.length > 0) {
    await sql`
      update users
      set password = ${passwordHash}
      where email = ${adminEmail}
    `;

    console.log("Admin user password updated successfully.");
    await sql.end({ timeout: 5 });
    return;
  }

  await sql`
    insert into users (name, mobile_number, email, password, role)
    values (${"Platform Admin"}, ${"9999999999"}, ${adminEmail}, ${passwordHash}, ${"admin"})
  `;

  await sql.end({ timeout: 5 });
  console.log("Admin user seeded successfully.");
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed admin user", error);
    process.exit(1);
  });
