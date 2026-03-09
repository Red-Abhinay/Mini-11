import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import ManagerProfileMenu from "@/components/ManagerProfileMenu";
import ManagerSidebar from "@/components/ManagerSidebar";

export default async function ManagerHomePage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "manager") {
    redirect("/dashboard/employee");
  }

  const managerName =
    session.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Manager";
  const initials = managerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 md:flex-row">
      <ManagerSidebar />

      <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl text-slate-900">Manager Home</h1>
            <p className="text-xs text-slate-600 mt-1">Manage projects and team members</p>
          </div>

          <ManagerProfileMenu
            managerName={managerName}
            email={session.email}
            role={session.role}
            initials={initials}
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome, {managerName}</h2>
              <p className="mt-2 text-slate-600">You have full control over projects and team management. Use the sidebar to navigate.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Your Role</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{session.role}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
            <p className="mt-2 truncate text-sm font-medium text-slate-900">{session.email}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-600">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
              Active
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Access Level</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Full</p>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
