import fs from "fs";
import path from "path";

const ONEDRIVE_FOLDER_PATH =
  process.env.ONEDRIVE_FOLDER_PATH || path.join(process.cwd(), "OneDrive");

/**
 * Get the full path to a file in the OneDrive folder
 */
export function getFilePath(relativePath: string): string {
  const basePath = path.resolve(ONEDRIVE_FOLDER_PATH);
  const fullPath = path.resolve(path.join(basePath, relativePath));

  // Security: Prevent path traversal
  if (!fullPath.startsWith(basePath)) {
    throw new Error("Access denied: Invalid path");
  }

  return fullPath;
}

/**
 * Check if a file exists
 */
export function fileExists(relativePath: string): boolean {
  try {
    const fullPath = getFilePath(relativePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

/**
 * Read a file as text
 */
export async function readFileText(relativePath: string): Promise<string> {
  const fullPath = getFilePath(relativePath);
  return fs.promises.readFile(fullPath, "utf-8");
}

/**
 * Read a file as Buffer
 */
export async function readFileBuffer(relativePath: string): Promise<Buffer> {
  const fullPath = getFilePath(relativePath);
  return fs.promises.readFile(fullPath);
}

/**
 * Parse CSV file into array of objects
 */
export async function parseCSV(relativePath: string): Promise<Record<string, string>[]> {
  const content = await readFileText(relativePath);
  const lines = content.trim().split("\n");

  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim());

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Read a JSON file
 */
export async function readJSON<T>(relativePath: string): Promise<T> {
  const content = await readFileText(relativePath);
  return JSON.parse(content);
}

/**
 * List files in a folder
 */
export async function listFiles(
  relativePath: string = ""
): Promise<
  Array<{
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modified: Date;
  }>
> {
  const fullPath = relativePath ? getFilePath(relativePath) : path.resolve(ONEDRIVE_FOLDER_PATH);

  const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    const stats = await fs.promises.stat(entryPath);
    const relativePath = path.relative(path.resolve(ONEDRIVE_FOLDER_PATH), entryPath);

    results.push({
      name: entry.name,
      path: relativePath.split(path.sep).join("/"),
      isDirectory: entry.isDirectory(),
      size: stats.size,
      modified: stats.mtime,
    });
  }

  return results;
}

/**
 * Get the base OneDrive folder path
 */
export function getBaseFolder(): string {
  return path.resolve(ONEDRIVE_FOLDER_PATH);
}
