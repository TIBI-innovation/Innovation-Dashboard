import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const AI_DISCLAIMER = "AI-generated leads — verify company details before outreach";

const SYSTEM_PROMPT = `You are an expert technology licensing and tech-transfer analyst.
Your task is to generate a structured licensing intelligence report.

Return ONLY valid JSON — no markdown, no code fences, no commentary — matching this exact shape:
{
  "oneSentenceSummary": string,
  "targetSectors": string[],
  "licensingTargets": [
    {
      "companyName": string,
      "companySize": string,
      "fitPercentage": number,
      "strategicFit": string,
      "decisionMakerRoles": string[]
    }
  ],
  "assumptions": string[]
}

STRICT RULES:
- oneSentenceSummary: interpret the technology's core commercial value in one sentence — do NOT rephrase the input
- targetSectors: 3–5 concrete industry verticals (e.g. "cardiovascular devices", not generic labels)
- licensingTargets: 4–6 REAL, existing companies; each must have a DISTINCT strategic rationale
- companySize: one of "large", "medium", "small", or "niche"
- Each strategicFit must reference the specific company's actual business domain and a unique strategic angle (e.g. product line gap, regulatory leverage, market expansion, portfolio fit)
- fitPercentage must reflect your reasoning — not arbitrary values
- assumptions: 2–4 items about missing context (regulatory status, IP maturity, market readiness)
- Do NOT use placeholder, invented, or generic company names
- Each response must vary meaningfully from previous outputs`;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { technicalSummary, ftoConstraints, previousReport, userFeedback } = body as {
    technicalSummary?: string;
    ftoConstraints?: string;
    previousReport?: unknown;
    userFeedback?: string;
  };

  if (!technicalSummary || typeof technicalSummary !== "string" || technicalSummary.trim() === "") {
    return NextResponse.json({ error: "technicalSummary is required." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[licensing-report] GROQ_API_KEY is not set.");
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  // Build user message — include optional context
  const userParts: string[] = [`Technical summary: ${technicalSummary}`];
  if (ftoConstraints) userParts.push(`FTO constraints: ${ftoConstraints}`);
  if (previousReport) userParts.push(`Previous report (for refinement context): ${JSON.stringify(previousReport)}`);
  if (userFeedback) userParts.push(`Analyst feedback to incorporate: ${userFeedback}`);
  const userContent = userParts.join("\n\n");

  console.log("[licensing-report] Input:", {
    summaryPreview: technicalSummary.slice(0, 100),
    hasFTO: !!ftoConstraints,
    hasPreviousReport: !!previousReport,
    hasFeedback: !!userFeedback,
  });

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("[licensing-report] Groq API error:", groqResponse.status, errText);
      return NextResponse.json(
        { error: `Groq API error (${groqResponse.status}): ${groqResponse.statusText}` },
        { status: groqResponse.status >= 500 ? 502 : groqResponse.status }
      );
    }

    const completion = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = completion.choices?.[0]?.message?.content ?? "";
    console.log("[licensing-report] Raw model response:", raw);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch (parseError) {
      console.error("[licensing-report] JSON parse failed:", parseError);
      console.error("[licensing-report] Raw output:", raw);
      return NextResponse.json(
        { error: "Malformed JSON returned by model. Please try again." },
        { status: 502 }
      );
    }

    // Attach disclaimer server-side — always present
    parsed.aiGeneratedDisclaimer = AI_DISCLAIMER;

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[licensing-report] Unexpected error:", message);
    return NextResponse.json({ error: `Request failed: ${message}` }, { status: 500 });
  }
}

