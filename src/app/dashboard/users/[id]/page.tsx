"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface UserWithProjects {
  id: string;
  name: string;
  email: string;
  role: "manager" | "employee";
  createdAt: string;
  updatedAt: string | null;
  assignedProjects: Project[];
  managedProjects: Project[];
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<UserWithProjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee" as "manager" | "employee",
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}?withProjects=true`);

      if (response.status === 403) {
        setError("You don't have permission to view this user");
        return;
      }

      if (response.status === 404) {
        setError("User not found");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to update user");
        return;
      }

      alert("User updated successfully!");
      setEditMode(false);
      fetchUser();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
        return;
      }

      alert("User deleted successfully!");
      router.push("/dashboard/users");
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-100 rounded w-3/4"></div>
              <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              <div className="h-6 bg-gray-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Users
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || "User not found"}
          </div>
        </div>
      </div>
    );
  }

  const totalProjects = user.assignedProjects.length + user.managedProjects.length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Users
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      role: user.role,
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "manager" | "employee",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    user.role === "manager"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
                <p className="text-lg font-semibold text-gray-900">{totalProjects}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              {user.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <p className="text-gray-900">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Managed Projects */}
        {user.managedProjects.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Managed Projects ({user.managedProjects.length})
            </h2>
            <div className="space-y-3">
              {user.managedProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Projects */}
        {user.assignedProjects.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Assigned Projects ({user.assignedProjects.length})
            </h2>
            <div className="space-y-3">
              {user.assignedProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Projects */}
        {totalProjects === 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">
              This user is not assigned to any projects yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
