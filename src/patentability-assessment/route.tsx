import { NextResponse } from "next/server";
import { listFiles } from "@/lib/files";
import { FILE_PATHS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const files = await listFiles(FILE_PATHS.IDF_ASSESSMENTS);

    const assessments = files
      .filter((f) => !f.isDirectory)
      .map((f) => ({
        name: f.name,
        path: f.path,
        modified: f.modified,
        size: f.size,
      }))
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Failed to list patentability assessments:", error);
    return NextResponse.json(
      { error: "Could not read assessments folder. Check that the folder exists in your OneDrive." },
      { status: 500 }
    );
  }
}