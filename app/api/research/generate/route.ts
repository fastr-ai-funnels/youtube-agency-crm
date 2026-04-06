import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, niche, contentStyle, targetAudience } = await req.json();
    if (!clientId || !niche) return NextResponse.json({ error: "clientId and niche required" }, { status: 400 });

    const prompt = `You are a YouTube strategy expert. Create a comprehensive content strategy brief for a YouTube channel in the "${niche}" niche.
Content style: ${contentStyle || "not specified"}
Target audience: ${targetAudience || "general audience"}

Provide a detailed brief covering:

**1. What's Winning Right Now**
Top video formats and styles performing in this niche.

**2. Optimal Upload Frequency**
What the algorithm rewards in this niche specifically.

**3. Best Performing Hook Styles**
3 specific hook formulas that get clicks in this niche.

**4. Title Formulas**
5 title patterns that perform well with examples.

**5. Thumbnail Strategy**
What visually works — colors, faces, text, style.

**6. Content Pillars**
5 content categories to rotate through.

**7. Audience Pain Points**
What problems and desires drive views in this niche.

**8. Underserved Angles**
2-3 content gaps competitors are missing.

Be specific and tactical. No generic advice. Write as if you've personally studied the top 50 channels in this niche.`;

    const brief = await callGroq(prompt);

    const contentBrief = await prisma.contentBrief.create({
      data: { clientId, niche, brief },
    });

    return NextResponse.json(contentBrief);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to generate brief" }, { status: 500 });
  }
}
