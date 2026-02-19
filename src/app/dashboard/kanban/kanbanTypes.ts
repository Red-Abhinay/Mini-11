export const columns = [
  { id: "assigned", title: "Assigned" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
  { id: "reviewed", title: "Reviewed" },
] as const;

export type TaskStatus = (typeof columns)[number]["id"];

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: string;
}

export interface ApiTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  project_id: string;
}
