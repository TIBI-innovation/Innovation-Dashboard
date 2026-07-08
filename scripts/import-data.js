/**
 * import-data.js
 *
 * Reads the CSV source and syncs it into the local SQLite database.
 * To switch to a different source (e.g. a file downloaded from OneDrive),
 * change CSV_SOURCE below — no other code needs to change.
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------------------
// Configuration – update CSV_SOURCE to point at a different file
// ---------------------------------------------------------------------------
const CSV_SOURCE = path.join(__dirname, "..", "src", "data", "sanitized-idf-database.csv");
const DB_PATH = path.join(__dirname, "..", "innovation.db");
// ---------------------------------------------------------------------------

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

function main() {
  console.log(`Reading CSV from ${CSV_SOURCE}...`);
  const csvText = fs.readFileSync(CSV_SOURCE, "utf-8");
  const rows = parseCSV(csvText);
  console.log(`Parsed ${rows.length} rows from CSV.`);

  console.log("Connecting to database...");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS technologies (
      idf_number TEXT PRIMARY KEY,
      created_by TEXT NOT NULL DEFAULT '',
      technology_category TEXT NOT NULL DEFAULT ''
    )
  `);

  const sync = db.transaction(() => {
    db.prepare("DELETE FROM technologies").run();

    const insert = db.prepare(`
      INSERT INTO technologies (idf_number, created_by, technology_category)
      VALUES (@idf_number, @created_by, @technology_category)
    `);

    for (const row of rows) {
      insert.run({
        idf_number: row["IDF Number"],
        created_by: row["Created By"],
        technology_category: row["Technology Category"],
      });
    }
  });

  sync();

  const count = db.prepare("SELECT COUNT(*) AS count FROM technologies").get();
  console.log(`Database now has ${count.count} rows.`);

  db.close();
  console.log("Done.");
}

main();
