import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

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

    const sql = neon(process.env.DATABASE_URL!);

    const [userStats, projectStats, taskStatusStats, totalsRow, recentProjects, projectsWithTaskCounts, taskCompletionByProject, tasksByUser] =
      await Promise.all([
        sql`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`,
        sql`SELECT status, COUNT(*)::int AS count FROM projects GROUP BY status`,
        sql`SELECT status, COUNT(*)::int AS count FROM tasks GROUP BY status`,
        sql`
          SELECT
            (SELECT COUNT(*)::int FROM users) AS "totalUsers",
            (SELECT COUNT(*)::int FROM projects) AS "totalProjects",
            (SELECT COUNT(*)::int FROM tasks) AS "totalTasks"
        `,
        sql`
          SELECT
            p.id,
            p.name,
            COALESCE(p.status, 'active') AS status,
            p.created_at AS "createdAt",
            m.name AS "managerName"
          FROM projects p
          LEFT JOIN users m ON p.manager_id::text = m.id::text
          ORDER BY p.created_at DESC
          LIMIT 5
        `,
        sql`
          SELECT
            p.name AS "projectName",
            COUNT(t.id)::int AS "totalTasks"
          FROM projects p
          LEFT JOIN tasks t ON p.id = t.project_id
          GROUP BY p.id, p.name
          ORDER BY COUNT(t.id) DESC
          LIMIT 10
        `,
        sql`
          SELECT
            p.name AS "projectName",
            COUNT(t.id)::int AS "totalTasks",
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::int AS "completedTasks"
          FROM projects p
          LEFT JOIN tasks t ON p.id = t.project_id
          GROUP BY p.id, p.name
          HAVING COUNT(t.id) > 0
          LIMIT 10
        `,
        sql`
          SELECT
            u.name AS "userName",
            COUNT(t.id)::int AS "totalTasks",
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::int AS "completedTasks"
          FROM users u
          LEFT JOIN tasks t ON u.id::text = t.assigned_to::text
          WHERE u.role = 'employee'
          GROUP BY u.id, u.name
          HAVING COUNT(t.id) > 0
          LIMIT 10
        `,
      ]);

    const totals = totalsRow[0] || { totalUsers: 0, totalProjects: 0, totalTasks: 0 };

    // Current tasks table does not have due_date/priority in this DB shape.
    const overdueTasks = 0;
    const taskPriorityStats: Array<{ priority: string; count: number }> = [];

    return NextResponse.json({
      summary: {
        totalUsers: Number(totals.totalUsers || 0),
        totalProjects: Number(totals.totalProjects || 0),
        totalTasks: Number(totals.totalTasks || 0),
        overdueTasks,
      },
      userStats: userStats.map(stat => ({
        role: String(stat.role),
        count: Number(stat.count),
      })),
      projectStats: projectStats.map(stat => ({
        status: String(stat.status),
        count: Number(stat.count),
      })),
      taskStatusStats: taskStatusStats.map(stat => ({
        status: String(stat.status),
        count: Number(stat.count),
      })),
      taskPriorityStats,
      recentProjects,
      projectsWithTaskCounts: projectsWithTaskCounts.map(p => ({
        projectName: String(p.projectName),
        totalTasks: Number(p.totalTasks),
      })),
      taskCompletionByProject: taskCompletionByProject.map(p => ({
        projectName: String(p.projectName),
        totalTasks: Number(p.totalTasks),
        completedTasks: Number(p.completedTasks),
        completionRate: Number(p.totalTasks) > 0 
          ? Math.round((Number(p.completedTasks) / Number(p.totalTasks)) * 100) 
          : 0,
      })),
      tasksByUser: tasksByUser.map(u => ({
        userName: String(u.userName),
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
