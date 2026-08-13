import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { upload } from "../middleware/upload";
import { parseFile, detectFileType } from "../services/fileParser";
import { fileQueries } from "../models/database";

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileType = detectFileType(req.file.originalname);
    const parsed = parseFile(req.file.path, fileType);

    if (parsed.rowCount === 0) return res.status(400).json({ error: "File contains no data rows" });
    if (parsed.headers.length === 0) return res.status(400).json({ error: "Could not detect column headers" });

    const fileId = uuidv4();
    const preview = parsed.rows.slice(0, 5);

    fileQueries.insert.run({
      file_id: fileId,
      filename: req.file.originalname,
      file_type: fileType,
      file_path: req.file.path,
      headers: JSON.stringify(parsed.headers),
      row_count: parsed.rowCount,
      file_size: parsed.fileSizeBytes,
      preview: JSON.stringify(preview),
    });

    return res.status(201).json({
      file_id: fileId,
      filename: req.file.originalname,
      headers: parsed.headers,
      row_count: parsed.rowCount,
      preview,
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

export default router;
