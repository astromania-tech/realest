CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'agent', 'owner', 'admin');

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "license_number" TEXT NOT NULL,
    "agency_name" TEXT,
    "specialization" TEXT[],
    "phone" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "verification_date" TIMESTAMPTZ(6),
    "years_experience" INTEGER,
    "bio" TEXT,
    "photo_url" TEXT,
    "rating" DECIMAL(3,2),
    "total_sales" INTEGER DEFAULT 0,
    "total_listings" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "whatsapp" VARCHAR(20),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "user_type" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "kyc_provider" TEXT NOT NULL,
    "kyc_reference_id" TEXT,
    "documents" JSONB,
    "submitted_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB DEFAULT '{}',
    "is_read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "business_name" TEXT,
    "property_types" TEXT[],
    "phone" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "verification_date" TIMESTAMPTZ(6),
    "years_experience" INTEGER,
    "bio" TEXT,
    "photo_url" TEXT,
    "rating" DECIMAL,
    "total_properties" INTEGER,
    "whatsapp" VARCHAR,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'NGN',
    "type" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "transaction_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "referral_code" VARCHAR(20),
    "referred_by" UUID,
    "referred_by_code" VARCHAR(20),
    "referral_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "property_type" TEXT NOT NULL,
    "listing_type" TEXT NOT NULL DEFAULT '''for_rent''::text',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NG',
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL,
    "square_feet" DECIMAL,
    "year_built" INTEGER,
    "status" TEXT NOT NULL DEFAULT '''draft''::text',
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "agent_id" UUID,
    "listing_source" TEXT DEFAULT 'owner',
    "price_frequency" TEXT DEFAULT 'sale',

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "parking_spaces" INTEGER,
    "has_pool" BOOLEAN DEFAULT false,
    "has_garage" BOOLEAN DEFAULT false,
    "has_garden" BOOLEAN DEFAULT false,
    "heating_type" TEXT,
    "cooling_type" TEXT,
    "flooring_type" TEXT,
    "roof_type" TEXT,
    "foundation_type" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "amenities" JSONB DEFAULT '{}',
    "features" JSONB DEFAULT '{}',

    CONSTRAINT "property_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "media_type" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "display_order" INTEGER DEFAULT 0,
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "target_type" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "phone" VARCHAR(20),
    "source" VARCHAR(50) DEFAULT 'website',
    "status" VARCHAR(20) DEFAULT 'active',
    "interests" TEXT[],
    "location_preference" VARCHAR(100),
    "property_type_preference" VARCHAR(50),
    "budget_range" VARCHAR(50),
    "subscribed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMPTZ(6),
    "last_contacted_at" TIMESTAMPTZ(6),
    "contact_count" INTEGER DEFAULT 0,
    "referrer_url" TEXT,
    "user_agent" TEXT,
    "ip_address" INET,
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(100),
    "referral_code" VARCHAR(20),
    "referred_by" UUID,
    "referral_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_key" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "ref" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL,
    "show_if" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID NOT NULL,
    "segment" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "opt_in_email_results" BOOLEAN NOT NULL DEFAULT false,
    "referral_code" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_submission_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_submission_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "audience_type" TEXT NOT NULL,
    "audience_id" TEXT,
    "audience_filter" JSONB,
    "send_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "template_props" JSONB,
    "scheduled_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "total_recipients" INTEGER DEFAULT 0,
    "sent_count" INTEGER DEFAULT 0,
    "failed_count" INTEGER DEFAULT 0,
    "resend_id" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_admin_audit_log_action" ON "admin_audit_log"("action");

-- CreateIndex
CREATE INDEX "idx_admin_audit_log_actor_id" ON "admin_audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "idx_admin_audit_log_created_at" ON "admin_audit_log"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "agents_profile_id_key" ON "agents"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_license_number_key" ON "agents"("license_number");

-- CreateIndex
CREATE INDEX "idx_agents_profile_id" ON "agents"("profile_id");

-- CreateIndex
CREATE INDEX "idx_agents_verified" ON "agents"("verified");

-- CreateIndex
CREATE INDEX "idx_inquiries_owner_id" ON "inquiries"("owner_id");

-- CreateIndex
CREATE INDEX "idx_kyc_requests_status" ON "kyc_requests"("status");

-- CreateIndex
CREATE INDEX "idx_kyc_requests_user_id" ON "kyc_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_type" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owners_profile_id_key" ON "owners"("profile_id");

-- CreateIndex
CREATE INDEX "idx_owners_profile_id" ON "owners"("profile_id");

-- CreateIndex
CREATE INDEX "idx_payments_property_id" ON "payments"("property_id");

-- CreateIndex
CREATE INDEX "idx_payments_user_id" ON "payments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_referral_code_key" ON "profiles"("referral_code");

-- CreateIndex
CREATE INDEX "idx_profiles_referral_code" ON "profiles"("referral_code");

-- CreateIndex
CREATE INDEX "idx_profiles_referred_by" ON "profiles"("referred_by");

-- CreateIndex
CREATE INDEX "idx_properties_agent" ON "properties"("agent_id");

-- CreateIndex
CREATE INDEX "idx_properties_description_trgm" ON "properties" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_properties_owner" ON "properties"("owner_id");

-- CreateIndex
CREATE INDEX "idx_properties_status" ON "properties"("status");

-- CreateIndex
CREATE INDEX "idx_properties_title_trgm" ON "properties" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_property_details_metadata_gin" ON "property_details" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "idx_property_documents_verified_by" ON "property_documents"("verified_by");

-- CreateIndex
CREATE INDEX "idx_reviews_property_id" ON "reviews"("property_id");

-- CreateIndex
CREATE INDEX "idx_reviews_reviewer_id" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "idx_saved_properties_property_id" ON "saved_properties"("property_id");

-- CreateIndex
CREATE INDEX "idx_saved_properties_user_id" ON "saved_properties"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_properties_user_id_property_id_key" ON "saved_properties"("user_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at") WHERE (deleted_at IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_referral_code_key" ON "waitlist"("referral_code");

-- CreateIndex
CREATE INDEX "idx_waitlist_email" ON "waitlist"("email");

-- CreateIndex
CREATE INDEX "idx_waitlist_location_preference" ON "waitlist"("location_preference");

-- CreateIndex
CREATE INDEX "idx_waitlist_referral_code" ON "waitlist"("referral_code");

-- CreateIndex
CREATE INDEX "idx_waitlist_referred_by" ON "waitlist"("referred_by");

-- CreateIndex
CREATE INDEX "idx_waitlist_source" ON "waitlist"("source");

-- CreateIndex
CREATE INDEX "idx_waitlist_status" ON "waitlist"("status");

-- CreateIndex
CREATE INDEX "idx_waitlist_subscribed_at" ON "waitlist"("subscribed_at");

-- CreateIndex
CREATE INDEX "idx_poll_responses_question_key" ON "poll_responses"("question_key");

-- CreateIndex
CREATE INDEX "idx_poll_responses_answer" ON "poll_responses"("answer");

-- CreateIndex
CREATE INDEX "idx_poll_responses_created_at" ON "poll_responses"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "poll_forms_slug_key" ON "poll_forms"("slug");

-- CreateIndex
CREATE INDEX "poll_questions_form_segment_idx" ON "poll_questions"("form_id", "segment", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "poll_questions_form_id_question_key_key" ON "poll_questions"("form_id", "question_key");

-- CreateIndex
CREATE INDEX "poll_submissions_form_segment_idx" ON "poll_submissions"("form_id", "segment");

-- CreateIndex
CREATE INDEX "poll_submissions_email_idx" ON "poll_submissions"("email");

-- CreateIndex
CREATE INDEX "poll_submission_answers_submission_idx" ON "poll_submission_answers"("submission_id");

-- CreateIndex
CREATE INDEX "poll_submission_answers_question_key_idx" ON "poll_submission_answers"("question_key");

-- CreateIndex
CREATE UNIQUE INDEX "poll_submission_answers_submission_id_question_key_key" ON "poll_submission_answers"("submission_id", "question_key");

-- CreateIndex
CREATE INDEX "idx_email_campaigns_status" ON "email_campaigns"("status");

-- CreateIndex
CREATE INDEX "idx_email_campaigns_created_by" ON "email_campaigns"("created_by");

-- CreateIndex
CREATE INDEX "idx_email_campaigns_created_at" ON "email_campaigns"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kyc_requests" ADD CONSTRAINT "kyc_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_users_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_details" ADD CONSTRAINT "property_details_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "waitlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_questions" ADD CONSTRAINT "poll_questions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "poll_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_submissions" ADD CONSTRAINT "poll_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "poll_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_submission_answers" ADD CONSTRAINT "poll_submission_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "poll_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
