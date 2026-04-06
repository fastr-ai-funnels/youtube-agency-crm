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
      max_tokens: 1800,
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
    const { clientId, topic, niche, contentStyle, targetAudience } = await req.json();
    if (!clientId || !topic) return NextResponse.json({ error: "clientId and topic required" }, { status: 400 });

    const prompt = `You are a YouTube script writer for a ${niche || "general"} channel.
Content style: ${contentStyle || "educational, engaging"}
Target audience: ${targetAudience || "general audience"}
Video topic: ${topic}

Write a complete YouTube script with these exact sections. Use these exact headers:

HOOK:
[First 15 seconds — grab attention immediately, create pattern interrupt]

INTRO:
[30-60 seconds — establish credibility and promise the value]

BODY:
[Main content — 3-5 key points, conversational and specific]

CTA:
[Final 30 seconds — clear single call to action]

Be conversational, specific, and avoid generic filler. No meta-commentary. Write it like you'd actually say it on camera.`;

    const fullText = await callGroq(prompt);

    // Parse sections
    const hookMatch = fullText.match(/HOOK[:\s]+([\s\S]*?)(?=INTRO[:\s]|$)/i);
    const introMatch = fullText.match(/INTRO[:\s]+([\s\S]*?)(?=BODY[:\s]|$)/i);
    const bodyMatch = fullText.match(/BODY[:\s]+([\s\S]*?)(?=CTA[:\s]|$)/i);
    const ctaMatch = fullText.match(/CTA[:\s]+([\s\S]*?)$/i);

    const script = await prisma.script.create({
      data: {
        clientId,
        title: topic,
        hook: hookMatch?.[1]?.trim() || "",
        intro: introMatch?.[1]?.trim() || "",
        body: bodyMatch?.[1]?.trim() || "",
        cta: ctaMatch?.[1]?.trim() || "",
        fullScript: fullText,
      },
      include: { client: { select: { id: true, companyName: true, niche: true } } },
    });

    return NextResponse.json(script);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to generate script" }, { status: 500 });
  }
}
