export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { SettingsPanel } from "@/components/SettingsPanel";

export default async function SettingsPage() {
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  return (
    <main className="fade-up p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure your agency profile and CRM preferences</p>
      </div>
      <SettingsPanel initial={settings} />
    </main>
  );
}
