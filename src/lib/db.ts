import path from "path";
import * as fs from "fs";
import { read, utils } from "xlsx";

export interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
}

export interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
  notes: string;
}

const DATA_FOLDER_PATH = path.resolve(
  process.env.LOCAL_DATA_FOLDER_PATH ||
    process.env.ONEDRIVE_FOLDER_PATH ||
    path.join(process.cwd(), "src", "data")
);

const IDF_DATA_FILE = process.env.IDF_DATA_FILE || "sanitized-idf-database.csv";
const PATENT_DATA_FILE = process.env.PATENT_DATA_FILE || "sanitized-patents-database.csv";

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readTabularRows(fileName: string): Record<string, unknown>[] {
  const fullPath = path.join(DATA_FOLDER_PATH, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Data file not found: ${fullPath}`);
  }

  const buffer = fs.readFileSync(fullPath);
  const workbook = read(buffer, { type: "buffer", raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`No worksheet found in data file: ${fullPath}`);
  }

  const sheet = workbook.Sheets[firstSheetName];
  return utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

function getFirstValue(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = toText(row[key]);
    if (value) return value;
  }
  return "";
}

export function getTechnologies(): TechnologyRow[] {
  const rows = readTabularRows(IDF_DATA_FILE);
  return rows
    .map((row) => ({
      idf_number: getFirstValue(row, ["IDF Number", "IDF Number ", "idf_number"]),
      created_by: getFirstValue(row, ["Created By", "created_by"]),
      technology_category: getFirstValue(row, [
        "Technology Category",
        "Technology Category ",
        "technology_category",
      ]),
    }))
    .filter((row) => row.idf_number || row.created_by || row.technology_category);
}

export function getPatents(): PatentRow[] {
  const rows = readTabularRows(PATENT_DATA_FILE);
  return rows
    .map((row) => ({
      patent_number: getFirstValue(row, ["Patent Number", "Docket No.", "patent_number"]),
      technology_category: getFirstValue(row, [
        "Technology Category",
        "Technology Category ",
        "Subject matter",
        "technology_category",
      ]),
      status: getFirstValue(row, ["Status", "status"]),
      notes: getFirstValue(row, ["Deadlines", "deadlines"]),
    }))
    .filter((row) => row.patent_number || row.technology_category || row.status || row.notes);
}
