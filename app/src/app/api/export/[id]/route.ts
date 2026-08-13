export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbQueries } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const record = dbQueries.findDashboard(params.id);

  if (!record || record.status !== "ready" || !record.spec) {
    return NextResponse.json({ error: "Dashboard not ready" }, { status: 404 });
  }

  return new NextResponse(record.spec as string, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dashboard-${params.id}.json"`,
    },
  });
}
