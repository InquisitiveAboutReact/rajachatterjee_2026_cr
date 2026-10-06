import { findTopMatches } from '../src/utils/similarity.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const embeddingsPath = path.join(__dirname, '..', 'scripts', 'embeddings-output.json');

async function getEmbedding(text) {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (!isProduction) {
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
      return null;
    }
  } else {
    try {
      const res = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/nomic-ai/nomic-embed-text-v1.5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: text }),
      });
      if (!res.ok) throw new Error(`Cloud Embedding Error: ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data[0])) return data.data[0];
      return null;
    } catch (err) {
      console.error(`[RAG] Production Embedding failed: ${err.message}`);
      return null;
    }
  }
}

function findKeywordMatches(query, chunks) {
  console.log(`[RAG] Falling back to Keyword Search for: "${query}"`);
  const words = query.toLowerCase().split(/\s+/);
  const scored = chunks.map(chunk => {
    let score = 0;
    const content = (chunk.text || '').toLowerCase();
    words.forEach(word => {
      if (word.length > 3 && content.includes(word)) score++;
    });
    return { ...chunk, score };
  });

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

async function generateAnswer(question, matches) {
  const context = matches.map((m) => `[${m.id}] ${m.text}`).join('\n\n');
  const systemPrompt = `You are Raja Chatterjee's portfolio assistant.
  Rules:
  - Only use the CONTEXT below to answer.
  - If the context doesn't contain enough information, say so honestly.
  - Keep answers concise.

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
        temperature: 0.2,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Groq API Error: ${res.statusText}`);
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error(`[RAG] Generation failed: ${err.message}`);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { question } = req.body;
  if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

  try {
    const queryEmbedding = await getEmbedding(question);
    const chunksRaw = fs.readFileSync(embeddingsPath, 'utf-8');
    const chunks = JSON.parse(chunksRaw);

    let matches;
    if (queryEmbedding) {
      matches = findTopMatches(queryEmbedding, chunks, 3);
    } else {
      matches = findKeywordMatches(question, chunks);
    }

    if (matches.length === 0) {
      return res.status(200).json({
        answer: "I'm sorry, I don't have specific information about that in my knowledge base. Please contact Raja directly for more details!",
        sources: []
      });
    }

    const answer = await generateAnswer(question, matches);
    res.status(200).json({ answer, sources: matches.map((m) => m.id) });
  } catch (err) {
    console.error('[RAG] CRITICAL ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
