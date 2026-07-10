# Local File Access Infrastructure

This document explains how to access local OneDrive files throughout the Innovation Dashboard.

## Overview

All file operations are centralized in:
- `src/lib/files.ts` - Server-side file utilities
- `src/lib/constants.ts` - Constants and types
- `src/lib/hooks.ts` - React hooks for components
- `src/app/api/data/*` - API endpoints

## Configuration

File path is configured in `.env.local`:
```
ONEDRIVE_FOLDER_PATH=C:\Users\Innovation\OneDrive - Terasaki Institute for Biomedical Innovation\Keuna Jeon's files - Maddie-summer2026
```

## Usage Examples

### 1. In React Components (Easiest for Frontend)

Use the provided hooks to fetch data:

```typescript
// Display IDF data
import { useIDFData } from "@/lib/hooks";

export function IDFDashboard() {
  const { data, loading, error } = useIDFData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>IDF Records: {data?.length}</h2>
      {data?.map((record) => (
        <div key={record.idf_number}>{record.technology_category}</div>
      ))}
    </div>
  );
}
```

```typescript
// Display Patent data
import { usePatentData } from "@/lib/hooks";

export function PatentDashboard() {
  const { data, loading, error, refetch } = usePatentData();

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {loading ? <div>Loading...</div> : <PatentList patents={data} />}
    </div>
  );
}
```

```typescript
// Load any custom file
import { useFileData, FILE_PATHS } from "@/lib/hooks";

export function CustomReport() {
  const { data } = useFileData<CustomDataType>(
    FILE_PATHS.PATENTS_DATABASE,
    { format: "csv" }
  );
}
```

### 2. In API Routes/Server Components

Use the file utilities directly:

```typescript
// src/app/api/reports/idf-summary.ts
import { parseCSV } from "@/lib/files";
import { FILE_PATHS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await parseCSV(FILE_PATHS.IDF_DATABASE);
  
  // Process data
  const summary = {
    total: data.length,
    byCategory: groupBy(data, "technology_category"),
  };

  return NextResponse.json(summary);
}
```

### 3. Use the Direct API Endpoints

Call these from anywhere:

**Get IDF Data:**
```bash
GET /api/data/idf
```

**Get Patents Data:**
```bash
GET /api/data/patents
```

**Get Any File:**
```bash
GET /api/data/file?path=sanitized-idf-database.csv&format=csv
GET /api/data/file?path=some-document.txt&format=text
GET /api/data/file?path=config.json&format=json
```

## Available Constants

All file paths are in `src/lib/constants.ts`:

```typescript
import { FILE_PATHS } from "@/lib/constants";

FILE_PATHS.IDF_DATABASE           // sanitized-idf-database.csv
FILE_PATHS.PATENTS_DATABASE       // sanitized-patents-database.csv
FILE_PATHS.IDF_ASSESSMENTS        // IDF assessments/ folder
FILE_PATHS.PATENTS_FOLDER         // PATENTS at TIBI/ folder
FILE_PATHS.FAKE_DATA_FOLDER       // Fake data for AI tool POC/
FILE_PATHS.IP_ASSESSMENT          // IP and Patent AI Tool Assessment.pptx
FILE_PATHS.PROTOCOL               // Potential SCOBY-Art Protocol.docx
FILE_PATHS.TIMELINE               // Proposed Timeline Jun 2026.docx
```

## File Utilities

Available in `src/lib/files.ts`:

### parseCSV(path)
Parse a CSV file into array of objects
```typescript
const records = await parseCSV("sanitized-idf-database.csv");
```

### readFileText(path)
Read a file as text
```typescript
const content = await readFileText("some-file.txt");
```

### readFileBuffer(path)
Read a file as buffer (for binary files)
```typescript
const buffer = await readFileBuffer("document.pdf");
```

### listFiles(folderPath?)
List all files in a folder
```typescript
const files = await listFiles("IDF assessments");
```

### getFilePath(path)
Get the full resolved path (for debugging)
```typescript
const fullPath = getFilePath("sanitized-idf-database.csv");
```

## Data Types

Pre-defined TypeScript interfaces in `src/lib/constants.ts`:

```typescript
interface IDFRecord {
  idf_number?: string;
  created_by?: string;
  technology_category?: string;
  status?: string;
  [key: string]: string;
}

interface PatentRecord {
  patent_number?: string;
  technology_category?: string;
  status?: string;
  filing_date?: string;
  [key: string]: string;
}
```

## Security

✅ **Path traversal protection** - Can't navigate outside base folder  
✅ **Local-only** - No external transmission  
✅ **Type-safe** - TypeScript prevents mistakes  
✅ **Error handling** - Graceful error responses  

## Examples by Page

### Dashboard Home (`src/app/(dashboard)/page.tsx`)
```typescript
import { useIDFData, usePatentData } from "@/lib/hooks";

// Use these to get counts, statistics, etc.
const { data: idfData } = useIDFData();
const { data: patents } = usePatentData();
```

### OneDrive Access Page
Already set up - browse files and subfolders

### New Data Page
```typescript
"use client";
import { useFileData, FILE_PATHS } from "@/lib/hooks";

export default function DataPage() {
  const { data, loading } = useFileData(FILE_PATHS.IDF_DATABASE);
  // Your code here
}
```

## Common Patterns

### Count records by category
```typescript
const { data } = useIDFData();
const byCategory = data?.reduce((acc, record) => {
  const cat = record.technology_category || "Other";
  acc[cat] = (acc[cat] || 0) + 1;
  return acc;
}, {});
```

### Filter by status
```typescript
const { data } = usePatentData();
const approved = data?.filter(p => p.status === "Approved");
```

### Transform data
```typescript
const { data } = useIDFData();
const formatted = data?.map(record => ({
  id: record.idf_number,
  category: record.technology_category,
  creator: record.created_by,
}));
```

## Notes

- All file paths are relative to `ONEDRIVE_FOLDER_PATH`
- CSV parsing is simple (doesn't handle quoted commas) - for complex CSVs, use `csv-parse` npm package
- Data is not cached - each fetch gets fresh data from disk
- To cache data, use `useMemo` or create an API endpoint that caches

---

Start using these utilities to integrate local file data throughout your dashboard!
