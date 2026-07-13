import Database from "better-sqlite3";
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
}

const DB_PATH = path.join(process.cwd(), "innovation.db");
const EXCEL_PATH = "C:\\Users\\Innovation\\OneDrive - Terasaki Institute for Biomedical Innovation\\Keuna Jeon's files - Maddie-summer2026\\sanitized-idf-database.xlsx";

export function getTechnologies(): TechnologyRow[] {
  try {
    if (fs.existsSync(EXCEL_PATH)) {
      const buffer = fs.readFileSync(EXCEL_PATH);
      const workbook = read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(sheet);

      return data.map((row: any) => ({
        idf_number: row["IDF Number"] || "",
        created_by: row["Created By"] || "",
        technology_category: row["Technology Category "] || "",
      })) as TechnologyRow[];
    } else {
      console.warn(`Excel file not found at ${EXCEL_PATH}, falling back to database`);
      const db = new Database(DB_PATH);
      try {
        return db
          .prepare(
            "SELECT idf_number, created_by, technology_category FROM technologies"
          )
          .all() as TechnologyRow[];
      } finally {
        db.close();
      }
    }
  } catch (error) {
    console.error("Error reading technologies:", error);
    return [];
  }
}

export function getPatents(): PatentRow[] {
  try {
    const db = new Database(DB_PATH);
    try {
      return db
        .prepare(
          "SELECT patent_number, technology_category, status FROM patents"
        )
        .all() as PatentRow[];
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}
