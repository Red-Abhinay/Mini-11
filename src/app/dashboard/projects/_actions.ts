"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"; 
import { eq } from "drizzle-orm";

export async function createProject(formData: FormData) {
  

try {
    const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const managerId = "proj-mgr-1"; 

  await db.insert(projects).values({
    id: uuidv4(), 
    name,
    description,
    managerId,
    status: "planning",
  });
  revalidatePath("/dashboard/projects");
    return { success: true, message: "Project created!" };
  } catch (e) {
    return { success: false, message: "Failed to create project." };
  }

}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/dashboard/projects"); 
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await db.update(projects)
      .set({ 
        name, 
        description, 
        updatedAt: new Date() 
      })
      .where(eq(projects.id, id));

    revalidatePath("/dashboard/projects");
    
    return { success: true, message: "Project updated successfully!" };
    
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update project." };
  }
}