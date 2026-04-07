"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";

type Settings = Record<string, string>;

const FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: "agencyName",      label: "Agency Name",           placeholder: "Your YouTube agency name" },
  { key: "ownerName",       label: "Owner / Contact Name",  placeholder: "Your name" },
  { key: "email",           label: "Email",                 placeholder: "hello@youragency.com", type: "email" },
  { key: "phone",           label: "Phone",                 placeholder: "+1 (555) 000-0000" },
  { key: "website",         label: "Website",               placeholder: "https://youragency.com" },
  { key: "instagram",       label: "Instagram Handle",      placeholder: "@youragency" },
  { key: "servicesOffered", label: "Services Offered",      placeholder: "Video Production, Script Writing, Channel Management, Thumbnails..." },
  { key: "targetNiche",     label: "Primary Niche / Market", placeholder: "e.g. Fitness, Finance, SaaS, Local Business" },
  { key: "retainerRange",   label: "Typical Retainer Range", placeholder: "e.g. $1,500 – $5,000/month" },
  { key: "onboardingLink",  label: "Onboarding / Intake Form", placeholder: "https://..." },
  { key: "notes",           label: "Notes for the Agent",   placeholder: "Anything the AI agent should know about how you operate..." },
];

export function SettingsPanel({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div className="card p-8">
        <h3 className="font-semibold text-slate-900 mb-1">Agency Profile</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This information is injected into the AI agent so it understands your business. It also pre-fills proposals and briefs.
        </p>

        <div className="space-y-5">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="heading-xs block mb-1.5">{f.label}</label>
              <input
                type={f.type || "text"}
                value={form[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input w-full"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={handleSave} disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-xs text-accent">Changes saved successfully</span>}
        </div>
      </div>

      <div className="card p-6 mt-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">CRM Info</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between">
            <span className="text-xs text-slate-400">Built by</span>
            <span className="text-xs text-slate-700">FASTR AI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-400">Agent model</span>
            <span className="text-xs font-mono text-slate-700">llama-3.3-70b (Groq)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
