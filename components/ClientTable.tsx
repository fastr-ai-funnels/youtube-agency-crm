"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Client, DeliverableGroup, Deliverable } from "@prisma/client";
import { createClient, updateClient, deleteClient } from "@/lib/actions";
import { Pencil, Trash2, Youtube } from "lucide-react";
import { DeliverableManager } from "./DeliverableManager";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const stageBadge: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  CHURNED: "bg-red-100 text-red-600",
};

type Props = { clients: EnrichedClient[] };

export function ClientTable({ clients }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingClient, setEditingClient] = useState<EnrichedClient | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-400">
            {clients.filter((c) => c.stage === "ACTIVE").length} active · {clients.length} total
          </p>
        </div>
        <form
          ref={formRef}
          action={(fd) => { startTransition(async () => { await createClient(fd); formRef.current?.reset(); }); }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4 w-full"
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
            className="col-span-2 md:col-span-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 active:scale-95 transition-all"
          >
            {isPending ? "Adding..." : "Add Client"}
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-[0.08em] text-slate-400 font-medium">
              <th className="pb-3 pr-4">Company</th>
              <th className="pb-3 pr-4">Stage</th>
              <th className="pb-3 pr-4">Niche</th>
              <th className="pb-3 pr-4">Retainer</th>
              <th className="pb-3 pr-4">Since</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors duration-100">
                <td className="py-3 pr-4">
                  <Link href={`/clients/${client.id}`} className="font-medium text-slate-900 hover:text-accent transition-colors">
                    {client.companyName}
                  </Link>
                  <div className="text-xs text-slate-400">{client.email}</div>
                  {(client as any).channelHandle && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Youtube size={9} className="text-red-500" />
                      {(client as any).channelHandle}
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageBadge[client.stage] ?? "bg-slate-100 text-slate-500"}`}>
                    {client.stage}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs">{(client as any).niche || "—"}</td>
                <td className="py-3 pr-4 text-slate-900 font-semibold mono-data">
                  {client.monthlyRetainer ? `$${client.monthlyRetainer.toLocaleString()}` : "—"}
                </td>
                <td className="py-3 pr-4 text-slate-400 text-xs whitespace-nowrap mono-data">
                  {fmtDate(client.startDate)}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingClient(client); setShowDeliverables(false); }} className="text-slate-300 hover:text-slate-700 active:scale-95">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => startTransition(() => deleteClient(client.id))} disabled={isPending} className="text-slate-300 hover:text-red-400 disabled:opacity-40 active:scale-95">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-300 text-sm">
                  No clients yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 space-y-4 my-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Edit Client</h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
            </div>
            <form
              action={(fd) => { startTransition(async () => { await updateClient(editingClient.id, fd); setEditingClient(null); }); }}
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

                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-medium mb-3">YouTube</p>
                </div>
                <input name="channelUrl" defaultValue={(editingClient as any).channelUrl ?? ""} placeholder="Channel URL" className="input col-span-2" />
                <input name="channelHandle" defaultValue={(editingClient as any).channelHandle ?? ""} placeholder="@handle" className="input" />
                <input name="niche" defaultValue={(editingClient as any).niche ?? ""} placeholder="Niche" className="input" />
                <input name="contentStyle" defaultValue={(editingClient as any).contentStyle ?? ""} placeholder="Content Style" className="input" />
                <input name="targetAudience" defaultValue={(editingClient as any).targetAudience ?? ""} placeholder="Target Audience" className="input" />
                <input name="postsPerWeek" defaultValue={(editingClient as any).postsPerWeek ?? ""} placeholder="Posts/week" type="number" className="input" />
                <input name="services" defaultValue={editingClient.services} placeholder="Services" className="input col-span-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 active:scale-95">
                  {isPending ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 rounded-full border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 active:scale-95">
                  Cancel
                </button>
              </div>
            </form>
            <div className="border-t border-slate-100 pt-4">
              <button onClick={() => setShowDeliverables((v) => !v)} className="text-sm text-slate-400 hover:text-slate-700 flex items-center gap-2 active:scale-95">
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
