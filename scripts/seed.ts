import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("../lib/db");
const { permission, adminPermission, user } = await import("../lib/db/schema");
const { auth } = await import("../lib/auth/auth");
const { PERMISSION_CATALOGUE } = await import("../lib/auth/permissions");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "System Administrator";

async function seed() {
  console.log("🌱 Starting database seed...");

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be defined in .env.local"
    );
  }

  if (!db) {
    throw new Error("Database connection could not be established.");
  }

  // --------------------------------------------------
  // 1. Seed complete system permissions catalogue
  // --------------------------------------------------

  console.log(`Seeding ${PERMISSION_CATALOGUE.length} system permissions...`);

  await db
    .insert(permission)
    .values(PERMISSION_CATALOGUE)
    .onConflictDoNothing();

  // --------------------------------------------------
  // 2. Find existing admin
  // --------------------------------------------------

  let [admin] = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL.trim().toLowerCase()))
    .limit(1);

  // --------------------------------------------------
  // 3. Create admin through Better Auth
  // --------------------------------------------------

  if (!admin) {
    console.log(`Creating admin: ${ADMIN_EMAIL}`);

    const result = await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.trim().toLowerCase(),
        password: ADMIN_PASSWORD,
      },
    });

    if ("error" in result) {
      throw new Error(
        `Failed to create admin: ${JSON.stringify(result.error)}`
      );
    }

    [admin] = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL.trim().toLowerCase()))
      .limit(1);

    if (!admin) {
      throw new Error("Admin was created but could not be found.");
    }
  } else {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  }

  // --------------------------------------------------
  // 4. Promote user to active administrator
  // --------------------------------------------------

  await db
    .update(user)
    .set({
      role: "admin",
      status: "active",
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, admin.id));

  // --------------------------------------------------
  // 5. Grant administrator all system permissions
  // --------------------------------------------------

  // Clean existing permissions to prevent duplicates
  await db
    .delete(adminPermission)
    .where(eq(adminPermission.userId, admin.id));

  const permissionRows = await db
    .select()
    .from(permission);

  for (const p of permissionRows) {
    await db
      .insert(adminPermission)
      .values({
        id: crypto.randomUUID(),
        userId: admin.id,
        permissionId: p.id,
        grantedBy: admin.id,
        grantedAt: new Date(),
      });
  }

  console.log("✅ Database seed completed successfully.");
  console.log(`Admin user: ${ADMIN_EMAIL}`);
  console.log(`Granted permissions: ${permissionRows.length}`);
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  });
