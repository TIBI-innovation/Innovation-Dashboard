const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "..", "innovation.db");
const CSV_PATH = path.join(__dirname, "..", "src", "data", "sanitized-idf-database.csv");

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
  console.log("Reading CSV...");
  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
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

  const insert = db.prepare(`
    INSERT OR IGNORE INTO technologies (idf_number, created_by, technology_category)
    VALUES (@idf_number, @created_by, @technology_category)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({
        idf_number: row["IDF Number"],
        created_by: row["Created By"],
        technology_category: row["Technology Category"],
      });
    }
  });

  const existing = db.prepare("SELECT COUNT(*) AS count FROM technologies").get();
  if (existing.count > 0) {
    console.log(`Table already has ${existing.count} row(s). Skipping import to avoid duplicates.`);
    console.log("  To re-import, run: rm innovation.db && node scripts/seed-db.js");
  } else {
    insertMany(rows);
    console.log(`Inserted ${rows.length} rows into the technologies table.`);
  }

  const count = db.prepare("SELECT COUNT(*) AS count FROM technologies").get();
  console.log(`Total rows in database: ${count.count}`);

  db.close();
  console.log("Done.");
}

main();
