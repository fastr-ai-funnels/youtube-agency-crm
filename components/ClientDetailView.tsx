"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Client, DeliverableGroup, Deliverable, Task, ContentBrief, Script } from "@prisma/client";
import { ArrowLeft, Youtube, Sparkles, FileText, CheckSquare, LayoutDashboard, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { DeliverableManager } from "./DeliverableManager";
import { updateTaskStatus } from "@/lib/actions";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
  tasks: Task[];
  contentBriefs: ContentBrief[];
  scripts: (Script & { client: { id: string; companyName: string; niche: string | null } })[];
};

type Tab = "overview" | "deliverables" | "research" | "scripts" | "tasks";

export function ClientDetailView({ client }: { client: EnrichedClient }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [, startTransition] = useTransition();

  // Research state
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState("");
  const [localBriefs, setLocalBriefs] = useState(client.contentBriefs);
  const [briefCopied, setBriefCopied] = useState(false);

  // Scripts state
  const [scriptTopic, setScriptTopic] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [localScripts, setLocalScripts] = useState(client.scripts);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  async function generateBrief() {
    if (!client.niche) return;
    setGeneratingBrief(true);
    setBriefError("");
    try {
      const res = await fetch("/api/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          niche: client.niche,
          contentStyle: client.contentStyle,
          targetAudience: client.targetAudience,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLocalBriefs(prev => [data, ...prev]);
    } catch (e: unknown) {
      setBriefError(e instanceof Error ? e.message : "Failed to generate brief");
    } finally {
      setGeneratingBrief(false);
    }
  }

  async function generateScript() {
    if (!scriptTopic.trim()) return;
    setGeneratingScript(true);
    setScriptError("");
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          topic: scriptTopic,
          niche: client.niche,
          contentStyle: client.contentStyle,
          targetAudience: client.targetAudience,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLocalScripts(prev => [data, ...prev]);
      setScriptTopic("");
      setExpandedScript(data.id);
    } catch (e: unknown) {
      setScriptError(e instanceof Error ? e.message : "Failed to generate script");
    } finally {
      setGeneratingScript(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
    { id: "deliverables", label: "Deliverables", icon: <CheckSquare size={14} /> },
    { id: "research", label: "Research", icon: <Sparkles size={14} /> },
    { id: "scripts", label: "Scripts", icon: <FileText size={14} /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare size={14} /> },
  ];

  const stage = client.stage as string;
  const stageColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PROSPECT: "bg-blue-100 text-blue-700",
    CHURNED: "bg-red-100 text-red-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{client.companyName}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stageColors[stage] ?? "bg-slate-100 text-slate-600"}`}>
                {stage}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {client.niche && <span className="text-xs text-slate-400">{client.niche}</span>}
              {client.channelHandle && (
                <span className="flex items-center gap-1 text-xs text-accent font-medium">
                  <Youtube size={11} />{client.channelHandle}
                </span>
              )}
              {client.postsPerWeek && (
                <span className="text-xs text-slate-400">{client.postsPerWeek}x/week</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Client Info */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">Client Info</h2>
            <dl className="space-y-3">
              {[
                { label: "Owner", value: client.owner },
                { label: "Email", value: client.email },
                { label: "Phone", value: client.phone },
                { label: "Monthly Retainer", value: client.monthlyRetainer ? `$${client.monthlyRetainer.toLocaleString()}` : null },
                { label: "Start Date", value: client.startDate ? new Date(client.startDate).toLocaleDateString() : null },
                { label: "Content Style", value: client.contentStyle },
                { label: "Target Audience", value: client.targetAudience },
              ].map(item => item.value ? (
                <div key={item.label} className="flex justify-between text-sm">
                  <dt className="text-slate-400">{item.label}</dt>
                  <dd className="text-slate-800 font-medium text-right max-w-[60%]">{item.value}</dd>
                </div>
              ) : null)}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => { setTab("research"); generateBrief(); }}
                disabled={!client.niche}
                className="w-full flex items-center gap-2 rounded-2xl bg-accent/10 hover:bg-accent/20 text-accent px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-40"
              >
                <Sparkles size={14} />Generate Content Brief
              </button>
              <button
                onClick={() => setTab("scripts")}
                className="w-full flex items-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-3 text-sm font-semibold transition-colors"
              >
                <FileText size={14} />Write Script
              </button>
              {client.channelUrl && (
                <a
                  href={client.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 text-sm font-semibold transition-colors"
                >
                  <Youtube size={14} />View YouTube Channel
                </a>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Content Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 tabular-nums">{localBriefs.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Briefs</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 tabular-nums">{localScripts.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Scripts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deliverables Tab */}
      {tab === "deliverables" && (
        <DeliverableManager clientId={client.id} groups={client.deliverableGroups} />
      )}

      {/* Research Tab */}
      {tab === "research" && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Sparkles size={14} className="text-accent" />Content Strategy Brief
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">AI-generated niche analysis powered by Groq (free)</p>
              </div>
              <button
                onClick={generateBrief}
                disabled={generatingBrief || !client.niche}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {generatingBrief ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {generatingBrief ? "Researching..." : "Generate Brief"}
              </button>
            </div>
            {!client.niche && (
              <p className="text-xs text-slate-400">Add a niche to this client to generate a brief.</p>
            )}
            {briefError && <p className="text-sm text-red-500">{briefError}</p>}
          </div>

          {generatingBrief && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 h-48 shimmer" />
          )}

          {localBriefs.map(brief => (
            <div key={brief.id} className="card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{brief.niche} — Strategy Brief</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(brief.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(brief.brief);
                    setBriefCopied(true);
                    setTimeout(() => setBriefCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
                >
                  {briefCopied ? <><Check size={11} className="text-green-500" />Copied</> : <><Copy size={11} />Copy</>}
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{brief.brief}</p>
              </div>
            </div>
          ))}

          {localBriefs.length === 0 && !generatingBrief && (
            <div className="card p-12 text-center">
              <Sparkles size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No briefs yet. Generate your first one above.</p>
            </div>
          )}
        </div>
      )}

      {/* Scripts Tab */}
      {tab === "scripts" && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <FileText size={14} className="text-accent" />Generate Script
            </h2>
            <div className="flex gap-3">
              <input
                value={scriptTopic}
                onChange={e => setScriptTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateScript()}
                placeholder="Video topic or title idea"
                className="input flex-1"
              />
              <button
                onClick={generateScript}
                disabled={generatingScript || !scriptTopic.trim()}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {generatingScript ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {generatingScript ? "Writing..." : "Generate"}
              </button>
            </div>
            {scriptError && <p className="mt-2 text-sm text-red-500">{scriptError}</p>}
          </div>

          {generatingScript && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 h-32 shimmer" />
          )}

          {localScripts.length === 0 && !generatingScript ? (
            <div className="card p-12 text-center">
              <FileText size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No scripts yet. Generate your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localScripts.map(script => (
                <div key={script.id} className="card overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{script.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(script.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(script.fullScript);
                          setCopiedScript(script.id);
                          setTimeout(() => setCopiedScript(null), 2000);
                        }}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
                      >
                        {copiedScript === script.id ? <><Check size={11} className="text-green-500" />Copied</> : <><Copy size={11} />Copy</>}
                      </button>
                      {expandedScript === script.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                  {expandedScript === script.id && (
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
      )}

      {/* Tasks Tab */}
      {tab === "tasks" && (
        <div className="space-y-3">
          {client.tasks.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckSquare size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No tasks yet.</p>
            </div>
          ) : (
            client.tasks.map(task => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-slate-400 mt-0.5">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <select
                  defaultValue={task.status}
                  onChange={e => startTransition(() => updateTaskStatus(task.id, e.target.value))}
                  className="input text-xs py-1 px-2 rounded-full"
                >
                  {["TODO", "IN_PROGRESS", "DONE"].map(s => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
