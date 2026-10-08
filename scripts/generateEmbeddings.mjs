import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Index } from '@upstash/vector';
import { CERTIFICATIONS } from '../src/data/knowledge/certifications.js';
import { SKILLS } from '../src/data/knowledge/skills.js';
import { CONTACT } from '../src/data/knowledge/contact.js';
import { PROJECTS } from '../src/data/knowledge/projects.js';
import { EXPERIENCE } from '../src/data/knowledge/experience.js';
import { COMPANIES } from '../src/data/knowledge/companies.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Environment Variables manually to avoid dependency issues
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/['"]/g, '');
});

const index = new Index({
  url: env.UPSTASH_VECTOR_REST_URL,
  token: env.UPSTASH_VECTOR_REST_TOKEN,
});

async function getEmbedding(text) {
  try {
    const res = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
    });
    if (!res.ok) throw new Error(`Ollama Embedding Error: ${res.statusText}`);
    const data = await res.json();
    return data.embedding;
  } catch (err) {
    console.error(`[Embedding] Failed for text: ${text.substring(0, 20)}... Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  const ALL_CHUNKS = [...CERTIFICATIONS, ...SKILLS, ...CONTACT, ...PROJECTS, ...EXPERIENCE, ...COMPANIES];
  const results = [];

  console.log(`🚀 Starting embedding process for ${ALL_CHUNKS.length} chunks...`);

  for (const chunk of ALL_CHUNKS) {
    try {
      console.log(`Embedding: ${chunk.id}...`);
      const embedding = await getEmbedding(chunk.text);

      // 1. Save for local JSON file
      results.push({ ...chunk, embedding });

      // 2. PUSH TO UPSTASH CLOUD IMMEDIATELY
      await index.upsert([{
        id: chunk.id,
        vector: embedding,
        metadata: {
          category: chunk.category,
          text: chunk.text
        }
      }]).catch(err => console.error(`[Upstash] Upsert failed for ${chunk.id}: ${err.message}`));

    } catch (err) {
      console.error(`❌ Critical failure on ${chunk.id}: ${err.message}`);
    }
  }

  // Write the local JSON file for Vercel/local fallback
  fs.writeFileSync(
    path.join(__dirname, 'embeddings-output.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n✅ DONE!`);
  console.log(`- Wrote ${results.length} embeddings to local JSON.`);
  console.log(`- Pushed updated vectors to Upstash Cloud.`);
  console.log(`\n👉 Now run 'node --env-file=.env.local scripts/listAllVectors.mjs' to verify!`);
}

main().catch(console.error);
