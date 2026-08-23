"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieChartProps {
  data: any[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
}

export function PieChart({
  data,
  dataKey = "value",
  nameKey = "name",
  height = 300,
  colors = ["#07402F", "#2E322E", "#ADF434"],
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey={dataKey}
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
