"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Lightbulb, AlertCircle } from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
  notes?: string;
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

const renderLabel = ({
  sector,
  percent,
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
}: {
  sector: string;
  percent: number;
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
    >
      {sector} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export default function IPDirectoryPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [patents, setPatents] = useState<PatentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIdfSectionOpen, setIsIdfSectionOpen] = useState(false);
  const [isPatentSectionOpen, setIsPatentSectionOpen] = useState(false);
  const [selectedIdfSector, setSelectedIdfSector] = useState<string | null>(null);
  const [selectedPatentSector, setSelectedPatentSector] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/technologies").then((r) => r.json()),
      fetch("/api/patents").then((r) => r.json()),
    ])
      .then(([techs, pats]) => {
        setTechnologies(Array.isArray(techs) ? techs : []);
        setPatents(Array.isArray(pats) ? pats : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const idfSectorCounts = useMemo(() => buildSectorCounts(technologies), [technologies]);
  const patentSectorCounts = useMemo(() => buildSectorCounts(patents), [patents]);

  const allSectors = useMemo(() => {
    const set = new Set<string>();
    idfSectorCounts.forEach((s) => set.add(s.sector));
    patentSectorCounts.forEach((s) => set.add(s.sector));
    return Array.from(set).sort();
  }, [idfSectorCounts, patentSectorCounts]);

  const selectedIdfRecords = useMemo(() => {
    if (!selectedIdfSector) return null;
    return technologies.filter(
      (t) => (t.technology_category || "(uncategorized)") === selectedIdfSector
    );
  }, [technologies, selectedIdfSector]);

  const selectedPatentRecords = useMemo(() => {
    if (!selectedPatentSector) return null;
    return patents.filter(
      (p) => (p.technology_category || "(uncategorized)") === selectedPatentSector
    );
  }, [patents, selectedPatentSector]);
  const urgentPatents = useMemo(
    () => patents.filter((p) => (p.status || "").trim().toUpperCase() === "URGENT"),
    [patents]
  );

  function toggleIdfSector(sector: string) {
    setSelectedIdfSector((prev) => (prev === sector ? null : sector));
  }

  function togglePatentSector(sector: string) {
    setSelectedPatentSector((prev) => (prev === sector ? null : sector));
  }

  return (
    <>
      <Header />
      <div className="space-y-10 p-8">
        {/* Page header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Intellectual Property Directory</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of invention disclosures and patents organized by technology sector.
          </p>
        </div>

        {/* Section 1: IDFs by sector */}
        <section>
          <button
            type="button"
            onClick={() => setIsIdfSectionOpen((prev) => !prev)}
            aria-expanded={isIdfSectionOpen}
            className="mb-4 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Invention Disclosure Forms (IDFs) by Technology Sector
              </h3>
            </span>
            {isIdfSectionOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {isIdfSectionOpen &&
            (loading ? (
              <p className="text-sm text-gray-400">Loading IDF data…</p>
            ) : idfSectorCounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-gray-400">No IDF data available.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {idfSectorCounts.map(({ sector, count }) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleIdfSector(sector)}
                      className="text-left"
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedIdfSector === sector ? "ring-2 ring-primary-500" : ""
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{sector}</CardTitle>
                            {selectedIdfSector === sector ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <CardDescription>
                            <span className="text-2xl font-bold text-gray-900">{count}</span>{" "}
                            IDF{count !== 1 ? "s" : ""}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </button>
                  ))}
                </div>

                {/* IDF detail panel */}
                {selectedIdfRecords && selectedIdfRecords.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>{selectedIdfSector}</CardTitle>
                      <CardDescription>
                        {selectedIdfRecords.length} disclosure
                        {selectedIdfRecords.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                              <th className="pb-2 pr-4 font-medium">IDF Number</th>
                              <th className="pb-2 pr-4 font-medium">Created By</th>
                              <th className="pb-2 font-medium">Technology Sector</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedIdfRecords.map((r) => (
                              <tr key={r.idf_number} className="border-b border-gray-100 last:border-0">
                                <td className="py-2.5 pr-4 font-medium text-gray-900">
                                  {r.idf_number}
                                </td>
                                <td className="py-2.5 pr-4 text-gray-700">
                                  {r.created_by || "—"}
                                </td>
                                <td className="py-2.5 text-gray-700">
                                  {r.technology_category || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                  <ResponsiveContainer width="100%" height={280}>
                    <RePieChart>
                      <Pie
                        data={idfSectorCounts}
                        dataKey="count"
                        nameKey="sector"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={35}
                        label={renderLabel}
                        labelLine
                      >
                        {idfSectorCounts.map((entry) => (
                          <Cell
                            key={entry.sector}
                            fill={getSectorColor(entry.sector, allSectors)}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
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

                {/* Patent detail panel */}
                {selectedPatentRecords && selectedPatentRecords.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>{selectedPatentSector}</CardTitle>
                      <CardDescription>
                        {selectedPatentRecords.length} record
                        {selectedPatentRecords.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                              <th className="pb-2 pr-4 font-medium">Patent Number</th>
                              <th className="pb-2 pr-4 font-medium">Technology Sector</th>
                              <th className="pb-2 pr-4 font-medium">Status</th>
                              <th className="pb-2 font-medium">Deadline Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPatentRecords.map((r) => (
                              <tr key={r.patent_number} className="border-b border-gray-100 last:border-0">
                                <td className="py-2.5 pr-4 font-medium text-gray-900">
                                  {r.patent_number}
                                </td>
                                <td className="py-2.5 pr-4 text-gray-700">
                                  {r.technology_category || "—"}
                                </td>
                                <td className="py-2.5 pr-4">
                                  {r.status ? (
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                        r.status
                                      )}`}
                                    >
                                      {r.status}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 text-gray-600">
                                  {r.notes || <span className="text-gray-400">—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                  <ResponsiveContainer width="100%" height={280}>
                    <RePieChart>
                      <Pie
                        data={patentSectorCounts}
                        dataKey="count"
                        nameKey="sector"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={35}
                        label={renderLabel}
                        labelLine
                      >
                        {patentSectorCounts.map((entry) => (
                          <Cell
                            key={entry.sector}
                            fill={getSectorColor(entry.sector, allSectors)}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
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
