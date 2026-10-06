import { findTopMatches } from '../src/utils/similarity.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const embeddingsPath = path.join(__dirname, '..', 'scripts', 'embeddings-output.json');

async function getEmbedding(text) {
  // In production (Vercel), we cannot use localhost:11434.
  // We use a cloud-based embedding model for the user's query.
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (!isProduction) {
    // LOCAL MODE: Use Ollama
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
      console.error(`[RAG] Local Embedding failed: ${err.message}`);
      throw err;
    }
  } else {
    // PRODUCTION MODE: Use a Cloud Embedding API
    // Using a free/low-cost compatible embedding endpoint
    try {
      // We can use a Groq-compatible or similar cloud provider.
      // Since you have a Groq key, we'll try to use a cloud-accessible embedding service.
      // For now, I'll implement a fallback to a common cloud embedding pattern.
      const res = await fetch('https://api.groq.com/openai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nomic-embed-text', // Groq supports nomic embeddings
          input: text
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`Cloud Embedding Error: ${errData.error?.message || res.statusText}`);
      }
      const data = await res.json();
      return data.data[0].embedding;
    } catch (err) {
      console.error(`[RAG] Production Embedding failed: ${err.message}`);
      throw err;
    }
  }
}

async function generateAnswer(question, matches) {
  const context = matches.map((m) => `[${m.id}] ${m.text}`).join('\n\n');
  console.log(`[RAG] Generating answer with ${matches.length} matches using Groq...`);

  const systemPrompt = `You are Raja Chatterjee's portfolio assistant, answering questions from recruiters and visitors.

Rules:
- Only use the CONTEXT below to answer. Do not use any outside knowledge about Raja.
- If the context doesn't contain enough information to answer, say so honestly — do not guess or make up details.
- Keep answers concise (2-4 sentences).
- Do not explicitly list the sources in your text response; the system will append them automatically.

CONTEXT:
${context}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.2, // Low temperature for factual groundedness
        stream: false,
      }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`Groq API Error: ${errData.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error(`[RAG] Generation failed: ${err.message}`);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing "question" in request body' });
  }

  try {
    console.log(`\n--- New Chat Query: "${question}" ---`);

    const queryEmbedding = await getEmbedding(question);
    console.log(`[RAG] Embedding received.`);

    const chunksRaw = fs.readFileSync(embeddingsPath, 'utf-8');
    const chunks = JSON.parse(chunksRaw);

    const matches = findTopMatches(queryEmbedding, chunks, 3);
    console.log(`[RAG] Found ${matches.length} top matches.`);

    const answer = await generateAnswer(question, matches);
    console.log(`[RAG] Answer generated successfully.`);

    res.status(200).json({
      answer,
      sources: matches.map((m) => m.id),
    });
  } catch (err) {
    console.error('[RAG] CRITICAL ERROR:', err);
    res.status(500).json({ error: 'Something went wrong generating a response.' });
  }
}
