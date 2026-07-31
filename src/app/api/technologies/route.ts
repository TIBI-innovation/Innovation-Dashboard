import { NextResponse } from "next/server";
import { getIdfDataSourceInfo, getTechnologies } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const technologies = getTechnologies();
    const idfDataSourceInfo = getIdfDataSourceInfo();

    return NextResponse.json({
      technologies,
      lastUpdated: idfDataSourceInfo.lastUpdated,
    });
  } catch (error) {
    console.error("Failed to fetch technologies:", error);
    return NextResponse.json(
      { error: "Failed to load technologies." },
      { status: 500 }
    );
  }
}
