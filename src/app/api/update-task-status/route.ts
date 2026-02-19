import { NextResponse } from "next/server";
import { db } from "../../../db";
import { tasks } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { id, status } = (await request.json()) as {
      id?: string;
      status?: string;
    };

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updated = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();

    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to update status", detail: message }, { status: 500 });
  }
}
