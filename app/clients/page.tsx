export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { ClientTable } from "@/components/ClientTable";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      deliverableGroups: { include: { deliverables: true } },
    },
  });

  return (
    <main className="fade-up space-y-1">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 heading-tight">Clients</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your YouTube agency client portfolio</p>
      </div>
      <ClientTable clients={clients} />
    </main>
  );
}
