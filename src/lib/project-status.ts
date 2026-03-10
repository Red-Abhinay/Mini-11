import { db } from "@/lib/db";
import { projects, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

type ProjectDerivedStatus = "planning" | "in_progress" | "completed";

function deriveProjectStatus(taskStatuses: string[]): ProjectDerivedStatus {
  if (taskStatuses.length === 0) {
    return "planning";
  }

  const allDone = taskStatuses.every((status) => status === "done");
  if (allDone) {
    return "completed";
  }

  const hasStartedTask = taskStatuses.some(
    (status) => status === "in_progress" || status === "done"
  );

  return hasStartedTask ? "in_progress" : "planning";
}

export async function syncProjectStatusFromTasks(projectId: string) {
  const projectTasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const nextStatus = deriveProjectStatus(
    projectTasks.map((task) => String(task.status))
  );

  await db
    .update(projects)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}
