export interface LicensingTarget {
  companyName: string;
  companySize: string;
  fitPercentage: number;
  strategicFit: string;
  decisionMakerRoles: string[];
}

export interface LicensingReportData {
  oneSentenceSummary: string;
  targetSectors: string[];
  licensingTargets: LicensingTarget[];
  assumptions: string[];
  aiGeneratedDisclaimer: string;
}

export interface LicensingDraft {
  technicalSummary: string;
  ftoConstraints: string;
  reportData: LicensingReportData;
  savedAt: string;
}

const STORAGE_KEY = "licensingCenterDraft";

/**
 * The dashboard has no backend database -- this is how the Licensing Center's
 * generated report hands off to the "Build Patentability Assessment" builder
 * on the Reports page without a server round-trip.
 */
export function saveLicensingDraft(draft: Omit<LicensingDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  const withTimestamp: LicensingDraft = { ...draft, savedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
}

export function loadLicensingDraft(): LicensingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LicensingDraft;
  } catch {
    return null;
  }
}
