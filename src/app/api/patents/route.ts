import { NextResponse } from "next/server";
import { getPatentDataSourceInfo, getPatents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const patents = getPatents();
    const patentDataSourceInfo = getPatentDataSourceInfo();

    return NextResponse.json({
      patents,
      lastUpdated: patentDataSourceInfo.lastUpdated,
    });
  } catch (error) {
    console.error("Failed to fetch patents:", error);
    return NextResponse.json(
      { error: "Failed to load patents." },
      { status: 500 }
    );
  }
}
