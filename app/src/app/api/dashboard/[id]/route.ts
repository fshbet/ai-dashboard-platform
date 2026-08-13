export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbQueries } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const record = dbQueries.findDashboard(params.id);

  if (!record) {
    return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
  }

  if (record.status === "ready" && record.spec) {
    const spec = JSON.parse(record.spec as string);
    return NextResponse.json({ status: "ready", spec });
  }

  if (record.status === "error") {
    return NextResponse.json(
      { status: "error", error: record.error_message },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: record.status });
}
