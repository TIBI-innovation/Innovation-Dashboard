import Database from "better-sqlite3";
import path from "path";

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

export function getTechnologies(): TechnologyRow[] {
  try {
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
  } catch {
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
