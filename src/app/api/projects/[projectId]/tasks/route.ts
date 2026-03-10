import { db } from "@/lib/db";
import { projects, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Fetch project details
    const projectData = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!projectData.length) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectData[0];

    if (project.managerId !== session.userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all tasks for this project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
      },
      tasks: projectTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        assignedTo: task.assignedTo,
      })),
    });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch project tasks" },
      { status: 500 }
    );
  }
}
