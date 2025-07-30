"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role: "admin" })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
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
        <h2 style={{ marginBottom: 24, fontWeight: 600, fontSize: 28, textAlign: 'center', letterSpacing: -1 }}>Create your account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthInput
            label="Full Name"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoFocus
          />
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {error && <div style={{ color: '#e53e3e', fontSize: 14 }}>{error}</div>}
          <AuthButton type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</AuthButton>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 15 }}>
          Already have an account? <Link href="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Sign in</Link>
        </div>
      </AuthCard>
    </div>
  );
} 