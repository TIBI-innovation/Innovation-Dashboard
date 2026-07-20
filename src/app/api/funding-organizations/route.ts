import { NextResponse } from "next/server";
import { getFundingOrganizations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fundingOrganizations = getFundingOrganizations();
    return NextResponse.json(fundingOrganizations);
  } catch (error) {
    console.error("Failed to fetch funding organizations:", error);
    return NextResponse.json(
      { error: "Failed to load funding organizations." },
      { status: 500 }
    );
  }
}
