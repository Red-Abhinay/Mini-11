import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  status: varchar("status"),
  projectId: varchar("project_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Task = {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  projectId?: string;
  createdAt?: Date;
};
