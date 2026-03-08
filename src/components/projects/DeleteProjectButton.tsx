"use client"; 

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteProject } from "@/app/dashboard/projects/_actions";

export function DeleteProjectButton({ 
  projectId, 
  projectName,
  onActionComplete
}: { 
  projectId: string, 
  projectName: string,
  onActionComplete?: () => void 
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleDelete() {
    await deleteProject(projectId);
    setIsConfirming(false);
    if (onActionComplete) onActionComplete();
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          setIsConfirming(true);
        }}
        className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors" 
        title="Delete Project"
      >
        <Trash2 size={14} /> 
        <span>Delete Project</span>
      </button>

      {isConfirming && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Are you sure?</h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 text-left">
              This will permanently delete <span className="font-semibold text-slate-900">"{projectName}"</span> and all its associated tasks. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}