import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Project } from "@/db/schema"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

export default async function ProjectsPage() {
  const session = await getServerSession(); 
  // if (!session || !session.user) {
  //   redirect("/login");
  // }


  // FOR TESTING: 
  const testUserId = session?.user?.id || "proj-mgr-1";

  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.managerId, testUserId));
  return (

      <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <CreateProjectModal /> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map((project:Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}


