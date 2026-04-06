import { Client } from "@prisma/client";

export function getRevenueForMonth(clients: Client[], yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  const targetStart = new Date(year, month - 1, 1);
  const targetEnd = new Date(year, month, 0, 23, 59, 59, 999);

  return clients
    .filter((c) => {
      if (!c.startDate || !c.monthlyRetainer) return false;
      const start = new Date(c.startDate);
      const termMonths = c.termLength ?? 12;
      const termEnd = new Date(start);
      termEnd.setMonth(termEnd.getMonth() + termMonths);
      return start <= targetEnd && termEnd > targetStart;
    })
    .reduce((sum, c) => sum + (c.monthlyRetainer ?? 0), 0);
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
