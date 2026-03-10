"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"; 
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function createProject(formData: FormData) {
try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return { success: false, message: "Unauthorized." };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await db.insert(projects).values({
      id: uuidv4(), 
      name,
      description,
      managerId: session.userId,
      status: "planning",
    });
    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project created!" };
  } catch (e) {
    return { success: false, message: "Failed to create project." };
  }

}

export async function deleteProject(id: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "manager") {
    return { success: false, message: "Unauthorized." };
  }

  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.managerId, session.userId)));
  revalidatePath("/dashboard/projects"); 
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return { success: false, message: "Unauthorized." };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await db.update(projects)
      .set({ 
        name, 
        description, 
        updatedAt: new Date() 
      })
      .where(and(eq(projects.id, id), eq(projects.managerId, session.userId)));

    revalidatePath("/dashboard/projects");
    
    return { success: true, message: "Project updated successfully!" };
    
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update project." };
  }
}