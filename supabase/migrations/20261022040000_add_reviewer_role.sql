-- Add reviewer staff role for Connect verification path.
-- admin remains super admin (system + sensitive PII).
-- Reviewers use verification queues; they do not get email/KYC/user moderation.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'reviewer';
