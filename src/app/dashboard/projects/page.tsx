import { db } from "@/lib/db";
import { projects, tasks, users } from "@/db/schema";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { Project } from "@/db/schema";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { redirect } from "next/navigation";
import ManagerSidebar from "@/components/ManagerSidebar";

export default async function ProjectsPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "manager") {
    redirect("/dashboard/employee");
  }

  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.managerId, session.userId));

  const managerRows = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const managerName =
    managerRows[0]?.name ||
    session.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const progressByProject = new Map<string, number>();
  if (allProjects.length > 0) {
    const projectIds = allProjects.map((project) => project.id);
    const projectTasks = await db
      .select({ projectId: tasks.projectId, status: tasks.status })
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds));

    const taskStats = new Map<string, { total: number; done: number }>();
    for (const projectId of projectIds) {
      taskStats.set(projectId, { total: 0, done: 0 });
    }

    for (const task of projectTasks) {
      const current = taskStats.get(task.projectId) || { total: 0, done: 0 };
      current.total += 1;
      if (task.status === "done") {
        current.done += 1;
      }
      taskStats.set(task.projectId, current);
    }

    for (const [projectId, stats] of taskStats.entries()) {
      const completion = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
      progressByProject.set(projectId, completion);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <ManagerSidebar />

      <main className="flex flex-1 flex-col">
        <div className="projects-page">
          <div className="kanban-shell projects-shell">
            <header className="kanban-header">
              <div>
                <p className="kanban-eyebrow">Portfolio view</p>
                <h1>Your Projects</h1>
                <p className="kanban-subtitle">
                  Track project health, ownership, and progress at a glance.
                </p>
              </div>
              <div className="kanban-controls">
                <CreateProjectModal />
              </div>
            </header>

            {allProjects.length === 0 ? (
              <div className="projects-empty">
                No projects yet. Create your first project to get started.
              </div>
            ) : (
              <div className="projects-grid">
                {allProjects.map((project: Project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    managerName={managerName}
                    progress={progressByProject.get(project.id) ?? 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


