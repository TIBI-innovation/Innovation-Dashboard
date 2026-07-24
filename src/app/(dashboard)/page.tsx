"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Lightbulb, AlertCircle } from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
  notes?: string;
}

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
}

interface SectorCount {
  sector: string;
  count: number;
}

const SECTOR_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1",
  "#84CC16", "#A855F7",
];

function getSectorColor(sector: string, allSectors: string[]): string {
  const idx = allSectors.indexOf(sector);
  return SECTOR_COLORS[idx % SECTOR_COLORS.length];
}

function buildSectorCounts(records: { technology_category: string }[]): SectorCount[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const cat = r.technology_category || "(uncategorized)";
    map.set(cat, (map.get(cat) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);
}

export default function DashboardPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [patentRows, setPatentRows] = useState<PatentRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/technologies", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/patents", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([techs, pats]) => {
        setTechnologies(Array.isArray(techs) ? techs : []);
        setPatentRows(Array.isArray(pats) ? pats : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const idfSectorCounts = useMemo(() => buildSectorCounts(technologies), [technologies]);
  const patentSectorCounts = useMemo(() => buildSectorCounts(patentRows), [patentRows]);

  const allSectors = useMemo(() => {
    const set = new Set<string>();
    idfSectorCounts.forEach((s) => set.add(s.sector));
    patentSectorCounts.forEach((s) => set.add(s.sector));
    return Array.from(set).sort();
  }, [idfSectorCounts, patentSectorCounts]);

  const urgentPatents = useMemo(
    () => patentRows.filter((p) => (p.status || "").trim().toUpperCase() === "URGENT"),
    [patentRows]
  );

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome back, Maddie</h2>
          <p className="mt-1 text-sm text-gray-500">Here is what is happening across your portfolio.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Invention Disclosures */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary-600" />
                  <CardTitle>Invention Disclosures</CardTitle>
                </div>
                <CardDescription>Innovation disclosures submitted to date</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{loaded ? technologies.length : "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IDFs by Technology Sector</CardTitle>
                <CardDescription>Distribution across technology sectors</CardDescription>
              </CardHeader>
              <CardContent>
                {!loaded ? (
                  <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
                ) : idfSectorCounts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">No IDF data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <RePieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={idfSectorCounts}
                        dataKey="count"
                        nameKey="sector"
                        cx="50%"
                        cy="42%"
                        outerRadius={80}
                        innerRadius={35}
                      >
                        {idfSectorCounts.map((entry) => (
                          <Cell
                            key={entry.sector}
                            fill={getSectorColor(entry.sector, allSectors)}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
                      <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconSize={10}
                        wrapperStyle={{ fontSize: 12, lineHeight: "18px", paddingTop: 12 }}
                        formatter={(value, entry) => {
                          const percent = (entry?.payload as unknown as { percent?: number })?.percent;
                          return `${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`;
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Patents */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <CardTitle>Total Patents</CardTitle>
                </div>
                <CardDescription>Count of issued patents in your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{loaded ? patentRows.length : "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patents by Technology Sector</CardTitle>
                <CardDescription>Distribution across technology sectors</CardDescription>
              </CardHeader>
              <CardContent>
                {!loaded ? (
                  <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
                ) : patentSectorCounts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">No patent data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <RePieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={patentSectorCounts}
                        dataKey="count"
                        nameKey="sector"
                        cx="50%"
                        cy="42%"
                        outerRadius={80}
                        innerRadius={35}
                      >
                        {patentSectorCounts.map((entry) => (
                          <Cell
                            key={entry.sector}
                            fill={getSectorColor(entry.sector, allSectors)}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
                      <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconSize={10}
                        wrapperStyle={{ fontSize: 12, lineHeight: "18px", paddingTop: 12 }}
                        formatter={(value, entry) => {
                          const percent = (entry?.payload as unknown as { percent?: number })?.percent;
                          return `${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`;
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Urgent Deadlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle>Upcoming Deadlines</CardTitle>
              </div>
              <CardDescription>Patents marked URGENT requiring immediate action</CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading deadline data...</p>
              ) : urgentPatents.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No urgent patent deadlines.</p>
              ) : (
                <div className="space-y-3">
                  {urgentPatents.map((p) => (
                    <div
                      key={p.patent_number}
                      className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{p.patent_number}</p>
                          <p className="text-xs text-gray-500">{p.technology_category}</p>
                          <p className="mt-1 text-xs text-gray-600">{p.notes || "No deadline provided."}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          URGENT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
