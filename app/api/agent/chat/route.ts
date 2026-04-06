import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ── GROQ CALLER ────────────────────────────────────────────────────────────────

async function callGroq(messages: object[], tools: object[], forceToolUse: boolean) {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 2000,
    messages,
    tools,
  };
  if (forceToolUse) body.tool_choice = "required";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }
  return res.json();
}

// ── TOOL DEFINITIONS ───────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "List all clients. Use when asked about clients, who's active, retainer totals, etc.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter by stage: ACTIVE, LEAD, CHURNED, PAUSED. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_client",
      description: "Get full details for a specific client including scripts and briefs.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Client company name (partial match ok)" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_leads",
      description: "List sales leads / pipeline leads.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter by stage: NEW, CALL_SCHEDULED, FOLLOW_UP, CLOSED, NOT_QUALIFIED. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_ig_leads",
      description: "List Instagram outreach leads.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter by stage: FOUND, SENT, FOLLOWED_UP, BOOKED, CLOSED. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_ig_lead",
      description: "Add a new Instagram prospect to the pipeline.",
      parameters: {
        type: "object",
        properties: {
          handle: { type: "string", description: "Instagram handle without @" },
          niche: { type: "string" },
          followers: { type: "number" },
          profileUrl: { type: "string" },
          notes: { type: "string" },
          stage: { type: "string", description: "FOUND, SENT, FOLLOWED_UP, BOOKED, or CLOSED. Default: FOUND" },
        },
        required: ["handle"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ig_lead",
      description: "Update stage or notes for an Instagram lead.",
      parameters: {
        type: "object",
        properties: {
          handle: { type: "string", description: "Instagram handle (partial match ok)" },
          stage: { type: "string", description: "New stage: FOUND, SENT, FOLLOWED_UP, BOOKED, CLOSED" },
          notes: { type: "string" },
        },
        required: ["handle"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_scripts",
      description: "List generated YouTube scripts, optionally filtered by client.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Filter by client name (partial match ok). Omit for all scripts." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_script",
      description: "Generate a full YouTube script (HOOK/INTRO/BODY/CTA) for a client using Groq AI. Use when asked to write a script.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Client company name (partial match ok)" },
          topic: { type: "string", description: "Video topic or title idea" },
        },
        required: ["clientName", "topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_brief",
      description: "Generate a content strategy brief for a client's niche using Groq AI. Use when asked for research, strategy, or a brief.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Client company name (partial match ok)" },
        },
        required: ["clientName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a fact to persistent memory so it's available in future conversations.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Short unique key (e.g. 'posting_goal', 'target_niche')" },
          value: { type: "string", description: "The fact to remember" },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_memory",
      description: "Delete a fact from persistent memory.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string" },
        },
        required: ["key"],
      },
    },
  },
];

// ── TOOL EXECUTOR ──────────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "list_clients": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const clients = await prisma.client.findMany({
          where,
          orderBy: { companyName: "asc" },
          select: {
            id: true, companyName: true, stage: true, niche: true,
            channelHandle: true, monthlyRetainer: true, postsPerWeek: true,
            _count: { select: { scripts: true, contentBriefs: true } },
          },
        });
        return JSON.stringify(clients);
      }

      case "get_client": {
        const client = await prisma.client.findFirst({
          where: { companyName: { contains: args.name as string, mode: "insensitive" } },
          include: {
            scripts: { orderBy: { createdAt: "desc" }, take: 5 },
            contentBriefs: { orderBy: { createdAt: "desc" }, take: 3 },
            tasks: { orderBy: { dueDate: "asc" }, take: 10 },
          },
        });
        if (!client) return `No client found matching "${args.name}"`;
        return JSON.stringify(client);
      }

      case "list_leads": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const leads = await prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 30,
        });
        return JSON.stringify(leads);
      }

      case "list_ig_leads": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const leads = await prisma.instagramLead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        return JSON.stringify(leads);
      }

      case "add_ig_lead": {
        const lead = await prisma.instagramLead.create({
          data: {
            handle: (args.handle as string).replace(/^@/, ""),
            niche: (args.niche as string) || null,
            followers: args.followers ? Number(args.followers) : null,
            profileUrl: (args.profileUrl as string) || null,
            notes: (args.notes as string) || null,
            stage: (args.stage as string) || "FOUND",
          },
        });
        return `Added @${lead.handle} to IG pipeline (stage: ${lead.stage})`;
      }

      case "update_ig_lead": {
        const lead = await prisma.instagramLead.findFirst({
          where: { handle: { contains: (args.handle as string).replace(/^@/, ""), mode: "insensitive" } },
        });
        if (!lead) return `No IG lead found matching "${args.handle}"`;
        const data: Record<string, unknown> = {};
        if (args.stage) data.stage = args.stage;
        if (args.notes) data.notes = args.notes;
        await prisma.instagramLead.update({ where: { id: lead.id }, data });
        return `Updated @${lead.handle}: ${JSON.stringify(data)}`;
      }

      case "list_scripts": {
        const where = args.clientName
          ? { client: { companyName: { contains: args.clientName as string, mode: "insensitive" as const } } }
          : {};
        const scripts = await prisma.script.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { client: { select: { companyName: true } } },
        });
        return JSON.stringify(scripts.map(s => ({
          id: s.id, title: s.title, client: s.client.companyName, createdAt: s.createdAt,
        })));
      }

      case "generate_script": {
        const client = await prisma.client.findFirst({
          where: { companyName: { contains: args.clientName as string, mode: "insensitive" } },
        });
        if (!client) return `No client found matching "${args.clientName}"`;

        const prompt = `You are a YouTube script writer for a ${client.niche || "general"} channel.
Content style: ${client.contentStyle || "educational, engaging"}
Target audience: ${client.targetAudience || "general audience"}
Video topic: ${args.topic}

Write a complete YouTube script with these exact sections:

HOOK:
[First 15 seconds — grab attention immediately]

INTRO:
[30-60 seconds — establish credibility and promise the value]

BODY:
[Main content — 3-5 key points, conversational and specific]

CTA:
[Final 30 seconds — clear single call to action]

Be conversational, specific, and avoid generic filler.`;

        const groqRes = await callGroq([{ role: "user", content: prompt }], [], false);
        const fullText = groqRes.choices?.[0]?.message?.content ?? "";

        const hookMatch = fullText.match(/HOOK[:\s]+([\s\S]*?)(?=INTRO[:\s]|$)/i);
        const introMatch = fullText.match(/INTRO[:\s]+([\s\S]*?)(?=BODY[:\s]|$)/i);
        const bodyMatch = fullText.match(/BODY[:\s]+([\s\S]*?)(?=CTA[:\s]|$)/i);
        const ctaMatch = fullText.match(/CTA[:\s]+([\s\S]*?)$/i);

        const script = await prisma.script.create({
          data: {
            clientId: client.id,
            title: args.topic as string,
            hook: hookMatch?.[1]?.trim() || "",
            intro: introMatch?.[1]?.trim() || "",
            body: bodyMatch?.[1]?.trim() || "",
            cta: ctaMatch?.[1]?.trim() || "",
            fullScript: fullText,
          },
        });
        return `Script generated for ${client.companyName}: "${script.title}"\n\n${fullText}`;
      }

      case "generate_brief": {
        const client = await prisma.client.findFirst({
          where: { companyName: { contains: args.clientName as string, mode: "insensitive" } },
        });
        if (!client) return `No client found matching "${args.clientName}"`;
        if (!client.niche) return `${client.companyName} has no niche set. Add a niche first.`;

        const prompt = `You are a YouTube strategy expert. Create a comprehensive content strategy brief for a YouTube channel in the "${client.niche}" niche.
Content style: ${client.contentStyle || "not specified"}
Target audience: ${client.targetAudience || "general audience"}

Cover: what's winning right now, optimal upload frequency, best hook styles (3 formulas), title formulas (5 patterns), thumbnail strategy, 5 content pillars, audience pain points, and 2-3 underserved angles.
Be specific and tactical. No generic advice.`;

        const groqRes = await callGroq([{ role: "user", content: prompt }], [], false);
        const brief = groqRes.choices?.[0]?.message?.content ?? "";

        await prisma.contentBrief.create({
          data: { clientId: client.id, niche: client.niche, brief },
        });
        return `Content brief generated for ${client.companyName} (${client.niche}):\n\n${brief}`;
      }

      case "save_memory": {
        await prisma.agentMemory.upsert({
          where: { key: args.key as string },
          create: { key: args.key as string, value: args.value as string },
          update: { value: args.value as string },
        });
        return `Remembered: ${args.key} = ${args.value}`;
      }

      case "delete_memory": {
        await prisma.agentMemory.delete({ where: { key: args.key as string } }).catch(() => {});
        return `Deleted memory: ${args.key}`;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e: unknown) {
    return `Tool error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── ROUTE HANDLER ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message || !sessionId) {
      return NextResponse.json({ error: "message and sessionId required" }, { status: 400 });
    }

    // Load memory + history in parallel
    const [memoryRows, historyRows] = await Promise.all([
      prisma.agentMemory.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.agentConversation.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        take: 40,
      }),
    ]);

    const memorySection = memoryRows.length > 0
      ? `\n\n[PERSISTENT MEMORY]\n${memoryRows.map(m => `• ${m.key}: ${m.value}`).join("\n")}\n`
      : "";

    const systemPrompt = `You are an AI assistant for a YouTube agency CRM. You help manage clients, generate scripts, research niches, track Instagram leads, and answer questions about the business.

You have access to tools that let you read and write to the database directly. ALWAYS use tools — never tell the user to do something manually.

CRITICAL RULES:
- ALWAYS call a tool for every request. Never respond with instructions like "go to Clients and add..."
- For script generation: call generate_script immediately
- For briefs/research: call generate_brief immediately
- For IG leads: call add_ig_lead or update_ig_lead immediately
- save_memory for important facts the user shares (niche goals, preferences, targets)

WRONG (never do this):
- "You can add this in the Clients section..."
- "I don't have direct access to..."
- "Please manually..."

CORRECT:
- "add @fitnesscoach to IG leads" → call add_ig_lead immediately
- "write a script for HealthCo about meal prep" → call generate_script immediately${memorySection}`;

    // Build messages array
    const apiMessages: object[] = [
      ...historyRows.map(r => ({ role: r.role, content: r.content })),
      { role: "user", content: message },
    ];

    // Ensure starts with user message
    while (apiMessages.length > 1 && (apiMessages[0] as { role: string }).role !== "user") {
      apiMessages.shift();
    }

    // First call — force tool use
    let data = await callGroq(
      [{ role: "system", content: systemPrompt }, ...apiMessages],
      TOOLS,
      true
    );

    // If model chose to respond conversationally (end_turn on forced call)
    if (data.choices?.[0]?.finish_reason === "stop") {
      const reply = data.choices[0].message?.content ?? "";
      await saveConversation(sessionId, message, reply);
      return NextResponse.json({ reply });
    }

    // Tool loop — max 6 iterations
    let iterations = 0;
    const loopMessages: object[] = [...apiMessages];

    while (data.choices?.[0]?.finish_reason === "tool_calls" && iterations < 6) {
      iterations++;
      const assistantMsg = data.choices[0].message;
      const toolCalls = assistantMsg.tool_calls ?? [];

      // Execute all tools in parallel
      const toolResults = await Promise.all(
        toolCalls.map(async (tc: { id: string; function: { name: string; arguments: string } }) => ({
          role: "tool" as const,
          tool_call_id: tc.id,
          content: await executeTool(tc.function.name, JSON.parse(tc.function.arguments || "{}")),
        }))
      );

      loopMessages.push({ role: "assistant", content: assistantMsg.content, tool_calls: toolCalls });
      loopMessages.push(...toolResults);

      data = await callGroq(
        [{ role: "system", content: systemPrompt }, ...loopMessages],
        TOOLS,
        false
      );
    }

    const reply = data.choices?.[0]?.message?.content ?? "Done.";
    await saveConversation(sessionId, message, reply);
    return NextResponse.json({ reply });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Agent error" },
      { status: 500 }
    );
  }
}

async function saveConversation(sessionId: string, userMsg: string, assistantMsg: string) {
  await prisma.agentConversation.createMany({
    data: [
      { sessionId, role: "user", content: userMsg },
      { sessionId, role: "assistant", content: assistantMsg },
    ],
  });
}
