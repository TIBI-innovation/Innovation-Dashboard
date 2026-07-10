import { NextResponse } from "next/server";
import { readFileText, parseCSV } from "@/lib/files";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    const format = searchParams.get("format") || "text";

    if (!filePath) {
      return NextResponse.json(
        { error: "Missing 'path' query parameter" },
        { status: 400 }
      );
    }

    // Determine file type based on format or extension
    const isCSV = format === "csv" || filePath.endsWith(".csv");
    const isJSON = format === "json" || filePath.endsWith(".json");

    if (isCSV) {
      const data = await parseCSV(filePath);
      return NextResponse.json(data);
    }

    if (isJSON) {
      const content = await readFileText(filePath);
      return NextResponse.json(JSON.parse(content));
    }

    // Default: return as text
    const content = await readFileText(filePath);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to read file:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
