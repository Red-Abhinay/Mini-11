import { clearAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse({ message: "Logged out successfully." });
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
    return errorResponse("Internal server error.", 500);
  }
}