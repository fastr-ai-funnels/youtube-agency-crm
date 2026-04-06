"use client";

import { useRef, useState, useTransition } from "react";
import { Lead } from "@prisma/client";
import { createLead, updateLead, updateLeadStage, deleteLead } from "@/lib/actions";
import { Pencil, Trash2, Phone, Users } from "lucide-react";

const STAGES = [
  { key: "NEW", label: "New Lead" },
  { key: "CALL_SCHEDULED", label: "Call Scheduled" },
  { key: "NO_SHOW", label: "No Show" },
  { key: "FOLLOW_UP", label: "Follow Up" },
  { key: "CLOSED", label: "Closed" },
  { key: "NOT_QUALIFIED", label: "Not Qualified" },
];

type Props = { leads: Lead[] };

export function LeadsBoard({ leads }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isPending, startTransition] = useTransition();

  const convertedCount = leads.filter((l) => l.stage === "CLOSED").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        </div>
        <p className="text-sm text-slate-400">{convertedCount} closed · {leads.length} total</p>
      </div>

      {/* Add lead form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-600 mb-4">Add Lead</h2>
        <form
          ref={formRef}
          action={(fd) => {
            startTransition(async () => {
              await createLead(fd);
              formRef.current?.reset();
            });
          }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <input name="name" placeholder="Name *" className="input" required />
          <input name="companyName" placeholder="Company" className="input" />
          <input name="phone" placeholder="Phone" className="input" />
          <select name="source" className="input">
            <option value="">Source</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="referral">Referral</option>
            <option value="organic">Organic</option>
          </select>
          <select name="readyToInvest" className="input">
            <option value="">Ready to invest?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select name="willingToStart" className="input">
            <option value="">Willing to start?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input name="notes" placeholder="Notes" className="input col-span-2" />
          <button type="submit" disabled={isPending} className="col-span-2 md:col-span-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {isPending ? "Adding..." : "Add Lead"}
          </button>
        </form>
      </div>

      {/* Kanban */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map(({ key, label }) => {
          const stageLeads = leads.filter((l) => l.stage === key);
          return (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">{label}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 tabular-nums">{stageLeads.length}</span>
              </div>
              {stageLeads.length === 0 && <p className="text-xs text-slate-300">No leads</p>}
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={() => setEditingLead(lead)}
                    onDelete={() => startTransition(() => deleteLead(lead.id))}
                    onStageChange={(stage) => startTransition(() => updateLeadStage(lead.id, stage))}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Edit Lead</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
            </div>
            <form
              action={(fd) => {
                startTransition(async () => {
                  await updateLead(editingLead.id, fd);
                  setEditingLead(null);
                });
              }}
              className="space-y-3"
            >
              <input name="name" defaultValue={editingLead.name} placeholder="Name *" className="input w-full" required />
              <input name="companyName" defaultValue={editingLead.companyName ?? ""} placeholder="Company" className="input w-full" />
              <input name="phone" defaultValue={editingLead.phone ?? ""} placeholder="Phone" className="input w-full" />
              <select name="stage" defaultValue={editingLead.stage} className="input w-full">
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <select name="readyToInvest" defaultValue={editingLead.readyToInvest === true ? "true" : editingLead.readyToInvest === false ? "false" : ""} className="input w-full">
                <option value="">Ready to invest?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <select name="willingToStart" defaultValue={editingLead.willingToStart === true ? "true" : editingLead.willingToStart === false ? "false" : ""} className="input w-full">
                <option value="">Willing to start?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <select name="source" defaultValue={editingLead.source ?? ""} className="input w-full">
                <option value="">Source</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Referral</option>
                <option value="organic">Organic</option>
              </select>
              <textarea name="notes" defaultValue={editingLead.notes ?? ""} placeholder="Notes" className="input w-full h-20 resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Save</button>
                <button type="button" onClick={() => setEditingLead(null)} className="flex-1 rounded-full border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead, onEdit, onDelete, onStageChange, isPending,
}: {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
  onStageChange: (stage: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm space-y-2 hover:border-slate-200 hover:bg-white transition-colors duration-150">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{lead.name}</p>
          {lead.companyName && <p className="text-xs text-slate-400">{lead.companyName}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onEdit} className="text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
          <button onClick={onDelete} disabled={isPending} className="text-slate-300 hover:text-red-500 disabled:opacity-40"><Trash2 size={12} /></button>
        </div>
      </div>
      {lead.phone && (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Phone size={10} /><span>{lead.phone}</span>
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {lead.readyToInvest !== null && lead.readyToInvest !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${lead.readyToInvest ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
            {lead.readyToInvest ? "Ready" : "Not ready"}
          </span>
        )}
        {lead.willingToStart !== null && lead.willingToStart !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${lead.willingToStart ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
            {lead.willingToStart ? "Start now" : "Not yet"}
          </span>
        )}
        {lead.source && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{lead.source}</span>}
      </div>
      {lead.notes && <p className="text-xs text-slate-400 line-clamp-2">{lead.notes}</p>}
      <select value={lead.stage} onChange={(e) => onStageChange(e.target.value)} className="input text-xs w-full mt-1">
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
    </div>
  );
}
