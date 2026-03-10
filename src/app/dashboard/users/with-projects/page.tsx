"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ManagerSidebar from "@/components/ManagerSidebar";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface UserWithProjects {
  id: string;
  name: string;
  email: string;
  role: "manager" | "employee";
  createdAt: string;
  assignedProjects: Project[];
  managedProjects: Project[];
  totalProjects: number;
}

export default function UsersWithProjectsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<"all" | "manager" | "employee">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsersWithProjects();
  }, []);

  const fetchUsersWithProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users?withProjects=true");

      if (response.status === 403) {
        setError("You don't have permission to view users");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on role and search query
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
      <ManagerSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
      <ManagerSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="mb-4 text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Users
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ManagerSidebar />
      <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 sticky top-0 z-10">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="mb-4 text-slate-600 hover:text-slate-900 transition-colors flex items-center"
          >
            ← Back to Users
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Users with Projects</h1>
              <p className="text-slate-600 mt-1">
                View all users and their assigned projects
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-slate-500">Managers</h3>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {users.filter((u) => u.role === "manager").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-slate-500">Employees</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {users.filter((u) => u.role === "employee").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-slate-500">Filtered Results</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {filteredUsers.length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Total Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Managed Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Assigned Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "manager"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {user.totalProjects}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.managedProjects.length > 0 ? (
                        <div className="space-y-1">
                          {user.managedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                            >
                              {project.name}
                              <span
                                className={`ml-1 ${
                                  project.status === "active"
                                    ? "text-green-600"
                                    : "text-slate-600"
                                }`}
                              >
                                ({project.status})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.assignedProjects.length > 0 ? (
                        <div className="space-y-1">
                          {user.assignedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {project.name}
                              <span
                                className={`ml-1 ${
                                  project.status === "active"
                                    ? "text-green-600"
                                    : "text-slate-600"
                                }`}
                              >
                                ({project.status})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/users/${user.id}`)}
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No users found matching your filters
            </div>
          )}
        </div>

        {/* Summary Section */}
        {/* <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-medium text-slate-500">
                Users Managing Projects
              </h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.filter((u) => u.managedProjects.length > 0).length}
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-medium text-slate-500">
                Users Assigned to Projects
              </h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.filter((u) => u.assignedProjects.length > 0).length}
              </p>
            </div>
            <div className="border-l-4 border-slate-500 pl-4">
              <h3 className="text-sm font-medium text-slate-500">
                Users with No Projects
              </h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.filter((u) => u.totalProjects === 0).length}
              </p>
            </div>
          </div>
        </div> */}
      </div>
      </div>
    </div>
  );
}
