"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Task, CreateTaskInput } from "@/db/schema";

type Status = "todo" | "in_progress" | "done";

type User = {
  id: string; // uuid
  name: string;
  email: string;
};

const STATUS_CONFIG: Record<Status, { label: string; badge: string; dot: string; border: string; ring: string }> = {
  todo: {
    label: "To Do",
    badge: "text-slate-400 bg-slate-400/10 border-slate-400/25",
    dot: "bg-slate-400",
    border: "border-slate-600",
    ring: "border-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badge: "text-amber-400 bg-amber-400/10 border-amber-400/25",
    dot: "bg-amber-400",
    border: "border-slate-600",
    ring: "border-amber-400",
  },
  done: {
    label: "Done",
    badge: "text-green-400 bg-green-400/10 border-green-400/25",
    dot: "bg-green-400",
    border: "border-slate-600",
    ring: "border-green-400",
  },
};

function UpdateTaskModal({ task, onClose, onUpdated }: { task: Task; onClose: () => void; onUpdated: (t: Task) => void }) {
  const [status, setStatus] = useState<Status>(task.status as Status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (status === task.status) {
      onClose();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      onUpdated(await res.json());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">Update Task</h2>
            <p className="text-xs text-slate-500 mt-0.5">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer bg-transparent border-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Change Status
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150 w-full text-left ${
                status === key ? `${cfg.ring} bg-slate-900/60` : "border-slate-700 bg-slate-900/30 hover:border-slate-600"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-sm font-semibold ${status === key ? cfg.badge.split(" ")[0] : "text-slate-400"}`}>
                {cfg.label}
              </span>
              {task.status === key && (
                <span className="ml-auto text-xs text-slate-500">current</span>
              )}
              {status === key && task.status !== key && (
                <span className={`ml-auto text-base ${cfg.badge.split(" ")[0]}`}>✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading || status === task.status}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      onDeleted(task.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-2xl" />
          <h2 className="text-base font-bold text-slate-100 mb-1.5">Delete Task?</h2>
          <p className="text-sm text-slate-500">
            "<span className="text-slate-300">{task.title}</span>" will be permanently removed.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdated, onDeleted }: { task: Task; onUpdated: (t: Task) => void; onDeleted: (id: string) => void }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const cfg = STATUS_CONFIG[task.status as Status] ?? STATUS_CONFIG.todo;

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-indigo-500 transition-colors duration-200">
        <div className="flex justify-between items-start gap-3">
          <span className="font-semibold text-slate-100 text-sm leading-snug">{task.title}</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        {task.description && (
          <p className="text-slate-400 text-xs leading-relaxed">{task.description}</p>
        )}

        {(task.assignedTo || (task as any).assigned_to) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Assigned to</span>
            <span className="font-mono text-xs text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md truncate max-w-[200px]">
              {task.assignedTo || (task as any).assigned_to}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-1">
          <span className="text-slate-500 text-xs">
            {task.createdAt
              ? new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUpdate(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold cursor-pointer hover:bg-indigo-500/25 transition-colors"
            >
              Update Task
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showUpdate && <UpdateTaskModal task={task} onClose={() => setShowUpdate(false)} onUpdated={onUpdated} />}
      {showDelete && <DeleteConfirmModal task={task} onClose={() => setShowDelete(false)} onDeleted={onDeleted} />}
    </>
  );
}

// ─── Create Task Modal ─────────────────────────────────────────────────────────

function CreateTaskModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [assignedTo, setAssignedTo] = useState(""); // selected user UUID

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users for the dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) setUsers(await res.json());
      } finally {
        setUsersLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          projectId,
          assigned_to: assignedTo || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      onCreated(await res.json());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-100">New Task</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-2xl leading-none cursor-pointer bg-transparent border-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title *</label>
            <input
              className="bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-full"
              placeholder="e.g. Implement login flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              className="bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-full min-h-[90px] resize-y"
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              className="bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-full cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* ── Assign To ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign To</label>
            {usersLoading ? (
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 text-sm animate-pulse">
                Loading users...
              </div>
            ) : (
              <select
                className="bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors w-full cursor-pointer"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">— Unassigned —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Status | "all">("all");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      setTasks(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId, fetchTasks]);

  const handleUpdated = (updated: Task) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const handleDeleted = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs tracking-[3px] text-slate-500 uppercase">Project · {projectId}</p>
            <h1 className="text-3xl font-bold text-slate-50 mt-1">Tasks</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors cursor-pointer"
          >
            + New Task
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "todo", "in_progress", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                filter === f
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-400"
                  : "border-slate-700 bg-transparent text-slate-500 hover:border-slate-600"
              }`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f ? "bg-indigo-500/25 text-indigo-300" : "bg-slate-800 text-slate-500"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading tasks...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchTasks}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 cursor-pointer hover:border-slate-500"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-dashed border-indigo-500/40 flex items-center justify-center text-3xl" />
            <p>No tasks here.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors cursor-pointer"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onUpdated={handleUpdated} onDeleted={handleDeleted} />
            ))}
          </div>
        )}

        {showModal && (
          <CreateTaskModal
            projectId={projectId}
            onClose={() => setShowModal(false)}
            onCreated={(task) => setTasks((prev) => [task, ...prev])}
          />
        )}
      </div>
    </div>
  );
}