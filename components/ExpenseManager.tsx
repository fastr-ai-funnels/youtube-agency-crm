"use client";

import { useRef, useState, useTransition } from "react";
import { Expense } from "@prisma/client";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions";
import { Pencil, Trash2 } from "lucide-react";

type Props = { expenses: Expense[] };

export function ExpenseManager({ expenses }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Expenses</p>
      <form
        ref={formRef}
        action={(fd) => {
          startTransition(async () => {
            await createExpense(fd);
            formRef.current?.reset();
          });
        }}
        className="grid grid-cols-2 gap-2 md:grid-cols-4"
      >
        <input name="title" placeholder="Expense name *" className="input" required />
        <input name="amount" type="number" placeholder="Amount *" className="input" required />
        <input name="purpose" placeholder="Purpose" className="input" />
        <input name="month" placeholder={currentMonth} defaultValue={currentMonth} className="input" />
        <button type="submit" disabled={isPending} className="col-span-2 md:col-span-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95 transition-transform">
          {isPending ? "Adding..." : "Add Expense"}
        </button>
      </form>

      <div className="space-y-1">
        {expenses.length === 0 && <p className="text-sm text-white/40">No expenses yet.</p>}
        {expenses.map((exp) =>
          editingId === exp.id ? (
            <form
              key={exp.id}
              action={(fd) => {
                startTransition(async () => {
                  await updateExpense(exp.id, fd);
                  setEditingId(null);
                });
              }}
              className="grid grid-cols-2 gap-2 md:grid-cols-4 items-center"
            >
              <input name="title" defaultValue={exp.title} className="input text-sm" required />
              <input name="amount" type="number" defaultValue={exp.amount} className="input text-sm" required />
              <input name="purpose" defaultValue={exp.purpose ?? ""} className="input text-sm" />
              <input name="month" defaultValue={exp.month} className="input text-sm" />
              <div className="col-span-2 md:col-span-4 flex gap-2">
                <button type="submit" disabled={isPending} className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/60 hover:text-white active:scale-95">Cancel</button>
              </div>
            </form>
          ) : (
            <div key={exp.id} className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
              <div className="flex-1 min-w-0">
                <span className="text-white">{exp.title}</span>
                {exp.purpose && <span className="text-white/40 ml-2 text-xs">{exp.purpose}</span>}
                <span className="text-white/30 ml-2 text-xs">{exp.month}</span>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-white font-semibold">${exp.amount.toLocaleString()}</span>
                <button onClick={() => setEditingId(exp.id)} className="text-white/40 hover:text-white active:scale-95"><Pencil size={13} /></button>
                <button onClick={() => startTransition(() => deleteExpense(exp.id))} disabled={isPending} className="text-white/40 hover:text-red-400 disabled:opacity-40 active:scale-95"><Trash2 size={13} /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
