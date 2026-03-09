import React from "react";
import { columns, Task } from "./kanbanTypes";

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, children }) => (
  <div className="kanban-column">
    <h2>{title}</h2>
    {children}
  </div>
);

interface KanbanTaskCardProps {
  task: Task;
}

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task }) => (
  <div className="kanban-task-card">
    <div className="task-title">{task.title}</div>
    <div className="task-desc">{task.description}</div>
  </div>
);
