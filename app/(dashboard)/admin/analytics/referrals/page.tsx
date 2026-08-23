/**
 * /admin/analytics/referrals — Referral system analytics (server component)
 */
import { createClient, getAuthUser} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Users, GitBranch, ArrowRight, Award } from 'lucide-react';

export const metadata = { title: 'Referral Analytics | RealEST Admin' };
export const dynamic = 'force-dynamic';

interface ReferrerEntry {
  id: string;
  email: string;
  name: string;
  referralCode: string | null;
  referralCount: number;
  status: string | null;
  joinedAt: string | null;
}

interface ReferredEntry {
  id: string;
  email: string;
  name: string;
  referralCode: string | null;
  joinedAt: string | null;
  referredBy: {
    id: string;
    email: string;
    name: string;
    referralCode: string | null;
  } | null;
}

interface ReferralData {
  stats: {
    totalReferrals: number;
    totalReferrers: number;
    totalReferred: number;
    totalWaitlist: number;
  };
  topReferrers: ReferrerEntry[];
  referred: ReferredEntry[];
}

async function getReferralData(): Promise<ReferralData | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/admin/analytics/referrals`,
    { cache: 'no-store', headers: { 'x-internal': '1' } },
  ).catch(() => null);
  if (!res?.ok) return null;
  return res.json();
}

function fmt(d: string | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(d));
}

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) redirect('/login');
  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userRow?.role !== 'admin') redirect('/');

  const data = await getReferralData();
  const stats = data?.stats ?? { totalReferrals: 0, totalReferrers: 0, totalReferred: 0, totalWaitlist: 0 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Referral Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track who referred who across your waitlist community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals Made', value: stats.totalReferrals, icon: GitBranch },
          { label: 'Active Referrers', value: stats.totalReferrers, icon: Award },
          { label: 'Referred Signups', value: stats.totalReferred, icon: Users },
          { label: 'Waitlist Size', value: stats.totalWaitlist, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Referrers */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ADF434]" />
            Top Referrers
          </CardTitle>
          <p className="text-sm text-muted-foreground">People who have referred the most signups</p>
        </CardHeader>
        <CardContent>
          {!data?.topReferrers?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No referrals recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Referrals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topReferrers.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{r.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>
                      {r.referralCode ? (
                        <code className="text-xs bg-accent/20 px-2 py-0.5 rounded font-mono">
                          {r.referralCode}
                        </code>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="bg-[#ADF434] text-[#07402F] font-bold">
                        {r.referralCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'active' ? 'outline' : 'secondary'} className="capitalize text-xs">
                        {r.status ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmt(r.joinedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referred signups */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Referred Signups
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {stats.totalReferred} people joined via a referral link
          </p>
        </CardHeader>
        <CardContent>
          {!data?.referred?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No referred signups yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Their Code</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Referrer Code</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.referred.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>
                      {r.referralCode ? (
                        <code className="text-xs bg-accent/20 px-2 py-0.5 rounded font-mono">
                          {r.referralCode}
                        </code>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {r.referredBy ? (
                        <div>
                          <p className="font-medium text-sm">{r.referredBy.name || r.referredBy.email}</p>
                          <p className="text-xs text-muted-foreground">{r.referredBy.email}</p>
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {r.referredBy?.referralCode ? (
                        <code className="text-xs bg-[#ADF434]/20 text-[#07402F] px-2 py-0.5 rounded font-mono">
                          {r.referredBy.referralCode}
                        </code>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmt(r.joinedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
