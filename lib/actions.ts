"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function safeNumber(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function safeDate(value: FormDataEntryValue | null): Date | undefined {
  if (!value || typeof value !== "string" || value === "") return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/leads");
  revalidatePath("/financials");
  revalidatePath("/calendar");
}

// ── CLIENTS ────────────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const owner = formData.get("owner")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!companyName || !owner || !email) return;

  await prisma.client.create({
    data: {
      companyName,
      owner,
      email,
      phone: formData.get("phone")?.toString().trim() || null,
      tier: formData.get("tier")?.toString() || "STANDARD",
      stage: formData.get("stage")?.toString() || "LEAD",
      monthlyRetainer: safeNumber(formData.get("monthlyRetainer")),
      frameioLink: formData.get("frameioLink")?.toString().trim() || null,
      contractUrl: formData.get("contractUrl")?.toString().trim() || null,
      services: formData.get("services")?.toString().trim() || "",
      startDate: safeDate(formData.get("startDate")) ?? new Date(),
      termLength: safeNumber(formData.get("termLength")) ?? 12,
      adAccountNumber: formData.get("adAccountNumber")?.toString().trim() || null,
      adAccountLink: formData.get("adAccountLink")?.toString().trim() || null,
      deliverablesNeeded: formData.get("deliverablesNeeded")?.toString().trim() || null,
      setupFeeStatus: formData.get("setupFeeStatus")?.toString() || null,
      retainerStatus: formData.get("retainerStatus")?.toString() || null,
      crmApiStatus: formData.get("crmApiStatus")?.toString() || null,
      twilioNumber: formData.get("twilioNumber")?.toString().trim() || null,
      elevenLabsVoiceId: formData.get("elevenLabsVoiceId")?.toString().trim() || null,
      n8nWorkflowId: formData.get("n8nWorkflowId")?.toString().trim() || null,
      goLiveDate: safeDate(formData.get("goLiveDate")),
      resultsNotes: formData.get("resultsNotes")?.toString().trim() || null,
      channelUrl: formData.get("channelUrl")?.toString().trim() || null,
      channelHandle: formData.get("channelHandle")?.toString().trim() || null,
      niche: formData.get("niche")?.toString().trim() || null,
      contentStyle: formData.get("contentStyle")?.toString().trim() || null,
      targetAudience: formData.get("targetAudience")?.toString().trim() || null,
      postsPerWeek: safeNumber(formData.get("postsPerWeek")),
    },
  });
  revalidateAll();
}

export async function updateClient(id: string, formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const owner = formData.get("owner")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!companyName || !owner || !email) return;

  await prisma.client.update({
    where: { id },
    data: {
      companyName,
      owner,
      email,
      phone: formData.get("phone")?.toString().trim() || null,
      tier: formData.get("tier")?.toString() || "STANDARD",
      stage: formData.get("stage")?.toString() || "LEAD",
      monthlyRetainer: safeNumber(formData.get("monthlyRetainer")),
      frameioLink: formData.get("frameioLink")?.toString().trim() || null,
      contractUrl: formData.get("contractUrl")?.toString().trim() || null,
      services: formData.get("services")?.toString().trim() || "",
      startDate: safeDate(formData.get("startDate")) ?? undefined,
      termLength: safeNumber(formData.get("termLength")) ?? 12,
      adAccountNumber: formData.get("adAccountNumber")?.toString().trim() || null,
      adAccountLink: formData.get("adAccountLink")?.toString().trim() || null,
      deliverablesNeeded: formData.get("deliverablesNeeded")?.toString().trim() || null,
      setupFeeStatus: formData.get("setupFeeStatus")?.toString() || null,
      retainerStatus: formData.get("retainerStatus")?.toString() || null,
      crmApiStatus: formData.get("crmApiStatus")?.toString() || null,
      twilioNumber: formData.get("twilioNumber")?.toString().trim() || null,
      elevenLabsVoiceId: formData.get("elevenLabsVoiceId")?.toString().trim() || null,
      n8nWorkflowId: formData.get("n8nWorkflowId")?.toString().trim() || null,
      goLiveDate: safeDate(formData.get("goLiveDate")),
      resultsNotes: formData.get("resultsNotes")?.toString().trim() || null,
      channelUrl: formData.get("channelUrl")?.toString().trim() || null,
      channelHandle: formData.get("channelHandle")?.toString().trim() || null,
      niche: formData.get("niche")?.toString().trim() || null,
      contentStyle: formData.get("contentStyle")?.toString().trim() || null,
      targetAudience: formData.get("targetAudience")?.toString().trim() || null,
      postsPerWeek: safeNumber(formData.get("postsPerWeek")),
    },
  });
  revalidateAll();
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidateAll();
}

// ── PROJECTS ───────────────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const clientId = formData.get("clientId")?.toString() ?? "";
  if (!name || !clientId) return;

  await prisma.project.create({
    data: {
      name,
      clientId,
      summary: formData.get("summary")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "PLANNING",
      kickoffDate: safeDate(formData.get("kickoffDate")),
      dueDate: safeDate(formData.get("dueDate")),
    },
  });
  revalidateAll();
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  await prisma.project.update({
    where: { id },
    data: {
      name,
      summary: formData.get("summary")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "PLANNING",
      dueDate: safeDate(formData.get("dueDate")),
    },
  });
  revalidateAll();
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidateAll();
}

// ── TASKS ──────────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  if (!title) return;

  const projectId = formData.get("projectId")?.toString().trim() || null;
  const clientId = formData.get("clientId")?.toString().trim() || null;

  await prisma.task.create({
    data: {
      title,
      projectId: projectId || null,
      clientId: clientId || null,
      assignee: formData.get("assignee")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "NOT_STARTED",
      dueDate: safeDate(formData.get("dueDate")),
      notes: formData.get("notes")?.toString().trim() || null,
      link: formData.get("link")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

export async function updateTask(id: string, formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  if (!title) return;

  await prisma.task.update({
    where: { id },
    data: {
      title,
      assignee: formData.get("assignee")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "NOT_STARTED",
      dueDate: safeDate(formData.get("dueDate")),
      notes: formData.get("notes")?.toString().trim() || null,
      link: formData.get("link")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

export async function updateTaskStatus(taskId: string, status: string) {
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidateAll();
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidateAll();
}

// ── EXPENSES ───────────────────────────────────────────────────────────────────

export async function createExpense(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const amount = safeNumber(formData.get("amount"));
  const month = formData.get("month")?.toString().trim() ?? currentMonth();
  if (!title || amount === null) return;

  await prisma.expense.create({
    data: { title, amount, purpose: formData.get("purpose")?.toString().trim() || null, month },
  });
  revalidateAll();
}

export async function updateExpense(id: string, formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const amount = safeNumber(formData.get("amount"));
  if (!title || amount === null) return;

  await prisma.expense.update({
    where: { id },
    data: {
      title,
      amount,
      purpose: formData.get("purpose")?.toString().trim() || null,
      month: formData.get("month")?.toString().trim() ?? currentMonth(),
    },
  });
  revalidateAll();
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidateAll();
}

// ── LEADS ──────────────────────────────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  const readyRaw = formData.get("readyToInvest")?.toString();
  const startRaw = formData.get("willingToStart")?.toString();

  await prisma.lead.create({
    data: {
      name,
      phone: formData.get("phone")?.toString().trim() || null,
      companyName: formData.get("companyName")?.toString().trim() || null,
      readyToInvest: readyRaw === "true" ? true : readyRaw === "false" ? false : null,
      willingToStart: startRaw === "true" ? true : startRaw === "false" ? false : null,
      stage: formData.get("stage")?.toString() || "NEW",
      notes: formData.get("notes")?.toString().trim() || null,
      source: formData.get("source")?.toString().trim() || null,
      conditionalLogicTag: formData.get("conditionalLogicTag")?.toString().trim() || null,
      salesCallDate: safeDate(formData.get("salesCallDate")),
      outcome: formData.get("outcome")?.toString() || null,
      revenueOnClose: safeNumber(formData.get("revenueOnClose")),
      downsellPathTaken: formData.get("downsellPathTaken")?.toString() || null,
    },
  });
  revalidateAll();
}

export async function updateLead(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  const readyRaw = formData.get("readyToInvest")?.toString();
  const startRaw = formData.get("willingToStart")?.toString();

  await prisma.lead.update({
    where: { id },
    data: {
      name,
      phone: formData.get("phone")?.toString().trim() || null,
      companyName: formData.get("companyName")?.toString().trim() || null,
      readyToInvest: readyRaw === "true" ? true : readyRaw === "false" ? false : null,
      willingToStart: startRaw === "true" ? true : startRaw === "false" ? false : null,
      stage: formData.get("stage")?.toString() || "NEW",
      notes: formData.get("notes")?.toString().trim() || null,
      source: formData.get("source")?.toString().trim() || null,
      conditionalLogicTag: formData.get("conditionalLogicTag")?.toString().trim() || null,
      salesCallDate: safeDate(formData.get("salesCallDate")),
      outcome: formData.get("outcome")?.toString() || null,
      revenueOnClose: safeNumber(formData.get("revenueOnClose")),
      downsellPathTaken: formData.get("downsellPathTaken")?.toString() || null,
    },
  });
  revalidateAll();
}

export async function updateLeadStage(id: string, stage: string) {
  await prisma.lead.update({ where: { id }, data: { stage } });
  revalidateAll();
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidateAll();
}

// ── DELIVERABLE GROUPS ────────────────────────────────────────────────────────

export async function createDeliverableGroup(clientId: string, name: string, type: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;

  const project = await prisma.project.create({
    data: {
      name: `${client.companyName} — ${name}`,
      clientId,
      summary: `Deliverables: ${name}`,
      status: "IN_PROGRESS",
    },
  });

  await prisma.deliverableGroup.create({
    data: { name, type, clientId, projectId: project.id },
  });
  revalidateAll();
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteDeliverableGroup(id: string) {
  await prisma.deliverableGroup.delete({ where: { id } });
  revalidateAll();
}

// ── DELIVERABLES ───────────────────────────────────────────────────────────────

export async function createDeliverable(
  groupId: string,
  title: string,
  dueDate?: string | null
) {
  const group = await prisma.deliverableGroup.findUnique({ where: { id: groupId } });
  if (!group) return;

  let taskId: string | null = null;
  if (group.projectId) {
    const task = await prisma.task.create({
      data: {
        title,
        projectId: group.projectId,
        status: "NOT_STARTED",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    taskId = task.id;
  }

  await prisma.deliverable.create({
    data: {
      title,
      groupId,
      taskId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });
  revalidateAll();
  revalidatePath(`/clients/${group.clientId}`);
}

export async function updateDeliverable(
  id: string,
  data: { title?: string; link?: string | null; completed?: boolean }
) {
  await prisma.deliverable.update({ where: { id }, data });

  if (data.completed !== undefined) {
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (deliverable?.taskId) {
      await prisma.task.update({
        where: { id: deliverable.taskId },
        data: { status: data.completed ? "DONE" : "NOT_STARTED" },
      });
    }
  }
  revalidateAll();
}

export async function updateDeliverableDueDate(id: string, dueDate: string | null) {
  await prisma.deliverable.update({
    where: { id },
    data: { dueDate: dueDate ? new Date(dueDate) : null },
  });
  revalidateAll();
}

export async function deleteDeliverable(id: string) {
  await prisma.deliverable.delete({ where: { id } });
  revalidateAll();
}

// ── INSTAGRAM LEADS ────────────────────────────────────────────────────────────

export async function createIGLead(formData: FormData) {
  const handle = formData.get("handle")?.toString().trim().replace(/^@/, "") ?? "";
  if (!handle) return null;

  const reminderRaw = formData.get("reminderAt")?.toString();
  const lead = await prisma.instagramLead.create({
    data: {
      handle,
      followers: safeNumber(formData.get("followers")),
      niche: formData.get("niche")?.toString().trim() || null,
      profileUrl: formData.get("profileUrl")?.toString().trim() || null,
      stage: formData.get("stage")?.toString() || "FOUND",
      notes: formData.get("notes")?.toString().trim() || null,
      reminderAt: reminderRaw ? new Date(reminderRaw) : null,
    },
  });
  revalidatePath("/leads");
  return lead;
}

export async function updateIGLeadStage(id: string, stage: string) {
  await prisma.instagramLead.update({ where: { id }, data: { stage } });
  revalidatePath("/leads");
}

export async function deleteIGLead(id: string) {
  await prisma.instagramLead.delete({ where: { id } });
  revalidatePath("/leads");
}

// ── ZAPIER LEAD INGESTION ─────────────────────────────────────────────────────

export async function createLeadFromZapier(data: {
  name?: string;
  phone?: string | null;
  companyName?: string | null;
  company_name?: string | null;
  readyToInvest?: boolean | string | null;
  ready_to_invest?: string | null;
  willingToStart?: boolean | string | null;
  willing_to_start?: string | null;
  notes?: string | null;
  source?: string | null;
}) {
  const lead = await prisma.lead.create({
    data: {
      name: data.name ?? "Unknown",
      phone: data.phone ?? null,
      companyName: data.companyName ?? data.company_name ?? null,
      readyToInvest:
        data.readyToInvest === true ||
        data.readyToInvest === "true" ||
        data.ready_to_invest === "true",
      willingToStart:
        data.willingToStart === true ||
        data.willingToStart === "true" ||
        data.willing_to_start === "true",
      notes: data.notes ?? null,
      source: data.source ?? "Zapier",
      stage: "NEW",
    },
  });
  revalidateAll();
  return lead;
}
