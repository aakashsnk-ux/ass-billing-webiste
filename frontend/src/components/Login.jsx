import React, { useState } from "react";
import { api, setToken } from "../api.js";
import logo from "../assets/logo.jpeg";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      setToken(res.token);
      onLoggedIn();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 h-14 w-14 overflow-hidden rounded-xl border border-slate-200">
            <img src={logo} alt="logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg font-bold">Billing Book</h1>
        </div>

        <label className="mb-1 block text-xs text-slate-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-accent focus:bg-white"
          autoComplete="username"
        />

        <label className="mb-1 block text-xs text-slate-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-accent focus:bg-white"
          autoComplete="current-password"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-accent font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
