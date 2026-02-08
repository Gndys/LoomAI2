CREATE TABLE "generation_call_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature" text NOT NULL,
	"provider" text,
	"model" text,
	"task_id" text,
	"status" text NOT NULL,
	"success" boolean,
	"failure_reason" text,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_call_log" ADD CONSTRAINT "generation_call_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;