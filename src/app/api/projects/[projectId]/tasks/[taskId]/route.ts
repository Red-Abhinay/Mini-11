import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { syncProjectStatusFromTasks } from "@/lib/project-status";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const { projectId, taskId } = await params;

  const result = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  if (!result.length) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const { projectId, taskId } = await params;
  const body = await req.json();

  await db
    .update(tasks)
    .set({
      title: body.title,
      description: body.description,
      status: body.status,
    })
    .where(eq(tasks.id, taskId));

  await syncProjectStatusFromTasks(projectId);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const { projectId, taskId } = await params;

  await db.delete(tasks).where(eq(tasks.id, taskId));

  await syncProjectStatusFromTasks(projectId);

  return NextResponse.json({ success: true });
}
