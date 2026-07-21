import { NextResponse } from "next/server";
import { getFundingDataSourceInfo, getFundingOrganizations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fundingOrganizations = getFundingOrganizations();
    const fundingDataSourceInfo = getFundingDataSourceInfo();

    return NextResponse.json({
      organizations: fundingOrganizations,
      lastUpdated: fundingDataSourceInfo.lastUpdated,
    });
  } catch (error) {
    console.error("Failed to fetch funding organizations:", error);
    return NextResponse.json(
      { error: "Failed to load funding organizations." },
      { status: 500 }
    );
  }
}
