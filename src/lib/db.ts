import path from "path";
import * as fs from "fs";
import { read, utils } from "xlsx";

export interface TechnologyRow {
  idf_number: string;
  created_by: string;
  technology_category: string;
  pipeline_status: string;
  deadline: string;
}

export interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
  notes: string;
}

export interface FundingOrganizationRow {
  id: string;
  organization_name: string;
  funding_type: string;
  website: string;
  headquarters: string;
  geographic_focus: string;
  mission_statement: string;
  supports_nonprofits: string;
  supports_startups: string;
  preferred_organization_type: string;
  funding_stage: string;
  typical_award_investment_size: string;
  funding_frequency: string;
  annual_budget_fund_size: string;
  equity_or_non_dilutive: string;
  why_they_are_a_good_fit: string;
  relevant_portfolio_companies_or_grantees: string;
  previous_nonprofit_partnerships: string;
  previous_university_partnerships: string;
  recent_awards_or_investments: string;
  key_contact: string;
  contact_title: string;
  email: string;
  phone: string;
  linkedin_profile: string;
  existing_relationship: string;
  warm_introduction_source: string;
  application_type: string;
  application_deadline: string;
  required_materials: string;
  date_contacted: string;
  last_communication: string;
  next_follow_up: string;
  status: string;
  probability_of_success: string;
  priority: string;
  notes: string;
  deadline_sort_key: string;
  priority_sort_key: string;
}

const DATA_FOLDER_PATH = path.resolve(
  process.env.LOCAL_DATA_FOLDER_PATH ||
    process.env.ONEDRIVE_FOLDER_PATH ||
    path.join(process.cwd(), "src", "data")
);

const IDF_DATA_FILE = process.env.IDF_DATA_FILE || "sanitized-idf-database.csv";
const PATENT_DATA_FILE = process.env.PATENT_DATA_FILE || "sanitized-patents-database.csv";
const FUNDING_DATA_FILE = process.env.FUNDING_DATA_FILE || "Terasaki Institute Funding CRM.xlsx";

function toText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date) return value.toISOString();
  return "";
}

function readWorksheetMatrix(fileName: string): unknown[][] {
  const fullPath = path.join(DATA_FOLDER_PATH, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Data file not found: ${fullPath}`);
  }

  const buffer = fs.readFileSync(fullPath);
  const workbook = read(buffer, { type: "buffer", raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`No worksheet found in data file: ${fullPath}`);
  }

  const sheet = workbook.Sheets[firstSheetName];
  return utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

function buildHeaders(row: unknown[]): string[] {
  const usedHeaders = new Map<string, number>();
  return row.map((value, index) => {
    const baseHeader = toText(value) || `column_${index}`;
    const currentCount = usedHeaders.get(baseHeader) || 0;
    usedHeaders.set(baseHeader, currentCount + 1);
    return currentCount === 0 ? baseHeader : `${baseHeader}_${currentCount}`;
  });
}

function readRowsWithHeaderRow(fileName: string, headerRowIndex = 0): Record<string, unknown>[] {
  const matrix = readWorksheetMatrix(fileName);
  const headerRow = matrix[headerRowIndex];
  if (!headerRow) {
    throw new Error(`Header row ${headerRowIndex + 1} not found in data file: ${fileName}`);
  }

  const headers = buildHeaders(headerRow);
  return matrix
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((value) => toText(value) || typeof value === "number"))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))
    );
}

function readTabularRows(fileName: string): Record<string, unknown>[] {
  return readRowsWithHeaderRow(fileName, 0);
}

function getFirstValue(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = toText(row[key]);
    if (value) return value;
  }
  return "";
}

function getDataFileLastUpdated(fileName: string): string | null {
  const fullPath = path.join(DATA_FOLDER_PATH, fileName);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  return stats.mtime.toISOString();
}

export function getFundingDataSourceInfo(): { fileName: string; lastUpdated: string | null } {
  return {
    fileName: FUNDING_DATA_FILE,
    lastUpdated: getDataFileLastUpdated(FUNDING_DATA_FILE),
  };
}

export function getIdfDataSourceInfo(): { fileName: string; lastUpdated: string | null } {
  return {
    fileName: IDF_DATA_FILE,
    lastUpdated: getDataFileLastUpdated(IDF_DATA_FILE),
  };
}

export function getPatentDataSourceInfo(): { fileName: string; lastUpdated: string | null } {
  return {
    fileName: PATENT_DATA_FILE,
    lastUpdated: getDataFileLastUpdated(PATENT_DATA_FILE),
  };
}

export function getTechnologies(): TechnologyRow[] {
  const rows = readTabularRows(IDF_DATA_FILE);
  return rows
    .map((row) => ({
      idf_number: getFirstValue(row, ["IDF Number", "IDF Number ", "idf_number"]),
      created_by: getFirstValue(row, ["Created By", "created_by"]),
      technology_category: getFirstValue(row, [
        "Technology Category",
        "Technology Category ",
        "technology_category",
      ]),
      pipeline_status: getFirstValue(row, ["Pipeline Status", "pipeline_status"]),
      deadline: getFirstValue(row, ["Deadline", "deadline"]),
    }))
    .filter((row) => row.idf_number || row.created_by || row.technology_category);
}

export interface PatentRow {
  patent_number: string;
  tibi_id: string;
  inventor: string;
  technology_category: string;
  status: string;
  licensing_status: string;
  notes: string;
}

export function getPatents(): PatentRow[] {
  const rows = readTabularRows(PATENT_DATA_FILE);
  return rows
    .map((row) => ({
      patent_number: getFirstValue(row, ["Docket No.", "docket_no", "patent_number"]),
      tibi_id: getFirstValue(row, ["TIBI ID No.", "tibi_id"]),
      inventor: getFirstValue(row, ["Inventor", "inventor"]),
      technology_category: getFirstValue(row, ["Subject matter", "Technology Category", "technology_category"]),
      status: getFirstValue(row, ["Status", "status"]),
      licensing_status: getFirstValue(row, ["Licensing Status", "licensing_status"]),
      notes: getFirstValue(row, ["Deadlines", "deadlines", "notes"]),
    }))
    .filter((row) => row.patent_number || row.technology_category || row.status);
}

export function getFundingOrganizations(): FundingOrganizationRow[] {
  const rows = readRowsWithHeaderRow(FUNDING_DATA_FILE, 1);
  return rows
    .map((row) => ({
      id: getFirstValue(row, ["ID"]),
      organization_name: getFirstValue(row, ["Organization Name"]),
      funding_type: getFirstValue(row, ["Funding Type"]),
      website: getFirstValue(row, ["Website"]),
      headquarters: getFirstValue(row, ["Headquarters"]),
      geographic_focus: getFirstValue(row, ["Geographic Focus"]),
      mission_statement: getFirstValue(row, ["Mission Statement"]),
      supports_nonprofits: getFirstValue(row, ["Supports Nonprofits?"]),
      supports_startups: getFirstValue(row, ["Supports Startups?"]),
      preferred_organization_type: getFirstValue(row, ["Preferred Organization Type"]),
      funding_stage: getFirstValue(row, ["Funding Stage"]),
      typical_award_investment_size: getFirstValue(row, ["Typical Award/Investment Size ($)"]),
      funding_frequency: getFirstValue(row, ["Funding Frequency"]),
      annual_budget_fund_size: getFirstValue(row, ["Annual Budget/Fund Size"]),
      equity_or_non_dilutive: getFirstValue(row, ["Equity or Non-Dilutive"]),
      why_they_are_a_good_fit: getFirstValue(row, ["Why They're a Good Fit"]),
      relevant_portfolio_companies_or_grantees: getFirstValue(row, [
        "Relevant Portfolio Companies / Grantees",
      ]),
      previous_nonprofit_partnerships: getFirstValue(row, [
        "Previous Non-profit Partnerships",
      ]),
      previous_university_partnerships: getFirstValue(row, [
        "Previous University Partnerships",
      ]),
      recent_awards_or_investments: getFirstValue(row, ["Recent Awards or Investments"]),
      key_contact: getFirstValue(row, ["Key Contact"]),
      contact_title: getFirstValue(row, ["Title"]),
      email: getFirstValue(row, ["Email"]),
      phone: getFirstValue(row, ["Phone"]),
      linkedin_profile: getFirstValue(row, ["LinkedIn / Profile"]),
      existing_relationship: getFirstValue(row, ["Existing Relationship"]),
      warm_introduction_source: getFirstValue(row, ["Warm Introduction Source"]),
      application_type: getFirstValue(row, ["Application Type"]),
      application_deadline: getFirstValue(row, ["Application Deadline"]),
      required_materials: getFirstValue(row, ["Required Materials"]),
      date_contacted: getFirstValue(row, ["Date Contacted"]),
      last_communication: getFirstValue(row, ["Last Communication"]),
      next_follow_up: getFirstValue(row, ["Next Follow-up"]),
      status: getFirstValue(row, ["Status"]),
      probability_of_success: getFirstValue(row, ["Probability of Success (1-5)"]),
      priority: getFirstValue(row, ["Priority"]),
      notes: getFirstValue(row, ["Notes"]),
      deadline_sort_key: getFirstValue(row, ["DeadlineSortKey"]),
      priority_sort_key: getFirstValue(row, ["PrioritySortKey"]),
    }))
    .filter((row) => row.id || row.organization_name || row.funding_type || row.why_they_are_a_good_fit);
}
