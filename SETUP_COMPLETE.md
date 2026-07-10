# 🎯 Complete Setup Guide - Local File Access

**Date:** July 10, 2026  
**Status:** ✅ Complete and Tested  
**Server:** Running on `http://localhost:3001`

---

## What's Been Set Up

You now have a complete, production-ready infrastructure for accessing local OneDrive files throughout your entire Innovation Dashboard. **No sensitive data leaves your machine.**

### ✅ All Tests Passing

- GET `/api/data/idf` → 200 OK ✓
- GET `/api/data/patents` → 200 OK ✓
- GET `/api/data/file` → 200 OK ✓
- GET `/api/onedrive` → 200 OK ✓

---

## Quick Start - 3 Ways to Use

### 1. **In React Components** (Easiest for Frontend)

```typescript
import { useIDFData } from "@/lib/hooks";

export default function MyPage() {
  const { data, loading, error } = useIDFData();
  
  return (
    <div>
      <h1>Total IDFs: {data?.length}</h1>
      {data?.map(idf => <div key={idf.idf_number}>{idf.technology_category}</div>)}
    </div>
  );
}
```

### 2. **In API Routes** (For Backend Processing)

```typescript
import { parseCSV } from "@/lib/files";
import { FILE_PATHS } from "@/lib/constants";

export async function GET() {
  const data = await parseCSV(FILE_PATHS.IDF_DATABASE);
  // Process, filter, aggregate...
  return NextResponse.json(processed);
}
```

### 3. **Direct API Calls** (From Any Frontend Code)

```typescript
// Fetch IDF data
const idfResponse = await fetch("/api/data/idf");
const idfData = await idfResponse.json();

// Fetch Patents
const patentResponse = await fetch("/api/data/patents");
const patentData = await patentResponse.json();
```

---

## Files Created

### 📁 Core Infrastructure

| File | Purpose |
|------|---------|
| `src/lib/files.ts` | Server-side file reading & parsing utilities |
| `src/lib/constants.ts` | File path constants & TypeScript interfaces |
| `src/lib/hooks.ts` | React hooks for fetching data in components |

### 🔌 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/data/idf` | Read IDF database CSV |
| `GET /api/data/patents` | Read Patents database CSV |
| `GET /api/data/file` | Generic file reader (CSV/JSON/text) |
| `GET /api/onedrive` | Browse folders & files |

### 📚 Documentation & Examples

| File | Purpose |
|------|---------|
| `FILE_ACCESS_README.md` | Complete usage documentation |
| `src/components/data-usage-example.tsx` | Working example component |

---

## What You Can Do Now

✅ **Access CSV Data** - Read IDF and Patent databases  
✅ **Browse Files** - Navigate OneDrive folders  
✅ **Parse Custom Files** - Read JSON, text, or CSV files  
✅ **Build Dashboards** - Display data on any page  
✅ **Create Reports** - Process and aggregate data  
✅ **Filter & Search** - Implement business logic on any data  

---

## How It Works (Architecture)

```
┌─────────────────────────────────────────┐
│   Your React Component                  │
│   useIDFData() / usePatentData()         │
└──────────────┬──────────────────────────┘
               │ fetch()
               ▼
┌─────────────────────────────────────────┐
│   API Endpoint                          │
│   /api/data/idf, /api/data/patents      │
└──────────────┬──────────────────────────┘
               │ (server-side)
               ▼
┌─────────────────────────────────────────┐
│   File Utilities (src/lib/files.ts)     │
│   parseCSV(), readFileText()            │
└──────────────┬──────────────────────────┘
               │ (fs.promises.readFile)
               ▼
┌─────────────────────────────────────────┐
│   Local File System (OneDrive folder)   │
│   ✓ sanitized-idf-database.csv          │
│   ✓ sanitized-patents-database.csv      │
│   ✓ Other files...                      │
└─────────────────────────────────────────┘
```

**Key Point:** Data never leaves your machine. Each layer only accesses the next one down.

---

## Security & Privacy

| Aspect | Status |
|--------|--------|
| Path traversal protection | ✅ Enabled |
| Local-only operation | ✅ Confirmed |
| No external transmission | ✅ Verified |
| Data stays on your machine | ✅ Always |
| Private git repo | ✅ Ready |
| Environment variables | ✅ In .env.local (not committed) |

---

## Environment Setup

Your `.env.local` file contains:
```
ONEDRIVE_FOLDER_PATH=C:\Users\Innovation\OneDrive - Terasaki Institute for Biomedical Innovation\Keuna Jeon's files - Maddie-summer2026
```

✅ **Not committed to git**  
✅ **Machine-specific path**  
✅ **Can be different on different machines**

---

## Next Steps - How to Use This

### Add Data to Dashboard
```typescript
// src/app/(dashboard)/page.tsx
import { useIDFData, usePatentData } from "@/lib/hooks";

// In your component:
const { data: idfs } = useIDFData();
const { data: patents } = usePatentData();
// Show on dashboard
```

### Create New Data Pages
```typescript
// Create any new page and use the hooks
import { useFileData } from "@/lib/hooks";
const { data } = useFileData("path/to/your/file.csv", { format: "csv" });
```

### Build API Endpoints
```typescript
// src/app/api/reports/my-report.ts
import { parseCSV } from "@/lib/files";
// Process data and return aggregated results
```

### Commit Your Changes
```bash
git add .
git commit -m "Add data integration to dashboard"
git push
# Your data files stay local - only code is committed
```

---

## Example: Adding to Existing Pages

### Home Dashboard
```typescript
// src/app/(dashboard)/page.tsx
import { useIDFData } from "@/lib/hooks";

export default function DashboardPage() {
  const { data: idfData } = useIDFData();
  
  return (
    <>
      <Header />
      <div className="p-8 space-y-6">
        {/* Add IDF count to stat cards */}
        <Card>
          <CardContent>
            <p className="text-2xl font-bold">{idfData?.length || 0}</p>
            <p className="text-sm text-gray-500">Invention Disclosures</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

---

## Troubleshooting

**Q: "Cannot find module" errors?**  
A: Run `npm install` to ensure all dependencies are installed

**Q: API returns 500 error?**  
A: Check that `.env.local` path is correct and accessible

**Q: Dev server not running?**  
A: Run `npm run dev` in the project root

**Q: Want to see the actual data?**  
A: Visit `http://localhost:3001/api/data/idf` in your browser

---

## Available Resources

📖 **Full Documentation:** `FILE_ACCESS_README.md`  
📝 **Example Component:** `src/components/data-usage-example.tsx`  
🔧 **File Utilities:** `src/lib/files.ts`  
📊 **Data Types:** `src/lib/constants.ts`  
⚙️ **React Hooks:** `src/lib/hooks.ts`

---

## Summary

You're all set! You can now:

1. ✅ Access local OneDrive files from anywhere in your app
2. ✅ Display data on dashboards & pages
3. ✅ Process & filter data securely on your machine
4. ✅ Commit code to private git without exposing data
5. ✅ Scale to more complex data operations

**Everything is type-safe, secure, and production-ready.** 🚀

---

**Questions?** See `FILE_ACCESS_README.md` for detailed documentation and examples.
