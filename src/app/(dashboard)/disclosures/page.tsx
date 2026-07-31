"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, User, Tag, Info, ArrowUpDown, AlertCircle, Clock, Activity } from "lucide-react";

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
  pipeline_status: string;
  deadline: string;
}

type SortMode = "idf" | "creator" | "category" | "status";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "idf", label: "IDF Number" },
  { value: "creator", label: "Created By" },
  { value: "category", label: "Technology Category" },
  { value: "status", label: "Status" },
];

function isValidCreatorName(row: TechnologyRow): boolean {
  const creator = (row.created_by || "").trim();
  if (!creator) return false;
  if (!/[A-Za-z]/.test(creator)) return false;
  if (/\d/.test(creator)) return false;
  if (/^IDF\d+/i.test(creator)) return false;
  if (creator === (row.idf_number || "").trim()) return false;
  if (creator === (row.technology_category || "").trim()) return false;
  return true;
}

function splitCreatorNames(createdBy: string): string[] {
  return createdBy
    .split(/[;,|]/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

function formatLastUpdated(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function deadlinePriority(deadline: string): number {
  const normalized = (deadline || "").trim().toUpperCase();
  if (normalized === "URGENT") return 0;
  if (normalized === "TO-DO" || normalized === "TODO") return 1;
  return 2;
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const normalized = (deadline || "").trim().toUpperCase();
  if (normalized === "URGENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <AlertCircle className="h-3 w-3" />
        URGENT
      </span>
    );
  }
  if (normalized === "TO-DO" || normalized === "TODO") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        <Clock className="h-3 w-3" />
        To-Do
      </span>
    );
  }
  return null;
}

export default function DisclosuresPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("idf");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/technologies")
      .then((res) => res.json())
      .then((data) => {
        const payload = data as TechnologyRow[] | { technologies?: TechnologyRow[]; lastUpdated?: string | null };
        setTechnologies(Array.isArray(payload) ? payload : payload.technologies ?? []);
        if (!Array.isArray(payload)) setLastUpdated(payload.lastUpdated ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const deadlineIDFs = useMemo(() => {
    return technologies
      .filter((t) => {
        const d = (t.deadline || "").trim().toUpperCase();
        return d === "URGENT" || d === "TO-DO" || d === "TODO";
      })
      .sort((a, b) => deadlinePriority(a.deadline) - deadlinePriority(b.deadline));
  }, [technologies]);

  const selectedSingle = useMemo(() => {
    if (!selectedValue || sortMode !== "idf") return undefined;
    return technologies.find((t) => t.idf_number === selectedValue);
  }, [technologies, sortMode, selectedValue]);

  const selectedGroup = useMemo(() => {
    if (!selectedValue || sortMode === "idf") return undefined;
    const key = selectedValue;
    if (sortMode === "creator") {
      return technologies.filter((t) => splitCreatorNames(t.created_by || "").includes(key));
    }
    if (sortMode === "category") {
      return technologies.filter((t) => t.technology_category === key);
    }
    if (sortMode === "status") {
      return technologies.filter((t) => t.deadline === key);
    }
    return undefined;
  }, [technologies, sortMode, selectedValue]);

  const idfValues = useMemo(
    () =>
      Array.from(
        new Set(
          technologies
            .map((t) => t.idf_number)
            .filter((v) => v && typeof v === "string" && v.trim().length > 0)
        )
      ).sort(),
    [technologies]
  );

  const creatorValues = useMemo(
    () =>
      Array.from(
        new Set(
          technologies
            .filter(isValidCreatorName)
            .flatMap((t) => splitCreatorNames(t.created_by || ""))
            .filter((name) => /[A-Za-z]/.test(name) && !/\d/.test(name) && !/^IDF/i.test(name))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [technologies]
  );

  const categoryValues = useMemo(
    () =>
      Array.from(
        new Set(
          technologies
            .map((t) => t.technology_category)
            .filter(
              (v) => v && typeof v === "string" && v.trim().length > 0 && !v.match(/^IDF\d+/)
            )
        )
      ).sort((a, b) => a.localeCompare(b)),
    [technologies]
  );

  const statusValues = useMemo(
    () =>
      Array.from(
        new Set(
          technologies
            .map((t) => t.deadline)
            .filter((v) => v && typeof v === "string" && v.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [technologies]
  );

  const distinctValues = useMemo(() => {
    if (sortMode === "creator") return creatorValues;
    if (sortMode === "category") return categoryValues;
    if (sortMode === "status") return statusValues;
    return idfValues;
  }, [sortMode, idfValues, creatorValues, categoryValues, statusValues]);

  function handleSortChange(mode: SortMode) {
    setSortMode(mode);
    setSelectedValue("");
  }

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invention Disclosures</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track invention disclosure submissions.
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-400">Data source last updated {formatLastUpdated(lastUpdated)}</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <CardTitle>Browse Disclosures</CardTitle>
                </div>
                <CardDescription>
                  Select an invention disclosure to view its full details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  <label htmlFor="sort-mode" className="text-sm text-gray-500 whitespace-nowrap">
                    Sort by
                  </label>
                  <select
                    id="sort-mode"
                    value={sortMode}
                    onChange={(e) => handleSortChange(e.target.value as SortMode)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    key={sortMode}
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 max-w-[200px]"
                  >
                    <option value="">—</option>
                    {loading && <option disabled>Loading...</option>}
                    {distinctValues.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {selectedSingle && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary-600" />
                    <CardTitle>{selectedSingle.idf_number}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Created By</p>
                        <p className="text-sm font-medium text-gray-900">{selectedSingle.created_by || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Technology Category</p>
                        <p className="text-sm font-medium text-gray-900">{selectedSingle.technology_category || "—"}</p>
                      </div>
                    </div>
                    {selectedSingle.pipeline_status && (
                      <div className="flex items-start gap-2">
                        <Activity className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Pipeline Status</p>
                          <p className="text-sm font-medium text-gray-900">{selectedSingle.pipeline_status}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedGroup && selectedGroup.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary-600" />
                    <CardTitle>{selectedValue}</CardTitle>
                  </div>
                  <CardDescription>
                    {selectedGroup.length} disclosure{selectedGroup.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-gray-100">
                    {selectedGroup.map((t) => (
                      <div key={t.idf_number} className="py-3 space-y-1">
                        <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
                          <div>
                            <p className="text-xs text-gray-400">IDF Number</p>
                            <p className="text-sm font-medium text-gray-900">{t.idf_number}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Created By</p>
                            <p className="text-sm text-gray-700">{t.created_by || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Category</p>
                            <p className="text-sm text-gray-700">{t.technology_category || "—"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-4">
                          {t.pipeline_status && (
                            <div>
                              <p className="text-xs text-gray-400">Pipeline Status</p>
                              <p className="text-sm text-gray-700">{t.pipeline_status}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar: Priority Workflow */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <CardTitle>Priority Workflow</CardTitle>
                </div>
                <CardDescription>
                  IDFs requiring immediate attention, sorted by urgency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
                ) : deadlineIDFs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">No urgent deadlines.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {deadlineIDFs.map((t) => (
                      <li key={t.idf_number} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{t.idf_number}</p>
                            <p className="mt-0.5 text-xs text-gray-500 truncate">{t.technology_category || "—"}</p>
                            {t.pipeline_status && (
                              <p className="mt-0.5 text-xs text-gray-400">{t.pipeline_status}</p>
                            )}
                          </div>
                          <DeadlineBadge deadline={t.deadline} />
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
