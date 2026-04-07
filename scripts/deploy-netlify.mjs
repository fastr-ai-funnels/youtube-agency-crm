// Deploy YouTube CRM to Netlify
// Netlify personal access token — find at app.netlify.com/user/applications
// We'll use the same approach as agency-crm

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
if (!NETLIFY_TOKEN) {
  console.error('Set NETLIFY_TOKEN env var');
  process.exit(1);
}

// Step 1: find GitHub repo ID
const repoRes = await fetch('https://api.github.com/repos/fastr-ai-funnels/youtube-agency-crm', {
  headers: {
    'Authorization': `token ${process.env.GITHUB_PAT}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'fastr-ai',
  },
});
const repo = await repoRes.json();
console.log('GitHub repo ID:', repo.id);

// Step 2: create Netlify site linked to GitHub
const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NETLIFY_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'youtube-agency-crm',
    repo: {
      provider: 'github',
      id: repo.id,
      repo: 'fastr-ai-funnels/youtube-agency-crm',
      branch: 'main',
      cmd: 'npx prisma generate && npm run build',
      dir: '.next',
      private: false,
    },
  }),
});

const site = await siteRes.json();
console.log('Netlify status:', siteRes.status);
console.log('Site:', JSON.stringify(site, null, 2));
