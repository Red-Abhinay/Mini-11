import React from 'react';
import { Project } from "@/db/schema";
import { Calendar, User, MoreVertical } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  progress?: number; // You'll calculate this in the parent SSR page
}

export function ProjectCard({ project, progress = 0 }: ProjectCardProps) {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header: Name and Options */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
            {project.status || 'Active'}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
        {project.description || "No description provided for this project."}
      </p>

      {/* Stats/Info */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center text-slate-500 text-xs">
          <Calendar size={14} className="mr-2" />
          <span>Created: {project.createdAt?.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-slate-500 text-xs">
          <User size={14} className="mr-2" />
          <span>Manager ID: {project.managerId}</span>
        </div>
      </div>

      {/* Progress Bar (Member 3 Logic) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">Completion</span>
          <span className="text-blue-600 font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-5 pt-4 border-t border-slate-50">
        <a 
          href={`/dashboard/projects/${project.id}`} 
          className="text-blue-600 text-sm font-semibold hover:underline flex items-center justify-center w-full"
        >
          View Project Details
        </a>
      </div>
    </div>
  );
}