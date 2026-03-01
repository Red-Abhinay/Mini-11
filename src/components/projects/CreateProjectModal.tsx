"use client";

import { useState } from "react";
import { createProject } from "@/app/dashboard/projects/_actions";
import { toast } from "react-hot-toast";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        + New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form action={async (formData) => {
              const result = await createProject(formData);
               if (result.success) {
                  toast.success(result.message); 
            }
                else {  toast.error(result.message);
            }
            setIsOpen(false);
            }}>
              <input 
                name="name" 
                placeholder="Project Name" 
                required 
                className="w-full border p-2 rounded mb-3"
              />
              <textarea 
                name="description" 
                placeholder="Description" 
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


