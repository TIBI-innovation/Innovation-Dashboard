import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  ShadingType,
  BorderStyle,
  PageBreak,
} from "docx";

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

const DARK_BLUE = "0C2340";
const LIGHT_BLUE_BG = "D6E4F0";
const PLACEHOLDER_COLOR = "CC0000";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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

function placeholderRun(text: string) {
  return new TextRun({ text, color: PLACEHOLDER_COLOR, italics: true });
}

function headerTable() {
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  function labelCell(label: string, value: TextRun, width: number) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: cellBorder,
      children: [
        new Paragraph({
          children: [new TextRun({ text: `${label} `, bold: true }), value],
        }),
      ],
    });
  }

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          labelCell("Title:", placeholderRun("*Insert title from IDF form*"), 4680),
          labelCell("Inventors:", placeholderRun("*Inventors Name (on IDF)*"), 4680),
        ],
      }),
      new TableRow({
        children: [
          labelCell("Effective Date:", placeholderRun("*Month, Year*"), 4680),
          labelCell("Report ID:", placeholderRun("IDF *FORM #* - *Version #*"), 4680),
        ],
      }),
      new TableRow({
        children: [
          labelCell("Reported by:", placeholderRun("*First Last Name*"), 4680),
          new TableCell({
            width: { size: 4680, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ children: [new TextRun({ text: "Page: 1" })] })],
          }),
        ],
      }),
    ],
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
  });
}

function subHeading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
  });
}

function italicGray(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: "555555" })],
    spacing: { after: 120 },
  });
}

function placeholder(text: string) {
  return new Paragraph({
    children: [placeholderRun(text)],
    spacing: { after: 120 },
  });
}

function blueBox(children: Paragraph[]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: LIGHT_BLUE_BG },
            children,
          }),
        ],
      }),
    ],
  });
}

function assessmentTable() {
  const headerCellShading = { type: ShadingType.CLEAR, fill: DARK_BLUE };

  function criterionRow(criterion: string) {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 3240, type: WidthType.DXA },
          shading: headerCellShading,
          children: [new Paragraph({ children: [new TextRun({ text: criterion, color: "FFFFFF", bold: true })] })],
        }),
        new TableCell({
          width: { size: 6120, type: WidthType.DXA },
          children: [new Paragraph({ text: "" })],
        }),
      ],
    });
  }

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3240, 6120],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: headerCellShading,
            columnSpan: 2,
            children: [new Paragraph({ children: [new TextRun({ text: "Patentability rating scale", bold: true, color: "FFFFFF" })] })],
          }),
        ],
      }),
      criterionRow("Novelty (35 U.S.C. § 102): Is the invention new? Has it been publicly disclosed or patented?"),
      criterionRow("Non-Obviousness (35 U.S.C. § 103): Is this invention a meaningful creative step beyond what already exists?"),
      criterionRow("Utility (35 U.S.C. § 101): Does the invention work and does it serve a significant purpose?"),
      criterionRow("Overall Recommendations"),
    ],
  });
}

function categoryTable(category: LicensingCategory, index: number): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const headerShading = { type: ShadingType.CLEAR, fill: DARK_BLUE };

  // "Category N: Sector Name"
  elements.push(
    new Paragraph({
      children: [new TextRun({ text: `Category ${index + 1}: ${category.categoryName}`, bold: true })],
      spacing: { before: 200, after: 100 },
    })
  );

  // Key Players cell content
  const keyPlayersChildren: Paragraph[] = [];

  if (category.bigPlayers.length > 0) {
    keyPlayersChildren.push(
      new Paragraph({ children: [new TextRun({ text: "Big players:", bold: true })] })
    );
    for (const p of category.bigPlayers) {
      keyPlayersChildren.push(
        new Paragraph({ children: [new TextRun({ text: `  -  ${p.companyName} (${p.fitPercentage}% fit)` })] })
      );
    }
  }

  if (category.smallerCompanies.length > 0) {
    keyPlayersChildren.push(
      new Paragraph({ children: [new TextRun({ text: "Startups:", bold: true })], spacing: { before: 80 } })
    );
    for (const p of category.smallerCompanies) {
      keyPlayersChildren.push(
        new Paragraph({ children: [new TextRun({ text: `  -  ${p.companyName} (${p.fitPercentage}% fit)` })] })
      );
    }
  }

  if (keyPlayersChildren.length === 0) {
    keyPlayersChildren.push(new Paragraph({ children: [new TextRun({ text: "No targets identified for this sector." })] }));
  }

  // Potential Market cell content
  const marketChildren: Paragraph[] = [
    ...category.potentialMarketSpaces.map(
      (space) => new Paragraph({ children: [new TextRun({ text: space })] })
    ),
  ];

  elements.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4680, 4680],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              shading: headerShading,
              children: [
                new Paragraph({ children: [new TextRun({ text: "Key Players", bold: true, color: "FFFFFF" })] }),
                new Paragraph({ children: [new TextRun({ text: "(ranked with decreasing revenue)", italics: true, color: "FFFFFF", size: 18 })] }),
              ],
            }),
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              shading: headerShading,
              children: [new Paragraph({ children: [new TextRun({ text: "Potential Market", bold: true, color: "FFFFFF" })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              children: keyPlayersChildren,
            }),
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              children: marketChildren,
            }),
          ],
        }),
      ],
    })
  );

  return elements;
}

function licensingSection(section32: GeneratedSection32, disclaimer: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(subHeading("3.2 Licensing Opportunities"));
  elements.push(
    italicGray(
      "Separate licensing opportunities into categories mirroring the different markets explored in Section 2.1."
    )
  );

  for (let i = 0; i < section32.categories.length; i++) {
    elements.push(...categoryTable(section32.categories[i], i));
  }

  elements.push(
    new Paragraph({
      children: [new TextRun({ text: `⚠ ${disclaimer}`, color: "B45309", italics: true })],
      spacing: { before: 200, after: 0 },
    })
  );

  return elements;
}

function priorArtTable() {
  const headerShading = { type: ShadingType.CLEAR, fill: DARK_BLUE };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 7020],
    rows: [
      ...["Prior Art Reference", "Date Published", "Key Distinction", "Most Competitive Claims"].map(
        (label) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2340, type: WidthType.DXA },
                shading: headerShading,
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: "FFFFFF" })] })],
              }),
              new TableCell({
                width: { size: 7020, type: WidthType.DXA },
                children: [new Paragraph({ text: "" })],
              }),
            ],
          })
      ),
    ],
  });
}

function marketTable() {
  const headerShading = { type: ShadingType.CLEAR, fill: DARK_BLUE };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 7020],
    rows: [
      ...["Target Market", "Market Size", "Projected Market Growth", "Market Growth Rate"].map(
        (label) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2340, type: WidthType.DXA },
                shading: headerShading,
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: "FFFFFF" })] })],
              }),
              new TableCell({
                width: { size: 7020, type: WidthType.DXA },
                children: [new Paragraph({ text: "" })],
              }),
            ],
          })
      ),
    ],
  });
}

function experimentsTable() {
  const headerShading = { type: ShadingType.CLEAR, fill: DARK_BLUE };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1000, 4180, 4180],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            shading: headerShading,
            children: [new Paragraph({ children: [new TextRun({ text: "Priority", bold: true, color: "FFFFFF" })] })],
          }),
          new TableCell({
            width: { size: 4180, type: WidthType.DXA },
            shading: headerShading,
            children: [new Paragraph({ children: [new TextRun({ text: "Experiment", bold: true, color: "FFFFFF" })] })],
          }),
          new TableCell({
            width: { size: 4180, type: WidthType.DXA },
            shading: headerShading,
            children: [new Paragraph({ children: [new TextRun({ text: "Why", bold: true, color: "FFFFFF" })] })],
          }),
        ],
      }),
      ...[1, 2, 3, 4, 5].map(
        (n) =>
          new TableRow({
            children: [
              new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(n) })] })] }),
              new TableCell({ width: { size: 4180, type: WidthType.DXA }, children: [new Paragraph({ text: "" })] }),
              new TableCell({ width: { size: 4180, type: WidthType.DXA }, children: [new Paragraph({ text: "" })] }),
            ],
          })
      ),
    ],
  });
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

  // Step 1: Call Groq to generate Section 3.2 content
  let section32: GeneratedSection32;
  try {
    section32 = await generateSection32(licensingData, apiKey);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate Section 3.2: ${message}` }, { status: 502 });
  }

  // Step 2: Build the docx
  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { color: DARK_BLUE, bold: true, size: 28 },
          paragraph: { spacing: { before: 320, after: 120 } },
        },
        heading2: {
          run: { color: "1F5C8B", bold: true, size: 24 },
          paragraph: { spacing: { before: 240, after: 80 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        children: [
          // Page 1
          new Paragraph({
            children: [new TextRun({ text: "Patentability Assessment Report", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          headerTable(),

          sectionHeading("Assessment Purpose"),
          italicGray(
            "This report assesses the patentability of the technology described herein across three core dimensions: novelty, non-obviousness, and commercial feasibility. It is intended to provide leadership with a structured evaluation to support decisions regarding patent filing, further R&D investment, and strategic IP positioning."
          ),
          blueBox([
            new Paragraph({ children: [new TextRun({ text: "Technology Overview", bold: true, color: DARK_BLUE })] }),
            placeholder("*Brief (2-3 sentences) overview of what the proposed technology is, explained so a non-expert can understand*"),
            new Paragraph({ children: [new TextRun({ text: "Key Novelty Statement", bold: true, color: DARK_BLUE })] }),
            placeholder("*2-3 sentence explanation of what is novel about the proposed technology.*"),
            new Paragraph({ children: [new TextRun({ text: "Non-Obviousness Statement", bold: true, color: DARK_BLUE })] }),
            placeholder("*Explanation of why the proposed technology is a genuine, unexpected advancement rather than an obvious, trivial tweak to existing technology*"),
          ]),

          sectionHeading("Overall Patentability Assessment"),
          italicGray(
            "Intellectual Property Key Terms: Before a patent can be granted, an invention must clear three legal tests set by U.S. patent law. The following table is a summary of our assessment based on the metrics below."
          ),
          assessmentTable(),

          // Page 2
          new Paragraph({ children: [new PageBreak()] }),
          headerTable(),
          sectionHeading("Section 1: Key Novel Factors"),
          italicGray("This section identifies the specific technical elements of the invention that distinguish it from existing prior art."),
          subHeading("1.1 Primary Novel Element"),
          placeholder("*Provide a one-paragraph explanation of the most novel aspect of the proposed technology, including what differentiates it from existing solutions.*"),
          subHeading("1.2 Prior Art Landscape"),
          new Paragraph({
            children: [new TextRun({ text: "Prior Art #1:", bold: true })],
            spacing: { after: 80 },
          }),
          priorArtTable(),

          // Page 3
          new Paragraph({ children: [new PageBreak()] }),
          headerTable(),
          sectionHeading("Section 2: Commercial Feasibility"),
          italicGray("A strong patent application is most valuable when underlying technology has a viable path to commercialization. This section evaluates the market opportunity, return on investment, and competitive positioning of the technology."),
          subHeading("2.1 Market Opportunity"),
          italicGray("Values concerning market size and growth can be found below."),
          placeholder("*To be completed — Pitchbook AI integration coming soon.*"),
          marketTable(),
          subHeading("2.2 Competitive Landscape"),
          placeholder("*To be completed — Prior art search tool integration coming soon.*"),

          // Page 4 — AI-filled Section 3
          new Paragraph({ children: [new PageBreak()] }),
          headerTable(),
          sectionHeading("Section 3: Future Directions & Data Requirements"),
          italicGray("This section outlines the additional research, experimentation, and data collection needed to strengthen the patent application, support non-obviousness arguments, and advance the technology toward commercialization."),
          subHeading("3.1 Data Needed to Strengthen Patent Claims"),
          new Paragraph({
            children: [new TextRun({ text: "The following are ideas of data to collect to prove some of the claims that will allow for the broadest IP coverage:" })],
            spacing: { after: 120 },
          }),
          experimentsTable(),

          ...licensingSection(section32, licensingData.aiGeneratedDisclaimer),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="patentability-assessment-${new Date().toISOString().slice(0, 10)}.docx"`,
    },
  });
}
