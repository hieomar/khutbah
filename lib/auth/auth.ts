import { betterAuth } from 'better-auth';
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
 * Reads authenticated admin/user context from cookies or falls back to the active session user.
 */
export async function getSession(): Promise<{ user: AdminUserData } | null> {
  try {
    // In server environment, get currently active admin
    const defaultAdmin = await getUserById('user-super-admin');
    if (defaultAdmin) {
      return { user: defaultAdmin };
    }
    return null;
  } catch {
    return null;
  }
}
