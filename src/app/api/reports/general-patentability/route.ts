import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FILE_PATH = path.join(
  "C:\\Users\\Innovation\\OneDrive - Terasaki Institute for Biomedical Innovation",
  "Keuna Jeon's files - Maddie-summer2026",
  "IDF assessments",
  "General Patentability Assessment IDFX.docx"
);

export async function GET() {
  try {
    const fileBuffer = readFileSync(FILE_PATH);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="General Patentability Assessment IDFX.docx"',
        "Content-Length": String(fileBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Failed to serve General Patentability Assessment:", error);
    return NextResponse.json(
      { error: "File not found or could not be read." },
      { status: 404 }
    );
  }
}
