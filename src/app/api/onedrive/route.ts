import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const ONEDRIVE_FOLDER_PATH =
  process.env.ONEDRIVE_FOLDER_PATH || path.join(process.cwd(), "OneDrive");

interface OneDriveEntry {
  name: string;
  relativePath: string;
  modifiedAt: string;
  isDirectory: boolean;
  size: number;
}

async function readFolderEntries(folderPath: string, basePath: string): Promise<OneDriveEntry[]> {
  const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
  const results: OneDriveEntry[] = [];

  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry.name);
    const stats = await fs.promises.stat(entryPath);
    const relativePath = path.relative(basePath, entryPath).split(path.sep).join("/");

    results.push({
      name: entry.name,
      relativePath,
      modifiedAt: stats.mtime.toISOString(),
      isDirectory: entry.isDirectory(),
      size: stats.size,
    });
  }

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get("path") || "";

    const basePath = path.resolve(ONEDRIVE_FOLDER_PATH);
    let resolvedPath = basePath;

    if (subPath) {
      resolvedPath = path.resolve(path.join(basePath, subPath));

      if (!resolvedPath.startsWith(basePath)) {
        return NextResponse.json(
          { error: "Access denied: Invalid path" },
          { status: 403 }
        );
      }
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({
        rootPath: basePath,
        currentPath: resolvedPath,
        entries: [],
        warning: "Folder does not exist.",
      });
    }

    const stats = await fs.promises.stat(resolvedPath);
    if (!stats.isDirectory()) {
      const fileBuffer = await fs.promises.readFile(resolvedPath);
      const fileName = path.basename(resolvedPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": "application/octet-stream",
          "Content-Length": String(stats.size),
        },
      });
    }

    const entries = await readFolderEntries(resolvedPath, basePath);

    return NextResponse.json({
      rootPath: basePath,
      currentPath: resolvedPath,
      entries,
    });
  } catch (error) {
    console.error("Failed to read OneDrive folder:", error);
    return NextResponse.json(
      { error: "Unable to read OneDrive folder. Check the configured path and folder permissions." },
      { status: 500 }
    );
  }
}
