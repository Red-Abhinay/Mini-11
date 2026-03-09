"use client";

import { useState } from "react";
import { Project } from "@/db/schema";
import { updateProject } from "@/app/dashboard/projects/_actions"; 
import { toast } from "react-hot-toast";

export function EditProjectModal({ 
  project, 
  onClose 
}: { 
  project: Project, 
  onClose: () => void 
}) {
  return (

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white text-gray-900 p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            
            <form action={async (formData) => {
            const result = await updateProject(project.id, formData);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
            onClose();
            }}>
            <input 
                name="name" 
                defaultValue={project.name} 
                placeholder="Project Name" 
                required 
                className="w-full border p-2 rounded mb-3"
            />
            
            <textarea 
                name="description" 
                defaultValue={project.description || ""} 
                placeholder="Description" 
                required 
                className="w-full border p-2 rounded mb-4 resize-none h-32"
            />

            <div className="flex justify-end gap-2">
                <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2"
                >
                Cancel
                </button>
                <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                Save Changes
                </button>
            </div>
            </form>
        </div>
        </div>

  );
}