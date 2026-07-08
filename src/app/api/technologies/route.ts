import { NextResponse } from "next/server";
import { getTechnologies } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const technologies = getTechnologies();
    return NextResponse.json(technologies);
  } catch (error) {
    console.error("Failed to fetch technologies:", error);
    return NextResponse.json(
      { error: "Failed to load technologies." },
      { status: 500 }
    );
  }
}
