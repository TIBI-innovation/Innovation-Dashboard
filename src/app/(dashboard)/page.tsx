"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Lightbulb, AlertCircle } from "lucide-react";
import { SectorChart } from "@/components/sector-chart";
import { buildSectorCounts } from "@/lib/sector-chart";

interface PatentRow {
  patent_number: string;
  tibi_id: string;
  inventor: string;
  technology_category: string;
  status: string;
  licensing_status: string;
  notes: string;
}

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
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
        const techPayload = techs as TechnologyRow[] | { technologies?: TechnologyRow[] };
        const patPayload = pats as PatentRow[] | { patents?: PatentRow[] };
        setTechnologies(Array.isArray(techPayload) ? techPayload : techPayload.technologies ?? []);
        setPatentRows(Array.isArray(patPayload) ? patPayload : patPayload.patents ?? []);
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
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.15fr_0.7fr]">
          {/* Column 1: Invention Disclosures */}
          <div className="min-w-0 space-y-4">
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
                  <SectorChart
                    data={idfSectorCounts}
                    allSectors={allSectors}
                    pieSize={{ height: 140, width: 110, outerRadius: 50, innerRadius: 22 }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Patents */}
          <div className="min-w-0 space-y-4">
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
                  <SectorChart
                    data={patentSectorCounts}
                    allSectors={allSectors}
                    pieSize={{ height: 140, width: 110, outerRadius: 50, innerRadius: 22 }}
                  />
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