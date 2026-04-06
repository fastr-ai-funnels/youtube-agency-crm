"use client";

import { useState } from "react";
import { FileText, Sparkles, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

type Client = { id: string; companyName: string; niche: string | null; contentStyle: string | null; targetAudience: string | null };
type Script = {
  id: string; title: string; hook: string; intro: string; body: string; cta: string;
  fullScript: string; createdAt: string;
  client: { id: string; companyName: string; niche: string | null };
};

export function ScriptLibrary({ scripts, clients }: { scripts: Script[]; clients: Client[] }) {
  const [generating, setGenerating] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [localScripts, setLocalScripts] = useState(scripts);
  const [error, setError] = useState("");

  async function generateScript() {
    if (!selectedClientId || !topic.trim()) return;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, topic, niche: client.niche, contentStyle: client.contentStyle, targetAudience: client.targetAudience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLocalScripts(prev => [data, ...prev]);
      setTopic("");
      setExpandedId(data.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  function copyScript(script: Script) {
    navigator.clipboard.writeText(script.fullScript);
    setCopied(script.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-slate-900">Scripting Engine</h1>
        </div>
        <p className="text-sm text-slate-400">One-click production-ready YouTube scripts in each client&apos;s voice. Powered by Groq (free).</p>
      </div>

      {/* Generator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />Generate New Script
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="input">
            <option value="">Select client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}{c.niche ? ` — ${c.niche}` : ""}</option>)}
          </select>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generateScript()} placeholder="Video topic or title idea" className="input" />
          <button onClick={generateScript} disabled={generating || !selectedClientId || !topic.trim()} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            <Sparkles size={13} />{generating ? "Writing..." : "Generate Script"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {clients.length === 0 && <p className="mt-3 text-xs text-slate-400">Add active clients first to generate scripts.</p>}
      </div>

      {/* Script list */}
      {localScripts.length === 0 && !generating ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No scripts yet. Generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {generating && <div className="rounded-3xl border border-slate-200 bg-white p-6 h-32 shimmer" />}
          {localScripts.map(script => (
            <div key={script.id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedId(expandedId === script.id ? null : script.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{script.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {script.client.companyName}{script.client.niche ? ` · ${script.client.niche}` : ""} · {new Date(script.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={e => { e.stopPropagation(); copyScript(script); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    {copied === script.id ? <><Check size={11} className="text-green-500" />Copied</> : <><Copy size={11} />Copy</>}
                  </button>
                  {expandedId === script.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>
              {expandedId === script.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
                  {[
                    { label: "HOOK", content: script.hook, color: "text-accent" },
                    { label: "INTRO", content: script.intro, color: "text-blue-400" },
                    { label: "BODY", content: script.body, color: "text-slate-600" },
                    { label: "CTA", content: script.cta, color: "text-green-600" },
                  ].map(s => (
                    <div key={s.label} className="pt-4">
                      <p className={`text-[10px] uppercase tracking-[0.08em] font-bold mb-2 ${s.color}`}>{s.label}</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{s.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
