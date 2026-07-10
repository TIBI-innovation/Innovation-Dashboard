import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/files";
import { FILE_PATHS, IDFRecord } from "@/lib/constants";

export async function GET() {
  try {
    const data = await parseCSV(FILE_PATHS.IDF_DATABASE);
    return NextResponse.json(data as IDFRecord[]);
  } catch (error) {
    console.error("Failed to read IDF data:", error);
    return NextResponse.json(
      { error: "Unable to read IDF database" },
      { status: 500 }
    );
  }
}
