/**
 * GET /api/admin/analytics/referrals
 *
 * Returns referral summary data from the waitlist table:
 *   - Top referrers (sorted by referral_count desc)
 *   - Recent referred entries with their referrer info
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

  const [totalWaitlist, totalReferrers, totalReferred, referralSum, topReferrers, referredRows] =
    await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.count({ where: { referral_count: { gt: 0 } } }),
      prisma.waitlist.count({ where: { referred_by: { not: null } } }),
      prisma.waitlist.aggregate({ _sum: { referral_count: true } }),
      prisma.waitlist.findMany({
        where: { referral_count: { gt: 0 } },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          referral_code: true,
          referral_count: true,
          status: true,
          subscribed_at: true,
        },
        orderBy: { referral_count: 'desc' },
        take: 50,
      }),
      prisma.waitlist.findMany({
        where: { referred_by: { not: null } },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          referral_code: true,
          referred_by: true,
          subscribed_at: true,
        },
        orderBy: { subscribed_at: 'desc' },
        take: 100,
      }),
    ]);

  const referrerIds = [
    ...new Set(
      referredRows
        .map((r) => r.referred_by)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const referrers =
    referrerIds.length > 0
      ? await prisma.waitlist.findMany({
          where: { id: { in: referrerIds } },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            referral_code: true,
          },
        })
      : [];

  const byId = Object.fromEntries(referrers.map((r) => [r.id, r]));

  const referred = referredRows.map((r) => {
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
    stats: {
      totalReferrals: referralSum._sum.referral_count ?? 0,
      totalReferrers,
      totalReferred,
      totalWaitlist,
    },
    topReferrers: topReferrers.map((r) => ({
      id: r.id,
      email: r.email,
      name: [r.first_name, r.last_name].filter(Boolean).join(' '),
      referralCode: r.referral_code,
      referralCount: r.referral_count ?? 0,
      status: r.status,
      joinedAt: r.subscribed_at,
    })),
    referred,
  });
}
