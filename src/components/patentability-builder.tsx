"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, KeyRound, TrendingUp, Download, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadLicensingDraft, type LicensingDraft } from "@/lib/licensing-draft";

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PatentabilityBuilder() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LicensingDraft | null>(null);
  const [attemptedImport, setAttemptedImport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function importFromLicensingCenter() {
    setAttemptedImport(true);
    setDraft(loadLicensingDraft());
  }

  async function exportReport() {
    if (!draft) return;

    setExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/export-patentability-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licensingData: draft.reportData,
          technicalSummary: draft.technicalSummary,
        }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errData?.error ?? "Failed to export report.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patentability-assessment-${new Date().toISOString().slice(0, 10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export patentability report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div>
          <CardTitle>Build Patentability Assessment</CardTitle>
          <CardDescription className="mt-1.5">
            Assemble a new assessment from AI-generated sections before exporting the full report.
          </CardDescription>
        </div>
        {open ? <ChevronUp className="h-5 w-5 shrink-0 text-gray-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />}
      </button>

      {open && (
        <CardContent className="space-y-4 pt-0">
          {/* Licensing Opportunities section */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-gray-900">Licensing Opportunities</p>
            </div>

            {!draft ? (
              <div className="space-y-2">
                {attemptedImport && (
                  <p className="text-sm text-gray-500">
                    Nothing generated yet.{" "}
                    <Link href="/licensing" className="font-medium text-primary-600 hover:text-primary-700">
                      Go to Licensing Center
                    </Link>{" "}
                    to generate a report first.
                  </p>
                )}
                <button
                  type="button"
                  onClick={importFromLicensingCenter}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <Download className="h-4 w-4" />
                  Import from Licensing Center
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{draft.reportData.oneSentenceSummary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {draft.reportData.targetSectors.map((sector) => (
                    <span
                      key={sector}
                      className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {draft.reportData.licensingTargets.length} licensing target
                  {draft.reportData.licensingTargets.length !== 1 ? "s" : ""} · imported from a draft saved{" "}
                  {formatSavedAt(draft.savedAt)}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={importFromLicensingCenter}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re-import latest
                  </button>
                  <Link
                    href="/licensing"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Edit in Licensing Center
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Market Opportunity section -- not wired up yet */}
          <div className="rounded-lg border border-gray-200 p-4 opacity-60">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">Market Opportunity</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Coming soon
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Target markets, market size, and growth rates, sourced from PitchBook.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={exportReport}
              disabled={!draft || exporting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {exporting ? "Generating..." : "Export Patentability Report"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
