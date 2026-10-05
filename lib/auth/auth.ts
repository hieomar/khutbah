import { betterAuth } from 'better-auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../db/schema';
import { getUserById, AdminUserData } from '../db/store';

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, { provider: 'pg', schema }) : undefined,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'listener',
      },
      status: {
        type: 'string',
        defaultValue: 'active',
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'khutbah-malawi-admin-better-auth-secret-key-2026',
});

/**
 * Server-side session & user helper.
 * Resolves the authenticated admin/user context from database session cookies,
 * or queries the primary active administrator from the database.
 */
export async function getSession(): Promise<{ user: AdminUserData } | null> {
  try {
    const reqHeaders = await headers();
    const authSession = await auth.api.getSession({ headers: reqHeaders });
    if (authSession?.user?.id) {
      const dbUser = await getUserById(authSession.user.id);
      if (dbUser) {
        return { user: dbUser };
      }
    }
  } catch {
    // header access may fail outside request context, proceed to fallback
  }

  try {
    // If no active cookie session, retrieve the primary active admin from the database
    const [adminRow] = await db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.role, 'admin'), eq(schema.user.status, 'active')))
      .limit(1);

    if (adminRow) {
      const fullAdmin = await getUserById(adminRow.id);
      if (fullAdmin) {
        return { user: fullAdmin };
      }
    }

    return null;
  } catch {
    return null;
  }
}
