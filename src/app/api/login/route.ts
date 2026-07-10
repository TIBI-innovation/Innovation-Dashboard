import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Login API is available." });
}

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "Login endpoint is not implemented in this demo." },
    { status: 501 }
  );
}
