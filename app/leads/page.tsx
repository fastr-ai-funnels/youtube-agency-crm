export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { LeadsBoard } from "@/components/LeadsBoard";
import { IGLeadPipeline } from "@/components/IGLeadPipeline";

export default async function LeadsPage() {
  const [leads, igLeads] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.instagramLead.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="pt-6 fade-up space-y-12">
      <LeadsBoard leads={leads} />
      <IGLeadPipeline leads={igLeads} />
    </main>
  );
}
