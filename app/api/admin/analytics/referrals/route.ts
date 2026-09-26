/**
 * GET /api/admin/analytics/referrals
 *
 * Returns referral summary data from the waitlist table:
 *   - Top referrers (sorted by referral_count desc)
 *   - All referred entries with their referrer info
 *
 * Admin-only.
 */
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';

export const openApiGET = {
  method: 'get',
  summary: 'Referral analytics',
  description: 'Referral program summary: top referrers and referred entries (admin-only).',
  tags: ['admin','analytics'],
  responses: {
    200: { description: 'Referral analytics payload' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
} as const;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const all = await prisma.waitlist.findMany({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      referral_code: true,
      referred_by: true,
      referral_count: true,
      status: true,
      subscribed_at: true,
    },
    orderBy: { referral_count: 'desc' },
  });

  // Build a lookup map: id → entry
  const byId: Record<string, typeof all[0]> = {};
  for (const r of all) byId[r.id] = r;

  const totalReferrals   = all.reduce((s, r) => s + (r.referral_count ?? 0), 0);
  const totalReferrers   = all.filter((r) => (r.referral_count ?? 0) > 0).length;
  const totalReferred    = all.filter((r) => r.referred_by !== null).length;

  // Top referrers (cap at 50 for payload size)
  const topReferrers = all
    .filter((r) => (r.referral_count ?? 0) > 0)
    .slice(0, 50)
    .map((r) => ({
      id: r.id,
      email: r.email,
      name: [r.first_name, r.last_name].filter(Boolean).join(' '),
      referralCode: r.referral_code,
      referralCount: r.referral_count ?? 0,
      status: r.status,
      joinedAt: r.subscribed_at,
    }));

  // All referred entries with their referrer's name/email
  const referred = all
    .filter((r) => r.referred_by !== null)
    .map((r) => {
      const referrer = r.referred_by ? byId[r.referred_by] : null;
      return {
        id: r.id,
        email: r.email,
        name: [r.first_name, r.last_name].filter(Boolean).join(' '),
        referralCode: r.referral_code,
        joinedAt: r.subscribed_at,
        referredBy: referrer
          ? {
              id: referrer.id,
              email: referrer.email,
              name: [referrer.first_name, referrer.last_name].filter(Boolean).join(' '),
              referralCode: referrer.referral_code,
            }
          : null,
      };
    });

  return NextResponse.json({
    stats: { totalReferrals, totalReferrers, totalReferred, totalWaitlist: all.length },
    topReferrers,
    referred,
  });
}
