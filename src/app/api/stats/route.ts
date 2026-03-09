import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, projects, tasks, projectMembers } from "@/lib/schema";
import { eq, count, sql } from "drizzle-orm";

// GET /api/stats - Get dashboard statistics (Manager only)
export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only managers can view statistics
    if (session.role !== "manager") {
      return NextResponse.json(
        { error: "Forbidden: Manager access required" },
        { status: 403 }
      );
    }

    // Get user statistics
    const userStats = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    // Get project statistics by status
    const projectStats = await db
      .select({
        status: projects.status,
        count: count(),
      })
      .from(projects)
      .groupBy(projects.status);

    // Get task statistics by status
    const taskStatusStats = await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .groupBy(tasks.status);

    // Get task statistics by priority
    const taskPriorityStats = await db
      .select({
        priority: tasks.priority,
        count: count(),
      })
      .from(tasks)
      .groupBy(tasks.priority);

    // Get total counts
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalProjects = await db.select({ count: count() }).from(projects);
    const totalTasks = await db.select({ count: count() }).from(tasks);

    // Get recent projects
    const recentProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        createdAt: projects.createdAt,
        managerName: users.name,
      })
      .from(projects)
      .leftJoin(users, eq(projects.managerId, users.id))
      .orderBy(sql`${projects.createdAt} DESC`)
      .limit(5);

    // Get projects with task counts
    const projectsWithTaskCounts = await db
      .select({
        projectName: projects.name,
        totalTasks: count(tasks.id),
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .groupBy(projects.id, projects.name)
      .orderBy(sql`count(${tasks.id}) DESC`)
      .limit(10);

    // Get task completion rate by project
    const taskCompletionByProject = await db
      .select({
        projectName: projects.name,
        totalTasks: count(tasks.id),
        completedTasks: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
      })
      .from(projects)
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .groupBy(projects.id, projects.name)
      .having(sql`count(${tasks.id}) > 0`)
      .limit(10);

    // Get overdue tasks count
    const overdueTasks = await db
      .select({ count: count() })
      .from(tasks)
      .where(sql`${tasks.dueDate} < NOW() AND ${tasks.status} != 'done'`);

    // Get tasks by user
    const tasksByUser = await db
      .select({
        userName: users.name,
        totalTasks: count(tasks.id),
        completedTasks: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
      })
      .from(users)
      .leftJoin(tasks, eq(users.id, tasks.assignedTo))
      .where(eq(users.role, "employee"))
      .groupBy(users.id, users.name)
      .having(sql`count(${tasks.id}) > 0`)
      .limit(10);

    return NextResponse.json({
      summary: {
        totalUsers: totalUsers[0]?.count || 0,
        totalProjects: totalProjects[0]?.count || 0,
        totalTasks: totalTasks[0]?.count || 0,
        overdueTasks: overdueTasks[0]?.count || 0,
      },
      userStats: userStats.map(stat => ({
        role: stat.role,
        count: Number(stat.count),
      })),
      projectStats: projectStats.map(stat => ({
        status: stat.status,
        count: Number(stat.count),
      })),
      taskStatusStats: taskStatusStats.map(stat => ({
        status: stat.status,
        count: Number(stat.count),
      })),
      taskPriorityStats: taskPriorityStats.map(stat => ({
        priority: stat.priority,
        count: Number(stat.count),
      })),
      recentProjects,
      projectsWithTaskCounts: projectsWithTaskCounts.map(p => ({
        projectName: p.projectName,
        totalTasks: Number(p.totalTasks),
      })),
      taskCompletionByProject: taskCompletionByProject.map(p => ({
        projectName: p.projectName,
        totalTasks: Number(p.totalTasks),
        completedTasks: Number(p.completedTasks),
        completionRate: Number(p.totalTasks) > 0 
          ? Math.round((Number(p.completedTasks) / Number(p.totalTasks)) * 100) 
          : 0,
      })),
      tasksByUser: tasksByUser.map(u => ({
        userName: u.userName,
        totalTasks: Number(u.totalTasks),
        completedTasks: Number(u.completedTasks),
        completionRate: Number(u.totalTasks) > 0 
          ? Math.round((Number(u.completedTasks) / Number(u.totalTasks)) * 100) 
          : 0,
      })),
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
