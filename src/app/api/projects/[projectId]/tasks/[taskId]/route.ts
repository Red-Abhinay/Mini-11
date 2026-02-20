import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const projectId = Number(params.projectId);
  const taskId = Number(params.taskId);

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
  { params }: { params: { projectId: string; taskId: string } }
) {
  const taskId = Number(params.taskId);
  const body = await req.json();

  await db
    .update(tasks)
    .set({
      title: body.title,
      description: body.description,
      assignedTo: body.assignedTo,
      deadline: body.deadline,
      priority: body.priority,
    })
    .where(eq(tasks.id, taskId));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  const taskId = Number(params.taskId);

  await db.delete(tasks).where(eq(tasks.id, taskId));

  return NextResponse.json({ success: true });
}
