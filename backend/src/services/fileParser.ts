import fs from "fs";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ParsedDataset, FileType } from "../types";

export function parseFile(filePath: string, fileType: FileType): ParsedDataset {
  const fileSizeBytes = fs.statSync(filePath).size;
  switch (fileType) {
    case "csv":  return parseCSV(filePath, fileSizeBytes);
    case "xlsx": return parseXLSX(filePath, fileSizeBytes);
    case "json": return parseJSON(filePath, fileSizeBytes);
    default:     throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function parseCSV(filePath: string, fileSizeBytes: number): ParsedDataset {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }
  const headers = result.meta.fields || [];
  return { headers, rows: result.data, rowCount: result.data.length, fileType: "csv", fileSizeBytes };
}

function parseXLSX(filePath: string, fileSizeBytes: number): ParsedDataset {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null, raw: false });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows, rowCount: rows.length, fileType: "xlsx", fileSizeBytes };
}

function parseJSON(filePath: string, fileSizeBytes: number): ParsedDataset {
  const data: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let rows: Record<string, unknown>[];
  if (Array.isArray(data)) {
    rows = data as Record<string, unknown>[];
  } else if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const arrayKey = Object.keys(obj).find((k) => Array.isArray(obj[k]));
    if (!arrayKey) throw new Error("JSON must contain an array or { data: [...] } structure");
    rows = obj[arrayKey] as Record<string, unknown>[];
  } else {
    throw new Error("Invalid JSON structure");
  }
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows, rowCount: rows.length, fileType: "json", fileSizeBytes };
}

export function detectFileType(originalName: string): FileType {
  const ext = originalName.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "json") return "json";
  throw new Error(`Unsupported file extension: .${ext}`);
}

export function buildDatasetContext(
  parsed: ParsedDataset,
  description: string,
  domain: string,
  maxRows = 5
): string {
  return JSON.stringify({
    domain,
    description,
    columns: parsed.headers,
    row_count: parsed.rowCount,
    sample_rows: parsed.rows.slice(0, maxRows),
  });
}
