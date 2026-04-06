import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.script.deleteMany();
  await prisma.contentBrief.deleteMany();
  await prisma.instagramLead.deleteMany();
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
        companyName: "Ryan Hogue Passive Income",
        owner: "Ryan Hogue",
        email: "ryan@ryanhogue.com",
        phone: "480-555-1822",
        tier: "FULL_SYSTEM",
        stage: "ACTIVE",
        services: "Long-form education + shorts strategy + thumbnail testing",
        monthlyRetainer: 4500,
        termLength: 12,
        channelUrl: "https://youtube.com/@RyanHogue",
        channelHandle: "@RyanHogue",
        niche: "Passive Income / Print-on-Demand",
        contentStyle: "Tutorial + case study",
        targetAudience: "Side hustlers 25-40",
        postsPerWeek: 2,
        startDate: addDays(new Date(), -90),
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Kali Muscle Fitness",
        owner: "Kali Muscle",
        email: "kali@kalimuscle.com",
        phone: "602-555-9880",
        tier: "AI_AGENT_AUTOMATIONS",
        stage: "ACTIVE",
        services: "Scripting + thumbnail strategy + upload automation",
        monthlyRetainer: 3200,
        termLength: 6,
        channelUrl: "https://youtube.com/@KaliMuscle",
        channelHandle: "@KaliMuscle",
        niche: "Fitness / Bodybuilding",
        contentStyle: "Motivational + workout demos",
        targetAudience: "Men 18-35 into fitness",
        postsPerWeek: 3,
        startDate: addDays(new Date(), -45),
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Zulie Rane Writing",
        owner: "Zulie Rane",
        email: "zulie@zulierane.com",
        phone: "310-555-4411",
        tier: "AI_AGENT_ONLY",
        stage: "LEAD",
        services: "Script architecture + content calendar",
        monthlyRetainer: 1800,
        termLength: 12,
        channelUrl: "https://youtube.com/@ZulieRane",
        channelHandle: "@ZulieRane",
        niche: "Writing / Medium / Freelance",
        contentStyle: "Storytelling + strategy",
        targetAudience: "Writers and online creators",
        postsPerWeek: 1,
        startDate: new Date(),
      },
    }),
  ]);

  const [ryanHogue, kaliMuscle, zulieRane] = clients;

  const projects = await prisma.$transaction([
    prisma.project.create({
      data: {
        name: "Q2 Content Sprint",
        summary: "8 long-form + 16 shorts in April-May",
        status: "IN_PROGRESS",
        kickoffDate: new Date(),
        dueDate: addDays(new Date(), 30),
        clientId: ryanHogue.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Thumbnail A/B Test",
        summary: "Test text-forward vs face-forward thumbnails",
        status: "REVIEW",
        kickoffDate: addDays(new Date(), -10),
        dueDate: addDays(new Date(), 7),
        clientId: kaliMuscle.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Onboarding & Strategy Call",
        summary: "Define content pillars and first 4 scripts",
        status: "PLANNING",
        clientId: zulieRane.id,
      },
    }),
  ]);

  const [q2Sprint, thumbnailTest, onboarding] = projects;

  await prisma.$transaction([
    prisma.task.create({
      data: {
        title: "Approve April content calendar",
        assignee: "Cyrus",
        status: "ACTIVE",
        dueDate: addDays(new Date(), 3),
        notes: "Send via Notion by EOD Friday",
        projectId: q2Sprint.id,
        clientId: ryanHogue.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Upload thumbnail test variants",
        assignee: "Cyrus",
        status: "NOT_STARTED",
        dueDate: addDays(new Date(), 5),
        projectId: thumbnailTest.id,
        clientId: kaliMuscle.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Send onboarding questionnaire",
        assignee: "Cyrus",
        status: "DONE",
        dueDate: addDays(new Date(), -2),
        notes: "Completed — awaiting response",
        projectId: onboarding.id,
        clientId: zulieRane.id,
      },
    }),
  ]);

  // Scripts
  await prisma.script.create({
    data: {
      clientId: ryanHogue.id,
      title: "How I Made $12k Passive Income Last Month (POD Breakdown)",
      hook: "Last month I made $12,000 without fulfilling a single order. Here's the exact breakdown no one talks about.",
      intro: "Hey, I'm Ryan. I've been building print-on-demand income for 3 years and this month was my best yet. Today I'm breaking down every dollar — where it came from, what worked, and what I'd do differently.",
      body: "Let's start with Merch by Amazon — that was $6,200 of it. The key was niching down into seasonal micro-trends early. I found 3 phrases in February that were just starting to spike on Google Trends...\n\nRedbubble added another $2,800. People sleep on Redbubble because of lower margins, but volume makes up for it when you're uploading systematically...\n\nEtsy print-on-demand was the surprise — $3,000 this month. I started using a tool to batch-generate listings and it 4x'd my output.",
      cta: "If you want the exact spreadsheet I use to track all my stores, it's linked below. And if this video helped you, subscribe — I drop new breakdowns every Tuesday.",
      fullScript: "Last month I made $12,000 without fulfilling a single order. Here's the exact breakdown no one talks about.\n\nHey, I'm Ryan. I've been building print-on-demand income for 3 years and this month was my best yet. Today I'm breaking down every dollar — where it came from, what worked, and what I'd do differently.\n\nLet's start with Merch by Amazon — that was $6,200 of it. The key was niching down into seasonal micro-trends early...\n\nIf you want the exact spreadsheet I use to track all my stores, it's linked below. And if this video helped you, subscribe — I drop new breakdowns every Tuesday.",
    },
  });

  // IG Leads
  await prisma.$transaction([
    prisma.instagramLead.create({
      data: {
        handle: "financewithjay",
        followers: 48200,
        niche: "Personal Finance",
        profileUrl: "https://instagram.com/financewithjay",
        stage: "SENT",
        notes: "DM sent Apr 3. Liked 2 posts before. 3.2% avg engagement.",
        reminderAt: addDays(new Date(), 2),
      },
    }),
    prisma.instagramLead.create({
      data: {
        handle: "marketingmia",
        followers: 112000,
        niche: "Digital Marketing",
        profileUrl: "https://instagram.com/marketingmia",
        stage: "FOLLOWED_UP",
        notes: "Replied asking about pricing. Follow up with case study.",
        reminderAt: addDays(new Date(), 1),
      },
    }),
    prisma.instagramLead.create({
      data: {
        handle: "cryptowithchris",
        followers: 67500,
        niche: "Crypto / Investing",
        stage: "FOUND",
        notes: "High engagement. Posts 4x/week. Needs better scripts.",
      },
    }),
    prisma.instagramLead.create({
      data: {
        handle: "fitbymarcus",
        followers: 89000,
        niche: "Fitness",
        stage: "BOOKED",
        notes: "Discovery call booked for April 8.",
        reminderAt: addDays(new Date(), 3),
      },
    }),
    prisma.instagramLead.create({
      data: {
        handle: "lifestylebylena",
        followers: 231000,
        niche: "Lifestyle / Vlogs",
        stage: "CLOSED",
        notes: "Signed 6-month contract Apr 1. Onboarding next week.",
      },
    }),
  ]);

  // Leads (sales pipeline)
  await prisma.$transaction([
    prisma.lead.create({
      data: {
        name: "Jake Navarro",
        phone: "602-555-0011",
        companyName: "Navarro Media",
        readyToInvest: true,
        willingToStart: true,
        stage: "NEW",
        source: "instagram",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Sarah Kim",
        phone: "480-555-0022",
        companyName: "SK Wellness",
        readyToInvest: true,
        willingToStart: false,
        stage: "CALL_SCHEDULED",
        source: "referral",
        notes: "Call Fri 2pm. Budget is $2-3k/mo.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Devon Torres",
        phone: "213-555-0033",
        companyName: "Torres Finance",
        readyToInvest: false,
        willingToStart: false,
        stage: "FOLLOW_UP",
        source: "instagram",
        notes: "Said 'maybe next quarter' — follow up in 30 days.",
      },
    }),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.$transaction([
    prisma.expense.create({
      data: { title: "Groq API (Scripting)", amount: 0, purpose: "Free tier — 0 cost", month: currentMonth },
    }),
    prisma.expense.create({
      data: { title: "Canva Pro", amount: 13, purpose: "Thumbnail design", month: currentMonth },
    }),
    prisma.expense.create({
      data: { title: "TubeBuddy", amount: 9, purpose: "YouTube SEO tool", month: currentMonth },
    }),
    prisma.expense.create({
      data: { title: "Notion Team", amount: 16, purpose: "Client content calendars", month: currentMonth },
    }),
  ]);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
