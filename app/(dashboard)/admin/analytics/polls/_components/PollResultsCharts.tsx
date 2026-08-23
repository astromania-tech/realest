"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const COLORS = ["#ADF434", "#07402F", "#2E7D52", "#6EB87A", "#C8F08F", "#4CAF50"];

interface CityRow {
  answer: string;
  total: number;
  byRef: Record<string, number>;
}

interface PollResultsChartsProps {
  cityData: CityRow[];
  refTags: string[];
}

export function PollResultsCharts({ cityData, refTags }: PollResultsChartsProps) {
  // Stacked bar data — one bar per city, stacked by ref tag
  const chartData = cityData.map((row) => ({
    city: row.answer.charAt(0).toUpperCase() + row.answer.slice(1),
    total: row.total,
    ...Object.fromEntries(refTags.map((tag) => [tag, row.byRef[tag] ?? 0])),
  }));

  return (
    <div className="space-y-6">
      {/* Stacked bar by campaign */}
      {refTags.length > 1 ? (
        <div>
          <p className="text-xs text-muted-foreground mb-3">Votes by city and campaign</p>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              {refTags.map((tag, i) => (
                <Bar key={tag} dataKey={tag} stackId="a" fill={COLORS[i % COLORS.length]} name={tag} />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Simple total bar when only one campaign */
        <div>
          <p className="text-xs text-muted-foreground mb-3">Total votes per city</p>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
