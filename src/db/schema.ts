import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


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



export const projects = pgTable("projects", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: varchar("manager_id").notNull(), 
  status: varchar("status").default("active"), 
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Project = {
  id: string;
  name: string;
  description: string | null;
  managerId: string;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};


export const projectMembers = pgTable("project_members", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id"),
  userId: varchar("user_id"),
  addedAt: timestamp("added_at").defaultNow(),
});


export const projectsRelations = relations(projects, ({ many }) => ({
  projectTasks: many(tasks),
  members: many(projectMembers),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));