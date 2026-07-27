"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, FolderOpen, ExternalLink, Clock, Download } from "lucide-react";

const ONEDRIVE_FOLDER_URL =
  "https://terasakilab-my.sharepoint.com/my?remoteItem=%7B%22mp%22%3A%7B%22webAbsoluteUrl%22%3A%22https%3A%2F%2Fterasakilab%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fmadeline%5Frogers%5Fterasakicolab%5Forg%22%2C%22listFullUrl%22%3A%22https%3A%2F%2Fterasakilab%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fmadeline%5Frogers%5Fterasakicolab%5Forg%2FDocuments%22%2C%22rootFolder%22%3A%22%2Fpersonal%2Fmadeline%5Frogers%5Fterasakicolab%5Forg%2FDocuments%2FKeuna%20Jeon%27s%20files%20%2D%20Maddie%2Dsummer2026%22%7D%2C%22rsi%22%3A%7B%22webAbsoluteUrl%22%3A%22https%3A%2F%2Fterasakilab%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fkeuna%5Fjeon%5Fterasaki%5Forg%22%2C%22listFullUrl%22%3A%22https%3A%2F%2Fterasakilab%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fkeuna%5Fjeon%5Fterasaki%5Forg%2FDocuments%22%2C%22rootFolder%22%3A%22%2Fpersonal%2Fkeuna%5Fjeon%5Fterasaki%5Forg%2FDocuments%2FDocuments%2FInnovation%20Team%2FMaddie%2Dsummer2026%2FPatentability%20Assessments%20%28Dashboard%20Access%29%22%7D%7D&id=%2Fpersonal%2Fkeuna%5Fjeon%5Fterasaki%5Forg%2FDocuments%2FDocuments%2FInnovation%20Team%2FMaddie%2Dsummer2026%2FPatentability%20Assessments%20%28Dashboard%20Access%29&listurl=%2Fpersonal%2Fkeuna%5Fjeon%5Fterasaki%5Forg%2FDocuments&viewid=797e1ae3%2D93e8%2D4e6f%2D91f3%2Dcbe8381bd274";

const ASSESSMENTS_FOLDER = "Patentability Assessments (Dashboard Access)";
const TEMPLATE_PATH = "IDF Assessments/General Patentability Assessment IDFX.docx";
const TEMPLATE_NAME = "General Patentability Assessment IDFX.docx";

const HIDDEN_FILES = ["desktop.ini", "thumbs.db", ".ds_store"];

interface OneDriveEntry {
  name: string;
  relativePath: string;
  modifiedAt: string;
  isDirectory: boolean;
  size: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const color =
    ext === "pdf" ? "text-red-500" :
    ext === "docx" || ext === "doc" ? "text-blue-500" :
    "text-gray-400";
  return <FileText className={`h-5 w-5 shrink-0 ${color}`} />;
}

export default function ReportsPage() {
  const [files, setFiles] = useState<OneDriveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/onedrive?path=${encodeURIComponent(ASSESSMENTS_FOLDER)}`)
      .then((r) => r.json())
      .then((data) => {
        const payload = data as { entries?: OneDriveEntry[]; warning?: string; error?: string };
        if (payload.error) {
          setError(payload.error);
        } else if (payload.warning) {
          setError("Folder not found. Make sure it exists in your OneDrive and is synced.");
        } else {
          const sorted = (payload.entries ?? [])
            .filter((e) => !e.isDirectory && !HIDDEN_FILES.includes(e.name.toLowerCase()))
            .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
          setFiles(sorted);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assessments.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Patentability Assessments</h2>
            <p className="mt-1 text-sm text-gray-500">
              Completed assessments stored in the shared OneDrive folder. Access is managed by folder permissions.
            </p>
          </div>
          <a
            href={ONEDRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <FolderOpen className="h-4 w-4" />
            Open in OneDrive
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completed Assessments</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : error
                ? "Could not read folder"
                : `${files.length} file${files.length !== 1 ? "s" : ""} in the Patentability Assessments folder`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">Loading assessments...</p>
            ) : error ? (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <p className="mt-1 text-xs text-red-400">
                  Make sure the folder exists in your OneDrive and is synced to disk.
                </p>
              </div>
            ) : files.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No files found in the Patentability Assessments folder.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {files.map((file) => (
                  <li key={file.relativePath} className="flex items-center gap-4 py-3">
                    <FileIcon name={file.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(file.modifiedAt)}
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empty Patentability Assessment</CardTitle>
            <CardDescription>
              Download the blank template to complete a new patentability assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{TEMPLATE_NAME}</p>
                <p className="text-xs text-gray-400">Word Document</p>
              </div>
              <a
                href={`/api/onedrive?path=${encodeURIComponent(TEMPLATE_PATH)}`}
                download={TEMPLATE_NAME}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
