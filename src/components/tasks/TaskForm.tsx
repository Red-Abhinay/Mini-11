"use client";

import { useState } from "react";

export default function TaskForm({
  projectId,
  onSuccess,
}: {
  projectId: number;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "Medium",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.title || !form.assignedTo || !form.deadline) {
      alert("Please fill all required fields");
      return;
    }

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        projectId,
      }),
    });

    onSuccess();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-indigo-600">Create Task</h2>

      <input
        name="title"
        placeholder="Task Title"
        className="input"
        value={form.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Task Description"
        className="input"
        value={form.description}
        onChange={handleChange}
      />

      <input
        name="assignedTo"
        placeholder="Assign To (Member Name)"
        className="input"
        value={form.assignedTo}
        onChange={handleChange}
      />

      <input
        type="date"
        name="deadline"
        className="input"
        value={form.deadline}
        onChange={handleChange}
      />

      <select
        name="priority"
        className="input"
        value={form.priority}
        onChange={handleChange}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <button
        onClick={submit}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Save Task
      </button>
    </div>
  );
}
