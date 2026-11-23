import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'docs/novel-demo-upstream.json'), 'utf8'));
const differences = [];
for (const [file, expected] of Object.entries(manifest.files)) {
  const content = readFileSync(path.join(root, 'novel-agent-demo-src', file), 'utf8').replaceAll('\r\n', '\n');
  if (createHash('sha256').update(content).digest('hex') !== expected) differences.push(file);
}
if (differences.length) throw new Error(`NovelAI demo differs from original UI: ${differences.join(', ')}`);
console.log(`Verified ${Object.keys(manifest.files).length} original Vue/CSS files against NovelAI ${manifest.commit.slice(0, 7)}.`);
