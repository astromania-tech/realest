/**
 * /admin/analytics/polls — Poll results page (server component)
 */
import { createClient, getAuthUser} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PollResultsCharts } from './_components/PollResultsCharts';

export const metadata = { title: 'Poll Results | RealEST Admin' };
export const dynamic = 'force-dynamic';

async function getPollData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/admin/analytics/polls`,
    { cache: 'no-store', headers: { 'x-internal': '1' } },
  ).catch(() => null);
  if (!res?.ok) return null;
  return res.json() as Promise<{
    total: number;
    questions: Record<string, { answer: string; total: number; byRef: Record<string, number> }[]>;
    refTags: string[];
  }>;
}

export default async function PollResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) redirect('/login');
  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userRow?.role !== 'admin') redirect('/');

  const data = await getPollData();

  const cityQuestion = data?.questions?.['city'] ?? [];
  const totalVotes = data?.total ?? 0;
  const refTags = data?.refTags ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Poll Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Votes collected via email links — <strong>{totalVotes}</strong> total responses
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalVotes}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Object.keys(data?.questions ?? {}).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{refTags.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{cityQuestion[0]?.answer ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* City poll chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>City Preference Poll</CardTitle>
            <div className="flex gap-2">
              {refTags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Which city are you most interested in?</p>
        </CardHeader>
        <CardContent>
          {cityQuestion.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No votes recorded yet.</p>
          ) : (
            <PollResultsCharts cityData={cityQuestion} refTags={refTags} />
          )}
        </CardContent>
      </Card>

      {/* Raw breakdown table */}
      {cityQuestion.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Breakdown by Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">City</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Total</th>
                    {refTags.map((tag) => (
                      <th key={tag} className="text-right py-2 px-4 font-medium text-muted-foreground capitalize">
                        {tag}
                      </th>
                    ))}
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {cityQuestion.map((row) => (
                    <tr key={row.answer} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-2 pr-4 font-medium capitalize">{row.answer}</td>
                      <td className="text-right py-2 px-4">{row.total}</td>
                      {refTags.map((tag) => (
                        <td key={tag} className="text-right py-2 px-4 text-muted-foreground">
                          {row.byRef[tag] ?? 0}
                        </td>
                      ))}
                      <td className="text-right py-2 pl-4 text-muted-foreground">
                        {totalVotes > 0 ? ((row.total / totalVotes) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
