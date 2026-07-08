"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { InnovationPipeline } from "@/components/innovation-pipeline";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Lightbulb, Award } from "lucide-react";

interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
}

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
}

function mostCommonSector(rows: { technology_category: string }[]): { sector: string; count: number } | null {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const cat = r.technology_category || "(uncategorized)";
    counts[cat] = (counts[cat] || 0) + 1;
  }
  let best: { sector: string; count: number } | null = null;
  for (const sector of Object.keys(counts)) {
    const count = counts[sector];
    if (!best || count > best.count) best = { sector, count };
  }
  return best;
}

export default function DashboardPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [patentRows, setPatentRows] = useState<PatentRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/technologies").then((r) => r.json()),
      fetch("/api/patents").then((r) => r.json()),
    ])
      .then(([techs, pats]) => {
        setTechnologies(Array.isArray(techs) ? techs : []);
        setPatentRows(Array.isArray(pats) ? pats : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const topIdf = useMemo(() => mostCommonSector(technologies), [technologies]);
  const topPatent = useMemo(() => mostCommonSector(patentRows), [patentRows]);

  const statCards = [
    {
      title: "Total Patents",
      description: "Count of issued patents in your portfolio",
      value: loaded ? patentRows.length : "—",
      icon: FileText,
    },
    {
      title: "Invention Disclosures",
      description: "Innovation disclosures submitted to date",
      value: loaded ? technologies.length : "—",
      icon: Lightbulb,
    },
    {
      title: "Top Technology Sector",
      description: "Most active technology area",
      icon: Award,
      render: () => (
        <div className="space-y-1">
          {topIdf && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">IDFs:</span> {topIdf.sector}{" "}
              <span className="text-gray-400">({topIdf.count})</span>
            </p>
          )}
          {topPatent && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Patents:</span> {topPatent.sector}{" "}
              <span className="text-gray-400">({topPatent.count})</span>
            </p>
          )}
          {!loaded && <p className="text-sm text-gray-400">Loading...</p>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome back, Maddie</h2>
          <p className="mt-1 text-sm text-gray-500">Here is what is happening across your portfolio.</p>
        </div>

        <InnovationPipeline />

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-primary-600" />
                  <CardTitle>{stat.title}</CardTitle>
                </div>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {"render" in stat && stat.render ? (
                  stat.render()
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <CardTitle>Recent Patents</CardTitle>
              </div>
              <CardDescription>Latest additions to your patent portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading patent data...</p>
              ) : patentRows.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No patent data available.</p>
              ) : (
                <div className="space-y-3">
                  {patentRows.slice(0, 4).map((p) => (
                    <div key={p.patent_number} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.patent_number}</p>
                        <p className="text-xs text-gray-500">{p.technology_category}</p>
                      </div>
                      {p.status ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {p.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                <CardTitle>Sector Breakdown</CardTitle>
              </div>
              <CardDescription>Most common technology sectors</CardDescription>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading data...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">IDFs</p>
                    <div className="mt-1 space-y-1">
                      {technologies.length === 0 ? (
                        <p className="text-sm text-gray-400">No data</p>
                      ) : (
                        (() => {
                          const counts: Record<string, number> = {};
                          technologies.forEach((t) => {
                            const cat = t.technology_category || "(uncategorized)";
                            counts[cat] = (counts[cat] || 0) + 1;
                          });
                          return Object.entries(counts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([sector, count]) => (
                              <div key={sector} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{sector}</span>
                                <span className="font-medium text-gray-900">{count}</span>
                              </div>
                            ));
                        })()
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Patents</p>
                    <div className="mt-1 space-y-1">
                      {patentRows.length === 0 ? (
                        <p className="text-sm text-gray-400">No data</p>
                      ) : (
                        (() => {
                          const counts: Record<string, number> = {};
                          patentRows.forEach((p) => {
                            const cat = p.technology_category || "(uncategorized)";
                            counts[cat] = (counts[cat] || 0) + 1;
                          });
                          return Object.entries(counts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([sector, count]) => (
                              <div key={sector} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{sector}</span>
                                <span className="font-medium text-gray-900">{count}</span>
                              </div>
                            ));
                        })()
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
