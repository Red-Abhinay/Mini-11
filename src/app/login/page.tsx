"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./auth.css";

export default function AuthPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const switchPanel = (toSignup: boolean) => {
    setError("");
    setSuccessMsg("");
    setIsSignup(toSignup);
  };

  const handleLogin = async () => {
    setError("");
    setSuccessMsg("");
    if (!loginEmail || !loginPassword) return setError("All fields are required.");
    if (!isValidEmail(loginEmail)) return setError("Enter a valid email.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed."); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    setSuccessMsg("");
    if (!name || !signupEmail || !signupPassword || !role)
      return setError("All fields are required.");
    if (!isValidEmail(signupEmail)) return setError("Enter a valid email.");
    if (signupPassword.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: signupEmail,
          password: signupPassword,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); return; }
      setSuccessMsg("Account created! Please sign in.");
      setName(""); setSignupEmail(""); setSignupPassword(""); setRole("");
      setTimeout(() => { switchPanel(false); setSuccessMsg(""); }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper kanban-page">
      <div className={`cont${isSignup ? " s--signup" : ""}`}>

        {/* ── LOGIN FORM ── */}
        <div className="form sign-in">
          <h2>Welcome</h2>

          <label>
            <span className="label-text">Email</span>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="email"
            />
          </label>

          <label>
            <span className="label-text">Password</span>
            <div className="password-field">
              <input
                type={showLoginPw ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowLoginPw(!showLoginPw)}
              >
                {showLoginPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <span className="forgot-link">Forgot password?</span>

          {!isSignup && error && <p className="msg-error">{error}</p>}
          {!isSignup && successMsg && <p className="msg-success">{successMsg}</p>}

          <button className="submit-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        {/* ── SLIDING PANEL ── */}
        <div className="sub-cont">
          <div className="img">
            <div className="img__text m--up">
              <h3>Don&apos;t have an account?<br />Please Sign up!</h3>
            </div>
            <div className="img__text m--in">
              <h3>If you already have<br />an account, just sign in.</h3>
            </div>
            <div className="img__btn" onClick={() => switchPanel(!isSignup)}>
              <span className="m--up">Sign Up</span>
              <span className="m--in">Sign In</span>
            </div>
          </div>

          {/* ── SIGNUP FORM ── */}
          <div className="form sign-up">
            <h2>Create Account</h2>

            <label>
              <span className="label-text">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>

            <label>
              <span className="label-text">Email</span>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label>
              <span className="label-text">Password</span>
              <div className="password-field">
                <input
                  type={showSignupPw ? "text" : "password"}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowSignupPw(!showSignupPw)}
                >
                  {showSignupPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label>
              <span className="label-text">Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="manager">Project Manager</option>
                <option value="employee">Employee</option>
              </select>
            </label>

            {isSignup && error && <p className="msg-error">{error}</p>}
            {isSignup && successMsg && <p className="msg-success">{successMsg}</p>}

            <button className="submit-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating…" : "Sign Up"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}