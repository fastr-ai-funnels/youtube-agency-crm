"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/clients");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "#eef2ff",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -5%, rgba(37,99,235,0.12), transparent),
          radial-gradient(ellipse 50% 60% at 90% 90%, rgba(99,102,241,0.08), transparent)
        `,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
          top: "-15%", left: "50%", transform: "translateX(-50%)",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
          bottom: "10%", right: "5%",
        }}
      />

      {/* Login card */}
      <div className="glass-login w-full max-w-sm mx-4 p-8 fade-up relative">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 6px 24px rgba(37,99,235,0.35)",
            }}
          >
            <Youtube size={26} className="text-white" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none">
              YouTube Agency OS
            </h1>
            <p className="text-xs text-slate-400 font-medium">Powered by FASTR AI</p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.12), transparent)" }}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              placeholder="Demo password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              autoFocus
            />
          </div>

          {error && (
            <p
              className="text-xs text-center font-medium rounded-lg py-2"
              style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626" }}
            >
              Incorrect password — try again
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background:
                loading || !password
                  ? "rgba(37,99,235,0.25)"
                  : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow:
                loading || !password
                  ? "none"
                  : "0 4px 16px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.2) inset",
              cursor: loading || !password ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Confidential demo · FASTR AI © 2026
        </p>
      </div>
    </div>
  );
}
