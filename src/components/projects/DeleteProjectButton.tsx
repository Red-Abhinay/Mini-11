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
        className="projects-menu-item"
        title="Delete Project"
      >
        <Trash2 size={14} /> 
        <span>Delete Project</span>
      </button>

      {isConfirming && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Are you sure?</h3>
            </div>
            
            <p className="delete-confirm-message">
              This will permanently delete <span className="delete-confirm-name">"{projectName}"</span> and all its associated tasks. This action cannot be undone.
            </p>

            <div className="delete-confirm-actions">
              <button
                onClick={() => setIsConfirming(false)}
                className="delete-confirm-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="delete-confirm-delete-btn"
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