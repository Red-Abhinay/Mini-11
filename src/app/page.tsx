"use client";

import { useState } from "react";
import "./globals.css";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [error, setError] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = () => {
    setError("");

    if (!name || !signupEmail || !signupPassword || !role) {
      return setError("All fields required");
    }

    if (!isValidEmail(signupEmail)) {
      return setError("Invalid email");
    }

    alert("Signup Successful!");
    setIsSignup(false);
  };

  const handleLogin = () => {
    setError("");

    if (!loginEmail || !loginPassword) {
      return setError("All fields required");
    }

    alert("Login Successful!");
  };

  return (
    <div className="cont">
      {!isSignup ? (
        <div className="form">
          <h2 style={{ textAlign: "center" }}>Login</h2>

          <label>
            Email
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button onClick={handleLogin}>Sign In</button>

          <button
            className="switch-btn"
            onClick={() => {
              setError("");
              setIsSignup(true);
            }}
          >
            Go to Signup
          </button>
        </div>
      ) : (
        <div className="form">
          <h2 style={{ textAlign: "center" }}>Signup</h2>

          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            Email
            <input
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
          </label>

          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </label>

          {error && <p className="error">{error}</p>}

          <button onClick={handleSignup}>Sign Up</button>

          <button
            className="switch-btn"
            onClick={() => {
              setError("");
              setIsSignup(false);
            }}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
