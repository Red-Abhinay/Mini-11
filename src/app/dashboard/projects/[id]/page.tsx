import { db } from "@/lib/db";
import { projects, tasks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ProjectDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: projectId } = await params;

  const projectData = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
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
        <h1 className="text-4xl font-extrabold mb-2 text-white-900">{project.name}</h1>
        
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          {project.description || "No description provided for this project."}
        </p>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-bold text-slate-700 whitespace-nowrap">{progress}% Complete</span>
        </div>
      </header>
      
      {/* Member 4's Task List Component */}
      <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white-800">Tasks</h2>
      </div>
    </div>
  );
}