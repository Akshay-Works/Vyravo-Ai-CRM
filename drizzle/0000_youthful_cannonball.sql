CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"lead_id" integer,
	"client_id" integer,
	"project_id" integer,
	"task_id" integer,
	"meeting_id" integer,
	"proposal_id" integer,
	"invoice_id" integer,
	"user_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"event_type" varchar(100) NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"industry" text,
	"website" text,
	"logo" text,
	"primary_contact_name" text NOT NULL,
	"primary_contact_email" text NOT NULL,
	"primary_contact_phone" text,
	"primary_contact_role" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"billing_email" text,
	"tax_id" text,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(50) DEFAULT 'active',
	"account_manager" integer,
	"contract_start_date" date,
	"contract_end_date" date,
	"lifetime_value" numeric(12, 2) DEFAULT '0',
	"monthly_recurring" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"tags" jsonb,
	"converted_from_lead_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel" varchar(50) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"lead_id" integer,
	"client_id" integer,
	"subject" text,
	"content" text,
	"from_email" text,
	"to_email" text,
	"cc_email" text,
	"status" varchar(50) DEFAULT 'sent',
	"read_at" timestamp,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"service" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" varchar(50),
	"mime_type" text,
	"size" integer,
	"url" text,
	"lead_id" integer,
	"client_id" integer,
	"project_id" integer,
	"proposal_id" integer,
	"invoice_id" integer,
	"folder" text,
	"tags" jsonb,
	"version" integer DEFAULT 1,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"client_id" integer,
	"email_type" varchar(50) NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" varchar(20) DEFAULT 'pending',
	"template_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(50) NOT NULL,
	"client_id" integer NOT NULL,
	"project_id" integer,
	"proposal_id" integer,
	"items" jsonb,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0',
	"amount_due" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"paid_at" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"payment_method" text,
	"payment_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"business_name" text,
	"business_website" text,
	"industry" text,
	"company_size" text,
	"country" text,
	"current_software" text,
	"biggest_challenge" text,
	"automation_goals" text,
	"monthly_leads" text,
	"desired_outcome" text,
	"budget_range" text,
	"timeline" text,
	"additional_info" text,
	"lead_score" integer DEFAULT 0,
	"lead_category" varchar(50),
	"lead_type" varchar(50),
	"recommended_services" jsonb,
	"qualification_summary" text,
	"stage" varchar(50) DEFAULT 'new',
	"status" varchar(50) DEFAULT 'active',
	"priority" varchar(20) DEFAULT 'medium',
	"owner_id" integer,
	"tags" jsonb,
	"meeting_status" varchar(50) DEFAULT 'pending',
	"meeting_date" timestamp,
	"meeting_timezone" text,
	"meeting_link" text,
	"meeting_brief" jsonb,
	"next_follow_up" timestamp,
	"last_contacted_at" timestamp,
	"converted_to_client_id" integer,
	"converted_at" timestamp,
	"lost_reason" text,
	"source" text DEFAULT 'website',
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" varchar(50) DEFAULT 'discovery',
	"lead_id" integer,
	"client_id" integer,
	"project_id" integer,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 30,
	"timezone" text,
	"location" text,
	"meeting_link" text,
	"calendar_event_id" text,
	"status" varchar(50) DEFAULT 'scheduled',
	"organizer_id" integer,
	"attendees" jsonb,
	"agenda" text,
	"notes" text,
	"summary" text,
	"action_items" jsonb,
	"recording_url" text,
	"transcript_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"lead_id" integer,
	"client_id" integer,
	"project_id" integer,
	"meeting_id" integer,
	"author_id" integer,
	"is_private" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(50) NOT NULL,
	"color" varchar(7),
	"order" integer NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"client_id" integer NOT NULL,
	"type" text,
	"status" varchar(50) DEFAULT 'planning',
	"priority" varchar(20) DEFAULT 'medium',
	"start_date" date,
	"due_date" date,
	"completed_at" timestamp,
	"progress" integer DEFAULT 0,
	"value" numeric(10, 2),
	"manager_id" integer,
	"team_members" jsonb,
	"milestones" jsonb,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"number" varchar(50),
	"lead_id" integer,
	"client_id" integer,
	"summary" text,
	"scope" text,
	"deliverables" jsonb,
	"timeline" text,
	"terms" text,
	"subtotal" numeric(10, 2),
	"discount" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(50) DEFAULT 'draft',
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"expires_at" timestamp,
	"signed_by" text,
	"signed_at" timestamp,
	"signature_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" varchar(7),
	"type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"project_id" integer,
	"lead_id" integer,
	"client_id" integer,
	"assignee_id" integer,
	"created_by_id" integer,
	"status" varchar(50) DEFAULT 'todo',
	"priority" varchar(20) DEFAULT 'medium',
	"due_date" timestamp,
	"completed_at" timestamp,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"webhook_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"payload" jsonb,
	"response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
