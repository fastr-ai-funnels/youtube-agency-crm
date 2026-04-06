export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDetailView } from "@/components/ClientDetailView";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      deliverableGroups: { include: { deliverables: true } },
      tasks: { orderBy: { dueDate: "asc" } },
      contentBriefs: { orderBy: { createdAt: "desc" } },
      scripts: {
        orderBy: { createdAt: "desc" },
        include: { client: { select: { id: true, companyName: true, niche: true } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <main className="pt-6">
      <ClientDetailView client={client} />
    </main>
  );
}
