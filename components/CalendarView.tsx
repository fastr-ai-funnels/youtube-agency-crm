"use client";

import { useState, useTransition, useRef } from "react";
import { Task, Deliverable, DeliverableGroup, Client } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createTask, updateTaskStatus } from "@/lib/actions";

type TaskWithClient = Task & {
  client: { companyName: string } | null;
};

type DeliverableWithGroup = Deliverable & {
  group: DeliverableGroup & {
    client: { companyName: string };
  };
};

type ClientOption = { id: string; companyName: string };

type Props = {
  tasks: TaskWithClient[];
  deliverables: DeliverableWithGroup[];
  clients: ClientOption[];
};

type SelectedItem =
  | { type: "task"; item: TaskWithClient }
  | { type: "deliverable"; item: DeliverableWithGroup };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function isSameDay(date: Date | null | undefined, year: number, month: number, day: number): boolean {
  if (!date) return false;
  const d = new Date(date);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const taskChipStyle: Record<string, string> = {
  NOT_STARTED: "bg-red-500/20 text-red-300 border border-red-500/30",
  ACTIVE: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  DONE: "bg-green-500/20 text-green-300 border border-green-500/30",
};

function deliverableChipStyle(d: DeliverableWithGroup, today: Date): string {
  if (d.completed) return "bg-green-500/20 text-green-300 border border-green-500/30";
  if (d.dueDate && new Date(d.dueDate) < today) return "bg-red-600/30 text-red-200 border border-red-600/30";
  return "bg-red-500/20 text-red-300 border border-red-500/30";
}

export function CalendarView({ tasks, deliverables, clients }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const days = getCalendarDays(year, month);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function handleAddTask(fd: FormData) {
    startTransition(async () => {
      await createTask(fd);
      formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <div className="rounded-3xl border border-white/5 bg-slate/60 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">
          Add Task
        </p>
        <form
          ref={formRef}
          action={handleAddTask}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <input
            name="title"
            placeholder="Task title *"
            className="input col-span-2"
            required
          />
          <select name="clientId" className="input">
            <option value="">Client (optional)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
          <select name="status" className="input">
            <option value="NOT_STARTED">Not Started</option>
            <option value="ACTIVE">Active</option>
            <option value="DONE">Done</option>
          </select>
          <input
            name="dueDate"
            type="date"
            className="input date-input"
            required
          />
          <input name="assignee" placeholder="Assignee" className="input" />
          <input
            name="notes"
            placeholder="Notes"
            className="input col-span-2"
          />
          <input name="link" placeholder="Link (optional)" className="input" />
          <button
            type="submit"
            disabled={isPending}
            className="col-span-2 md:col-span-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Add Task"}
          </button>
        </form>
      </div>

      {/* Calendar */}
      <div className="rounded-3xl border border-white/5 bg-slate/60 p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/60 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/60 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-xs uppercase tracking-[0.2em] text-white/30 pb-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="min-h-[80px]" />;
            }

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() + 1 &&
              year === today.getFullYear();

            const dayTasks = tasks.filter((t) =>
              isSameDay(t.dueDate, year, month, day)
            );
            const dayDeliverables = deliverables.filter((d) =>
              isSameDay(d.dueDate, year, month, day)
            );

            return (
              <div
                key={day}
                className={`min-h-[80px] rounded-xl p-1.5 border transition-colors ${
                  isToday
                    ? "border-accent/40 bg-accent/5"
                    : "border-white/5 bg-white/2 hover:bg-white/5"
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-accent text-black font-bold"
                      : "text-white/40"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() =>
                        setSelectedItem({ type: "task", item: task })
                      }
                      className={`w-full text-left truncate rounded px-1 py-0.5 text-[10px] leading-tight ${
                        taskChipStyle[task.status] ?? "bg-white/10 text-white/60"
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayDeliverables.map((del) => (
                    <button
                      key={del.id}
                      onClick={() =>
                        setSelectedItem({ type: "deliverable", item: del })
                      }
                      className={`w-full text-left truncate rounded px-1 py-0.5 text-[10px] leading-tight ${deliverableChipStyle(del, today)}`}
                      title={del.title}
                    >
                      {del.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {selectedItem.type === "task" ? "Task" : "Deliverable"}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {selectedItem.type === "task" && (
              <div className="space-y-3">
                <p className="text-white font-medium">
                  {selectedItem.item.title}
                </p>
                {selectedItem.item.client && (
                  <p className="text-sm text-white/50">
                    Client: {selectedItem.item.client.companyName}
                  </p>
                )}
                {selectedItem.item.assignee && (
                  <p className="text-sm text-white/50">
                    Assignee: {selectedItem.item.assignee}
                  </p>
                )}
                <p className="text-sm text-white/50">
                  Due: {fmtDate(selectedItem.item.dueDate)}
                </p>
                {selectedItem.item.notes && (
                  <p className="text-sm text-white/60">
                    {selectedItem.item.notes}
                  </p>
                )}
                {selectedItem.item.link && (
                  <a
                    href={selectedItem.item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent text-sm hover:underline"
                  >
                    Open link ↗
                  </a>
                )}
                <div className="pt-2">
                  <label className="text-xs text-white/40 block mb-1">
                    Status
                  </label>
                  <select
                    key={selectedItem.item.status}
                    defaultValue={selectedItem.item.status}
                    onChange={(e) => {
                      startTransition(() =>
                        updateTaskStatus(
                          (selectedItem.item as TaskWithClient).id,
                          e.target.value
                        )
                      );
                    }}
                    disabled={isPending}
                    className="input w-full"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            )}

            {selectedItem.type === "deliverable" && (
              <div className="space-y-3">
                <p className="text-white font-medium">
                  {selectedItem.item.title}
                </p>
                <p className="text-sm text-white/50">
                  Client:{" "}
                  {selectedItem.item.group.client.companyName}
                </p>
                <p className="text-sm text-white/50">
                  Group: {selectedItem.item.group.name}
                </p>
                <p className="text-sm text-white/50">
                  Due: {fmtDate(selectedItem.item.dueDate)}
                </p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      selectedItem.item.completed
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {selectedItem.item.completed ? "Completed" : "Pending"}
                  </span>
                </p>
                {selectedItem.item.link && (
                  <a
                    href={selectedItem.item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent text-sm hover:underline"
                  >
                    Open link ↗
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full rounded-full border border-white/20 py-2 text-sm hover:bg-white/5 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
