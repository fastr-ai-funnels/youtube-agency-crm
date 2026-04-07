const PAT = 'YOUR_GITHUB_PAT';

const res = await fetch('https://api.github.com/user/repos', {
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
if (data.html_url) {
  console.log('Repo created:', data.html_url);
  console.log('Clone URL:', data.clone_url);
} else {
  console.log('Response:', JSON.stringify(data, null, 2));
}
