-- Align live Supabase schema with prisma/schema.prisma
-- Generated from prisma migrate diff against the live datasource.

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "candidate_role" TEXT,
ADD COLUMN     "launch_reward_window_ends_at" TIMESTAMPTZ(6),
ADD COLUMN     "role_activated_at" TIMESTAMPTZ(6),
ADD COLUMN     "waitlist_persona" TEXT;

-- AlterTable
ALTER TABLE "waitlist" ADD COLUMN     "candidate_role" TEXT,
ADD COLUMN     "persona" TEXT NOT NULL DEFAULT 'buyer_renter',
ADD COLUMN     "persona_details" JSONB,
ADD COLUMN     "poll_completion_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "queue_rank" INTEGER,
ADD COLUMN     "queue_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "waitlist_reward_eligible" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "property_validation_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "job_kind" TEXT NOT NULL DEFAULT 'property',
    "source" TEXT NOT NULL DEFAULT 'admin_validation',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "failure_reason" TEXT,
    "final_property_status" TEXT,
    "queued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_retry_at" TIMESTAMPTZ(6),
    "request_payload" JSONB,
    "result" JSONB,
    "requested_by" UUID,

    CONSTRAINT "property_validation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_waitlist_id" UUID,
    "referrer_profile_id" UUID,
    "referred_waitlist_id" UUID,
    "referred_profile_id" UUID,
    "referral_code" TEXT,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_catalog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reward_system" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_redeemable" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_entitlements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_email" TEXT NOT NULL,
    "waitlist_id" UUID,
    "profile_id" UUID,
    "reward_key" TEXT NOT NULL,
    "source_event" TEXT NOT NULL,
    "source_referral_count" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "reward_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entitlement_id" UUID NOT NULL,
    "profile_id" UUID,
    "redemption_context" TEXT NOT NULL,
    "redemption_reference_id" TEXT,
    "redeemed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_rank_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "waitlist_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_property_validation_jobs_job_kind" ON "property_validation_jobs"("job_kind");

-- CreateIndex
CREATE INDEX "idx_property_validation_jobs_next_retry_at" ON "property_validation_jobs"("next_retry_at") WHERE (next_retry_at IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_property_validation_jobs_property_id" ON "property_validation_jobs"("property_id");

-- CreateIndex
CREATE INDEX "idx_property_validation_jobs_queued_at" ON "property_validation_jobs"("queued_at" DESC);

-- CreateIndex
CREATE INDEX "idx_property_validation_jobs_status" ON "property_validation_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_referral_events_event_type" ON "referral_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_referral_events_referrer_profile" ON "referral_events"("referrer_profile_id");

-- CreateIndex
CREATE INDEX "idx_referral_events_referrer_waitlist" ON "referral_events"("referrer_waitlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "reward_catalog_key_key" ON "reward_catalog"("key");

-- CreateIndex
CREATE INDEX "idx_reward_entitlements_profile_id" ON "reward_entitlements"("profile_id");

-- CreateIndex
CREATE INDEX "idx_reward_entitlements_waitlist_id" ON "reward_entitlements"("waitlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_reward_entitlements_email_key" ON "reward_entitlements"("user_email", "reward_key") WHERE (status = ANY (ARRAY['active'::text, 'redeemed'::text]));

-- CreateIndex
CREATE INDEX "idx_waitlist_rank_history_waitlist_id" ON "waitlist_rank_history"("waitlist_id");

-- AddForeignKey
ALTER TABLE "property_validation_jobs" ADD CONSTRAINT "property_validation_jobs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_validation_jobs" ADD CONSTRAINT "property_validation_jobs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referred_profile_id_fkey" FOREIGN KEY ("referred_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referred_waitlist_id_fkey" FOREIGN KEY ("referred_waitlist_id") REFERENCES "waitlist"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referrer_profile_id_fkey" FOREIGN KEY ("referrer_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referrer_waitlist_id_fkey" FOREIGN KEY ("referrer_waitlist_id") REFERENCES "waitlist"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_entitlements" ADD CONSTRAINT "reward_entitlements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_entitlements" ADD CONSTRAINT "reward_entitlements_reward_key_fkey" FOREIGN KEY ("reward_key") REFERENCES "reward_catalog"("key") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_entitlements" ADD CONSTRAINT "reward_entitlements_waitlist_id_fkey" FOREIGN KEY ("waitlist_id") REFERENCES "waitlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_entitlement_id_fkey" FOREIGN KEY ("entitlement_id") REFERENCES "reward_entitlements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "waitlist_rank_history" ADD CONSTRAINT "waitlist_rank_history_waitlist_id_fkey" FOREIGN KEY ("waitlist_id") REFERENCES "waitlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION;