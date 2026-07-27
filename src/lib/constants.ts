/**
 * File path constants for easy reference throughout the app
 * All paths are relative to ONEDRIVE_FOLDER_PATH
 */

export const FILE_PATHS = {
  // CSV Data Files
  IDF_DATABASE: "sanitized-idf-database.csv",
  PATENTS_DATABASE: "sanitized-patents-database.csv",

  // Folders
  IDF_ASSESSMENTS: "Patentability Assessments (Dashboard Access)",
  PATENTS_FOLDER: "PATENTS at TIBI",
  FAKE_DATA_FOLDER: "Fake data for AI tool POC",

  // Documents
  IP_ASSESSMENT: "IP and Patent AI Tool Assessment.pptx",
  PROTOCOL: "Potential SCOBY-Art Protocol.docx",
  TIMELINE: "Proposed Timeline Jun 2026.docx",
} as const;

/**
 * Data structure for IDF records
 */
export interface IDFRecord {
  [key: string]: string | undefined;
  idf_number?: string;
  created_by?: string;
  technology_category?: string;
  status?: string;
}

/**
 * Data structure for Patent records
 */
export interface PatentRecord {
  [key: string]: string | undefined;
  patent_number?: string;
  technology_category?: string;
  status?: string;
  filing_date?: string;
}

/**
 * File listing with metadata
 */
export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

/**
 * OneDrive entry (from API)
 */
export interface OneDriveEntry {
  name: string;
  relativePath: string;
  modifiedAt: string;
  isDirectory: boolean;
  size: number;
}
