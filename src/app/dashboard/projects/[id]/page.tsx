"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Task } from "@/db/schema";
import ManagerSidebar from "@/components/ManagerSidebar";

type Status = "todo" | "in_progress" | "done";
type FilterStatus = Status | "all";

const STATUS_CONFIG: Record<Status, { label: string; badge: string; dot: string; ring: string; bg: string }> = {
  todo:        { label: "To Do",       badge: "text-slate-400 bg-slate-400/10 border-slate-400/25", dot: "bg-slate-400",  ring: "border-slate-400", bg: "bg-slate-400/10" },
  in_progress: { label: "In Progress", badge: "text-amber-400 bg-amber-400/10 border-amber-400/25", dot: "bg-amber-400",  ring: "border-amber-400", bg: "bg-amber-400/10" },
  done:        { label: "Done",        badge: "text-green-400 bg-green-400/10 border-green-400/25", dot: "bg-green-400",  ring: "border-green-400", bg: "bg-green-400/10" },
};

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
}

interface AssignableUser {
  id: string;
  name: string;
  email: string;
  role: "manager" | "employee";
}

function CreateTaskModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: (task: Task) => void }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [employees, setEmployees] = useState<AssignableUser[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error("Failed to load employees");
        }

        const users: AssignableUser[] = await res.json();
        setEmployees(users.filter((user) => user.role === "employee"));
      } catch {
        setError("Failed to load employees");
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const search = assigneeSearch.trim().toLowerCase();
    if (!search) return true;
    return (
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search)
    );
  });

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      setError("Select at least one employee to assign this task");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // The tasks table stores one assignee per row, so create one task per selected employee.
      const createResults = await Promise.all(
        selectedEmployeeIds.map(async (employeeId) => {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: form.title,
              description: form.description,
              projectId,
              status: "todo",
              assigned_to: employeeId,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to create task");
          }

          return res.json() as Promise<Task>;
        })
      );

      setForm({ title: "", description: "" });
      setAssigneeSearch("");
      setSelectedEmployeeIds([]);
      createResults.forEach((task) => onCreated(task));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-100">Create New Task</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer bg-transparent border-none">×</button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Task Title</label>
            <input
              type="text"
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm outline-none focus:border-sky-300 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              placeholder="Enter task description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm outline-none focus:border-sky-300 transition-colors disabled:opacity-50 resize-none h-24"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign</label>
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <input
                type="text"
                placeholder="Search employee name"
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                disabled={loading || employeesLoading}
                className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-sky-300 disabled:opacity-50"
              />

              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {employeesLoading && (
                  <p className="text-sm text-slate-400">Loading employees...</p>
                )}

                {!employeesLoading && filteredEmployees.length === 0 && (
                  <p className="text-sm text-slate-400">No employees found.</p>
                )}

                {!employeesLoading && filteredEmployees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-slate-500"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onChange={() => toggleEmployee(employee.id)}
                      disabled={loading}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span className="leading-tight text-slate-200">
                      {employee.name}
                      <span className="block text-xs text-slate-400">{employee.email}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-sky-400/20 border border-sky-300/50 text-sky-100 text-sm font-semibold cursor-pointer hover:bg-sky-300/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateTaskModal({ task, onClose, onUpdated, onCreated }: { task: Task; onClose: () => void; onUpdated: (t: Task) => void; onCreated: (t: Task) => void }) {
  const [status, setStatus] = useState<Status>(task.status as Status);
  const [employees, setEmployees] = useState<AssignableUser[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error("Failed to load employees");
        }

        const users: AssignableUser[] = await res.json();
        setEmployees(
          users.filter(
            (user) => user.role === "employee" && user.id !== task.assignedTo
          )
        );
      } catch {
        setError("Failed to load employees");
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const search = assigneeSearch.trim().toLowerCase();
    if (!search) return true;
    return (
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search)
    );
  });

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const canSave = status !== task.status || selectedEmployeeIds.length > 0;

  const handleUpdate = async () => {
    setLoading(true); setError(null);
    try {
      const statusChanged = status !== task.status;
      const hasNewAssignees = selectedEmployeeIds.length > 0;

      if (!statusChanged && !hasNewAssignees) {
        onClose();
        return;
      }

      if (statusChanged) {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }

        const updatedTask = await res.json();
        onUpdated(updatedTask);
      }

      // One task row stores one assignee, so added assignees are created as additional task rows.
      if (hasNewAssignees) {
        const createdTasks = await Promise.all(
          selectedEmployeeIds.map(async (employeeId) => {
            const createRes = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: task.title,
                description: task.description,
                projectId: task.projectId,
                status: statusChanged ? status : task.status,
                assigned_to: employeeId,
              }),
            });

            if (!createRes.ok) {
              const d = await createRes.json();
              throw new Error(d.error || "Failed to add employee to task");
            }

            return createRes.json() as Promise<Task>;
          })
        );

        createdTasks.forEach((createdTask) => onCreated(createdTask));
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">Update Task</h2>
            <p className="text-xs text-slate-500 mt-0.5">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer bg-transparent border-none">×</button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Change Status</p>

        <div className="flex flex-col gap-2 mb-6">
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatus(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150 w-full text-left
                ${status === key ? `${cfg.ring} ${cfg.bg}` : "border-slate-700 bg-slate-900/30 hover:border-slate-600"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
              <span className={`text-sm font-semibold ${status === key ? cfg.badge.split(" ")[0] : "text-slate-400"}`}>{cfg.label}</span>
              {task.status === key && <span className="ml-auto text-xs text-slate-500">current</span>}
              {status === key && task.status !== key && <span className={`ml-auto text-base ${cfg.badge.split(" ")[0]}`}>✓</span>}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign</label>
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
            <input
              type="text"
              placeholder="Search employee name"
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
              disabled={loading || employeesLoading}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-sky-300 disabled:opacity-50"
            />

            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {employeesLoading && (
                <p className="text-sm text-slate-400">Loading employees...</p>
              )}

              {!employeesLoading && filteredEmployees.length === 0 && (
                <p className="text-sm text-slate-400">No employees found.</p>
              )}

              {!employeesLoading && filteredEmployees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-slate-500"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployeeIds.includes(employee.id)}
                    onChange={() => toggleEmployee(employee.id)}
                    disabled={loading}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span className="leading-tight text-slate-200">
                    {employee.name}
                    <span className="block text-xs text-slate-400">{employee.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors">Cancel</button>
          <button onClick={handleUpdate} disabled={loading || !canSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-sky-400/20 border border-sky-300/50 text-sky-100 text-sm font-semibold cursor-pointer hover:bg-sky-300/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ task, onClose, onDeleted }: { task: Task; onClose: () => void; onDeleted: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onDeleted(task.id); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
          <h2 className="text-base font-bold text-slate-100 mb-1.5">Delete Task?</h2>
          <p className="text-sm text-slate-500">"<span className="text-slate-300">{task.title}</span>" will be permanently removed.</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onUpdated, onDeleted, onCreated, assigneeName }: { task: Task; onUpdated: (t: Task) => void; onDeleted: (id: string) => void; onCreated: (t: Task) => void; assigneeName: string }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const cfg = STATUS_CONFIG[task.status as Status] ?? STATUS_CONFIG.todo;

  return (
    <>
      <div className="grid grid-cols-[1fr_220px_130px_210px] items-center px-6 py-4 hover:bg-slate-700/50 transition-colors duration-150 gap-3">
        <div>
          <p className="font-semibold text-sm text-slate-100">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{task.description}</p>
          )}
        </div>

        <div className="text-sm text-slate-300 truncate" title={assigneeName}>
          {assigneeName}
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border w-fit ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowUpdate(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-300/10 border border-sky-300/35 text-sky-200 text-xs font-semibold cursor-pointer hover:bg-sky-300/20 hover:border-sky-300/55 transition-all duration-150">
            Update
          </button>
          <button onClick={() => setShowDelete(true)}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-150">
            Delete
          </button>
        </div>
      </div>

      {showUpdate && <UpdateTaskModal task={task} onClose={() => setShowUpdate(false)} onUpdated={onUpdated} onCreated={onCreated} />}
      {showDelete && <DeleteConfirmModal task={task} onClose={() => setShowDelete(false)} onDeleted={onDeleted} />}
    </>
  );
}

function StatCard({ label, value, valueClass }: { label: string; value: number; valueClass: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 flex-1 min-w-[120px]">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className={`text-4xl font-extrabold mt-1.5 ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersById, setUsersById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);

  const fetchProjectAndTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch project tasks");
      const data = await res.json();
      setProject(data.project);
      setTasks(data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return;
        const users: AssignableUser[] = await res.json();
        const mapped = users.reduce<Record<string, string>>((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {});
        setUsersById(mapped);
      } catch {
        // Keep task list usable even if users endpoint fails.
      }
    };

    fetchUsers();
  }, []);

  const handleUpdated = (updated: Task) =>
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  const handleDeleted = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));
  const handleCreated = (newTask: Task) =>
    setTasks(prev => [newTask, ...prev]);

  const filtered = tasks.filter(t => {
    const matchStatus = filter === "all" || t.status === filter;
    const matchSearch = search.trim() === "" ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <ManagerSidebar />

      <main className="flex flex-1 flex-col">
        <div className="kanban-page">
          <div className="kanban-shell">
            <header className="kanban-header">
              <div>
                <p className="kanban-eyebrow">Project Details</p>
                <h1>{project?.name || "Project"}</h1>
                <p className="kanban-subtitle">
                  {project?.description || "Manage all tasks in this project"}
                </p>
              </div>
              <div className="kanban-controls">
                <button 
                  onClick={() => setShowCreateTask(true)}
                  className="create-project-btn"
                >
                  + New Task
                </button>
                <button 
                  onClick={() => router.back()}
                  className="create-project-btn"
                >
                  ← Back
                </button>
              </div>
            </header>

          {error && <div className="kanban-alert">{error}</div>}

            {loading ? (
              <div className="kanban-loading">Loading tasks…</div>
            ) : (
              <>
            {/* Stat cards */}
            <div className="flex gap-3 mb-8 flex-wrap">
              <StatCard label="Total"       value={counts.all}         valueClass="text-slate-50" />
              <StatCard label="To Do"       value={counts.todo}        valueClass="text-slate-400" />
              <StatCard label="In Progress" value={counts.in_progress} valueClass="text-amber-400" />
              <StatCard label="Done"        value={counts.done}        valueClass="text-green-400" />
            </div>

            {/* Search + filters */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
              <input
                placeholder="Search tasks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-sky-300 transition-colors flex-1 min-w-[200px]"
              />
              {(["all", "todo", "in_progress", "done"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all
                    ${filter === f
                      ? "border-sky-300/60 bg-sky-300/15 text-sky-200"
                      : "border-slate-700 bg-transparent text-slate-500 hover:border-slate-600"}`}
                >
                  {f === "all" ? "All" : STATUS_CONFIG[f as Status].label}
                </button>
              ))}
            </div>

            {/* Task list */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                {search || filter !== "all" ? "No tasks match your filters" : "No tasks in this project yet"}
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="grid grid-cols-[1fr_220px_130px_210px] px-6 py-4 bg-slate-900 border-b border-slate-700 gap-3">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Task</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Assigned To</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Status</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold text-right">Actions</span>
                </div>
                <div className="divide-y divide-slate-700">
                  {filtered.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                      onCreated={handleCreated}
                      assigneeName={task.assignedTo ? (usersById[task.assignedTo] || task.assignedTo) : "Unassigned"}
                    />
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {showCreateTask && (
            <CreateTaskModal
              projectId={projectId}
              onClose={() => setShowCreateTask(false)}
              onCreated={handleCreated}
            />
          )}
        </div>
      </main>
    </div>
  );
}
