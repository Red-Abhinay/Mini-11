"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/db/schema";

type Status = "todo" | "in_progress" | "done";
type FilterStatus = Status | "all";

const STATUS_CONFIG: Record<Status, { label: string; badge: string; dot: string; ring: string; bg: string }> = {
  todo:        { label: "To Do",       badge: "text-slate-400 bg-slate-400/10 border-slate-400/25", dot: "bg-slate-400",  ring: "border-slate-400", bg: "bg-slate-400/10" },
  in_progress: { label: "In Progress", badge: "text-amber-400 bg-amber-400/10 border-amber-400/25", dot: "bg-amber-400",  ring: "border-amber-400", bg: "bg-amber-400/10" },
  done:        { label: "Done",        badge: "text-green-400 bg-green-400/10 border-green-400/25", dot: "bg-green-400",  ring: "border-green-400", bg: "bg-green-400/10" },
};



function UpdateTaskModal({ task, onClose, onUpdated }: { task: Task; onClose: () => void; onUpdated: (t: Task) => void }) {
  const [status, setStatus] = useState<Status>(task.status as Status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (status === task.status) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onUpdated(await res.json()); onClose();
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
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-sm font-semibold ${status === key ? cfg.badge.split(" ")[0] : "text-slate-400"}`}>{cfg.label}</span>
              {task.status === key && <span className="ml-auto text-xs text-slate-500">current</span>}
              {status === key && task.status !== key && <span className={`ml-auto text-base ${cfg.badge.split(" ")[0]}`}>✓</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-sm font-medium cursor-pointer hover:border-slate-500 transition-colors">Cancel</button>
          <button onClick={handleUpdate} disabled={loading || status === task.status}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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



function TaskRow({ task, onUpdated, onDeleted }: { task: Task; onUpdated: (t: Task) => void; onDeleted: (id: string) => void }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const cfg = STATUS_CONFIG[task.status as Status] ?? STATUS_CONFIG.todo;

  return (
    <>
      <div className="grid grid-cols-[1fr_130px_210px] items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:border-slate-700 gap-3 transition-all duration-150">
        <div>
          <p className="font-semibold text-sm text-slate-100">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{task.description}</p>
          )}
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowUpdate(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold cursor-pointer hover:bg-indigo-500/25 transition-colors">
            Update Task
          </button>
          <button onClick={() => setShowDelete(true)}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-500/20 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {showUpdate && <UpdateTaskModal task={task} onClose={() => setShowUpdate(false)} onUpdated={onUpdated} />}
      {showDelete && <DeleteConfirmModal task={task} onClose={() => setShowDelete(false)} onDeleted={onDeleted} />}
    </>
  );
}



function ProjectGroup({ projectId, tasks, onUpdated, onDeleted, onOpenProject }: {
  projectId: string; tasks: Task[];
  onUpdated: (t: Task) => void; onDeleted: (id: string) => void;
  onOpenProject: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const done = tasks.filter(t => t.status === "done").length;
  const progress = Math.round((done / tasks.length) * 100);

  return (
    <div className="bg-[#161d2b] border border-slate-800 rounded-2xl overflow-hidden mb-4">
      {/* Group header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer bg-[#1a2234] border-b border-slate-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{collapsed ? "▶" : "▼"}</span>
          <div>
            <span className="font-bold text-sm text-slate-100">Project · {projectId}</span>
            <span className="ml-2.5 text-xs text-slate-500">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-400" : "bg-indigo-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 min-w-[2rem]">{progress}%</span>
          <button
            onClick={e => { e.stopPropagation(); onOpenProject(projectId); }}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-medium cursor-pointer hover:bg-indigo-500/25 transition-colors"
          >
            Open Project →
          </button>
        </div>
      </div>

      {/* Task rows */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="grid grid-cols-[1fr_130px_210px] px-4 py-2 gap-3">
            <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Task</span>
            <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Status</span>
            <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold text-right">Actions</span>
          </div>
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} onUpdated={onUpdated} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
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


export default function AllTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/all-tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      setTasks(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleUpdated = (updated: Task) =>
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  const handleDeleted = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const filtered = tasks.filter(t => {
    const matchStatus = filter === "all" || t.status === filter;
    const matchSearch = search.trim() === "" ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectId?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const grouped = filtered.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.projectId ?? "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 p-10 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[3px] text-slate-500 uppercase">Overview</p>
          <h1 className="text-3xl font-bold text-slate-50 mt-1">All Tasks</h1>
        </div>

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
            placeholder="Search tasks or projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors flex-1 min-w-[200px]"
          />
          {(["all", "todo", "in_progress", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all
                ${filter === f
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-400"
                  : "border-slate-700 bg-transparent text-slate-500 hover:border-slate-600"}`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f as Status].label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading…</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchTasks} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 cursor-pointer hover:border-slate-500">Retry</button>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-slate-500">No tasks found.</div>
        ) : (
          Object.entries(grouped).map(([projectId, projectTasks]) => (
            <ProjectGroup
              key={projectId}
              projectId={projectId}
              tasks={projectTasks}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
              onOpenProject={id => router.push(`/projects/${id}/tasks`)}
            />
          ))
        )}
      </div>
    </div>
  );
}