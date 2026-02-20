import { NextResponse } from "next/server";
import { db } from "../../../db";
import { tasks } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    const result = projectId
      ? await db.select().from(tasks).where(eq(tasks.projectId, projectId))
      : await db.select().from(tasks);

    const rows = result.map((row) => {
      const sanitizedEntries = Object.entries(row).map(([key, value]) => {
        if (typeof value === "bigint") return [key, value.toString()];
        if (value instanceof Date) return [key, value.toISOString()];
        return [key, value];
      });
      return Object.fromEntries(sanitizedEntries);
    });

    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch tasks", detail: message }, { status: 500 });
  }
}
