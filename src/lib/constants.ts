/**
 * File path constants for easy reference throughout the app
 * All paths are relative to ONEDRIVE_FOLDER_PATH
 */

export const FILE_PATHS = {
  // Folders
  IDF_ASSESSMENTS: "Dashboard Files/Patentability Assessments (Dashboard Access)",
  IDF_ASSESSMENTS_TEMPLATE_FOLDER: "Dashboard Files/Patentability Assessments (Dashboard Access)",
  IDF_ASSESSMENTS_TEMPLATE: "Dashboard Files/Patentability Assessments (Dashboard Access)/General Patentability Assessment IDFX.docx",
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
