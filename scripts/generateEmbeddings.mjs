import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CERTIFICATIONS } from '../src/data/knowledge/certifications.js';
import { SKILLS } from '../src/data/knowledge/skills.js';
import { CONTACT } from '../src/data/knowledge/contact.js';
import { PROJECTS } from '../src/data/knowledge/projects.js';
import { EXPERIENCE } from '../src/data/knowledge/experience.js';

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
  const ALL_CHUNKS = [...CERTIFICATIONS, ...SKILLS, ...CONTACT, ...PROJECTS, ...EXPERIENCE];
  const results = [];
  for (const chunk of ALL_CHUNKS) {
    console.log(`Embedding: ${chunk.id}...`);
    const embedding = await getEmbedding(chunk.text);
    results.push({ ...chunk, embedding });
  }
  fs.writeFileSync(
    path.join(__dirname, 'embeddings-output.json'),
    JSON.stringify(results, null, 2)
  );
  console.log(`Done. Wrote ${results.length} embeddings.`);
}

main();
