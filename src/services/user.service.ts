import { db } from "@/lib/db";
import { users, projects, projectMembers } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

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
  const sqlClient = neon(process.env.DATABASE_URL!);

  const allUsers = await sqlClient`
    SELECT id, name, email, role, created_at AS "createdAt"
    FROM users
    ORDER BY name
  `;

  const usersWithProjects = await Promise.all(
    allUsers.map(async (user) => {
      // Assigned projects are derived from task assignments.
      const assignedProjects = await sqlClient`
        SELECT DISTINCT
          p.id,
          p.name,
          COALESCE(p.status, 'active') AS status
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to::text = ${user.id}::text
      `;

      const managedProjects = await sqlClient`
        SELECT
          p.id,
          p.name,
          COALESCE(p.status, 'active') AS status
        FROM projects p
        WHERE p.manager_id::text = ${user.id}::text
      `;

      return {
        ...user,
        assignedProjects,
        managedProjects,
        totalProjects: assignedProjects.length + managedProjects.length,
      };
    })
  );

  return usersWithProjects;
}

// Get user with projects by ID
export async function getUserWithProjects(id: string) {
  const sqlClient = neon(process.env.DATABASE_URL!);

  const userRows = await sqlClient`
    SELECT id, name, email, role, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM users
    WHERE id::text = ${id}::text
    LIMIT 1
  `;

  if (userRows.length === 0) return null;
  const user = userRows[0];

  const assignedProjects = await sqlClient`
    SELECT DISTINCT
      p.id,
      p.name,
      p.description,
      COALESCE(p.status, 'active') AS status,
      p.created_at AS "createdAt"
    FROM tasks t
    INNER JOIN projects p ON t.project_id = p.id
    WHERE t.assigned_to::text = ${id}::text
  `;

  const managedProjects = await sqlClient`
    SELECT
      p.id,
      p.name,
      p.description,
      COALESCE(p.status, 'active') AS status,
      p.created_at AS "createdAt"
    FROM projects p
    WHERE p.manager_id::text = ${id}::text
  `;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    assignedProjects,
    managedProjects,
  };
}