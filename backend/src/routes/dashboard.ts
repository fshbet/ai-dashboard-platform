import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { fileQueries, dashboardQueries } from "../models/database";
import { parseFile, detectFileType } from "../services/fileParser";
import { orchestrateDashboardGeneration } from "../services/n8nOrchestrator";
import { GenerationRequest, Theme } from "../types";

const router = Router();

// POST /api/dashboard/generate
router.post("/generate", async (req: Request, res: Response) => {
  const { domain, dataset_description, business_goal, theme, file_id } = req.body as GenerationRequest;

  if (!domain || !business_goal || !file_id) {
    return res.status(400).json({ error: "Required: domain, business_goal, file_id" });
  }

  const fileRow = fileQueries.findById.get(file_id) as
    | { file_path: string; filename: string; file_type: string; headers: string }
    | undefined;

  if (!fileRow) return res.status(404).json({ error: `File not found: ${file_id}` });

  const dashboardId = uuidv4();

  dashboardQueries.insert.run({
    dashboard_id: dashboardId,
    file_id,
    domain,
    business_goal,
    theme: (theme as Theme) || "modern",
    spec: "{}",
    status: "processing",
  });

  // Return immediately — generation runs async
  res.status(202).json({ dashboard_id: dashboardId, status: "processing" });

  (async () => {
    try {
      const fileType = detectFileType(fileRow.filename);
      const parsed = parseFile(fileRow.file_path, fileType);

      const spec = await orchestrateDashboardGeneration(dashboardId, {
        domain,
        dataset_description: dataset_description || "",
        business_goal,
        theme: (theme as Theme) || "modern",
        file_id,
      }, parsed);

      dashboardQueries.updateSpec.run({
        dashboard_id: dashboardId,
        spec: JSON.stringify(spec),
        status: "ready",
      });
    } catch (err) {
      dashboardQueries.updateError.run({
        dashboard_id: dashboardId,
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  })();
});

// GET /api/dashboard/:id
router.get("/:id", (req: Request, res: Response) => {
  const row = dashboardQueries.findById.get(req.params.id) as
    | { spec: string; status: string; error: string | null }
    | undefined;

  if (!row) return res.status(404).json({ error: "Dashboard not found" });
  if (row.status === "processing") return res.status(202).json({ status: "processing" });
  if (row.status === "error") return res.status(500).json({ status: "error", error: row.error });

  try {
    return res.json({ status: "ready", spec: JSON.parse(row.spec) });
  } catch {
    return res.status(500).json({ error: "Failed to parse dashboard spec" });
  }
});

// GET /api/dashboards
router.get("/", (_req: Request, res: Response) => {
  return res.json(dashboardQueries.listAll.all());
});

export default router;
