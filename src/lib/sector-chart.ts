export interface SectorCount {
  sector: string;
  count: number;
}

export const SECTOR_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1",
  "#84CC16", "#A855F7",
];

export function getSectorColor(sector: string, allSectors: string[]): string {
  const idx = allSectors.indexOf(sector);
  return SECTOR_COLORS[idx % SECTOR_COLORS.length];
}

/**
 * A record can belong to more than one sector — separate multiple categories
 * in the source spreadsheet with a semicolon (e.g. "Biomaterial development; Treatments").
 * Each sector listed gets its own +1, so one record can count toward several bars.
 */
export function buildSectorCounts(records: { technology_category: string }[]): SectorCount[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const raw = (r.technology_category || "").trim();
    const parts = raw ? raw.split(";").map((p) => p.trim()).filter(Boolean) : [];
    const categories = parts.length > 0 ? parts : ["(uncategorized)"];
    for (const cat of categories) {
      map.set(cat, (map.get(cat) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);
}
