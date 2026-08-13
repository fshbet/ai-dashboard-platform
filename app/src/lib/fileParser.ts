import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedDataset } from "./types";

export function detectFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "json") return "json";
  return "unknown";
}

export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<ParsedDataset> {
  const fileType = detectFileType(filename);

  if (fileType === "csv") return parseCsv(buffer, filename);
  if (fileType === "xlsx") return parseXlsx(buffer, filename);
  if (fileType === "json") return parseJson(buffer, filename);

  throw new Error(`Unsupported file type: ${fileType}`);
}

function parseCsv(buffer: Buffer, filename: string): ParsedDataset {
  const text = buffer.toString("utf-8").replace(/^﻿/, "");
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  const rows = result.data as Record<string, unknown>[];
  return buildDataset(rows, filename, "csv");
}

function parseXlsx(buffer: Buffer, filename: string): ParsedDataset {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<
    string,
    unknown
  >[];
  return buildDataset(rows, filename, "xlsx");
}

function parseJson(buffer: Buffer, filename: string): ParsedDataset {
  const text = buffer.toString("utf-8");
  let data: unknown = JSON.parse(text);

  if (!Array.isArray(data)) {
    const keys = Object.keys(data as object);
    for (const key of keys) {
      if (Array.isArray((data as Record<string, unknown>)[key])) {
        data = (data as Record<string, unknown>)[key];
        break;
      }
    }
  }

  if (!Array.isArray(data)) throw new Error("JSON must contain an array of records");

  return buildDataset(data as Record<string, unknown>[], filename, "json");
}

function buildDataset(
  rows: Record<string, unknown>[],
  filename: string,
  file_type: string
): ParsedDataset {
  if (rows.length === 0) throw new Error("File contains no data rows");

  const columns = Object.keys(rows[0]);
  const sample_rows = rows.slice(0, 5);

  const numeric_columns: string[] = [];
  const categorical_columns: string[] = [];
  const date_columns: string[] = [];

  for (const col of columns) {
    const vals = rows
      .slice(0, 50)
      .map((r) => r[col])
      .filter((v) => v != null);

    if (vals.every((v) => v instanceof Date)) {
      date_columns.push(col);
    } else if (
      vals.filter((v) => typeof v === "number").length > vals.length * 0.8
    ) {
      numeric_columns.push(col);
    } else if (
      typeof vals[0] === "string" &&
      vals[0].match(/^\d{4}-\d{2}-\d{2}/)
    ) {
      date_columns.push(col);
    } else {
      categorical_columns.push(col);
    }
  }

  return {
    filename,
    file_type,
    columns,
    row_count: rows.length,
    sample_rows,
    numeric_columns,
    categorical_columns,
    date_columns,
  };
}

export function buildDatasetContext(dataset: ParsedDataset): string {
  return JSON.stringify({
    domain: "unknown",
    columns: dataset.columns,
    numeric_columns: dataset.numeric_columns,
    categorical_columns: dataset.categorical_columns,
    date_columns: dataset.date_columns,
    row_count: dataset.row_count,
    sample_rows: dataset.sample_rows,
  });
}
