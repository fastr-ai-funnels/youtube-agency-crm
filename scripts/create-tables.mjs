const PAT = 'sbp_c9193a316914928557935527c43c32194f8e71ab';
const PROJECT = 'kvxkuxhikojdjnvgdhnu';

const sql = `
CREATE TABLE IF NOT EXISTS yt_clients (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyName" text NOT NULL,
  owner text NOT NULL,
  email text NOT NULL,
  phone text,
  tier text NOT NULL DEFAULT 'STANDARD',
  services text NOT NULL,
  "monthlyRetainer" int,
  stage text NOT NULL DEFAULT 'LEAD',
  "frameioLink" text,
  "contractUrl" text,
  "startDate" timestamptz NOT NULL DEFAULT now(),
  "termLength" int NOT NULL DEFAULT 12,
  "adAccountNumber" text,
  "adAccountLink" text,
  "deliverablesNeeded" text,
  "setupFeeStatus" text,
  "retainerStatus" text,
  "crmApiStatus" text,
  "twilioNumber" text,
  "elevenLabsVoiceId" text,
  "n8nWorkflowId" text,
  "goLiveDate" timestamptz,
  "resultsNotes" text,
  "channelUrl" text,
  "channelHandle" text,
  niche text,
  "contentStyle" text,
  "targetAudience" text,
  "postsPerWeek" int,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_projects (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'PLANNING',
  "kickoffDate" timestamptz,
  "dueDate" timestamptz,
  "clientId" text NOT NULL REFERENCES yt_clients(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_tasks (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  assignee text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'NOT_STARTED',
  "dueDate" timestamptz,
  notes text,
  link text,
  "projectId" text REFERENCES yt_projects(id) ON DELETE CASCADE,
  "clientId" text REFERENCES yt_clients(id) ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_deliverable_groups (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'GENERAL',
  "clientId" text NOT NULL REFERENCES yt_clients(id) ON DELETE CASCADE,
  "projectId" text UNIQUE REFERENCES yt_projects(id) ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_deliverables (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  link text,
  completed boolean NOT NULL DEFAULT false,
  "dueDate" timestamptz,
  "groupId" text NOT NULL REFERENCES yt_deliverable_groups(id) ON DELETE CASCADE,
  "taskId" text UNIQUE REFERENCES yt_tasks(id) ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_content_briefs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" text NOT NULL REFERENCES yt_clients(id) ON DELETE CASCADE,
  niche text NOT NULL,
  brief text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_scripts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" text NOT NULL REFERENCES yt_clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  hook text NOT NULL,
  intro text NOT NULL,
  body text NOT NULL,
  cta text NOT NULL,
  "fullScript" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_instagram_leads (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  handle text NOT NULL,
  followers int,
  niche text,
  "profileUrl" text,
  stage text NOT NULL DEFAULT 'FOUND',
  notes text,
  "reminderAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_agent_conversations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS yt_agent_conv_idx ON yt_agent_conversations("sessionId", "createdAt");

CREATE TABLE IF NOT EXISTS yt_agent_memory (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_expenses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  amount int NOT NULL,
  purpose text,
  month text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yt_leads (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  phone text,
  "companyName" text,
  "readyToInvest" boolean,
  "willingToStart" boolean,
  stage text NOT NULL DEFAULT 'NEW',
  notes text,
  source text,
  "conditionalLogicTag" text,
  "salesCallDate" timestamptz,
  outcome text,
  "revenueOnClose" int,
  "downsellPathTaken" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const data = await res.json();
console.log('Status:', res.status);
console.log('Result:', JSON.stringify(data, null, 2));
