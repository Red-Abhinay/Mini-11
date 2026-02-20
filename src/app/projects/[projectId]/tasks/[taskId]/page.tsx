"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TaskDetails({
  params,
}: {
  params: Promise<{ project_id: string; taskId: string }>;
}) {
  const { project_id, taskId } = React.use(params);
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${project_id}/tasks/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Task not found");
        return res.json();
      })
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project_id, taskId]);

  const updateTask = async () => {
    await fetch(`/api/projects/${project_id}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    alert("Task updated");
    router.push(`/projects/${project_id}/tasks`);
  };

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;

    await fetch(`/api/projects/${project_id}/tasks/${taskId}`, {
      method: "DELETE",
    });

    alert("Task deleted");
    router.push(`/projects/${project_id}/tasks`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        Loading...
      </div>
    );

  if (!task)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        Task not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-indigo-600">Task Details</h1>

        <input
          value={task.title || ""}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          className="input"
        />

        <textarea
          value={task.description || ""}
          onChange={(e) =>
            setTask({ ...task, description: e.target.value })
          }
          className="input h-24"
        />

        <input
          value={task.assignedTo || ""}
          onChange={(e) =>
            setTask({ ...task, assignedTo: e.target.value })
          }
          className="input"
        />

        <input
          type="date"
          value={task.deadline?.slice(0, 10) || ""}
          onChange={(e) =>
            setTask({ ...task, deadline: e.target.value })
          }
          className="input"
        />

        <select
          value={task.priority || "Low"}
          onChange={(e) =>
            setTask({ ...task, priority: e.target.value })
          }
          className="input"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <div className="flex gap-4 pt-4">
          <button
            onClick={updateTask}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
          >
            Update
          </button>

          <button
            onClick={deleteTask}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
