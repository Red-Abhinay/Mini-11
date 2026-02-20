import { pgTable, serial, text, integer, date } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("Todo"),
  priority: text("priority").default("Low"),
  deadline: date("deadline"),
  assignedTo: text("assigned_to"),
  projectId: integer("project_id").notNull(),
});
