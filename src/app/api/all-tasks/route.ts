import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(tasks)
      .orderBy(tasks.createdAt);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/all-tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}