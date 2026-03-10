
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
        className="create-project-btn"
      >
        + New Project
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Create New Project</h2>
            
            <form action={handleSubmit}>
              <input 
                name="name" 
                placeholder="Project Name" 
                required 
                disabled={isPending}
                className="modal-input"
              />
              <textarea 
                name="description" 
                placeholder="Description" 
                required 
                disabled={isPending}
                className="modal-textarea"
              />
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isPending}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="modal-submit-btn"
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