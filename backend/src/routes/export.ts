import { Router, Request, Response } from "express";
import { dashboardQueries } from "../models/database";

const router = Router();

router.get("/:id", (req: Request, res: Response) => {
  const row = dashboardQueries.findById.get(req.params.id) as
    | { spec: string; status: string; domain: string }
    | undefined;

  if (!row) return res.status(404).json({ error: "Dashboard not found" });
  if (row.status !== "ready") return res.status(400).json({ error: "Dashboard is not ready for export" });

  const filename = `dashboard_${row.domain.replace(/\s+/g, "_").toLowerCase()}_${req.params.id.slice(0, 8)}.json`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(row.spec);
});

export default router;
