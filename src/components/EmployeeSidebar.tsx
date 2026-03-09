"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", href: "/dashboard/employee", icon: "🏠" },
  { label: "Kanban", href: "/dashboard/kanban", icon: "📋" },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-slate-900 text-white md:w-56 md:flex-shrink-0">
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
