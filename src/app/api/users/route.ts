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
}
