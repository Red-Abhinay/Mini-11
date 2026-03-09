import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  if (session.role === "manager") {
    redirect("/dashboard/manager");
  }

  redirect("/dashboard/employee");
}