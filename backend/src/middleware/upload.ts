import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const allowed = [".csv", ".xlsx", ".xls", ".json"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed: ${allowed.join(", ")}`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
