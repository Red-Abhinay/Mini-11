import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f4f4",
      fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
    }}>
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5e5e5",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#222", margin: 0 }}>
            Project Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "2px 0 0" }}>
            Logged in as <strong style={{ color: "#555" }}>{session.email}</strong>
            &nbsp;·&nbsp;
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "capitalize",
              padding: "2px 10px",
              borderRadius: "20px",
              background: session.role === "manager" ? "#fef3c7" : "#dbeafe",
              color: session.role === "manager" ? "#92400e" : "#1e40af",
            }}>
              {session.role}
            </span>
          </p>
        </div>
        <LogoutButton />
      </header>

      <main style={{ padding: "40px 32px", maxWidth: "960px", margin: "0 auto" }}>
        {session.role === "manager" ? (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "16px",
            padding: "28px 32px",
            color: "#92400e",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              🏆 Manager Panel
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              You have full access. Create projects, assign tasks to employees,
              and track progress across the entire team.
            </p>
          </div>
        ) : (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #93c5fd",
            borderRadius: "16px",
            padding: "28px 32px",
            color: "#1e40af",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              👋 Welcome, {session.email.split("@")[0]}!
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Your assigned tasks and project updates will appear here once a
              manager assigns them to you.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}