"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lightbulb, FileText, AlertCircle, Clock, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { SectorChart } from "@/components/sector-chart";
import { buildSectorCounts } from "@/lib/sector-chart";

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
  pipeline_status: string;
  deadline: string;
}

interface PatentRow {
  patent_number: string;
  tibi_id: string;
  inventor: string;
  technology_category: string;
  status: string;
  licensing_status: string;
  notes: string;
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const normalized = (deadline || "").trim().toUpperCase();
  if (normalized === "URGENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <AlertCircle className="h-3 w-3" />
        URGENT
      </span>
    );
  }
  if (normalized === "TO-DO" || normalized === "TODO") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        <Clock className="h-3 w-3" />
        To-Do
      </span>
    );
  }
  return null;
}

function getStatusBadgeClass(status: string): string {
  const normalized = status.trim().toUpperCase();
  if (normalized === "URGENT") return "bg-red-100 text-red-700";
  if (normalized === "TO-DO" || normalized === "TODO") return "bg-blue-100 text-blue-700";
  if (normalized === "BLOCKED") return "bg-orange-100 text-orange-700";
  if (normalized === "AWAITING RESPONSE") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

function formatLastUpdated(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function IPDirectoryPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [patents, setPatents] = useState<PatentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [idfLastUpdated, setIdfLastUpdated] = useState<string | null>(null);
  const [patentLastUpdated, setPatentLastUpdated] = useState<string | null>(null);
  const [idfTableOpen, setIdfTableOpen] = useState(false);
  const [patentTableOpen, setPatentTableOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/technologies").then((r) => r.json()),
      fetch("/api/patents").then((r) => r.json()),
    ])
      .then(([techs, pats]) => {
        const techPayload = techs as TechnologyRow[] | { technologies?: TechnologyRow[]; lastUpdated?: string | null };
        const patPayload = pats as PatentRow[] | { patents?: PatentRow[]; lastUpdated?: string | null };
        setTechnologies(Array.isArray(techPayload) ? techPayload : techPayload.technologies ?? []);
        setPatents(Array.isArray(patPayload) ? patPayload : patPayload.patents ?? []);
        if (!Array.isArray(techPayload)) setIdfLastUpdated(techPayload.lastUpdated ?? null);
        if (!Array.isArray(patPayload)) setPatentLastUpdated(patPayload.lastUpdated ?? null);
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

  const combinedDeadlines = useMemo(() => {
    const priority = (d: string) => {
      const n = (d || "").trim().toUpperCase();
      if (n === "URGENT") return 0;
      if (n === "TO-DO" || n === "TODO") return 1;
      return 2;
    };
    const idfItems = technologies
      .filter((t) => {
        const d = (t.deadline || "").trim().toUpperCase();
        return d === "URGENT" || d === "TO-DO" || d === "TODO";
      })
      .map((t) => ({ id: t.idf_number, category: t.technology_category, deadline: t.deadline, type: "IDF" as const, priority: priority(t.deadline) }));
    const patentItems = patents
      .filter((p) => {
        const s = (p.status || "").trim().toUpperCase();
        return s === "URGENT" || s === "TO-DO" || s === "TODO";
      })
      .map((p) => ({ id: p.patent_number, category: p.technology_category, deadline: p.status, type: "Patent" as const, priority: priority(p.status) }));
    return [...idfItems, ...patentItems].sort((a, b) => a.priority - b.priority);
  }, [technologies, patents]);

  return (
    <>
      <Header />
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Intellectual Property Directory</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of invention disclosures and patents organized by technology sector.
          </p>
          {(idfLastUpdated || patentLastUpdated) && (
            <p className="mt-1 text-xs text-gray-400">
              Data source last updated {formatLastUpdated(idfLastUpdated ?? patentLastUpdated)}
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div className="min-w-0 space-y-10">

            {/* IDFs section */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Invention Disclosure Forms (IDFs)</h3>
              </div>
              {loading ? (
                <p className="text-sm text-gray-400">Loading IDF data…</p>
              ) : technologies.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-gray-400">No IDF data available.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* IDF pie chart */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>IDFs by Technology Sector</CardTitle>
                      <CardDescription>Distribution of invention disclosures across technology sectors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SectorChart
                        data={idfSectorCounts}
                        allSectors={allSectors}
                        pieSize={{ height: 180, width: 140, outerRadius: 60, innerRadius: 28 }}
                      />
                    </CardContent>
                  </Card>

                  {/* IDF full table */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIdfTableOpen((prev) => !prev)}
                      className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        All Invention Disclosures ({technologies.length})
                      </span>
                      {idfTableOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>
                    {idfTableOpen && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                              <th className="pb-2 pr-4 font-medium">IDF Number</th>
                              <th className="pb-2 pr-4 font-medium">Created By</th>
                              <th className="pb-2 pr-4 font-medium">Technology Sector</th>
                              <th className="pb-2 pr-4 font-medium">Pipeline Status</th>
                              <th className="pb-2 font-medium">Deadline</th>
                            </tr>
                          </thead>
                          <tbody>
                            {technologies.map((r) => (
                              <tr key={r.idf_number} className="border-b border-gray-100 last:border-0">
                                <td className="py-2.5 pr-4 font-medium text-gray-900">{r.idf_number}</td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.created_by || "—"}</td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.technology_category || "—"}</td>
                                <td className="py-2.5 pr-4 text-gray-700">
                                  {r.pipeline_status ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                      <Activity className="h-3 w-3 text-gray-400" />
                                      {r.pipeline_status}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="py-2.5">{r.deadline ? <DeadlineBadge deadline={r.deadline} /> : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Patents section */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Patents Filed / Ready for Licensing</h3>
              </div>
              {loading ? (
                <p className="text-sm text-gray-400">Loading patent data…</p>
              ) : patents.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-gray-400">No patent data available.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Patent pie chart */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Patents by Technology Sector</CardTitle>
                      <CardDescription>Distribution of patents across technology sectors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SectorChart
                        data={patentSectorCounts}
                        allSectors={allSectors}
                        pieSize={{ height: 180, width: 140, outerRadius: 60, innerRadius: 28 }}
                      />
                    </CardContent>
                  </Card>

                  {/* Patent full table */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setPatentTableOpen((prev) => !prev)}
                      className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        All Patents ({patents.length})
                      </span>
                      {patentTableOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>
                    {patentTableOpen && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                              <th className="pb-2 pr-4 font-medium">Docket No.</th>
                              <th className="pb-2 pr-4 font-medium">TIBI ID</th>
                              <th className="pb-2 pr-4 font-medium">Inventor</th>
                              <th className="pb-2 pr-4 font-medium">Subject Matter</th>
                              <th className="pb-2 pr-4 font-medium">Status</th>
                              <th className="pb-2 pr-4 font-medium">Licensing Status</th>
                              <th className="pb-2 font-medium">Deadlines</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patents.map((r) => (
                              <tr key={r.patent_number} className="border-b border-gray-100 last:border-0">
                                <td className="py-2.5 pr-4 font-medium text-gray-900">{r.patent_number || "—"}</td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.tibi_id || "—"}</td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.inventor || "—"}</td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.technology_category || "—"}</td>
                                <td className="py-2.5 pr-4">
                                  {r.status ? (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(r.status)}`}>
                                      {r.status}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="py-2.5 pr-4 text-gray-700">{r.licensing_status || "—"}</td>
                                <td className="py-2.5 pr-4 text-xs text-gray-600">{r.notes || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                    )}
                  </div>
                </>
              )}
            </section>

          </div>

          {/* Deadlines sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <CardTitle>Deadlines</CardTitle>
                </div>
                <CardDescription>All urgent and to-do items across IDFs and patents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
                ) : combinedDeadlines.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">No upcoming deadlines.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {combinedDeadlines.map((item) => (
                      <li key={`${item.type}-${item.id}`} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-gray-400">{item.type}</span>
                              <span className="text-sm font-medium text-gray-900">{item.id}</span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{item.category || "—"}</p>
                          </div>
                          <DeadlineBadge deadline={item.deadline} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
