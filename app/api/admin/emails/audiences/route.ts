/**
 * GET /api/admin/emails/audiences
 *
 * Returns all available audience sources:
 *   - Resend-managed audiences (from RESEND_AUDIENCE_* env vars)
 *   - DB segments (live counts from users table)
 *
 * Admin-only.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';
import type { UserRole } from '@/lib/prisma/client';

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List admin email audiences',
  description: 'Return configured Resend audiences and database-backed audience segments with counts.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': { description: 'Audience sources loaded successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Configured Resend audiences ───────────────────────────────────────────────
const RESEND_AUDIENCES = [
  {
    id: process.env.RESEND_AUDIENCE_WAITLIST_ID ?? '',
    key: 'waitlist',
    name: 'Waitlist Subscribers',
    description: 'Everyone who joined the waitlist',
    sendMode: 'broadcast' as const,
  },
  {
    id: process.env.RESEND_AUDIENCE_USERS_ID ?? '',
    key: 'all_users',
    name: 'All Users',
    description: 'All registered platform users',
    sendMode: 'broadcast' as const,
  },
  {
    id: process.env.RESEND_AUDIENCE_OWNERS_ID ?? '',
    key: 'owners',
    name: 'Property Owners',
    description: 'Verified and unverified owners',
    sendMode: 'broadcast' as const,
  },
  {
    id: process.env.RESEND_AUDIENCE_AGENTS_ID ?? '',
    key: 'agents',
    name: 'Agents',
    description: 'Licensed real estate agents',
    sendMode: 'broadcast' as const,
  },
];

// ── DB segments ───────────────────────────────────────────────────────────────
const DB_SEGMENTS = [
  {
    id: 'db_all_active',
    key: 'db_all_active',
    name: 'All Active Users (DB)',
    description: 'All non-deleted platform users',
    sendMode: 'batch' as const,
    filter: { deleted_at: null },
  },
  {
    id: 'db_owners',
    key: 'db_owners',
    name: 'Active Owners (DB)',
    description: 'Users with role = owner',
    sendMode: 'batch' as const,
    filter: { role: 'owner' as const, deleted_at: null },
  },
  {
    id: 'db_agents',
    key: 'db_agents',
    name: 'Active Agents (DB)',
    description: 'Users with role = agent',
    sendMode: 'batch' as const,
    filter: { role: 'agent' as const, deleted_at: null },
  },
  {
    id: 'db_users',
    key: 'db_users',
    name: 'Regular Users (DB)',
    description: 'Users with role = user',
    sendMode: 'batch' as const,
    filter: { role: 'user' as const, deleted_at: null },
  },
  {
    id: 'db_waitlist',
    key: 'db_waitlist',
    name: 'Waitlist Subscribers (DB)',
    description: 'Active waitlist sign-ups from the waitlist table',
    sendMode: 'batch' as const,
    filter: { source: 'waitlist' as const },
  },
] as const;

export async function GET() {
  // Auth guard
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  // ── Fetch Resend contact counts in parallel ────────────────────────────────
  const resendAudiencesWithCounts = await Promise.all(
    RESEND_AUDIENCES.map(async (audience) => {
      if (!audience.id) {
        return { ...audience, contactCount: 0, configured: false };
      }
      try {
        const listRes = await (
          resend.contacts as unknown as {
            list: (opts: { audienceId: string }) => Promise<{
              data: { data?: unknown[] } | null;
              error: { message: string } | null;
            }>;
          }
        ).list({ audienceId: audience.id });

        const count = listRes.data?.data?.length ?? 0;
        return { ...audience, contactCount: count, configured: true };
      } catch {
        return { ...audience, contactCount: 0, configured: true };
      }
    }),
  );

  // ── Fetch DB segment counts ────────────────────────────────────────────────
  const dbSegmentsWithCounts = await Promise.all(
    DB_SEGMENTS.map(async (segment) => {
      try {
        if (segment.id === 'db_waitlist') {
          const count = await prisma.waitlist.count({ where: { status: 'active' } });
          return { ...segment, contactCount: count };
        }

        const where: { deleted_at: null; role?: UserRole } = { deleted_at: null };
        if ('role' in segment.filter && segment.filter.role) {
          where.role = segment.filter.role as UserRole;
        }

        const count = await prisma.users.count({ where });
        return { ...segment, contactCount: count };
      } catch {
        return { ...segment, contactCount: 0 };
      }
    }),
  );

  return NextResponse.json({
    resendAudiences: resendAudiencesWithCounts,
    dbSegments: dbSegmentsWithCounts,
  });
}
