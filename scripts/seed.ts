import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("../lib/db");
const { permission, adminPermission, user } = await import("../lib/db/schema");
const { auth } = await import("../lib/auth/auth");

const permissions = [
  {
    id: "users.create",
    category: "User Management",
    name: "Create users",
    description: "Create new users.",
  },
  {
    id: "users.read",
    category: "User Management",
    name: "View users",
    description: "View user accounts.",
  },
  {
    id: "users.update",
    category: "User Management",
    name: "Update users",
    description: "Update user accounts.",
  },
  {
    id: "users.delete",
    category: "User Management",
    name: "Delete users",
    description: "Delete user accounts.",
  },
  {
    id: "users.reset_password",
    category: "User Management",
    name: "Reset passwords",
    description: "Reset user passwords.",
  },
  {
    id: "users.invite",
    category: "User Management",
    name: "Invite users",
    description: "Invite new users.",
  },

  {
    id: "media.create",
    category: "Media Management",
    name: "Upload media",
    description: "Upload new media.",
  },
  {
    id: "media.read",
    category: "Media Management",
    name: "View media",
    description: "View media.",
  },
  {
    id: "media.update",
    category: "Media Management",
    name: "Update media",
    description: "Update existing media.",
  },
  {
    id: "media.delete",
    category: "Media Management",
    name: "Delete media",
    description: "Delete media.",
  },
  {
    id: "media.archive",
    category: "Media Management",
    name: "Archive media",
    description: "Archive media.",
  },

  {
    id: "admins.create",
    category: "Administrator Management",
    name: "Create administrators",
    description: "Create administrator accounts.",
  },
  {
    id: "admins.update_permissions",
    category: "Administrator Management",
    name: "Manage administrator permissions",
    description: "Assign and revoke administrator permissions.",
  },
];

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "System Administrator";

console.log("email", ADMIN_EMAIL);
console.log("password", ADMIN_PASSWORD)
async function seed() {
  console.log("🌱 Starting database seed...");

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be defined"
    );
  }

  // --------------------------------------------------
  // 1. Seed permissions
  // --------------------------------------------------

  console.log("Seeding permissions...");

  if (!db) {
    throw new Error("Database connection could not be established.");
  }

  await db
    .insert(permission)
    .values(permissions)
    .onConflictDoNothing();

  // --------------------------------------------------
  // 2. Find existing admin
  // --------------------------------------------------

  let [admin] = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  // --------------------------------------------------
  // 3. Create admin through Better Auth
  // --------------------------------------------------

  if (!admin) {
    console.log(`Creating admin: ${ADMIN_EMAIL}`);

    const result = await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
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
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1);

    if (!admin) {
      throw new Error("Admin was created but could not be found.");
    }
  } else {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  }

  // --------------------------------------------------
  // 4. Promote user to admin
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
  // 5. Give admin all permissions
  // --------------------------------------------------

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
      })
      .onConflictDoNothing();
  }

  console.log("✅ Database seed completed.");
  console.log(`Admin: ${ADMIN_EMAIL}`);
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  });
