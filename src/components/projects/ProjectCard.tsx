"use client";

import React, { useState } from 'react';
import { Project } from "@/db/schema";
import { Calendar, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DeleteProjectButton } from './DeleteProjectButton';
import { EditProjectModal } from './EditProjectModal';

interface ProjectCardProps {
  project: Project;
  progress?: number;
  managerName?: string;
}

export function ProjectCard({ project, progress = 0, managerName = "Unknown" }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="projects-card group">
      <div>
        <div className="projects-card-top">
          <div>
            <h3 className="projects-card-title">
              {project.name}
            </h3>
            <span className="projects-status-badge">
              {project.status || 'Active'}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="projects-menu-trigger"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <div className="projects-menu-dropdown">
                  <button 
                    onClick={() => {
                      setIsEditOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="projects-menu-item"
                  >
                    <Pencil size={14} /> Edit Project
                  </button>
                  
                  <div className="projects-menu-divider">
                    <DeleteProjectButton 
                      projectId={project.id} 
                      projectName={project.name} 
                      onActionComplete={() => setIsMenuOpen(false)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="projects-card-description">
          {project.description || "No description provided for this project."}
        </p>

        <div className="projects-meta-list">
          <div className="projects-meta-item">
            <Calendar size={14} className="mr-2" />
            <span>Created: {project.createdAt?.toLocaleDateString()}</span>
          </div>
          <div className="projects-meta-item">
            <User size={14} className="mr-2" />
            <span>Manager: {managerName}</span>
          </div>
        </div>

        <div className="projects-progress">
          <div className="projects-progress-header">
            <span>Completion</span>
            <span>{progress}%</span>
          </div>
          <div className="projects-progress-track">
            <div 
              className="projects-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="projects-card-footer">
        <a 
          href={`/dashboard/projects/${project.id}`} 
          className="projects-details-link"
        >
          View Details
        </a>
      </div>

      {isEditOpen && (
        <EditProjectModal 
          project={project} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </div>
  );
}