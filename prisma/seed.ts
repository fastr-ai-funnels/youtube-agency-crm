import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.deliverable.deleteMany();
  await prisma.deliverableGroup.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.client.deleteMany();

  const clients = await prisma.$transaction([
    prisma.client.create({
      data: {
        companyName: "White Rhino Turf",
        owner: "Jake Navarro",
        email: "jake@whiterhino.com",
        phone: "480-555-1822",
        tier: "PERFORMANCE",
        stage: "ACTIVE",
        services: "Meta lead gen + onsite creative",
        monthlyRetainer: 7500,
        termLength: 12,
        adAccountNumber: "act_1234567890",
        adAccountLink: "https://business.facebook.com/adsmanager",
        deliverablesNeeded: "4 video ads per month, 8 static images, monthly report",
        startDate: addDays(new Date(), -90),
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Desert Peak HVAC",
        owner: "Lauren Riley",
        email: "lauren@desertpeak.com",
        phone: "602-555-9880",
        tier: "STANDARD",
        stage: "ACTIVE",
        services: "Meta + G Ads + Funnel",
        monthlyRetainer: 4800,
        termLength: 6,
        deliverablesNeeded: "2 video ads, landing page updates, weekly check-in",
        startDate: addDays(new Date(), -60),
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Soho Sculpt",
        owner: "Cameron Yu",
        email: "cameron@sohosculpt.com",
        phone: "310-555-4411",
        tier: "ADVISORY",
        stage: "LEAD",
        services: "Offer architecture + CRO",
        monthlyRetainer: 6200,
        termLength: 12,
        startDate: new Date(),
      },
    }),
  ]);

  const [whiteRhino, desertPeak, sohoSculpt] = clients;

  const projects = await prisma.$transaction([
    prisma.project.create({
      data: {
        name: "Spring Promo Rollout",
        summary: "Bundle turf install + financing hooks",
        status: "IN_PROGRESS",
        kickoffDate: new Date(),
        dueDate: addDays(new Date(), 21),
        clientId: whiteRhino.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "HVAC Always-On",
        summary: "Rebuild lead routing + Zapier QA",
        status: "REVIEW",
        kickoffDate: addDays(new Date(), -10),
        dueDate: addDays(new Date(), 5),
        clientId: desertPeak.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Soho Product Ladder",
        summary: "Reposition low-ticket acquisition",
        status: "PLANNING",
        clientId: sohoSculpt.id,
      },
    }),
  ]);

  const [springPromo, hvac, soho] = projects;

  await prisma.$transaction([
    prisma.task.create({
      data: {
        title: "Shot list sign-off",
        assignee: "Alyssa",
        status: "ACTIVE",
        dueDate: addDays(new Date(), 2),
        notes: "Need Cam's approval on hooks",
        projectId: springPromo.id,
        clientId: whiteRhino.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Zapier error logging",
        assignee: "Devin",
        status: "NOT_STARTED",
        dueDate: addDays(new Date(), 4),
        projectId: hvac.id,
        clientId: desertPeak.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Sculpt onboarding deck",
        assignee: "Rae",
        status: "DONE",
        dueDate: addDays(new Date(), -1),
        notes: "Ready for review",
        projectId: soho.id,
        clientId: sohoSculpt.id,
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.lead.create({
      data: {
        name: "Mike Torres",
        phone: "602-555-0011",
        companyName: "Sonoran Pools",
        readyToInvest: true,
        willingToStart: true,
        stage: "NEW",
        source: "facebook",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Sarah Kim",
        phone: "480-555-0022",
        companyName: "Valley Dental",
        readyToInvest: true,
        willingToStart: false,
        stage: "QUALIFIED",
        source: "facebook",
      },
    }),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.$transaction([
    prisma.expense.create({
      data: {
        title: "Meta Ads Tools",
        amount: 97,
        purpose: "Ad management software",
        month: currentMonth,
      },
    }),
    prisma.expense.create({
      data: {
        title: "Adobe Creative Cloud",
        amount: 55,
        purpose: "Video editing + design",
        month: currentMonth,
      },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
