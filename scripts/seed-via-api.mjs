const PAT = 'sbp_c9193a316914928557935527c43c32194f8e71ab';
const PROJECT = 'kvxkuxhikojdjnvgdhnu';

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// Clear tables
await query(`
  DELETE FROM yt_scripts;
  DELETE FROM yt_content_briefs;
  DELETE FROM yt_instagram_leads;
  DELETE FROM yt_deliverables;
  DELETE FROM yt_deliverable_groups;
  DELETE FROM yt_tasks;
  DELETE FROM yt_projects;
  DELETE FROM yt_leads;
  DELETE FROM yt_expenses;
  DELETE FROM yt_clients;
`);
console.log('Cleared tables');

// Insert clients
const clientsResult = await query(`
  INSERT INTO yt_clients (id, "companyName", owner, email, phone, tier, stage, services, "monthlyRetainer", "termLength", "channelUrl", "channelHandle", niche, "contentStyle", "targetAudience", "postsPerWeek", "startDate")
  VALUES
    (gen_random_uuid()::text, 'Ryan Hogue Passive Income', 'Ryan Hogue', 'ryan@ryanhogue.com', '480-555-1822', 'FULL_SYSTEM', 'ACTIVE', 'Long-form education + shorts strategy + thumbnail testing', 4500, 12, 'https://youtube.com/@RyanHogue', '@RyanHogue', 'Passive Income / Print-on-Demand', 'Tutorial + case study', 'Side hustlers 25-40', 2, now() - interval '90 days'),
    (gen_random_uuid()::text, 'Kali Muscle Fitness', 'Kali Muscle', 'kali@kalimuscle.com', '602-555-9880', 'AI_AGENT_AUTOMATIONS', 'ACTIVE', 'Scripting + thumbnail strategy + upload automation', 3200, 6, 'https://youtube.com/@KaliMuscle', '@KaliMuscle', 'Fitness / Bodybuilding', 'Motivational + workout demos', 'Men 18-35 into fitness', 3, now() - interval '45 days'),
    (gen_random_uuid()::text, 'Zulie Rane Writing', 'Zulie Rane', 'zulie@zulierane.com', '310-555-4411', 'AI_AGENT_ONLY', 'LEAD', 'Script architecture + content calendar', 1800, 12, 'https://youtube.com/@ZulieRane', '@ZulieRane', 'Writing / Medium / Freelance', 'Storytelling + strategy', 'Writers and online creators', 1, now())
  RETURNING id, "companyName";
`);
console.log('Clients:', clientsResult.map(c => `${c.companyName}: ${c.id}`));

const [ryanId, kaliId, zulieId] = clientsResult.map(c => c.id);

// Insert projects
const projectsResult = await query(`
  INSERT INTO yt_projects (id, name, summary, status, "kickoffDate", "dueDate", "clientId")
  VALUES
    (gen_random_uuid()::text, 'Q2 Content Sprint', '8 long-form + 16 shorts in April-May', 'IN_PROGRESS', now(), now() + interval '30 days', '${ryanId}'),
    (gen_random_uuid()::text, 'Thumbnail A/B Test', 'Test text-forward vs face-forward thumbnails', 'REVIEW', now() - interval '10 days', now() + interval '7 days', '${kaliId}'),
    (gen_random_uuid()::text, 'Onboarding & Strategy Call', 'Define content pillars and first 4 scripts', 'PLANNING', now(), now() + interval '14 days', '${zulieId}')
  RETURNING id, name;
`);
console.log('Projects:', projectsResult.map(p => p.name));

const [q2Id, thumbId, onboardId] = projectsResult.map(p => p.id);

// Insert tasks
await query(`
  INSERT INTO yt_tasks (id, title, assignee, status, "dueDate", notes, "projectId", "clientId")
  VALUES
    (gen_random_uuid()::text, 'Approve April content calendar', 'Cyrus', 'ACTIVE', now() + interval '3 days', 'Send via Notion by EOD Friday', '${q2Id}', '${ryanId}'),
    (gen_random_uuid()::text, 'Upload thumbnail test variants', 'Cyrus', 'NOT_STARTED', now() + interval '5 days', null, '${thumbId}', '${kaliId}'),
    (gen_random_uuid()::text, 'Send onboarding questionnaire', 'Cyrus', 'DONE', now() - interval '2 days', 'Completed — awaiting response', '${onboardId}', '${zulieId}');
`);
console.log('Tasks inserted');

// Insert script
const scriptText = `Last month I made $12,000 without fulfilling a single order. Here''s the exact breakdown no one talks about.\n\nHey, I''m Ryan. I''ve been building print-on-demand income for 3 years and this month was my best yet. Today I''m breaking down every dollar.`;
await query(`
  INSERT INTO yt_scripts (id, "clientId", title, hook, intro, body, cta, "fullScript")
  VALUES (
    gen_random_uuid()::text,
    '${ryanId}',
    'How I Made $12k Passive Income Last Month (POD Breakdown)',
    'Last month I made $12,000 without fulfilling a single order. Here''s the exact breakdown no one talks about.',
    'Hey, I''m Ryan. I''ve been building print-on-demand income for 3 years and this month was my best yet.',
    'Let''s start with Merch by Amazon — $6,200. Niching into seasonal micro-trends early was the key. Redbubble added $2,800. Etsy POD was the surprise — $3,000.',
    'Spreadsheet linked below. Subscribe for new breakdowns every Tuesday.',
    'Last month I made $12,000 without fulfilling a single order. Here''s the breakdown...'
  );
`);
console.log('Script inserted');

// Insert IG leads
await query(`
  INSERT INTO yt_instagram_leads (id, handle, followers, niche, "profileUrl", stage, notes, "reminderAt")
  VALUES
    (gen_random_uuid()::text, 'financewithjay', 48200, 'Personal Finance', 'https://instagram.com/financewithjay', 'SENT', 'DM sent Apr 3. Liked 2 posts before. 3.2% avg engagement.', now() + interval '2 days'),
    (gen_random_uuid()::text, 'marketingmia', 112000, 'Digital Marketing', 'https://instagram.com/marketingmia', 'FOLLOWED_UP', 'Replied asking about pricing. Follow up with case study.', now() + interval '1 day'),
    (gen_random_uuid()::text, 'cryptowithchris', 67500, 'Crypto / Investing', null, 'FOUND', 'High engagement. Posts 4x/week. Needs better scripts.', null),
    (gen_random_uuid()::text, 'fitbymarcus', 89000, 'Fitness', null, 'BOOKED', 'Discovery call booked for April 8.', now() + interval '3 days'),
    (gen_random_uuid()::text, 'lifestylebylena', 231000, 'Lifestyle / Vlogs', null, 'CLOSED', 'Signed 6-month contract Apr 1. Onboarding next week.', null);
`);
console.log('IG leads inserted');

// Insert pipeline leads
await query(`
  INSERT INTO yt_leads (id, name, phone, "companyName", "readyToInvest", "willingToStart", stage, source, notes)
  VALUES
    (gen_random_uuid()::text, 'Jake Navarro', '602-555-0011', 'Navarro Media', true, true, 'NEW', 'instagram', null),
    (gen_random_uuid()::text, 'Sarah Kim', '480-555-0022', 'SK Wellness', true, false, 'CALL_SCHEDULED', 'referral', 'Call Fri 2pm. Budget is $2-3k/mo.'),
    (gen_random_uuid()::text, 'Devon Torres', '213-555-0033', 'Torres Finance', false, false, 'FOLLOW_UP', 'instagram', 'Said ''maybe next quarter'' — follow up in 30 days.');
`);
console.log('Leads inserted');

// Insert expenses
const month = new Date().toISOString().slice(0, 7);
await query(`
  INSERT INTO yt_expenses (id, title, amount, purpose, month)
  VALUES
    (gen_random_uuid()::text, 'Groq API (Scripting)', 0, 'Free tier — 0 cost', '${month}'),
    (gen_random_uuid()::text, 'Canva Pro', 13, 'Thumbnail design', '${month}'),
    (gen_random_uuid()::text, 'TubeBuddy', 9, 'YouTube SEO tool', '${month}'),
    (gen_random_uuid()::text, 'Notion Team', 16, 'Client content calendars', '${month}');
`);
console.log('Expenses inserted');

console.log('\n✅ Seed complete!');
