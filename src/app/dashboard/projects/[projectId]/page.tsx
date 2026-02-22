// src/app/dashboard/projects/[id]/page.tsx
import { db } from "@/lib/db";
import { projects, tasks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);

  // SSR: Fetch project details and task stats in a single query
  const projectData = await db
    .select({
      id: projects.id,
      name: projects.name,
      totalTasks: sql<number>`count(${tasks.id})`,
      completedTasks: sql<number>`count(case when ${tasks.status} = 'Done' then 1 end)`,
    })
    .from(projects)
    .leftJoin(tasks, eq(projects.id, tasks.projectId))
    .where(eq(projects.id, projectId))
    .groupBy(projects.id);

  const project = projectData[0];
  if (!project) notFound();

  const progress = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2">{project.name}</h1>
        <div className="flex items-center gap-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-bold">{progress}% Complete</span>
        </div>
      </header>
      
      {/* Member 4's Task List Component would go here */}
    </div>
  );
}