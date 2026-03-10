import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { Project } from "@/db/schema";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { redirect } from "next/navigation";

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

  return (
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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


