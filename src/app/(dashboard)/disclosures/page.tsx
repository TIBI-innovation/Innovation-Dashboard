"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FolderOpen, ExternalLink, FileText, User, Tag, Info, ArrowUpDown } from "lucide-react";

interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
}

type SortMode = "idf" | "creator" | "category";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "idf", label: "IDF Number" },
  { value: "creator", label: "Created By" },
  { value: "category", label: "Technology Category" },
];

const ONEDRIVE_URL =
  "https://terasakilab-my.sharepoint.com/:f:/g/personal/madeline_rogers_terasakicolab_org/IgCUWHHQyzOVRaZh1GUqfyZ7AXcLoQVduIY9kxjFKOvYKSY?e=wANRmj";

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

export default function DisclosuresPage() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("idf");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/technologies")
      .then((res) => res.json())
      .then((data) => {
        setTechnologies(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const distinctValues = useMemo(() => {
    if (sortMode === "creator") return creatorValues;
    if (sortMode === "category") return categoryValues;
    return idfValues;
  }, [sortMode, idfValues, creatorValues, categoryValues]);

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
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary-600" />
              <CardTitle>Documents Folder</CardTitle>
            </div>
            <CardDescription>
              Access supporting documents and reference materials for your disclosures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href={ONEDRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Documents Folder
            </a>
            <p className="mt-3 text-xs text-gray-400">
              Access to this folder is managed through Microsoft OneDrive. You must have
              permission to view its contents.
            </p>
          </CardContent>
        </Card>

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
                {loading && <option disabled>Loading…</option>}
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
                  <div key={t.idf_number} className="grid grid-cols-[1fr_1fr_1fr] gap-4 py-3">
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
