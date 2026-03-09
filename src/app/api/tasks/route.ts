import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
 
 
export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");

    // If a projectId is provided, filter by it. Otherwise return all tasks.
    let result;
    if (projectId) {
      result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(tasks.createdAt);
    } else {
      result = await db.select().from(tasks).orderBy(tasks.createdAt);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status = "todo", projectId, assigned_to } = body; 
 
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!["todo", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
 
    const [newTask] = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description?.trim() ?? null,
        status,
        projectId,
        assignedTo: assigned_to ?? null, 
      })
      .returning();
 
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
 
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await req.json();
    const { status } = body;
 
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }
 
    if (!["todo", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
 
    const [updated] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
 
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
 
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/tasks/:taskId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
 
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
 
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }
 
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();
 
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
 
    return NextResponse.json({ success: true, id: taskId }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/tasks/:taskId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
