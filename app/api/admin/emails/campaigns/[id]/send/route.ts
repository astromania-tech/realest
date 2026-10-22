/**
 * POST /api/admin/emails/campaigns/[id]/send  — execute a campaign send
 *
 * Steps:
 *  1. Load campaign (must be draft or scheduled)
 *  2. Set status → sending
 *  3a. resend_audience + broadcast: render once → executeBulkSend broadcast
 *  3b. db_segment  + batch:  fetch recipients from DB → executeBulkSend batch
 *  4. Update campaign with result (status, sent_at, sent_count, failed_count, resend_id)
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import prisma from '@/lib/prisma';
import { renderCampaignTemplate, executeBulkSend, CampaignRecipient } from '@/lib/emailBulkSender';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';
import type { Prisma } from '@/lib/prisma/client';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Send email campaign',
  description: 'Execute a draft or scheduled campaign send using Resend broadcast or batch delivery.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Campaign sent successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Campaign not found' },
    '409': { description: 'Campaign cannot be sent in its current status' },
    '500': { description: 'Campaign send failed' },
  },
};

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'RealEST Connect <info@connect.realest.ng>';
const FROM_EMAIL_AUTH = process.env.FROM_EMAIL_AUTH ?? FROM_EMAIL;
const FROM_EMAIL_INQUIRIES = process.env.FROM_EMAIL_INQUIRIES ?? FROM_EMAIL;
const FROM_EMAIL_WAITLIST = process.env.FROM_EMAIL_WAITLIST ?? FROM_EMAIL;

/** Map template name → appropriate FROM address. */
function fromForTemplate(templateName: string): string {
  const authTemplates = ['LoginAlertEmail', 'PasswordResetEmail', 'VerificationEmail'];
  const inquiryTemplates = ['InquirySentEmail', 'ViewingReminderEmail'];
  const waitlistTemplates = [
    'FrontierReengagementEmail', 'AuthorityGeotagEmail', 'AuthorityBootsGroundEmail',
    'LaunchWindowEmail', 'SystemUpdateEmail', 'WaitlistMilestoneEmail',
    'AgentVsLandlordEmail', 'PropertyCategoriesEmail', 'LaunchEveEmail',
    'ReferralInviteEmail', 'WeeklyDigestEmail',
  ];

  if (authTemplates.includes(templateName)) return FROM_EMAIL_AUTH;
  if (inquiryTemplates.includes(templateName)) return FROM_EMAIL_INQUIRIES;
  if (waitlistTemplates.includes(templateName)) return FROM_EMAIL_WAITLIST;
  return FROM_EMAIL;
}



// ── Recipient pages (cursor batches — never dump the full audience at once) ───

const RECIPIENT_PAGE = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://realest.ng';

function mapWaitlistRow(row: {
  email: string;
  first_name: string;
  last_name: string | null;
  referral_code: string | null;
}): CampaignRecipient | null {
  if (typeof row.email !== 'string' || !EMAIL_RE.test(row.email.trim())) return null;
  const firstName = row.first_name?.trim() || undefined;
  const lastName = row.last_name?.trim() || undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
  const referralCode = row.referral_code?.trim() || undefined;
  const referralUrl = referralCode ? `${BASE_URL}/refer?ref=${referralCode}` : undefined;
  return { email: row.email.trim(), firstName, fullName, referralCode, referralUrl };
}

async function* iterateWaitlistRecipients(): AsyncGenerator<CampaignRecipient[]> {
  let cursor: string | undefined;
  for (;;) {
    const batch = await prisma.waitlist.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        referral_code: true,
      },
      orderBy: { id: 'asc' },
      take: RECIPIENT_PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;
    const mapped = batch
      .map(mapWaitlistRow)
      .filter((row): row is CampaignRecipient => row !== null);
    if (mapped.length > 0) yield mapped;
    if (batch.length < RECIPIENT_PAGE) break;
    cursor = batch[batch.length - 1].id;
  }
}

function usersWhereFromFilter(
  audienceFilter: Record<string, unknown>,
): Prisma.usersWhereInput {
  const where: Prisma.usersWhereInput = {
    deleted_at: null,
    email: { not: null },
  };
  if (typeof audienceFilter.role === 'string') {
    where.role = audienceFilter.role as Prisma.EnumUserRoleFilter['equals'];
  } else if (Array.isArray(audienceFilter.roles) && audienceFilter.roles.length > 0) {
    where.role = { in: audienceFilter.roles as Prisma.EnumUserRoleFilter['in'] };
  }
  return where;
}

async function* iterateDbSegmentRecipients(
  audienceFilter: Record<string, unknown>,
): AsyncGenerator<CampaignRecipient[]> {
  const where = usersWhereFromFilter(audienceFilter);
  let cursor: string | undefined;
  for (;;) {
    const batch = await prisma.users.findMany({
      where,
      select: { id: true, email: true, full_name: true },
      orderBy: { id: 'asc' },
      take: RECIPIENT_PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;
    const mapped = batch
      .filter((row) => !!row.email)
      .map((row) => ({
        email: row.email as string,
        fullName: row.full_name ?? undefined,
        firstName: row.full_name?.split(' ')[0] ?? undefined,
      }));
    if (mapped.length > 0) yield mapped;
    if (batch.length < RECIPIENT_PAGE) break;
    cursor = batch[batch.length - 1].id;
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;

  // 1. Load campaign
  const campaign = await prisma.email_campaigns.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    return NextResponse.json(
      { error: `Campaign cannot be sent — current status: ${campaign.status}` },
      { status: 409 },
    );
  }

  // 2. Mark as sending
  await prisma.email_campaigns.update({
    where: { id },
    data: { status: 'sending', updated_at: new Date() },
  });

  const templateProps = (campaign.template_props as Record<string, unknown>) ?? {};
  const from = fromForTemplate(campaign.template_name);

  try {
    let result;

    if (campaign.audience_type === 'resend_audience') {
      if (!campaign.audience_id) {
        throw new Error('audience_id is required for resend_audience campaigns');
      }

      // Broadcast renders once — Resend manages the audience, no per-recipient data
      const { html, text } = await renderCampaignTemplate(campaign.template_name, templateProps);

      result = await executeBulkSend({
        mode: 'broadcast',
        audience_id: campaign.audience_id,
        from,
        subject: campaign.subject,
        html,
        text,
        name: campaign.name,
      });
    } else {
      // db_segment: page recipients and send in batches so the full audience
      // is never loaded into memory as one findMany dump.
      const audienceFilter = (campaign.audience_filter as Record<string, unknown>) ?? {};
      const pages =
        audienceFilter.source === 'waitlist'
          ? iterateWaitlistRecipients()
          : iterateDbSegmentRecipients(audienceFilter);

      let sent = 0;
      let failed = 0;
      let resendId: string | undefined;
      let sawRecipients = false;

      for await (const recipients of pages) {
        sawRecipients = true;
        const pageResult = await executeBulkSend({
          mode: 'batch',
          recipients,
          from,
          subject: campaign.subject,
          renderFn: async (recipient) => {
            const mergedProps: Record<string, unknown> = {
              ...templateProps,
              email: recipient.email,
              firstName: recipient.firstName ?? 'there',
              fullName: recipient.fullName ?? recipient.firstName ?? '',
              referralCode:
                recipient.referralCode ??
                (templateProps.referralCode as string | undefined) ??
                '',
              referralUrl:
                recipient.referralUrl ??
                (templateProps.referralUrl as string | undefined) ??
                '',
            };
            return renderCampaignTemplate(campaign.template_name, mergedProps);
          },
        });
        sent += pageResult.sent;
        failed += pageResult.failed;
        resendId = pageResult.resendId ?? resendId;
      }

      result = {
        success: sawRecipients ? failed === 0 : true,
        sent,
        failed,
        resendId,
      };
    }

    // 4. Update with result
    const finalStatus = result.success ? 'sent' : 'failed';
    const updated = await prisma.email_campaigns.update({
      where: { id },
      data: {
        status: finalStatus,
        sent_at: result.success ? new Date() : campaign.sent_at,
        sent_count: result.sent,
        failed_count: result.failed,
        resend_id: result.resendId ?? campaign.resend_id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ campaign: updated, result });
  } catch (err) {
    // Mark campaign as failed so it can be retried or debugged
    await prisma.email_campaigns.update({
      where: { id },
      data: { status: 'failed', updated_at: new Date() },
    });

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Send failed: ${message}` }, { status: 500 });
  }
}
