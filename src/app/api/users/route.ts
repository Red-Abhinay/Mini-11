<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllUsers, getUsersWithProjects } from "@/services/user.service";

// GET /api/users - Get all users (Manager only)
// GET /api/users?withProjects=true - Get users with projects
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only managers can view all users
    if (session.role !== "manager") {
      return NextResponse.json(
        { error: "Forbidden: Manager access required" },
        { status: 403 }
      );
    }

    // Check if we need users with projects
    const { searchParams } = new URL(req.url);
    const withProjects = searchParams.get("withProjects") === "true";

    if (withProjects) {
      const usersWithProjects = await getUsersWithProjects();
      return NextResponse.json(usersWithProjects, { status: 200 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
=======
import { db } from "@/lib/db";  
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const allUsers = await db.select({
            id:users.id,
            name:users.name,
            email:users.email,

        })
        .from(users)
        .orderBy(users.name);
        return NextResponse.json(allUsers,{status:200});
    }
    catch(error){
        console.error("[GET /api/users]",error);
    
    return NextResponse.json({error:"Internal server error"},{status:500});
    }
>>>>>>> 321bf86 (Added user assignment task)
}
