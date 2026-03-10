import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
 
 
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = req.nextUrl.searchParams.get("projectId");

    // Managers can see all tasks, employees only their assigned tasks.
    let result;
    if (session.role === "manager") {
      if (projectId) {
        result = await db
          .select()
          .from(tasks)
          .where(eq(tasks.projectId, projectId))
          .orderBy(tasks.createdAt);
      } else {
        result = await db.select().from(tasks).orderBy(tasks.createdAt);
      }
    } else {
      const sql = neon(process.env.DATABASE_URL!);

      const canonicalUserRow = await sql`
        SELECT id, name, email
        FROM users
        WHERE lower(email) = lower(${session.email})
        LIMIT 1
      `;

      const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
      const localEmailName = session.email.split("@")[0] || "";
      const matchKeys = new Set(
        [
          canonicalUserRow[0]?.id,
          session.userId,
          session.email,
          canonicalUserRow[0]?.email,
          canonicalUserRow[0]?.name,
          localEmailName,
        ]
          .map((value) => normalize(value))
          .filter(Boolean)
      );

      const employeeTaskRows = await sql`
        SELECT
          id,
          title,
          description,
          status,
          project_id AS "projectId",
          assigned_to AS "assignedTo",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM tasks
        WHERE assigned_to IS NOT NULL
        ${projectId ? sql`AND project_id = ${projectId}` : sql``}
        ORDER BY created_at ASC
      `;

      result = employeeTaskRows.filter((task) =>
        matchKeys.has(normalize((task as { assignedTo?: string | null }).assignedTo))
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status = "todo", projectId, assigned_to } = body; 
 
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!["todo", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
 
    const [newTask] = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description?.trim() ?? null,
        status,
        projectId,
        assignedTo: assigned_to ?? null, 
      })
      .returning();
 
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
