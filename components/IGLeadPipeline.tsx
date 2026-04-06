"use client";

import { useState, useTransition } from "react";
import { InstagramLead } from "@prisma/client";
import { Instagram, Clock, ExternalLink, Pencil, Trash2, Bell } from "lucide-react";
import { createIGLead, updateIGLeadStage, deleteIGLead } from "@/lib/actions";

const STAGES = [
  { key: "FOUND", label: "Found", color: "bg-slate-100 text-slate-600" },
  { key: "SENT", label: "DM Sent", color: "bg-blue-100 text-blue-700" },
  { key: "FOLLOWED_UP", label: "Followed Up", color: "bg-yellow-100 text-yellow-700" },
  { key: "BOOKED", label: "Booked", color: "bg-purple-100 text-purple-700" },
  { key: "CLOSED", label: "Closed", color: "bg-green-100 text-green-700" },
];

type Props = { leads: InstagramLead[] };

export function IGLeadPipeline({ leads }: Props) {
  const [localLeads, setLocalLeads] = useState(leads);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLead, setEditingLead] = useState<InstagramLead | null>(null);
  const [isPending, startTransition] = useTransition();

  const closedCount = localLeads.filter(l => l.stage === "CLOSED").length;

  // Leads with upcoming reminders (within 48hrs)
  const now = Date.now();
  const reminders = localLeads.filter(l => {
    if (!l.reminderAt) return false;
    const diff = new Date(l.reminderAt).getTime() - now;
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  });

  function handleStageChange(id: string, stage: string) {
    setLocalLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    startTransition(() => updateIGLeadStage(id, stage));
  }

  function handleDelete(id: string) {
    setLocalLeads(prev => prev.filter(l => l.id !== id));
    startTransition(() => deleteIGLead(id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram size={20} className="text-pink-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">IG Lead Scraper</h2>
            <p className="text-xs text-slate-400">{closedCount} closed · {localLeads.length} total prospects</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + Add Lead
        </button>
      </div>

      {/* Reminder alerts */}
      {reminders.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
          <Bell size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Upcoming Follow-ups ({reminders.length})</p>
            <div className="mt-1 space-y-0.5">
              {reminders.map(l => (
                <p key={l.id} className="text-xs text-yellow-700">
                  @{l.handle} — {new Date(l.reminderAt!).toLocaleString()}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {STAGES.map(s => {
          const count = localLeads.filter(l => l.stage === s.key).length;
          return (
            <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-slate-900 tabular-nums">{count}</p>
              <p className={`text-xs font-medium mt-1 rounded-full px-2 py-0.5 inline-block ${s.color}`}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Lead table */}
      {localLeads.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Instagram size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No IG leads yet. Add your first prospect above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Handle</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Followers</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Niche</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Stage</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.08em] font-bold text-slate-400">Reminder</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {localLeads.map((lead, i) => (
                <tr key={lead.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === localLeads.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {lead.handle[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">@{lead.handle}</p>
                        {lead.notes && <p className="text-xs text-slate-400 line-clamp-1">{lead.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums text-slate-700 font-medium">
                      {lead.followers ? (lead.followers >= 1000 ? `${(lead.followers / 1000).toFixed(1)}K` : lead.followers.toString()) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-500">{lead.niche || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.stage}
                      onChange={e => handleStageChange(lead.id, e.target.value)}
                      className="input text-xs py-1 px-2 rounded-full"
                    >
                      {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {lead.reminderAt ? (
                      <span className={`flex items-center gap-1 text-xs ${new Date(lead.reminderAt).getTime() - now < 48 * 3600 * 1000 && new Date(lead.reminderAt).getTime() > now ? "text-yellow-600 font-medium" : "text-slate-400"}`}>
                        <Clock size={11} />
                        {new Date(lead.reminderAt).toLocaleDateString()}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {lead.profileUrl && (
                        <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-pink-500 transition-colors">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button onClick={() => setEditingLead(lead)} className="text-slate-300 hover:text-slate-600">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} disabled={isPending} className="text-slate-300 hover:text-red-500 disabled:opacity-40">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <IGLeadModal
          title="Add IG Lead"
          onClose={() => setShowAdd(false)}
          onSave={async (fd) => {
            const res = await createIGLead(fd);
            if (res) setLocalLeads(prev => [res as InstagramLead, ...prev]);
            setShowAdd(false);
          }}
          isPending={isPending}
        />
      )}

      {/* Edit modal */}
      {editingLead && (
        <IGLeadModal
          title="Edit Lead"
          defaults={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={async (fd) => {
            startTransition(async () => {
              // update via stage + notes fields
              const stage = fd.get("stage") as string;
              const notes = fd.get("notes") as string;
              const reminderAt = fd.get("reminderAt") as string;
              setLocalLeads(prev => prev.map(l => l.id === editingLead.id
                ? { ...l, stage, notes, reminderAt: reminderAt ? new Date(reminderAt) : null }
                : l
              ));
              await updateIGLeadStage(editingLead.id, stage);
            });
            setEditingLead(null);
          }}
          isPending={isPending}
        />
      )}
    </div>
  );
}

function IGLeadModal({
  title, defaults, onClose, onSave, isPending,
}: {
  title: string;
  defaults?: InstagramLead;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div className="glass-modal w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>
        <form action={onSave} className="space-y-3">
          <input name="handle" defaultValue={defaults?.handle ?? ""} placeholder="@handle (without @) *" className="input w-full" required />
          <input name="followers" type="number" defaultValue={defaults?.followers ?? ""} placeholder="Followers" className="input w-full" />
          <input name="niche" defaultValue={defaults?.niche ?? ""} placeholder="Niche (e.g. fitness, beauty)" className="input w-full" />
          <input name="profileUrl" defaultValue={defaults?.profileUrl ?? ""} placeholder="Profile URL" className="input w-full" />
          <select name="stage" defaultValue={defaults?.stage ?? "FOUND"} className="input w-full">
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Follow-up Reminder</label>
            <input
              name="reminderAt"
              type="datetime-local"
              defaultValue={defaults?.reminderAt ? new Date(new Date(defaults.reminderAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
              className="input w-full"
            />
          </div>
          <textarea name="notes" defaultValue={defaults?.notes ?? ""} placeholder="Notes (DM sent, response, etc.)" className="input w-full h-20 resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Save</button>
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
