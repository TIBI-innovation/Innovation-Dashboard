import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MODEL_NAME = "gemini-flash-latest";
const MAX_RETRIES = 3;

function isTransientError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message;
    return msg.includes("503") || msg.includes("Service Unavailable") || msg.includes("overloaded");
  }
  return false;
}

async function callGeminiWithRetry(
  apiKey: string,
  prompt: string
): Promise<string> {
  console.log(`[generate-report] Using model: ${MODEL_NAME}`);

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
    },
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[generate-report] Attempt ${attempt}/${MAX_RETRIES}`);
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      console.log("[generate-report] Raw Gemini response:", raw);
      return raw;
    } catch (err) {
      lastError = err;
      console.error(`[generate-report] Attempt ${attempt} failed:`, err);

      if (!isTransientError(err) || attempt === MAX_RETRIES) {
        break;
      }

      const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.log(`[generate-report] Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  // Parse request body
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

  // Validate required fields
  if (!technicalSummary || typeof technicalSummary !== "string" || technicalSummary.trim() === "") {
    return NextResponse.json({ error: "technicalSummary is required." }, { status: 400 });
  }

  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("[generate-report] GEMINI_API_KEY is not set.");
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  // Debug: log input
  console.log("[generate-report] Input payload:", {
    technicalSummary: technicalSummary.slice(0, 120),
    ftoConstraints: ftoConstraints ?? "(none)",
    hasPreviousReport: !!previousReport,
    hasUserFeedback: !!userFeedback,
  });

  const prompt = `You are a senior technology commercialization strategist.

Input:
- Technical summary: ${technicalSummary}
- FTO constraints: ${ftoConstraints ?? ""}
- Previous report: ${previousReport ? JSON.stringify(previousReport) : "None"}
- User feedback: ${userFeedback ?? ""}

CRITICAL RULES:
- Do NOT paraphrase or reuse input wording
- Do NOT use templates or generic phrasing
- Do NOT return placeholder companies
- Generate REAL, specific companies (or highly plausible real-world companies)
- Each company must have a distinct strategic rationale
- Each response must vary meaningfully from previous outputs

The technology_summary must:
- Be a new interpretation of the input (not a rewording)
- Focus on business value and novelty

Each licensing target must:
- Be unique
- Use a distinct strategic angle (e.g. product line fit, market expansion, regulatory advantage, portfolio gap)

Return ONLY valid JSON:
{
  "technology_summary": string,
  "target_industries": string[],
  "licensing_targets": [
    {
      "company_name": string,
      "company_size": "large" | "medium" | "small" | "niche",
      "fit_percentage": number,
      "strategic_fit_explanation": string,
      "relevant_roles": string[]
    }
  ],
  "assumptions": string[]
}`;

  try {
    const raw = await callGeminiWithRetry(process.env.GEMINI_API_KEY, prompt);

    // Parse JSON
    try {
      const parsed = JSON.parse(raw) as unknown;
      return NextResponse.json(parsed, { status: 200 });
    } catch (parseError) {
      console.error("[generate-report] JSON parse failed:", parseError);
      console.error("[generate-report] Raw output that failed:", raw);
      return NextResponse.json(
        { error: "Invalid JSON returned from Gemini." },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-report] Final error:", message);

    if (isTransientError(err)) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Gemini request failed: ${message}` },
      { status: 500 }
    );
  }
}
