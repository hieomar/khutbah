import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local first (Next.js default), then fallback to .env
config({ path: '.env.local' });
config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.warn(
    '\n⚠️  DATABASE_URL environment variable is missing in .env or .env.local.\n'
  );
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
