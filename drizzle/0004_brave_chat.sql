CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mosque" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "file_size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "mosque_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mosque_id" text;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_uidx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_permission_user_permission_uidx" ON "admin_permission" USING btree ("user_id","permission_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_duration_seconds_check" CHECK ("media"."duration_seconds" >= 0);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_file_size_check" CHECK ("media"."file_size" >= 0);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_status_check" CHECK ("media"."status" IN ('published', 'draft', 'archived'));--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK ("user"."role" IN ('admin', 'listener', 'mosque'));--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_status_check" CHECK ("user"."status" IN ('active', 'suspended', 'pending'));