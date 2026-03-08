"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        background: "#d4af7a",
        color: "#fff",
        border: "none",
        padding: "9px 24px",
        borderRadius: "30px",
        fontSize: "13px",
        fontWeight: "600",
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        letterSpacing: "0.5px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "background 0.2s",
      }}
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}