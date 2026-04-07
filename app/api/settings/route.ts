import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  const ops = Object.entries(body).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  );
  await Promise.all(ops);
  return NextResponse.json({ ok: true });
}
