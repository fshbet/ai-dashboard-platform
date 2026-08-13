export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { parseFile, buildDatasetContext } from "@/lib/fileParser";
import { dbQueries } from "@/lib/db";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["csv", "xlsx", "xls", "json"].includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload CSV, XLSX, or JSON." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dataset = await parseFile(buffer, file.name);

    const fileId = uuidv4();
    const safeFilename = `${fileId}.${ext}`;

    fs.mkdirSync(path.resolve(UPLOAD_DIR), { recursive: true });
    fs.writeFileSync(path.join(path.resolve(UPLOAD_DIR), safeFilename), buffer);

    const context = buildDatasetContext(dataset);

    dbQueries.insertFile({
      id: fileId,
      filename: safeFilename,
      original_name: file.name,
      file_type: dataset.file_type,
      file_size: file.size,
      row_count: dataset.row_count,
      columns: JSON.stringify(dataset.columns),
      dataset_context: context,
    });

    return NextResponse.json({
      file_id: fileId,
      filename: file.name,
      headers: dataset.columns,
      row_count: dataset.row_count,
      preview: dataset.sample_rows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
