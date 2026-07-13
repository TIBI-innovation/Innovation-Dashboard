export interface LicensingSector {
  name: string;
  description: string;
  relevance_reason: string;
}

export interface LicensingCompany {
  name: string;
  industry: string;
  why_license: string;
  confidence: number;
  contacts: LicensingContact[];
}

export interface LicensingContact {
  name?: string;
  title: string;
  why_relevant: string;
  confidence: number;
}

export interface LicensingIntelligence {
  technology_summary: string;
  sectors: LicensingSector[];
  companies: {
    large: LicensingCompany[];
    mid_size: LicensingCompany[];
    small_or_niche: LicensingCompany[];
  };
  fto_considerations: string[];
  assumptions: string[];
}

interface SectorRule {
  name: string;
  description: string;
  keywords: string[];
}

interface CompanyRule {
  name: string;
  industry: string;
  size: "large" | "mid_size" | "small_or_niche";
  sectors: string[];
  portfolio_focus: string;
  external_innovation_signal: string;
}

const SECTOR_RULES: SectorRule[] = [
  {
    name: "Medical Devices & Diagnostics",
    description: "Products used for clinical diagnostics, monitoring, and intervention in healthcare settings.",
    keywords: ["device", "sensor", "wearable", "diagnostic", "clinical", "hospital", "monitoring"],
  },
  {
    name: "Biopharma & Therapeutics",
    description: "Drug development, biologics, and treatment modalities for disease management.",
    keywords: ["drug", "therapeutic", "biologic", "pharma", "antibody", "gene", "treatment"],
  },
  {
    name: "Digital Health & AI",
    description: "Software-enabled healthcare workflows, analytics, and AI-driven decision support.",
    keywords: ["ai", "machine learning", "software", "algorithm", "platform", "data", "digital health"],
  },
  {
    name: "Advanced Biomaterials",
    description: "Novel materials for implants, tissue engineering, drug delivery, or biocompatible systems.",
    keywords: ["biomaterial", "polymer", "hydrogel", "scaffold", "implant", "material"],
  },
  {
    name: "Manufacturing & Process Scale-Up",
    description: "Production methods, quality systems, and scale-up capabilities for commercialization.",
    keywords: ["manufacturing", "scale", "process", "production", "formulation", "automation"],
  },
  {
    name: "Research Tools & Life Science Services",
    description: "Technologies sold to labs, CROs, and R&D teams for research and validation.",
    keywords: ["research", "laboratory", "assay", "screening", "preclinical", "service"],
  },
];

const COMPANY_RULES: CompanyRule[] = [
  {
    name: "Medtronic",
    industry: "Medical devices",
    size: "large",
    sectors: ["Medical Devices & Diagnostics"],
    portfolio_focus: "cardiovascular, neuromodulation, surgical technologies, and patient monitoring platforms",
    external_innovation_signal: "has a long track record of acquiring and integrating externally developed device technologies into major therapy franchises",
  },
  {
    name: "Philips",
    industry: "Health technology",
    size: "large",
    sectors: ["Medical Devices & Diagnostics", "Digital Health & AI"],
    portfolio_focus: "connected care, imaging, patient monitoring, and clinical informatics ecosystems",
    external_innovation_signal: "frequently builds partner-driven solutions where hardware, software, and analytics are co-developed with external innovators",
  },
  {
    name: "Johnson & Johnson",
    industry: "MedTech and pharmaceuticals",
    size: "large",
    sectors: ["Medical Devices & Diagnostics", "Biopharma & Therapeutics"],
    portfolio_focus: "surgical robotics, interventional technologies, and broad therapeutic-area pipelines",
    external_innovation_signal: "uses strategic collaborations and licensing across both MedTech and pharma to de-risk internal pipeline priorities",
  },
  {
    name: "Roche",
    industry: "Diagnostics and pharmaceuticals",
    size: "large",
    sectors: ["Medical Devices & Diagnostics", "Biopharma & Therapeutics"],
    portfolio_focus: "in vitro diagnostics, companion diagnostics, and targeted therapeutics",
    external_innovation_signal: "actively licenses and partners where diagnostics and therapeutics can be linked for precision-care strategies",
  },
  {
    name: "Siemens Healthineers",
    industry: "Diagnostic imaging and lab diagnostics",
    size: "large",
    sectors: ["Medical Devices & Diagnostics", "Digital Health & AI"],
    portfolio_focus: "imaging systems, diagnostic testing workflows, and AI-enabled clinical decision support",
    external_innovation_signal: "regularly incorporates third-party software and workflow innovations into enterprise hospital deployments",
  },
  {
    name: "Thermo Fisher Scientific",
    industry: "Life science tools and services",
    size: "large",
    sectors: ["Research Tools & Life Science Services", "Biopharma & Therapeutics"],
    portfolio_focus: "analytical instruments, bioproduction tools, and translational research services",
    external_innovation_signal: "consistently expands its platform through acquisitions and licensing of differentiated research and manufacturing tools",
  },
  {
    name: "Merck KGaA",
    industry: "Biopharma and life science platforms",
    size: "large",
    sectors: ["Biopharma & Therapeutics", "Manufacturing & Process Scale-Up"],
    portfolio_focus: "bioprocessing materials, life-science workflow products, and specialty therapeutics",
    external_innovation_signal: "frequently partners to add enabling technologies that improve therapeutic development and manufacturing throughput",
  },
  {
    name: "AstraZeneca",
    industry: "Biopharmaceuticals",
    size: "large",
    sectors: ["Biopharma & Therapeutics"],
    portfolio_focus: "oncology, cardiovascular, renal, respiratory, and immunology therapeutic franchises",
    external_innovation_signal: "relies on a broad external partnering model for discovery assets, platform technologies, and co-development programs",
  },
  {
    name: "Repligen",
    industry: "Bioprocessing tools",
    size: "mid_size",
    sectors: ["Biopharma & Therapeutics", "Manufacturing & Process Scale-Up"],
    portfolio_focus: "filtration, chromatography, and process analytics solutions for biologics manufacturing",
    external_innovation_signal: "has repeatedly expanded its bioprocess portfolio by acquiring and integrating niche external technologies",
  },
  {
    name: "Bio-Techne",
    industry: "Life science reagents and tools",
    size: "mid_size",
    sectors: ["Research Tools & Life Science Services", "Biopharma & Therapeutics"],
    portfolio_focus: "protein sciences, molecular diagnostics components, and translational research reagents",
    external_innovation_signal: "uses focused acquisitions and licensing to strengthen specialized assay and reagent capabilities",
  },
  {
    name: "Insulet",
    industry: "Diabetes delivery devices",
    size: "mid_size",
    sectors: ["Medical Devices & Diagnostics", "Digital Health & AI"],
    portfolio_focus: "tubeless insulin delivery systems and connected diabetes management workflows",
    external_innovation_signal: "depends on ecosystem integrations and external components to improve digital therapy performance and patient adherence",
  },
  {
    name: "LivaNova",
    industry: "Medical technology",
    size: "mid_size",
    sectors: ["Medical Devices & Diagnostics"],
    portfolio_focus: "neuromodulation and cardiopulmonary support technologies for specialized care pathways",
    external_innovation_signal: "selectively licenses and partners in high-specialty domains where focused innovation can shift standard of care",
  },
  {
    name: "10x Genomics",
    industry: "Genomics research platforms",
    size: "mid_size",
    sectors: ["Research Tools & Life Science Services", "Digital Health & AI"],
    portfolio_focus: "single-cell and spatial biology instrumentation with integrated analytics",
    external_innovation_signal: "benefits from complementary external methods that expand assay breadth and data utility in research workflows",
  },
  {
    name: "Abionic",
    industry: "Rapid diagnostics",
    size: "small_or_niche",
    sectors: ["Medical Devices & Diagnostics"],
    portfolio_focus: "point-of-care biomarker diagnostics and rapid testing formats for acute care use cases",
    external_innovation_signal: "niche diagnostics players often partner to broaden menu offerings without extending internal development timelines",
  },
  {
    name: "Cytiva Fast Trak services partners",
    industry: "Bioprocess development services",
    size: "small_or_niche",
    sectors: ["Manufacturing & Process Scale-Up", "Biopharma & Therapeutics"],
    portfolio_focus: "process development support, scale-up methods, and CMC-adjacent commercialization services",
    external_innovation_signal: "service-led organizations prioritize licensable technologies that shorten development cycles for client programs",
  },
  {
    name: "Akadeum Life Sciences",
    industry: "Cell separation tools",
    size: "small_or_niche",
    sectors: ["Research Tools & Life Science Services", "Biopharma & Therapeutics"],
    portfolio_focus: "cell isolation and sample preparation platforms for translational and clinical research",
    external_innovation_signal: "specialty tool providers commonly in-license complementary methods to increase workflow value per customer account",
  },
  {
    name: "Biolinq",
    industry: "Biosensing wearables",
    size: "small_or_niche",
    sectors: ["Medical Devices & Diagnostics", "Digital Health & AI"],
    portfolio_focus: "minimally invasive biosensing patches and continuous metabolic monitoring products",
    external_innovation_signal: "wearable startups often use targeted external licensing to accelerate feature expansion and regulatory positioning",
  },
  {
    name: "Tissium",
    industry: "Biomaterial-based repair technologies",
    size: "small_or_niche",
    sectors: ["Advanced Biomaterials", "Medical Devices & Diagnostics"],
    portfolio_focus: "polymer-based tissue repair platforms designed for procedural integration and surgical applications",
    external_innovation_signal: "adjacent biomaterial innovators are frequent licensing candidates when new chemistry or delivery methods strengthen core indications",
  },
];

function normalize(text: string): string {
  return text.toLowerCase();
}

function oneSentenceTechnologySummary(summary: string): string {
  const cleaned = summary.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "A technology concept was provided for licensing analysis, but additional technical detail is needed to produce a precise summary.";
  }

  const sentenceMatch = cleaned.match(/^[^.!?]+[.!?]/);
  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }

  const words = cleaned.split(" ");
  if (words.length <= 24) return `${cleaned}.`;
  return `${words.slice(0, 24).join(" ")}...`;
}

function parseAreasToAvoid(areasToAvoid: string): string[] {
  return areasToAvoid
    .split(/\r?\n|,|;/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function matchesAvoidedArea(text: string, avoidedAreas: string[]): boolean {
  const normalizedText = normalize(text);
  return avoidedAreas.some((area) => {
    const normalizedArea = normalize(area);
    return normalizedText.includes(normalizedArea) || normalizedArea.includes(normalizedText);
  });
}

function scoreSector(summary: string, rule: SectorRule): number {
  const normalized = normalize(summary);
  return rule.keywords.reduce((score, keyword) => {
    return normalized.includes(keyword) ? score + 1 : score;
  }, 0);
}

function buildSectors(
  summary: string,
  avoidedAreas: string[]
): { sectors: LicensingSector[]; vague: boolean } {
  const scored = SECTOR_RULES.map((rule) => ({ rule, score: scoreSector(summary, rule) }))
    .sort((a, b) => b.score - a.score);
  const allowed = scored.filter(
    ({ rule }) => !matchesAvoidedArea(`${rule.name} ${rule.description}`, avoidedAreas)
  );
  const candidates = avoidedAreas.length > 0 && allowed.length >= 3 ? allowed : scored;

  const positive = candidates.filter((item) => item.score > 0);
  const vague = positive.length === 0;
  const selected = vague ? candidates.slice(0, 3) : positive.slice(0, 6);
  if (!vague && selected.length < 3) {
    const used = new Set(selected.map((item) => item.rule.name));
    for (const item of candidates) {
      if (used.has(item.rule.name)) continue;
      selected.push(item);
      used.add(item.rule.name);
      if (selected.length >= 3) break;
    }
  }

  return {
    vague,
    sectors: selected.map(({ rule, score }) => ({
      name: rule.name,
      description: rule.description,
      relevance_reason:
        score > 0
          ? `The summary references concepts aligned with ${rule.name.toLowerCase()} (matched ${score} domain cues).`
          : `Based on typical commercialization pathways for early-stage technologies, this sector is a plausible entry point.`,
    })),
  };
}

function confidenceFromMatches(matches: number): number {
  if (matches >= 2) return 0.86;
  if (matches === 1) return 0.74;
  return 0.61;
}

function pickContacts(
  company: CompanyRule,
  matchedSectors: string[],
  baseConfidence: number
): LicensingContact[] {
  const contacts: LicensingContact[] = [
    {
      title: "VP/Head of Business Development & Licensing",
      why_relevant:
        "Owns evaluation of external innovations, structures licensing terms, and drives partnership decisions.",
      confidence: Math.min(0.95, baseConfidence + 0.09),
    },
  ];

  if (matchedSectors.includes("Digital Health & AI")) {
    contacts.push({
      title: "Chief Product Officer / VP Product Strategy",
      why_relevant:
        "Assesses product roadmap fit, integration feasibility, and commercial differentiation of licensed technology.",
      confidence: Math.min(0.95, baseConfidence + 0.06),
    });
  } else if (
    matchedSectors.includes("Biopharma & Therapeutics") ||
    matchedSectors.includes("Research Tools & Life Science Services")
  ) {
    contacts.push({
      title: "Head of R&D / VP Translational Science",
      why_relevant:
        "Evaluates scientific validity, development risk, and technical diligence required before licensing decisions.",
      confidence: Math.min(0.95, baseConfidence + 0.06),
    });
  } else {
    contacts.push({
      title: "CTO / Head of Innovation",
      why_relevant:
        "Leads technical diligence and determines whether external technology can accelerate strategic innovation goals.",
      confidence: Math.min(0.95, baseConfidence + 0.06),
    });
  }

  if (company.size === "large") {
    contacts[0].confidence = Math.min(0.95, contacts[0].confidence + 0.02);
  }

  return contacts.slice(0, 2);
}

function pickCompaniesForSize(
  size: "large" | "mid_size" | "small_or_niche",
  sectorNames: string[],
  avoidedAreas: string[]
): LicensingCompany[] {
  const scored = COMPANY_RULES.filter((company) => company.size === size)
    .filter((company) => {
      if (avoidedAreas.length === 0) return true;
      const companyScope = `${company.industry} ${company.sectors.join(" ")}`;
      return !matchesAvoidedArea(companyScope, avoidedAreas);
    })
    .map((company) => {
      const matches = company.sectors.filter((sector) => sectorNames.includes(sector)).length;
      return { company, matches };
    })
    .sort((a, b) => b.matches - a.matches);

  const selected = scored.slice(0, 3);
  return selected.map(({ company, matches }) => {
    const matchedSectors = company.sectors.filter((s) => sectorNames.includes(s));
    const confidence = confidenceFromMatches(matches);
    return {
      name: company.name,
      industry: company.industry,
      why_license:
        matches > 0
          ? `Strong strategic fit with ${matchedSectors.join(", ")}; portfolio priorities and partnering behavior indicate high practical licensing relevance.`
          : `Potential fit due to adjacent market focus and openness to external innovation when time-to-market is important.`,
      confidence,
      contacts: pickContacts(company, matchedSectors, confidence),
    };
  });
}

export function generateLicensingIntelligence(
  technicalSummary: string,
  areasToAvoid: string = ""
): LicensingIntelligence {
  const summary = (technicalSummary || "").trim();
  const avoidedAreas = parseAreasToAvoid(areasToAvoid);
  const { sectors, vague } = buildSectors(summary, avoidedAreas);
  const sectorNames = sectors.map((sector) => sector.name);
  const constrained = avoidedAreas.length > 0;
  const ftoConsiderations = constrained
    ? avoidedAreas.map(
        (area) =>
          `Excluded direct overlap with "${area}" and prioritized adjacent sectors/targets less likely to create freedom-to-operate conflicts.`
      )
    : [];

  const assumptions: string[] = [];
  if (vague) {
    assumptions.push(
      "The summary is broad, so sector and company targeting is inferred from common life-science commercialization pathways.",
      "Please rewrite the summary with specific mechanism, application area, stage of development, and target end-user to improve precision."
    );
  } else {
    assumptions.push(
      "Assumes the technology is at a stage where licensing or co-development is the preferred commercialization path.",
      "Assumes no exclusive field-of-use restrictions prevent cross-sector licensing opportunities."
    );
  }
  if (constrained) {
    assumptions.push(
      "Assumes the provided FTO avoidance areas are strict constraints and should be excluded from direct targeting."
    );
  }

  return {
    technology_summary: oneSentenceTechnologySummary(summary),
    sectors,
    companies: {
      large: pickCompaniesForSize("large", sectorNames, avoidedAreas),
      mid_size: pickCompaniesForSize("mid_size", sectorNames, avoidedAreas),
      small_or_niche: pickCompaniesForSize("small_or_niche", sectorNames, avoidedAreas),
    },
    fto_considerations: ftoConsiderations,
    assumptions,
  };
}
