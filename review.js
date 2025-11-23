import fetch from 'node-fetch';
import { spawnSync } from 'child_process';

function getGitDiff() {
  const result = spawnSync('git', ['diff', '--cached'], { encoding: 'utf-8' });

  if (result.status !== 0) {
    console.error('Failed to run git diff:', result.stderr);
    process.exit(1);
  }

  const diff = result.stdout.trim();

  if (!diff) {
    console.log('No staged changes to review.\nUse: git add <files>');
    process.exit(0);
  }

  return diff;
}

async function callOllama(diff) {
  const system = `
You are a senior software engineer.
Perform a strict code review on the user's git diff.
Return structured output.

Format:

Summary:
- ...

Issues:
1) [SEVERITY] Title
   - Details

Suggestions:
- ...
`;

  const body = {
    model: "llama3.1",
    stream: false,
    messages: [
      { role: "system", content: system },
      { role: "user", content: "Review this git diff:\n\n" + diff }
    ]
  };

  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  return json.message?.content || "(no response)";
}

(async () => {
  const diff = getGitDiff();
  const review = await callOllama(diff);

  console.log("\n=== CODE REVIEW ===\n");
  console.log(review);
})();
