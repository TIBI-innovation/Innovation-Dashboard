import { NextResponse } from "next/server";
import { generateLicensingIntelligence } from "@/lib/licensing-intelligence";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const technicalSummary =
      typeof body?.technical_summary === "string" ? body.technical_summary : "";
    const areasToAvoid =
      typeof body?.areas_to_avoid === "string" ? body.areas_to_avoid : "";

    const result = generateLicensingIntelligence(technicalSummary, areasToAvoid);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to generate licensing intelligence:", error);
    const fallback = generateLicensingIntelligence("");
    return NextResponse.json(fallback);
  }
}
