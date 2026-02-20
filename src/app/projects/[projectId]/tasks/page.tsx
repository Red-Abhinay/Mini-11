"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import TaskForm from "@/components/tasks/TaskForm";

export default function TasksPage({
  params,
}: {
  params: Promise<{ projectId: number }>;
}) {
  const { projectId } = React.use(params);

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = () => {
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTasks([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!projectId) return;
    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            Project Tasks
          </h1>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow"
          >
            {showForm ? "Close Form" : "+ Create Task"}
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              projectId={projectId}
              onSuccess={() => {
                setShowForm(false);
                fetchTasks();
              }}
            />
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !showForm && (
          <p className="text-center text-gray-500 py-12">
            No tasks yet. Create your first task 🚀
          </p>
        )}

        {/* Task Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/projects/${projectId}/tasks/${task.id}`}
              className="border rounded-xl p-4 hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg text-indigo-600">
                {task.title}
              </h2>

              <p className="text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>

              <div className="flex justify-between text-sm mt-3">
                <span>Priority: {task.priority}</span>
                <span className="text-gray-400">
                  {task.deadline?.slice(0, 10)}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
