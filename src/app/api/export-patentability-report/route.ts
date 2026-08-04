import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const dynamic = "force-dynamic";

interface LicensingTarget {
  companyName: string;
  companySize: string;
  fitPercentage: number;
  strategicFit: string;
  decisionMakerRoles: string[];
}

interface LicensingData {
  oneSentenceSummary: string;
  targetSectors: string[];
  licensingTargets: LicensingTarget[];
  assumptions: string[];
  aiGeneratedDisclaimer: string;
  technicalSummary: string;
}

interface LicensingCategory {
  categoryName: string;
  bigPlayers: { companyName: string; fitPercentage: number }[];
  smallerCompanies: { companyName: string; fitPercentage: number }[];
  potentialMarketSpaces: string[];
}

interface GeneratedSection32 {
  categories: LicensingCategory[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "patentability-assessment-template.docx");

async function generateSection32(data: LicensingData, apiKey: string): Promise<GeneratedSection32> {
  const prompt = `You are a technology licensing analyst writing Section 3.2 "Licensing Opportunities" of a Patentability Assessment Report for the Terasaki Institute.

You have the following information about the technology:

Technical Summary: ${data.technicalSummary}
Commercial Summary: ${data.oneSentenceSummary}
Target Sectors: ${data.targetSectors.join(", ")}

Licensing Targets (companies already identified):
${data.licensingTargets.map(t => `- ${t.companyName} (size: ${t.companySize}, fit: ${t.fitPercentage}%, rationale: ${t.strategicFit})`).join("\n")}

Your task: Generate one licensing category per target sector. For each category:
1. Use the sector name as the category name
2. Split the licensing targets that are relevant to this sector into:
   - bigPlayers: companies with companySize "large" — include their fitPercentage
   - smallerCompanies: companies with companySize "medium", "small", or "niche" — include their fitPercentage
3. Generate 3-5 specific potential market application spaces for this sector (e.g. "Extraction Socket Preservation", "Guided Bone Ridge Regeneration") — these should be specific clinical, commercial, or industrial applications, NOT generic descriptions. Reason from the technical summary and sector to identify real market niches.

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
{
  "categories": [
    {
      "categoryName": string,
      "bigPlayers": [{ "companyName": string, "fitPercentage": number }],
      "smallerCompanies": [{ "companyName": string, "fitPercentage": number }],
      "potentialMarketSpaces": string[]
    }
  ]
}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a technology licensing analyst. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = completion.choices?.[0]?.message?.content ?? "";
  return JSON.parse(raw) as GeneratedSection32;
}

function renderReport(section32: GeneratedSection32, disclaimer: string, templateBuf: Buffer): Buffer {
  const zip = new PizZip(templateBuf);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render({
    categories: section32.categories.map((category, index) => ({
      categoryNumber: index + 1,
      categoryName: category.categoryName,
      bigPlayers: category.bigPlayers.map((p) => ({ name: p.companyName, fit: p.fitPercentage })),
      smallerCompanies: category.smallerCompanies.map((p) => ({ name: p.companyName, fit: p.fitPercentage })),
      potentialMarketSpaces: category.potentialMarketSpaces,
    })),
    disclaimer,
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const licensingData = body.licensingData as LicensingData | undefined;
  const technicalSummary = (body.technicalSummary as string | undefined) ?? "";

  if (!licensingData) {
    return NextResponse.json({ error: "licensingData is required." }, { status: 400 });
  }

  licensingData.technicalSummary = technicalSummary;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  let section32: GeneratedSection32;
  try {
    section32 = await generateSection32(licensingData, apiKey);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate Section 3.2: ${message}` }, { status: 502 });
  }

  let templateBuf: Buffer;
  try {
    templateBuf = await fs.readFile(TEMPLATE_PATH);
  } catch {
    return NextResponse.json({ error: "Patentability assessment template is missing on the server." }, { status: 500 });
  }

  let outputBuf: Buffer;
  try {
    outputBuf = renderReport(section32, licensingData.aiGeneratedDisclaimer, templateBuf);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fill in report template: ${message}` }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(outputBuf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="patentability-assessment-${new Date().toISOString().slice(0, 10)}.docx"`,
    },
  });
}
