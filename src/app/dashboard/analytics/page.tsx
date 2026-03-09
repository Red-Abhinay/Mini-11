"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import ManagerSidebar from "@/components/ManagerSidebar";

interface Stats {
  summary: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    overdueTasks: number;
  };
  userStats: Array<{ role: string; count: number }>;
  projectStats: Array<{ status: string; count: number }>;
  taskStatusStats: Array<{ status: string; count: number }>;
  taskPriorityStats: Array<{ priority: string; count: number }>;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
    managerName: string | null;
  }>;
  projectsWithTaskCounts: Array<{
    projectName: string;
    totalTasks: number;
  }>;
  taskCompletionByProject: Array<{
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  tasksByUser: Array<{
    userName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
}

const COLORS = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  status: {
    active: '#10b981',
    completed: '#3b82f6',
    archived: '#6b7280',
    todo: '#f59e0b',
    in_progress: '#3b82f6',
    review: '#8b5cf6',
    done: '#10b981',
  },
  priority: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  }
};

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/stats");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (response.status === 403) {
        setError("Access denied. Manager role required.");
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;

    const csvContent = [
      ["Analytics Report", new Date().toLocaleDateString()],
      [],
      ["Summary Metrics"],
      ["Total Users", stats.summary.totalUsers],
      ["Total Projects", stats.summary.totalProjects],
      ["Total Tasks", stats.summary.totalTasks],
      ["Overdue Tasks", stats.summary.overdueTasks],
      [],
      ["Recent Projects"],
      ["Project Name", "Manager", "Status", "Created Date"],
      ...stats.recentProjects.map((p) => [
        p.name,
        p.managerName || "N/A",
        p.status,
        new Date(p.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredProjects = stats?.recentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const completionRate =
    stats && stats.summary.totalTasks > 0
      ? Math.round(
          ((stats.summary.totalTasks - stats.summary.overdueTasks) /
            stats.summary.totalTasks) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/dashboard/manager")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Manager Home
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <ManagerSidebar />

      <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Real-time insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchStats}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => router.push("/dashboard/manager")}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.summary.totalUsers}</p>
                <p className="text-xs text-slate-600 mt-1">Active in system</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.summary.totalProjects}</p>
                <p className="text-xs text-slate-600 mt-1">Across organization</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">📁</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.summary.totalTasks}</p>
                <p className="text-xs text-slate-600 mt-1">{completionRate}% completed</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">✓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.summary.overdueTasks}</p>
                <p className="text-xs text-slate-600 mt-1">Require attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">⚠️</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.projectStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.status[entry.status as keyof typeof COLORS.status] || COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.taskStatusStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.taskPriorityStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.priority}: ${entry.count}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="priority"
                >
                  {stats.taskPriorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.priority[entry.priority as keyof typeof COLORS.priority] || COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Distribution by Role</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.userStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Task Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Team Member</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Total Tasks</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Completed</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasksByUser.slice(0, 5).map((user) => (
                  <tr key={user.userName} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.userName}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{user.totalTasks}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{user.completedTasks}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${user.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{user.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects Section with Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Project Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Manager</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                      <td className="px-4 py-3 text-slate-600">{project.managerName || "N/A"}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            project.status === "active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                      No projects found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
