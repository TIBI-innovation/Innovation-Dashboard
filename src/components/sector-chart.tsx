"use client";

import { useState } from "react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { SectorBarChart } from "@/components/sector-bar-chart";
import { getSectorColor, type SectorCount } from "@/lib/sector-chart";

interface PieSize {
  height: number;
  width: number;
  outerRadius: number;
  innerRadius: number;
}

interface SectorChartProps {
  data: SectorCount[];
  allSectors: string[];
  defaultView?: "pie" | "bar";
  pieSize?: PieSize;
}

const DEFAULT_PIE_SIZE: PieSize = { height: 180, width: 140, outerRadius: 60, innerRadius: 28 };

function sectorPercent(count: number, all: SectorCount[]): number {
  const total = all.reduce((sum, s) => sum + s.count, 0);
  return total ? Math.round((count / total) * 100) : 0;
}

export function SectorChart({ data, allSectors, defaultView = "bar", pieSize = DEFAULT_PIE_SIZE }: SectorChartProps) {
  const [view, setView] = useState<"pie" | "bar">(defaultView);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
          <button
            type="button"
            onClick={() => setView("bar")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "bar" ? "bg-primary-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bar
          </button>
          <button
            type="button"
            onClick={() => setView("pie")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "pie" ? "bg-primary-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      {view === "bar" ? (
        <SectorBarChart data={data} allSectors={allSectors} />
      ) : (
        <div className="flex items-center gap-4">
          <div className="shrink-0" style={{ height: pieSize.height, width: pieSize.width }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={pieSize.outerRadius}
                  innerRadius={pieSize.innerRadius}
                >
                  {data.map((entry) => (
                    <Cell key={entry.sector} fill={getSectorColor(entry.sector, allSectors)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, name]} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <ul className="min-w-0 flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: pieSize.height }}>
            {data.map((entry) => (
              <li key={entry.sector} className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getSectorColor(entry.sector, allSectors) }}
                />
                <span
                  className="truncate text-xs text-gray-700"
                  title={`${entry.sector} (${sectorPercent(entry.count, data)}%)`}
                >
                  {entry.sector} ({sectorPercent(entry.count, data)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
