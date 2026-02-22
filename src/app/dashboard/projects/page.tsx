// src/app/dashboard/projects/page.tsx
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // Example session helper
import { Project } from "@/db/schema"

export default async function ProjectsPage() {
  // SSR: Fetching data directly on the server
  const session = await getServerSession(); 
  if (!session || !session.user) {
    redirect("/login");
  }
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.managerId, session.user.id));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map((project:Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}


