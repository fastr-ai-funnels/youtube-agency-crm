export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/CalendarView";

export default async function CalendarPage() {
  const [tasks, deliverables, clients] = await Promise.all([
    prisma.task.findMany({
      where: { dueDate: { not: null } },
      include: { client: { select: { companyName: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.deliverable.findMany({
      where: { dueDate: { not: null } },
      include: {
        group: { include: { client: { select: { companyName: true } } } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.client.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  return (
    <main className="pt-6">
      <CalendarView
        tasks={tasks}
        deliverables={deliverables}
        clients={clients}
      />
    </main>
  );
}
