"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Client, DeliverableGroup, Deliverable } from "@prisma/client";
import { createClient, updateClient, deleteClient } from "@/lib/actions";
import { Pencil, Trash2, Youtube, Users, TrendingUp, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { DeliverableManager } from "./DeliverableManager";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const stageMeta: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  LEAD:    { dot: "#3b82f6", label: "Lead",    bg: "rgba(59,130,246,0.08)",  text: "#2563eb" },
  ACTIVE:  { dot: "#10b981", label: "Active",  bg: "rgba(16,185,129,0.08)",  text: "#059669" },
  PAUSED:  { dot: "#f59e0b", label: "Paused",  bg: "rgba(245,158,11,0.08)",  text: "#d97706" },
  CHURNED: { dot: "#ef4444", label: "Churned", bg: "rgba(239,68,68,0.08)",   text: "#dc2626" },
};

type Props = { clients: EnrichedClient[] };

export function ClientTable({ clients }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingClient, setEditingClient] = useState<EnrichedClient | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeClients = clients.filter((c) => c.stage === "ACTIVE");
  const mrr = activeClients.reduce((sum, c) => sum + (c.monthlyRetainer ?? 0), 0);
  const arr = mrr * 12;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Clients", value: activeClients.length.toString(), icon: Users,      color: "#2563eb" },
          { label: "MRR",            value: `$${mrr.toLocaleString()}`,       icon: DollarSign, color: "#059669" },
          { label: "ARR",            value: `$${arr.toLocaleString()}`,        icon: TrendingUp, color: "#7c3aed" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="heading-xs">{label}</p>
              <p className="text-xl font-extrabold text-slate-900 mono-data leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <div className="card overflow-hidden">
        {/* Card header */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
          style={{ borderBottom: "1px solid rgba(37,99,235,0.06)" }}
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Roster</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeClients.length} active · {clients.length} total
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            {showAddForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showAddForm ? "Hide Form" : "Add Client"}
          </button>
        </div>

        {/* Collapsible add form */}
        {showAddForm && (
          <div
            className="px-6 py-4"
            style={{ background: "rgba(37,99,235,0.02)", borderBottom: "1px solid rgba(37,99,235,0.06)" }}
          >
            <form
              ref={formRef}
              action={(fd) => {
                startTransition(async () => {
                  await createClient(fd);
                  formRef.current?.reset();
                  setShowAddForm(false);
                });
              }}
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
            >
              <input name="companyName" placeholder="Company *" className="input" required />
              <input name="owner" placeholder="Owner *" className="input" required />
              <input name="email" placeholder="Email *" className="input" type="email" required />
              <input name="phone" placeholder="Phone" className="input" />
              <select name="tier" className="input">
                <option value="FULL_SYSTEM">Full System</option>
                <option value="AI_AGENT_AUTOMATIONS">AI Agent + Automations</option>
                <option value="AI_AGENT_ONLY">AI Agent Only</option>
                <option value="AUTOMATIONS_ONLY">Automations Only</option>
                <option value="AI_AD_CAMPAIGN">AI Ad Campaign Only</option>
              </select>
              <select name="stage" className="input">
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CHURNED">Churned</option>
              </select>
              <input name="monthlyRetainer" placeholder="Retainer amount" type="number" className="input" />
              <input name="termLength" placeholder="Term (months)" type="number" defaultValue="12" className="input" />
              <input name="channelUrl" placeholder="YouTube Channel URL" className="input col-span-2" />
              <input name="channelHandle" placeholder="@handle" className="input" />
              <input name="niche" placeholder="Niche (e.g. Personal Finance)" className="input" />
              <input name="contentStyle" placeholder="Content Style" className="input" />
              <input name="targetAudience" placeholder="Target Audience" className="input" />
              <input name="postsPerWeek" placeholder="Posts/week" type="number" className="input" />
              <input name="services" placeholder="Services *" className="input col-span-2" required />
              <button
                type="submit"
                disabled={isPending}
                className="col-span-2 md:col-span-4 btn-primary justify-center text-sm py-2.5"
              >
                {isPending ? "Adding..." : "Add Client"}
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(37,99,235,0.07)" }}>
                {["Company", "Stage", "Niche", "Retainer", "Since", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pt-4 px-4 first:pl-6 last:pr-6 text-left text-[10px] uppercase tracking-[0.08em] text-slate-400 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const stage = stageMeta[client.stage] ?? {
                  dot: "#94a3b8", label: client.stage, bg: "rgba(148,163,184,0.08)", text: "#64748b",
                };
                return (
                  <tr
                    key={client.id}
                    className="table-row group"
                    style={{ borderBottom: "1px solid rgba(37,99,235,0.04)" }}
                  >
                    <td className="py-3.5 px-4 pl-6">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {client.companyName}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">{client.email}</div>
                      {(client as any).channelHandle && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Youtube size={9} className="text-red-400" />
                          {(client as any).channelHandle}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: stage.bg, color: stage.text }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: stage.dot }}
                        />
                        {stage.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{(client as any).niche || "—"}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 mono-data">
                      {client.monthlyRetainer ? `$${client.monthlyRetainer.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap mono-data">
                      {fmtDate(client.startDate)}
                    </td>
                    <td className="py-3.5 px-4 pr-6">
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingClient(client); setShowDeliverables(false); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => startTransition(() => deleteClient(client.id))}
                          disabled={isPending}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-300 text-sm">
                    No clients yet — click "Add Client" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/20 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-modal w-full max-w-xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Edit Client</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingClient.companyName}</p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form
              action={(fd) => {
                startTransition(async () => {
                  await updateClient(editingClient.id, fd);
                  setEditingClient(null);
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input name="companyName" defaultValue={editingClient.companyName} placeholder="Company *" className="input" required />
                <input name="owner" defaultValue={editingClient.owner} placeholder="Owner *" className="input" required />
                <input name="email" defaultValue={editingClient.email} placeholder="Email *" className="input" type="email" required />
                <input name="phone" defaultValue={editingClient.phone ?? ""} placeholder="Phone" className="input" />
                <select name="tier" defaultValue={editingClient.tier} className="input">
                  <option value="FULL_SYSTEM">Full System</option>
                  <option value="AI_AGENT_AUTOMATIONS">AI Agent + Automations</option>
                  <option value="AI_AGENT_ONLY">AI Agent Only</option>
                  <option value="AUTOMATIONS_ONLY">Automations Only</option>
                  <option value="AI_AD_CAMPAIGN">AI Ad Campaign Only</option>
                </select>
                <select name="stage" defaultValue={editingClient.stage} className="input">
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CHURNED">Churned</option>
                </select>
                <input name="monthlyRetainer" defaultValue={editingClient.monthlyRetainer ?? ""} placeholder="Retainer amount" type="number" className="input" />
                <input name="termLength" defaultValue={editingClient.termLength ?? 12} placeholder="Term (months)" type="number" className="input" />

                <div className="col-span-2 pt-1">
                  <p className="heading-xs mb-2">YouTube</p>
                </div>
                <input name="channelUrl" defaultValue={(editingClient as any).channelUrl ?? ""} placeholder="Channel URL" className="input col-span-2" />
                <input name="channelHandle" defaultValue={(editingClient as any).channelHandle ?? ""} placeholder="@handle" className="input" />
                <input name="niche" defaultValue={(editingClient as any).niche ?? ""} placeholder="Niche" className="input" />
                <input name="contentStyle" defaultValue={(editingClient as any).contentStyle ?? ""} placeholder="Content Style" className="input" />
                <input name="targetAudience" defaultValue={(editingClient as any).targetAudience ?? ""} placeholder="Target Audience" className="input" />
                <input name="postsPerWeek" defaultValue={(editingClient as any).postsPerWeek ?? ""} placeholder="Posts/week" type="number" className="input" />
                <input name="services" defaultValue={editingClient.services} placeholder="Services" className="input col-span-2" />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 btn-primary justify-center py-2.5 text-sm"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }} className="pt-4">
              <button
                onClick={() => setShowDeliverables((v) => !v)}
                className="text-sm text-slate-400 hover:text-slate-700 flex items-center gap-2 active:scale-95 transition-colors"
              >
                <span>{showDeliverables ? "▾" : "▸"}</span>
                Deliverables ({editingClient.deliverableGroups.length} groups)
              </button>
              {showDeliverables && (
                <div className="mt-3">
                  <DeliverableManager clientId={editingClient.id} groups={editingClient.deliverableGroups} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
