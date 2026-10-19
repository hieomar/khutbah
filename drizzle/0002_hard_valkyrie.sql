ALTER TABLE "audit_log" ALTER COLUMN "details" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "details" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "permissions" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "permissions" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "tags" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "key_takeaways" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "key_takeaways" SET DEFAULT '[]'::jsonb;