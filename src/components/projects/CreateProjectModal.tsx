
"use client";

import { useState, useRef } from "react";
import { createProject } from "@/app/dashboard/projects/_actions";
import { toast } from "react-hot-toast";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const lock = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (lock.current) return;

    lock.current = true;
    setIsPending(true);

    try {
      const result = await createProject(formData);
      
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.message);
        lock.current = false;
        setIsPending(false);
      }
    } catch (error) {
      toast.error("An error occurred");

      lock.current = false;
      setIsPending(false);
    } finally {

    }
  }

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
            
            <form action={handleSubmit}>
              <input 
                name="name" 
                placeholder="Project Name" 
                required 
                disabled={isPending}
                className="w-full border p-2 rounded mb-3 disabled:bg-gray-100"
              />
              <textarea 
                name="description" 
                placeholder="Description" 
                required 
                disabled={isPending}
                className="w-full border p-2 rounded mb-4 resize-none h-32 disabled:bg-gray-100"
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isPending}
                  className="px-4 py-2 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400 flex items-center gap-2"
                >
                  {isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}