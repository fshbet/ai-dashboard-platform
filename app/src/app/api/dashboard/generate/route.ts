export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { dbQueries } from "@/lib/db";
import { orchestrateDashboardGeneration } from "@/lib/n8nOrchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_id, domain, description, business_goal, theme } = body;

    if (!file_id || !domain || !business_goal) {
      return NextResponse.json(
        { error: "file_id, domain, and business_goal are required" },
        { status: 400 }
      );
    }

    const fileRecord = dbQueries.findFile(file_id);
    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const dashboardId = uuidv4();

    dbQueries.insertDashboard({
      id: dashboardId,
      file_id,
      domain,
      business_goal,
      theme: theme || "modern",
    });

    const columns: string[] = JSON.parse((fileRecord.columns as string) || "[]");
    const datasetContext = (fileRecord.dataset_context as string) || "{}";

    (async () => {
      try {
        const spec = await orchestrateDashboardGeneration({
          dashboard_id: dashboardId,
          domain,
          business_goal,
          dataset_description: description || `${domain} dataset with ${fileRecord.row_count} rows`,
          dataset_context: datasetContext,
          columns,
          row_count: fileRecord.row_count as number,
          theme: theme || "modern",
        });

        dbQueries.updateDashboard({
          id: dashboardId,
          status: "ready",
          spec: JSON.stringify(spec),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        dbQueries.updateDashboard({
          id: dashboardId,
          status: "error",
          error_message: message,
        });
      }
    })();

    return NextResponse.json(
      { dashboard_id: dashboardId, status: "processing" },
      { status: 202 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
