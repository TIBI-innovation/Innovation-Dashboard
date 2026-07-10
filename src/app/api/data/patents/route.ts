import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/files";
import { FILE_PATHS, PatentRecord } from "@/lib/constants";

export async function GET() {
  try {
    const data = await parseCSV(FILE_PATHS.PATENTS_DATABASE);
    return NextResponse.json(data as PatentRecord[]);
  } catch (error) {
    console.error("Failed to read Patents data:", error);
    return NextResponse.json(
      { error: "Unable to read Patents database" },
      { status: 500 }
    );
  }
}
