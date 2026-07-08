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

let _db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

export function getTechnologies(): TechnologyRow[] {
  const db = getDB();
  return db
    .prepare("SELECT idf_number, created_by, technology_category FROM technologies ORDER BY idf_number")
    .all() as TechnologyRow[];
}

export function getPatents(): PatentRow[] {
  const db = getDB();
  return db
    .prepare("SELECT patent_number, technology_category, status FROM patents ORDER BY patent_number")
    .all() as PatentRow[];
}
