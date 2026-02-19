"use client";

import { useState } from "react";
import "./auth.css";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = () => {
    setError("");

    if (!name || !signupEmail || !signupPassword || !role) {
      return setError("All fields are required");
    }

    if (!isValidEmail(signupEmail)) {
      return setError("Enter valid email");
    }

    if (signupPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    alert("Signup Successful!");
    setIsSignup(false);

    setName("");
    setSignupEmail("");
    setSignupPassword("");
    setRole("");
  };

  const handleLogin = () => {
    setError("");

    if (!loginEmail || !loginPassword) {
      return setError("All fields required");
    }

    if (!isValidEmail(loginEmail)) {
      return setError("Enter valid email");
    }

    alert("Login Successful!");
  };

  return (
    <div className={`cont ${isSignup ? "s--signup" : ""}`}>
      <div className="form sign-in">
        <h2>Welcome</h2>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
        </label>

        {error && <p className="error">{error}</p>}

        <button className="submit" onClick={handleLogin}>
          Sign In
        </button>
      </div>

      <div className="sub-cont">
        <div className="img">
          <div className="img__text m--up">
            <h3>Don't have an account? Please Sign up!</h3>
          </div>

          <div className="img__text m--in">
            <h3>If you already have an account, just sign in.</h3>
          </div>

          <div
            className="img__btn"
            onClick={() => {
              setError("");
              setIsSignup(!isSignup);
            }}
          >
            <span className="m--up">Sign Up</span>
            <span className="m--in">Sign In</span>
          </div>
        </div>

        <div className="form sign-up">
          <h2>Create Account</h2>

          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            <span>Email</span>
            <input
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </label>

          <label>
            <span>Password</span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </label>

          <label>
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="MANAGER">Project Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </label>

          {error && <p className="error">{error}</p>}

          <button className="submit" onClick={handleSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
