"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  FileText,
  Folder,
  ChevronRight,
  File,
  Music,
  Image,
  Video,
} from "lucide-react";

interface OneDriveEntry {
  name: string;
  relativePath: string;
  modifiedAt: string;
  isDirectory: boolean;
  size: number;
}

function getFileIcon(name: string, isDirectory: boolean) {
  if (isDirectory) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";

  const iconProps = { className: "h-5 w-5" };

  switch (ext) {
    case "pdf":
      return <FileText {...iconProps} className="h-5 w-5 text-red-500" />;
    case "doc":
    case "docx":
      return <FileText {...iconProps} className="h-5 w-5 text-blue-600" />;
    case "xls":
    case "xlsx":
      return <FileText {...iconProps} className="h-5 w-5 text-green-600" />;
    case "ppt":
    case "pptx":
      return <FileText {...iconProps} className="h-5 w-5 text-orange-600" />;
    case "csv":
      return <FileText {...iconProps} className="h-5 w-5 text-green-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <Image {...iconProps} className="h-5 w-5 text-purple-500" />;
    case "mp3":
    case "wav":
    case "flac":
    case "m4a":
      return <Music {...iconProps} className="h-5 w-5 text-pink-500" />;
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
      return <Video {...iconProps} className="h-5 w-5 text-red-600" />;
    default:
      return <File {...iconProps} className="h-5 w-5 text-gray-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OneDriveAccessPage() {
  const [entries, setEntries] = useState<OneDriveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  useEffect(() => {
    loadFolder(currentPath);
  }, [currentPath]);

  const loadFolder = async (folderPath: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/onedrive`;
      const params = new URLSearchParams();
      if (folderPath) {
        params.set("path", folderPath);
      }

      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      console.log("Fetching from:", fullUrl);

      const response = await fetch(fullUrl);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        setError(data.error);
        setEntries([]);
      } else {
        const sorted = (data.entries || []).sort((a: OneDriveEntry, b: OneDriveEntry) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        setEntries(sorted);
        console.log("Entries loaded:", sorted.length);

        const parts = folderPath ? folderPath.split(/[\/\\]/).filter(Boolean) : [];
        setBreadcrumbs(["Root", ...parts]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error loading folder:", errorMsg);
      setError(errorMsg);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (entry: OneDriveEntry) => {
    if (entry.isDirectory) {
      const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      setCurrentPath(newPath);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath("");
    } else {
      const parts = currentPath.split(/[\/\\]/);
      const newPath = parts.slice(0, index).join("/");
      setCurrentPath(newPath);
    }
  };

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">OneDrive Access</h2>
          <p className="mt-1 text-sm text-gray-500">Browse and view files from your OneDrive folder</p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {crumb}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* File Listing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Files & Folders</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `${entries.length} item(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading files...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">This folder is empty</p>
              </div>
            ) : (
              <div className="space-y-1 divide-y divide-gray-200">
                {entries.map((entry) => (
                  <div
                    key={entry.relativePath}
                    onClick={() => handleNavigate(entry)}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      entry.isDirectory
                        ? "cursor-pointer hover:bg-gray-50"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(entry.name, entry.isDirectory)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Modified {formatDate(entry.modifiedAt)}
                      </p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-600 font-medium">
                        {entry.isDirectory ? "-" : formatFileSize(entry.size)}
                      </p>
                    </div>

                    {entry.isDirectory && (
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
