"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: any[];
  dataKeys: string[];
  height?: number;
  colors?: string[];
}

export function RadarChart({
  data,
  dataKeys,
  height = 300,
  colors = ["#07402F", "#2E322E", "#ADF434"],
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => `${value}%`}
        />
        {dataKeys.map((key, index) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
        <Tooltip />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
