import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (process.env.LEAD_API_KEY && apiKey !== process.env.LEAD_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lead = await prisma.lead.create({
      data: {
        name: body.name ?? "Unknown",
        phone: body.phone ?? null,
        companyName: body.companyName ?? body.company_name ?? null,
        readyToInvest:
          body.readyToInvest === true ||
          body.readyToInvest === "true" ||
          body.ready_to_invest === "true",
        willingToStart:
          body.willingToStart === true ||
          body.willingToStart === "true" ||
          body.willing_to_start === "true",
        notes: body.notes ?? null,
        source: body.source ?? "Zapier",
        stage: "NEW",
      },
    });
    return NextResponse.json({ success: true, id: lead.id });
  } catch (err) {
    console.error("Lead ingestion error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
