import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findTopMatches } from '../src/utils/similarity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getEmbedding(text) {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  });
  const data = await res.json();
  return data.embedding;
}

async function main() {
  const chunks = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'embeddings-output.json'), 'utf-8')
  );

  const question = "Does Raja have Oracle Payroll experience?";
  console.log(`\nQuestion: "${question}"\n`);

  const queryEmbedding = await getEmbedding(question);
  const matches = findTopMatches(queryEmbedding, chunks, 3);

  matches.forEach((m, i) => {
    console.log(`${i + 1}. [${m.score.toFixed(4)}] ${m.id}`);
    console.log(`   "${m.text}"\n`);
  });
}

main();
