export const dynamic = "force-dynamic";

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
    <main className="pt-6 fade-up">
      <ClientTable clients={clients} />
    </main>
  );
}
