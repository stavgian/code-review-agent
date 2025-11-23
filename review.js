import fetch from 'node-fetch';
import { spawnSync } from 'node:child_process';

// 1. Get git diff (staged changes)
function getGitDiff() {
  const result = spawnSync('git', ['diff', '--cached'], {
    encoding: 'utf-8'
  });

  if (result.status !== 0) {
    console.error('Failed to run git diff:', result.stderr);
    process.exit(1);
  }

  const diff = result.stdout.trim();
  if (!diff) {
    console.log('No staged changes to review.');
    process.exit(0);
  }

  return diff;
}

// 2. Call Ollama
async function callOllama(diff, model = 'llama3.1') {
  const url = 'http://localhost:11434/api/chat';

  const systemPrompt = `
You are a senior software engineer doing a code review.
Be concise and structured. Focus on:
- correctness
- readability
- potential bugs
- tests
- architecture

Respond in this format:

Summary:
- ...

Issues:
1) [SEVERITY] Short title
   - Detail

Suggestions:
- ...
`.trim();

  const userPrompt = `
Please review the following git diff:

${diff}
`.trim();

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: false
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.message?.content || '(no content)';
}

// 3. Main
(async () => {
  try {
    const diff = getGitDiff();
    console.log('Sending diff to Ollama for review...\n');

    const review = await callOllama(diff);

    console.log('=== CODE REVIEW ===\n');
    console.log(review);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
