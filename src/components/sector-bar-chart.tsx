"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, ResponsiveContainer } from "recharts";
import { getSectorColor, type SectorCount } from "@/lib/sector-chart";

interface SectorBarChartProps {
  data: SectorCount[];
  allSectors: string[];
  rowHeight?: number;
}

const AXIS_TICK_STYLE = { fontSize: 12, fill: "#374151" };

export function SectorBarChart({ data, allSectors, rowHeight = 30 }: SectorBarChartProps) {
  const height = Math.max(data.length * rowHeight, 90);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 0 }} barCategoryGap={4}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="sector"
            width={200}
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(value: number) => [value, "Count"]} cursor={{ fill: "#F3F4F6" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry) => (
              <Cell key={entry.sector} fill={getSectorColor(entry.sector, allSectors)} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: "#374151" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
