"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please enter both email/username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Determine if identifier is email or username
      const isEmail = identifier.includes('@');
      const loginData = isEmail ? { email: identifier, password } : { username: identifier, password };
      
      const res = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      // Redirect to dashboard or home
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AuthCard>
        <h2 style={{ marginBottom: 24, fontWeight: 600, fontSize: 28, textAlign: 'center', letterSpacing: -1 }}>Sign in to Admin</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthInput
            label="Email or Username"
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            autoFocus
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div style={{ color: '#e53e3e', fontSize: 14 }}>{error}</div>}
          <AuthButton type="submit" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</AuthButton>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 15 }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: '#2563eb', fontWeight: 500 }}>Sign up</Link>
        </div>
      </AuthCard>
    </div>
  );
} 