import { NextResponse } from "next/server";
import { prisma } from "@fameworld/db";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe: checks database connectivity. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", db: "down" }, { status: 503 });
  }
}
