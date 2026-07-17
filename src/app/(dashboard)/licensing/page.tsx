"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

interface LicensingTarget {
  companyName: string;
  companySize: string;
  fitPercentage: number;
  strategicFit: string;
  decisionMakerRoles: string[];
}

interface ReportData {
  oneSentenceSummary: string;
  targetSectors: string[];
  licensingTargets: LicensingTarget[];
  assumptions: string[];
  aiGeneratedDisclaimer: string;
}

export default function LicensingPage() {
  const [technicalSummary, setTechnicalSummary] = useState("");
  const [ftoConstraints, setFtoConstraints] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [userFeedback, setUserFeedback] = useState("");

  async function generateReport() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/licensing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicalSummary, ftoConstraints }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errData?.error ?? "Failed to generate report.");
      }

      const data = (await response.json()) as ReportData;
      setReportData(data);
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function submitFeedback() {
    setUserFeedback(feedbackInput);
  }

  async function regenerateReport() {
    if (!reportData) return;

    setRegenerating(true);
    setError(null);
    const feedbackToSubmit = feedbackInput.trim();
    setUserFeedback(feedbackToSubmit);

    try {
      const response = await fetch("/api/licensing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicalSummary,
          ftoConstraints,
          previousReport: reportData,
          userFeedback: feedbackToSubmit || userFeedback,
        }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errData?.error ?? "Failed to regenerate report.");
      }

      const data = (await response.json()) as ReportData;
      setReportData(data);
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Something went wrong.");
    } finally {
      setRegenerating(false);
    }
  }

  async function exportToExcel() {
    if (!reportData) return;

    setExporting(true);
    setError(null);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ["Field", "Value"],
        ["Technology Summary", reportData.oneSentenceSummary],
        ["Technical Summary Input", technicalSummary],
        ["FTO Constraints", ftoConstraints || ""],
        ["Target Sectors", reportData.targetSectors.join(", ")],
        ["AI Disclaimer", reportData.aiGeneratedDisclaimer],
      ]);

      const targetsSheet = XLSX.utils.json_to_sheet(
        reportData.licensingTargets.map((target) => ({
          Company: target.companyName,
          Size: target.companySize,
          "Fit Percentage": target.fitPercentage,
          "Strategic Fit": target.strategicFit,
          "Decision-Maker Roles": target.decisionMakerRoles.join(", "),
        }))
      );

      const assumptionsSheet = XLSX.utils.json_to_sheet(
        reportData.assumptions.map((assumption) => ({ Assumption: assumption }))
      );

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(workbook, targetsSheet, "Licensing Targets");
      XLSX.utils.book_append_sheet(workbook, assumptionsSheet, "Assumptions");

      const fileName = `licensing-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Licensing Center</h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze a technical summary and generate licensing intelligence targets.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary-600" />
              <CardTitle>Generate Report</CardTitle>
            </div>
            <CardDescription>
              Provide a technical summary and constraints to generate report output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Technical Summary</label>
              <textarea
                value={technicalSummary}
                onChange={(event) => setTechnicalSummary(event.target.value)}
                className="min-h-[180px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Paste technical summary here..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">FTO Constraints (Optional)</label>
              <input
                type="text"
                value={ftoConstraints}
                onChange={(event) => setFtoConstraints(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Example: invasive implantables, insulin pumps, specific assay claims..."
              />
            </div>
            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Output</CardTitle>
            <CardDescription>Generated report data based on current inputs.</CardDescription>
          </CardHeader>
          <CardContent>
            {!reportData ? (
              <p className="text-sm text-gray-500">Generate a report to view output.</p>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Technology Summary</label>
                  <input
                    type="text"
                    value={reportData.oneSentenceSummary}
                    onChange={(event) =>
                      setReportData({ ...reportData, oneSentenceSummary: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Target Sectors</p>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                    {reportData.targetSectors.map((sector) => (
                      <li key={sector}>{sector}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Licensing Targets</p>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {reportData.licensingTargets.map((target) => (
                      <div key={target.companyName} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{target.companyName}</p>
                            <p className="text-xs text-gray-500">{target.companySize}</p>
                          </div>
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {target.fitPercentage}% fit
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">{target.strategicFit}</p>
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Decision-Maker Roles
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-600">
                            {target.decisionMakerRoles.map((role) => (
                              <li key={`${target.companyName}-${role}`}>{role}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Assumptions</p>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                    {reportData.assumptions.map((assumption) => (
                      <li key={assumption}>{assumption}</li>
                    ))}
                  </ul>
                </div>

                <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  ⚠ {reportData.aiGeneratedDisclaimer}
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">User Feedback</label>
                  <textarea
                    value={feedbackInput}
                    onChange={(event) => setFeedbackInput(event.target.value)}
                    className="min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Provide feedback to refine the report..."
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={submitFeedback}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Submit Feedback
                  </button>
                  <button
                    type="button"
                    onClick={regenerateReport}
                    disabled={regenerating}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
                  >
                    {regenerating ? "Regenerating..." : "Regenerate Report"}
                  </button>
                  <button
                    type="button"
                    onClick={exportToExcel}
                    disabled={exporting}
                    className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:border-primary-100 disabled:bg-primary-50 disabled:text-primary-300"
                  >
                    {exporting ? "Exporting..." : "Export to Excel"}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
