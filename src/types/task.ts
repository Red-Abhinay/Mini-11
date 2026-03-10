export interface Task {
  id: number ;
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  projectId: number;
}
