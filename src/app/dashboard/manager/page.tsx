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
    <div className="manager-home-page flex min-h-screen flex-col text-slate-100 md:flex-row">
      <ManagerSidebar />

      <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl text-slate-100">Manager Home</h1>
            <p className="mt-1 text-xs text-slate-300">Manage projects and team members</p>
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
        <section className="manager-home-hero rounded-2xl border border-white/15 p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Welcome, {managerName}</h2>
              <p className="mt-2 text-slate-300">You have full control over projects and team management. Use the sidebar to navigate.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="manager-home-card rounded-xl border border-white/15 p-4">
            <p className="text-xs font-semibold uppercase text-slate-300">Your Role</p>
            <p className="mt-2 text-lg font-semibold text-slate-100 capitalize">{session.role}</p>
          </div>
          <div className="manager-home-card rounded-xl border border-white/15 p-4">
            <p className="text-xs font-semibold uppercase text-slate-300">Email</p>
            <p className="mt-2 truncate text-sm font-medium text-slate-100">{session.email}</p>
          </div>
          <div className="manager-home-card rounded-xl border border-white/15 p-4">
            <p className="text-xs font-semibold uppercase text-slate-300">Status</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300"></span>
              Active
            </p>
          </div>
          <div className="manager-home-card rounded-xl border border-white/15 p-4">
            <p className="text-xs font-semibold uppercase text-slate-300">Access Level</p>
            <p className="mt-2 text-lg font-semibold text-slate-100">Full</p>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
