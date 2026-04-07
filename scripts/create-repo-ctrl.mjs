const PAT = 'YOUR_GITHUB_PAT';

// Create repo in fastrai007-ctrl org
const res = await fetch('https://api.github.com/orgs/fastrai007-ctrl/repos', {
  method: 'POST',
  headers: {
    'Authorization': `token ${PAT}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'fastr-ai',
  },
  body: JSON.stringify({
    name: 'youtube-agency-crm',
    private: false,
    description: 'YouTube Agency CRM — demo',
    auto_init: false,
  }),
});

const data = await res.json();
console.log('Status:', res.status);
console.log(JSON.stringify(data, null, 2));
