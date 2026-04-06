export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ScriptLibrary } from "@/components/ScriptLibrary";

export default async function ScriptsPage() {
  const scripts = await prisma.script.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, companyName: true, niche: true } } },
  });
  const clients = await prisma.client.findMany({
    where: { stage: "ACTIVE" },
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, niche: true, contentStyle: true, targetAudience: true },
  });

  return (
    <main className="pt-6 fade-up">
      <ScriptLibrary scripts={scripts as any} clients={clients as any} />
    </main>
  );
}
