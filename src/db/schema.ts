import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", {
    enum: ["todo", "in_progress", "done"],
  })
    .notNull()
    .default("todo"),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  projectId: string;
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
