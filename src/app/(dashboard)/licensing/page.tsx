"use client";

import { FormEvent, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, KeyRound } from "lucide-react";

interface LicensingResponse {
  technology_summary: string;
  sectors: Array<{
    name: string;
    description: string;
    relevance_reason: string;
  }>;
  companies: {
    large: Array<{
      name: string;
      industry: string;
      why_license: string;
      confidence: number;
      contacts: Array<{ name?: string; title: string; why_relevant: string; confidence: number }>;
    }>;
    mid_size: Array<{
      name: string;
      industry: string;
      why_license: string;
      confidence: number;
      contacts: Array<{ name?: string; title: string; why_relevant: string; confidence: number }>;
    }>;
    small_or_niche: Array<{
      name: string;
      industry: string;
      why_license: string;
      confidence: number;
      contacts: Array<{ name?: string; title: string; why_relevant: string; confidence: number }>;
    }>;
  };
  fto_considerations: string[];
  assumptions: string[];
}

type CompanySizeGroup = "large" | "mid_size" | "small_or_niche";

const COMPANY_GROUPS: Array<{ label: string; key: CompanySizeGroup }> = [
  { label: "Large Enterprise", key: "large" },
  { label: "Mid-Size Company", key: "mid_size" },
  { label: "Small or Niche Company", key: "small_or_niche" },
];

function confidenceTone(confidence: number): string {
  if (confidence >= 0.8) return "bg-green-50 text-green-700";
  if (confidence >= 0.65) return "bg-blue-50 text-blue-700";
  return "bg-yellow-50 text-yellow-700";
}

function confidenceLabel(confidence: number): string {
  return `${Math.round(confidence * 100)}% fit`;
}

export default function LicensingPage() {
  const [technicalSummary, setTechnicalSummary] = useState("");
  const [areasToAvoid, setAreasToAvoid] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LicensingResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/licensing-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          technical_summary: technicalSummary,
          areas_to_avoid: areasToAvoid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate licensing intelligence.");
      }

      const data = (await response.json()) as LicensingResponse;
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportToExcel() {
    if (!result) {
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      const summaryRows = [
        {
          "Technology Summary": result.technology_summary,
          "Generated At": new Date().toLocaleString(),
        },
      ];
      const sectorsRows = result.sectors.map((sector, index) => ({
        Rank: index + 1,
        Sector: sector.name,
        Description: sector.description,
        "Relevance Reason": sector.relevance_reason,
      }));

      const companyRows = COMPANY_GROUPS.flatMap((group) =>
        result.companies[group.key].map((company, index) => ({
          "Company Size Group": group.label,
          Rank: index + 1,
          Company: company.name,
          Industry: company.industry,
          "Why License": company.why_license,
          "Fit (%)": Math.round(company.confidence * 100),
          "Contact Count": company.contacts.length,
        }))
      );

      const contactRows = COMPANY_GROUPS.flatMap((group) =>
        result.companies[group.key].flatMap((company) =>
          company.contacts.map((contact, index) => ({
            "Company Size Group": group.label,
            Company: company.name,
            "Contact Rank": index + 1,
            Name: contact.name || "",
            Title: contact.title,
            "Why Relevant": contact.why_relevant,
            "Confidence (%)": Math.round(contact.confidence * 100),
          }))
        )
      );

      const ftoRows = result.fto_considerations.map((item, index) => ({
        Priority: index + 1,
        Consideration: item,
      }));
      const assumptionsRows = result.assumptions.map((item, index) => ({
        Priority: index + 1,
        Assumption: item,
      }));
      const inputRows = [
        {
          "Technical Summary Input": technicalSummary || "(none provided)",
          "Areas To Avoid Input": areasToAvoid || "(none provided)",
        },
      ];

      const sheetConfigs: Array<{ name: string; rows: Record<string, string | number>[] }> = [
        { name: "Summary", rows: summaryRows },
        { name: "Sectors", rows: sectorsRows },
        { name: "Companies", rows: companyRows },
        { name: "Contacts", rows: contactRows },
        { name: "FTO", rows: ftoRows },
        { name: "Assumptions", rows: assumptionsRows },
        { name: "Input", rows: inputRows },
      ];

      for (const config of sheetConfigs) {
        const safeRows = config.rows.length > 0 ? config.rows : [{ Notes: "No records available." }];
        const sheet = XLSX.utils.json_to_sheet(safeRows);
        sheet["!cols"] = Object.keys(safeRows[0]).map((columnKey) => {
          const maxLength = Math.max(
            columnKey.length,
            ...safeRows.map((row) => String(row[columnKey] ?? "").length)
          );
          return { wch: Math.min(Math.max(maxLength + 2, 14), 60) };
        });
        XLSX.utils.book_append_sheet(workbook, sheet, config.name);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      XLSX.writeFile(workbook, `licensing-intelligence-${timestamp}.xlsx`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export Excel file.");
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
              <CardTitle>Technology Licensing Intelligence</CardTitle>
            </div>
            <CardDescription>
              Provide a technical summary from a patent or invention disclosure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <textarea
                value={technicalSummary}
                onChange={(event) => setTechnicalSummary(event.target.value)}
                className="min-h-[180px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Paste technical summary here..."
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  2) OPTIONAL: areas to avoid based on Freedom-to-Operate (FTO) analysis
                </label>
                <textarea
                  value={areasToAvoid}
                  onChange={(event) => setAreasToAvoid(event.target.value)}
                  className="min-h-[90px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Example: invasive implantables, insulin pumps, specific assay claims..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                {loading ? "Generating..." : "Generate Intelligence"}
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleExportToExcel}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export to Excel"}
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Technology Summary</CardTitle>
                <CardDescription>One-sentence summary of the submitted technology.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{result.technology_summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Industry Sectors</CardTitle>
                <CardDescription>
                  The strongest market segments where this technology can be licensed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.sectors.map((sector) => (
                    <div key={sector.name} className="rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900">{sector.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{sector.description}</p>
                      <p className="mt-3 text-xs text-gray-500">{sector.relevance_reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {result.fto_considerations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>FTO Considerations</CardTitle>
                  <CardDescription>
                    How avoided areas were applied to steer sector and company recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                    {result.fto_considerations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recommended Licensing Targets</CardTitle>
                <CardDescription>
                  Prioritized by company size to support outreach sequencing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {COMPANY_GROUPS.map((group) => (
                  <details
                    key={group.key}
                    className="rounded-lg border border-gray-200 bg-white"
                    open={group.key === "large"}
                  >
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-900">
                      <div className="flex items-center justify-between">
                        <span>{group.label}</span>
                        <span className="text-xs text-gray-500">
                          {result.companies[group.key].length} companies
                        </span>
                      </div>
                    </summary>
                    <div className="border-t border-gray-100 p-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {result.companies[group.key].map((company) => (
                          <div key={company.name} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                                <p className="text-xs text-gray-500">{company.industry}</p>
                              </div>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${confidenceTone(
                                  company.confidence
                                )}`}
                              >
                                {confidenceLabel(company.confidence)}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">{company.why_license}</p>
                            <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Relevant Decision-Makers
                              </p>
                              {company.contacts.map((contact) => (
                                <div key={`${company.name}-${contact.title}`} className="rounded-md bg-gray-50 p-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-900">
                                        {contact.name ? `${contact.name} — ${contact.title}` : contact.title}
                                      </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${confidenceTone(contact.confidence)}`}>
                                      {Math.round(contact.confidence * 100)}%
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-600">{contact.why_relevant}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assumptions</CardTitle>
                <CardDescription>
                  Important context used to generate these recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                  {result.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
