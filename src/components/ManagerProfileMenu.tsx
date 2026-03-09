"use client";

import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

interface ManagerProfileMenuProps {
  managerName: string;
  email: string;
  role: string;
  initials: string;
}

export default function ManagerProfileMenu({
  managerName,
  email,
  role,
  initials,
}: ManagerProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials || "M"}
        </span>
        <span className="hidden sm:inline">Profile</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manager Profile</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{managerName}</p>
          <p className="mt-1 break-all text-sm text-slate-600">{email}</p>
          <p className="mt-1 text-sm capitalize text-slate-600">Role: {role}</p>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <LogoutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
