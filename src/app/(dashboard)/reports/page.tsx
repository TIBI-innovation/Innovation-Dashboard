"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3, FileText, ExternalLink } from "lucide-react";

const assessments = [
  {
    id: "general-patentability",
    title: "General Patentability Assessment",
    description:
      "A general-purpose patentability assessment template covering novelty, non-obviousness, and utility criteria.",
    apiPath: "/api/reports/general-patentability",
    fileName: "General Patentability Assessment IDFX.docx",
  },
];

export default function ReportsPage() {
  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports and Assessments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Access and download IP reports, assessments, and evaluation documents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={item.apiPath}
                  download={item.fileName}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  See General Patentability Assessment
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
