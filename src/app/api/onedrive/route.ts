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
    const resolvedPath = path.resolve(ONEDRIVE_FOLDER_PATH);

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({
        rootPath: resolvedPath,
        entries: [],
        warning: "Configured OneDrive folder does not exist. Set ONE_DRIVE_FOLDER_PATH to a valid local folder.",
      });
    }

    const stats = await fs.promises.stat(resolvedPath);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: "Configured OneDrive path is not a directory." },
        { status: 400 }
      );
    }

    const entries = await readFolderEntries(resolvedPath, resolvedPath);

    return NextResponse.json({
      rootPath: resolvedPath,
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
