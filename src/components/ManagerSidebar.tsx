"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface MenuItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/dashboard/manager",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M3 10.5L12 3L21 10.5V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M4 19.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="6" y="11" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="11" y="8" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="16" y="5" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M3 7A2 2 0 0 1 5 5H9L11 7H19A2 2 0 0 1 21 9V17A2 2 0 0 1 19 19H5A2 2 0 0 1 3 17V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Manage Users",
    href: "/dashboard/users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19C3.5 15.96 5.96 13.5 9 13.5C12.04 13.5 14.5 15.96 14.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15.5 14.7C16 14.56 16.51 14.5 17 14.5C19.49 14.5 21.5 16.51 21.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Manage Tasks",
    href: "/dashboard/all-tasks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8H16M8 12H16M8 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function ManagerSidebar() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (pathname === href) return true;
    if (href === "/dashboard/manager") return pathname === href;
    return pathname.startsWith(`${href}/`);
  };

  const navContent = (
    <nav className="flex h-full flex-col gap-1 p-4">
      {menuItems.map((item) => {
        const isActive = isActiveRoute(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-5 py-4 text-base font-semibold transition ${
              isActive
                ? "border border-sky-200/40 bg-sky-200/20 text-sky-50 shadow-[inset_0_0_0_1px_rgba(214,232,243,0.18),0_8px_20px_rgba(0,0,0,0.28)]"
                : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-slate-800"
            }`}
          >
            <span
              className={`[&>svg]:h-5 [&>svg]:w-5 ${
                isActive ? "text-sky-100" : "text-slate-300"
              }`}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="w-full bg-slate-900 text-white md:hidden">
        {navContent}
      </aside>

      <aside className="hidden bg-slate-900 text-white md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-56 md:overflow-y-auto">
        {navContent}
      </aside>

      <div className="hidden md:block md:w-56 md:shrink-0" aria-hidden="true" />
    </>
  );
}
