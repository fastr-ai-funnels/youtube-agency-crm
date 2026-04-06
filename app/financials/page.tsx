export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FinancialDashboard } from "@/components/FinancialDashboard";

export default async function FinancialsPage() {
  const [clients, expenses] = await Promise.all([
    prisma.client.findMany(),
    prisma.expense.findMany({ orderBy: { month: "desc" } }),
  ]);

  return (
    <main className="pt-6 fade-up">
      <FinancialDashboard clients={clients} expenses={expenses} />
    </main>
  );
}
