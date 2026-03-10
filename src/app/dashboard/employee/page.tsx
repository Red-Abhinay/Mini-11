import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth";
import ManagerProfileMenu from "@/components/ManagerProfileMenu";
import EmployeeSidebar from "@/components/EmployeeSidebar";

type AssignedTask = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assignedTo: string | null;
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  projectStatus: string | null;
  projectCreatedAt: Date | null;
  managerName: string | null;
};

type AssignedProject = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  managerName: string | null;
};

export default async function EmployeeHomePage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "employee") {
    redirect("/dashboard/manager");
  }

  const employeeName =
    session.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Employee";

  const initials = employeeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const sql = neon(process.env.DATABASE_URL!);

  const canonicalUserRow = await sql`
    SELECT id, name, email
    FROM users
    WHERE lower(email) = lower(${session.email})
    LIMIT 1
  `;

  const employeeId = canonicalUserRow[0]?.id || session.userId;
  const employeeDbName = canonicalUserRow[0]?.name || employeeName;

  const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
  const localEmailName = session.email.split("@")[0] || "";
  const matchKeys = new Set(
    [
      employeeId,
      session.userId,
      session.email,
      canonicalUserRow[0]?.email,
      employeeDbName,
      localEmailName,
    ]
      .map((value) => normalize(value))
      .filter(Boolean)
  );

  let assignedTaskRows: AssignedTask[] = [];

  try {
    const taskRows = await sql`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.assigned_to::text AS "assignedTo",
        p.id AS "projectId",
        p.name AS "projectName",
        p.description AS "projectDescription",
        p.status AS "projectStatus",
        p.created_at AS "projectCreatedAt",
        m.name AS "managerName"
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      LEFT JOIN users m ON p.manager_id::text = m.id::text
      WHERE t.assigned_to IS NOT NULL
    `;

    // Prefer exact employee ID matches from task.assigned_to, then fall back to legacy values.
    const idMatchedTasks = (taskRows as AssignedTask[]).filter(
      (task) => normalize(task.assignedTo) === normalize(employeeId)
    );

    if (idMatchedTasks.length > 0) {
      assignedTaskRows = idMatchedTasks;
    } else {
    assignedTaskRows = (taskRows as AssignedTask[]).filter((task) =>
      matchKeys.has(normalize(task.assignedTo))
    );
    }
  } catch (error) {
    console.error("Failed to load task assignments for employee dashboard:", error);
  }

  const projectMap = new Map<string, AssignedProject>();
  assignedTaskRows.forEach((task) => {
    projectMap.set(task.projectId, {
      id: task.projectId,
      name: task.projectName,
      description: task.projectDescription,
      status: task.projectStatus,
      managerName: task.managerName,
    });
  });
  const assignedProjects = Array.from(projectMap.values());

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 md:flex-row">
      <EmployeeSidebar />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl text-slate-900">Employee Home</h1>
              <p className="text-xs text-slate-600 mt-1">Track your assigned tasks</p>
            </div>

            <ManagerProfileMenu
              managerName={employeeName}
              email={session.email}
              role={session.role}
              initials={initials}
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome, {employeeName}</h2>
                <p className="mt-2 text-slate-600">Here are the tasks currently assigned to you.</p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Your Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{session.role}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
              <p className="mt-2 truncate text-sm font-medium text-slate-900">{session.email}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Assigned Projects</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{assignedProjects.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Assigned Tasks</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{assignedTaskRows.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-600">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
                Active
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">My Assigned Tasks</h3>
              <p className="text-sm text-slate-600 mt-1">Tasks are shown from `tasks.assigned_to` in the database for your employee login.</p>
            </div>

            {assignedTaskRows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No tasks assigned to you yet.
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTaskRows.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">{task.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">Project: {task.projectName}</p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {task.description || "No description provided."}
                    </p>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>Manager: {task.managerName || "Unknown"}</p>
                      <p>Task ID: {task.id}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">My Assigned Projects</h3>
              <p className="text-sm text-slate-600 mt-1">Projects are derived from your assigned tasks in the database.</p>
            </div>

            {assignedProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No projects assigned to you yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {assignedProjects.map((project) => (
                  <article key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-semibold text-slate-900">{project.name}</h4>
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                        {project.status || "active"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {project.description || "No description provided."}
                    </p>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>Manager: {project.managerName || "Unknown"}</p>
                      <p>Project ID: {project.id}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
