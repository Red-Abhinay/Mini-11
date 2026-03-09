import { db } from "@/lib/db";
import { users, projects, projectMembers } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "manager" | "employee";
}) {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });
  return user;
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email));
  return user ?? null;
}

export async function findUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));
  return user ?? null;
}

// Get all users (for manager)
export async function getAllUsers() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(users.createdAt);
  return allUsers;
}

// Update user
export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: "manager" | "employee";
  }
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
  return updatedUser ?? null;
}

// Delete user
export async function deleteUser(id: string) {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return deletedUser ?? null;
}

// Get users with their assigned projects
export async function getUsersWithProjects() {
  // Get all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name);

  // For each user, get their projects
  const usersWithProjects = await Promise.all(
    allUsers.map(async (user) => {
      // Get projects where user is a member
      const userProjects = await db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, user.id));

      // Get projects where user is the manager
      const managedProjects = await db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
        })
        .from(projects)
        .where(eq(projects.managerId, user.id));

      return {
        ...user,
        assignedProjects: userProjects,
        managedProjects: managedProjects,
        totalProjects: userProjects.length + managedProjects.length,
      };
    })
  );

  return usersWithProjects;
}

// Get user with projects by ID
export async function getUserWithProjects(id: string) {
  const user = await findUserById(id);
  if (!user) return null;

  // Get projects where user is a member
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, id));

  // Get projects where user is the manager
  const managedProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.managerId, id));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    assignedProjects: userProjects,
    managedProjects: managedProjects,
  };
}