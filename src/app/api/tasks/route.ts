import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = Number(searchParams.get("projectId"));

    if (!projectId) {
      return NextResponse.json({ error: "Project ID missing" }, { status: 400 });
    }

    const data = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    
    const body = await req.json();

    const inserted = await db
      .insert(tasks)
      .values({
        title: body.title,
        description: body.description,
        assignedTo: body.assignedTo,
        deadline: body.deadline,
        priority: body.priority,
        status: body.status || "Todo",
        projectId: body.projectId,
      })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error("POST task error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
