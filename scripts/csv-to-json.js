const fs = require("fs");
const path = require("path");

function parseLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

const csvPath = path.join(__dirname, "..", "src", "data", "sanitized-idf-database.csv");
const text = fs.readFileSync(csvPath, "utf-8");
const lines = text.trim().split("\n");
const headers = parseLine(lines[0]).map((h) => h.trim());
const rows = [];

for (let i = 1; i < lines.length; i++) {
  const vals = parseLine(lines[i].trim());
  const row = {};
  headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
  if (row["IDF Number"]) rows.push(row);
}

const technologyRows = rows.map((r) => ({
  idf_number: r["IDF Number"],
  created_by: r["Created By"],
  technology_category: r["Technology Category"],
}));

const jsonPath = path.join(__dirname, "..", "src", "data", "sanitized-idf-database.json");
fs.writeFileSync(jsonPath, JSON.stringify(technologyRows, null, 2), "utf-8");
console.log("Wrote " + technologyRows.length + " rows to " + jsonPath);
