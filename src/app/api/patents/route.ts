import { NextResponse } from "next/server";
import { getPatents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const patents = getPatents();
    return NextResponse.json(patents);
  } catch (error) {
    console.error("Failed to fetch patents:", error);
    return NextResponse.json(
      { error: "Failed to load patents." },
      { status: 500 }
    );
  }
}
