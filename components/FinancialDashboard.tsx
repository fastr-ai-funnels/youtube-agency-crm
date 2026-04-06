"use client";

import { useEffect, useState } from "react";
import { Client, Expense } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getRevenueForMonth, getLast6Months, getCurrentMonth } from "@/lib/revenue";
import { ExpenseManager } from "./ExpenseManager";

type Props = {
  clients: Client[];
  expenses: Expense[];
};

export function FinancialDashboard({ clients, expenses }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentMonth = getCurrentMonth();
  const last6 = getLast6Months();

  const monthRevenue = getRevenueForMonth(clients, currentMonth);
  const monthExpenses = expenses
    .filter((e) => e.month === currentMonth)
    .reduce((s, e) => s + e.amount, 0);
  const monthProfit = monthRevenue - monthExpenses;

  const chartData = last6.map((month) => {
    const revenue = getRevenueForMonth(clients, month);
    const exp = expenses
      .filter((e) => e.month === month)
      .reduce((s, e) => s + e.amount, 0);
    const label = month.slice(5);
    return { month: label, revenue, expenses: exp, profit: revenue - exp };
  });

  const summaryCards = [
    { label: "Monthly Revenue", value: `$${monthRevenue.toLocaleString()}`, sub: "Derived from active retainers", loss: false },
    { label: "Monthly Expenses", value: `$${monthExpenses.toLocaleString()}`, sub: "This month", loss: false },
    { label: "Monthly Profit", value: `$${monthProfit.toLocaleString()}`, sub: monthProfit >= 0 ? "Net positive" : "Net loss", loss: monthProfit < 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 border-t-[3px] border-t-accent"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium">
              {card.label}
            </p>
            <p className={`mt-3 text-3xl font-bold mono-data ${card.loss ? "text-red-500" : "text-slate-900"}`}>
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Last 6 Months</h2>
          <p className="text-sm text-slate-400">Revenue auto-derived from active client retainers</p>
        </div>
        {mounted && (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#dbeafe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expense manager */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs text-slate-400 italic mb-4">
          Note: Monthly revenue is auto-derived from active client retainers. No manual revenue entry needed.
        </p>
        <ExpenseManager expenses={expenses} />
      </div>
    </div>
  );
}
