/**
 * import-patents.js
 *
 * Reads a sanitized patents/licensing CSV and syncs it into
 * the local SQLite database (patents table).
 *
 * The script auto-detects CSV columns. Two formats are supported:
 *
 *   Format A (preferred):
 *     Patent Number,Technology Category,Status
 *
 *   Format B (Terasaki docket export):
 *     Count,Docket No.,Subject matter
 *
 * Change PATENTS_CSV_SOURCE below to point at a different file.
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const PATENTS_CSV_SOURCE = path.join(__dirname, "..", "src", "data", "sanitized-patents-database.csv");
const DB_PATH = path.join(__dirname, "..", "innovation.db");

function parseLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Map CSV header names to the column names used by the SQL table.
 * Supports multiple source formats.
 */
function mapRow(row) {
  const hasDocket = "Docket No." in row;
  const isTerasakiFormat = hasDocket;

  if (isTerasakiFormat) {
    return {
      patent_number: row["Docket No."] || "",
      technology_category: row["Subject matter"] || "",
      status: "",
    };
  }

  return {
    patent_number: row["Patent Number"] || "",
    technology_category: row["Technology Category"] || "",
    status: row["Status"] || "",
  };
}

/** True if the row contains no meaningful data. */
function isEmptyRow(mapped) {
  return !mapped.patent_number && !mapped.technology_category;
}

function main() {
  console.log(`Reading CSV from ${PATENTS_CSV_SOURCE}...`);
  const csvText = fs.readFileSync(PATENTS_CSV_SOURCE, "utf-8");
  const parsed = parseCSV(csvText);
  console.log(`Parsed ${parsed.length} total rows from CSV.`);

  const rows = parsed.map(mapRow).filter((r) => !isEmptyRow(r));
  console.log(`Filtered to ${rows.length} non-empty rows.`);

  console.log("Connecting to database...");

  /* ── recreate the table so schema always matches ── */
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    DROP TABLE IF EXISTS patents
  `);

  db.exec(`
    CREATE TABLE patents (
      row_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      patent_number       TEXT NOT NULL DEFAULT '',
      technology_category TEXT NOT NULL DEFAULT '',
      status              TEXT NOT NULL DEFAULT ''
    )
  `);

  const insert = db.prepare(`
    INSERT INTO patents (patent_number, technology_category, status)
    VALUES (@patent_number, @technology_category, @status)
  `);

  const sync = db.transaction(() => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  sync();

  const count = db.prepare("SELECT COUNT(*) AS count FROM patents").get();
  console.log(`Database now has ${count.count} rows in the patents table.`);

  db.close();
  console.log("Done.");
}

main();
