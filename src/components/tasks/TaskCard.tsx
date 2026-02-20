import Link from "next/link";
import { Task } from "@/types/task";

export default function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={`/projects/${task.projectId}/tasks/${task.id}`}
      className="block bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition border-t-4 border-indigo-600"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs text-white ${
            task.priority === "High"
              ? "bg-red-500"
              : task.priority === "Medium"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
        {task.description}
      </p>

      <div className="flex justify-between text-sm text-gray-500 mt-4">
        <span>👤 {task.assignedTo}</span>
        <span>📅 {task.deadline}</span>
      </div>
    </Link>
  );
}
