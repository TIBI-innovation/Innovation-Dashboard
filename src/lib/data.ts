export interface OverviewStat {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: string;
}

export interface Patent {
  id: string;
  title: string;
  inventors: string[];
  status: "granted" | "pending" | "provisional" | "expired";
  filedDate: string;
  patentNumber?: string;
}

export interface Disclosure {
  id: string;
  title: string;
  inventor: string;
  status: "new" | "in_review" | "approved" | "filed";
  submittedDate: string;
}

export interface Startup {
  id: string;
  name: string;
  founder: string;
  technology: string;
  stage: "idea" | "seed" | "growth";
  foundedDate: string;
}

export interface License {
  id: string;
  technology: string;
  licensee: string;
  status: "active" | "negotiating" | "completed";
  signedDate?: string;
}

export const overviewStats: OverviewStat[] = [
  { label: "Total Patents", value: 47, change: 12, changeLabel: "vs last year", icon: "FileText" },
  { label: "Pending Disclosures", value: 18, change: -3, changeLabel: "vs last quarter", icon: "Lightbulb" },
  { label: "Active Startups", value: 9, change: 2, changeLabel: "vs last year", icon: "Building2" },
  { label: "Licensed Technologies", value: 31, change: 8, changeLabel: "vs last year", icon: "Key" },
];

export const patents: Patent[] = [
  {
    id: "P-001",
    title: "Novel nanoparticle drug delivery system",
    inventors: ["Dr. Sarah Chen", "Prof. Michael Wong"],
    status: "granted",
    filedDate: "2022-03-15",
    patentNumber: "US-11,234,567",
  },
  {
    id: "P-002",
    title: "Quantum error correction algorithm",
    inventors: ["Dr. James Patel"],
    status: "pending",
    filedDate: "2024-01-10",
  },
  {
    id: "P-003",
    title: "Biodegradable microfluidic sensor array",
    inventors: ["Prof. Emily Rodriguez", "Dr. Alex Kim", "Dr. Lisa Park"],
    status: "granted",
    filedDate: "2021-11-22",
    patentNumber: "US-11,098,765",
  },
  {
    id: "P-004",
    title: "AI-powered structural health monitoring system",
    inventors: ["Dr. Robert Tanaka", "Prof. Sarah Chen"],
    status: "provisional",
    filedDate: "2024-06-01",
  },
  {
    id: "P-005",
    title: "Low-power edge computing architecture for IoT",
    inventors: ["Prof. Michael Wong"],
    status: "granted",
    filedDate: "2020-09-14",
    patentNumber: "US-10,987,654",
  },
];

export const disclosures: Disclosure[] = [
  {
    id: "D-001",
    title: "Self-healing polymer coatings for biomedical implants",
    inventor: "Dr. Sarah Chen",
    status: "in_review",
    submittedDate: "2024-09-12",
  },
  {
    id: "D-002",
    title: "Blockchain-verified credentialing system",
    inventor: "Dr. James Patel",
    status: "new",
    submittedDate: "2024-10-28",
  },
  {
    id: "D-003",
    title: "Wearable haptic feedback device for rehabilitation",
    inventor: "Dr. Lisa Park",
    status: "approved",
    submittedDate: "2024-08-05",
  },
  {
    id: "D-004",
    title: "Carbon-negative concrete using recycled aggregates",
    inventor: "Prof. Emily Rodriguez",
    status: "filed",
    submittedDate: "2024-06-19",
  },
];

export const startups: Startup[] = [
  {
    id: "S-001",
    name: "NanoTherapeutics Inc.",
    founder: "Dr. Sarah Chen",
    technology: "Nanoparticle drug delivery",
    stage: "seed",
    foundedDate: "2023-08-01",
  },
  {
    id: "S-002",
    name: "QuantumDefense Labs",
    founder: "Dr. James Patel",
    technology: "Quantum error correction",
    stage: "idea",
    foundedDate: "2024-05-15",
  },
  {
    id: "S-003",
    name: "MicroFlow Diagnostics",
    founder: "Prof. Emily Rodriguez",
    technology: "Microfluidic sensors",
    stage: "growth",
    foundedDate: "2022-02-10",
  },
  {
    id: "S-004",
    name: "StructAI",
    founder: "Dr. Robert Tanaka",
    technology: "AI structural monitoring",
    stage: "seed",
    foundedDate: "2024-01-20",
  },
  {
    id: "S-005",
    name: "EdgeCore Systems",
    founder: "Prof. Michael Wong",
    technology: "Edge computing architecture",
    stage: "growth",
    foundedDate: "2021-06-01",
  },
];

export const licenses: License[] = [
  {
    id: "L-001",
    technology: "Nanoparticle drug delivery system",
    licensee: "PharmaCore Inc.",
    status: "active",
    signedDate: "2023-04-15",
  },
  {
    id: "L-002",
    technology: "Quantum error correction algorithm",
    licensee: "Quantum Computing Corp.",
    status: "negotiating",
  },
  {
    id: "L-003",
    technology: "Biodegradable microfluidic sensor array",
    licensee: "BioSense Medical",
    status: "active",
    signedDate: "2022-09-01",
  },
  {
    id: "L-004",
    technology: "Low-power edge computing architecture",
    licensee: "IoT Solutions Ltd.",
    status: "completed",
    signedDate: "2021-12-10",
  },
  {
    id: "L-005",
    technology: "AI-powered structural health monitoring",
    licensee: "InfraTech Engineering",
    status: "negotiating",
  },
];

// --- IDF Seed Data (placeholder / mock only) ---

export interface IDFSeedRecord {
  idf_id: string;
  title: string;
  inventor_names: string[];
  department: string;
  date_submitted: string;
  status: string;
  abstract: string;
  tech_area: string;
}

import seedData from "@/data/idf_seed_data.json";

export function getIDFSeeds(): IDFSeedRecord[] {
  return seedData as IDFSeedRecord[];
}
