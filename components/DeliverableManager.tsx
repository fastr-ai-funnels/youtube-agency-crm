"use client";

import { useTransition } from "react";
import { DeliverableGroup, Deliverable } from "@prisma/client";
import {
  createDeliverableGroup,
  createDeliverable,
  updateDeliverable,
  updateDeliverableDueDate,
  deleteDeliverable,
  deleteDeliverableGroup,
} from "@/lib/actions";
import { Trash2 } from "lucide-react";

type EnrichedGroup = DeliverableGroup & { deliverables: Deliverable[] };

type Props = {
  clientId: string;
  groups: EnrichedGroup[];
};

const GROUP_TYPES = ["GENERAL", "PICTURES", "VIDEOS"];

function fmtDueDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export function DeliverableManager({ clientId, groups }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <p className="heading-xs">Deliverables</p>
      {groups.length === 0 && (
        <p className="text-sm text-slate-400">No deliverable groups yet.</p>
      )}

      {groups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-slate-800">{group.name}</span>
              <span className="rounded-full bg-accent/10 text-accent text-xs px-2 py-0.5 font-medium">
                {group.type}
              </span>
            </div>
            <button
              onClick={() => startTransition(() => deleteDeliverableGroup(group.id))}
              disabled={isPending}
              className="text-slate-300 hover:text-red-400 disabled:opacity-40 active:scale-95"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="space-y-1 ml-1">
            {group.deliverables.map((d) => (
              <div key={d.id} className="flex items-center gap-2 py-1 flex-wrap">
                <input
                  type="checkbox"
                  checked={d.completed}
                  onChange={(e) =>
                    startTransition(() => updateDeliverable(d.id, { completed: e.target.checked }))
                  }
                  className="rounded border-slate-200 accent-blue-600 shrink-0"
                />
                <span className={`text-sm flex-1 min-w-0 ${d.completed ? "line-through text-slate-300" : "text-slate-700"}`}>
                  {d.title}
                </span>
                {d.dueDate && !d.completed && (
                  <span className="text-xs text-slate-400 whitespace-nowrap mono-data">
                    Due {fmtDueDate(d.dueDate)}
                  </span>
                )}
                <input
                  type="date"
                  defaultValue={toDateInput(d.dueDate)}
                  className="input text-xs w-32 py-1"
                  title="Due date"
                  onBlur={(e) =>
                    startTransition(() => updateDeliverableDueDate(d.id, e.target.value || null))
                  }
                />
                <input
                  type="text"
                  placeholder="Link"
                  defaultValue={d.link ?? ""}
                  className="input text-xs w-32"
                  onBlur={(e) =>
                    startTransition(() => updateDeliverable(d.id, { link: e.target.value || null }))
                  }
                />
                <button
                  onClick={() => startTransition(() => deleteDeliverable(d.id))}
                  disabled={isPending}
                  className="text-slate-300 hover:text-red-400 disabled:opacity-40 active:scale-95 shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          <form
            action={(fd) => {
              const title = fd.get("title")?.toString().trim();
              const dueDate = fd.get("dueDate")?.toString().trim() || null;
              if (!title) return;
              startTransition(() => createDeliverable(group.id, title, dueDate));
            }}
            className="flex gap-2 mt-2 flex-wrap"
          >
            <input name="title" placeholder="+ Add deliverable" className="input text-xs flex-1 min-w-[140px]" />
            <input name="dueDate" type="date" className="input text-xs w-32 py-1" title="Due date (optional)" />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-accent/10 text-accent px-3 py-1 text-xs hover:bg-accent hover:text-white disabled:opacity-40 active:scale-95 transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      ))}

      <form
        action={(fd) => {
          const name = fd.get("name")?.toString().trim();
          const type = fd.get("type")?.toString() ?? "GENERAL";
          if (!name) return;
          startTransition(() => createDeliverableGroup(clientId, name, type));
        }}
        className="flex gap-2 items-center"
      >
        <input name="name" placeholder="Group name (e.g. Video Ads)" className="input text-sm flex-1" />
        <select name="type" className="input text-sm">
          {GROUP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 active:scale-95 whitespace-nowrap"
        >
          + Group
        </button>
      </form>
    </div>
  );
}
