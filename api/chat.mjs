// import { findTopMatches } from '../src/utils/similarity.js';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const embeddingsPath = path.join(__dirname, '..', 'scripts', 'embeddings-output.json');

// async function getEmbedding(text) {
//   const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

//   if (!isProduction) {
//     try {
//       const res = await fetch('http://localhost:11434/api/embeddings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
//       });
//       if (!res.ok) throw new Error(`Ollama Embedding Error: ${res.statusText}`);
//       const data = await res.json();
//       return data.embedding;
//     } catch (err) {
//       console.error(`[RAG] Local Embedding failed: ${err.message}`);
//       return null;
//     }
//   } else {
//     try {
//       const res = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/nomic-ai/nomic-embed-text-v1.5', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ inputs: text }),
//       });
//       if (!res.ok) throw new Error(`Cloud Embedding Error: ${res.statusText}`);
//       const data = await res.json();
//       if (Array.isArray(data)) return data;
//       if (data.data && Array.isArray(data.data[0])) return data.data[0];
//       return null;
//     } catch (err) {
//       console.error(`[RAG] Production Embedding failed: ${err.message}`);
//       return null;
//     }
//   }
// }

// function findKeywordMatches(query, chunks) {
//   console.log(`[RAG] Falling back to Keyword Search for: "${query}"`);
//   const words = query.toLowerCase().split(/\s+/);
//   const scored = chunks.map(chunk => {
//     let score = 0;
//     const content = (chunk.text || '').toLowerCase();
//     words.forEach(word => {
//       if (word.length > 3 && content.includes(word)) score++;
//     });
//     return { ...chunk, score };
//   });

//   return scored
//     .filter(c => c.score > 0)
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 3);
// }

// async function generateAnswer(question, matches) {
//   const context = matches.map((m) => `[${m.id}] ${m.text}`).join('\n\n');
//   const systemPrompt = `You are Raja Chatterjee's portfolio assistant.
//   Rules:
//   - Only use the CONTEXT below to answer.
//   - If the context doesn't contain enough information, say so honestly.
//   - Keep answers concise.

//   CONTEXT:
//   ${context}`;

//   try {
//     const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'openai/gpt-oss-20b',
//         messages: [
//           { role: 'system', content: systemPrompt },
//           { role: 'user', content: question }
//         ],
//         temperature: 0.2,
//         stream: false,
//       }),
//     });
//     if (!res.ok) throw new Error(`Groq API Error: ${res.statusText}`);
//     const data = await res.json();
//     return data.choices[0].message.content;
//   } catch (err) {
//     console.error(`[RAG] Generation failed: ${err.message}`);
//     throw err;
//   }
// }

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
//   const { question } = req.body;
//   if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

//   try {
//     const queryEmbedding = await getEmbedding(question);
//     const chunksRaw = fs.readFileSync(embeddingsPath, 'utf-8');
//     const chunks = JSON.parse(chunksRaw);

//     let matches;
//     if (queryEmbedding) {
//       matches = findTopMatches(queryEmbedding, chunks, 3);
//     } else {
//       matches = findKeywordMatches(question, chunks);
//     }

//     if (matches.length === 0) {
//       return res.status(200).json({
//         answer: "I'm sorry, I don't have specific information about that in my knowledge base. Please contact Raja directly for more details!",
//         sources: []
//       });
//     }

//     const answer = await generateAnswer(question, matches);
//     res.status(200).json({ answer, sources: matches.map((m) => m.id) });
//   } catch (err) {
//     console.error('[RAG] CRITICAL ERROR:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { findTopMatches } from '../src/utils/similarity.js';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const embeddingsPath = path.join(__dirname, '..', 'scripts', 'embeddings-output.json');

// // Local embedding via Ollama during local development
// async function getLocalEmbedding(text) {
//   try {
//     const res = await fetch('http://localhost:11434/api/embeddings', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
//     });
//     if (!res.ok) throw new Error(`Ollama Embedding Error: ${res.statusText}`);
//     const data = await res.json();
//     return data.embedding;
//   } catch (err) {
//     console.error(`[RAG] Local Embedding failed: ${err.message}`);
//     return null;
//   }
// }

// // Robust multi-word keyword & entity scoring for production or fallback
// function findKeywordMatches(query, chunks) {
//   console.log(`[RAG] Using Smart Text Matching for: "${query}"`);
//   const queryLower = query.toLowerCase();
//   const words = queryLower.split(/\s+/).filter(w => w.length > 2);

//   const scored = chunks.map(chunk => {
//     let score = 0;
//     const content = (chunk.text || '').toLowerCase();
//     const id = (chunk.id || '').toLowerCase();
//     const category = (chunk.category || '').toLowerCase();

//     // Exact phrase bonus
//     if (content.includes(queryLower) || id.includes(queryLower)) {
//       score += 10;
//     }

//     // Keyword matching
//     words.forEach(word => {
//       if (content.includes(word)) score += 2;
//       if (id.includes(word)) score += 3;
//       if (category.includes(word)) score += 1;
//     });

//     return { ...chunk, score };
//   });

//   return scored
//     .filter(c => c.score > 0)
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 4);
// }

// async function generateAnswer(question, matches) {
//   const context = matches.map((m) => `[ID: ${m.id} | Category: ${m.category}] ${m.text}`).join('\n\n');
//   const systemPrompt = `You are Raja Chatterjee's professional portfolio assistant.
//   Rules:
//   - Answer accurately based ONLY on the provided CONTEXT below.
//   - Pay close attention to employment history, companies (TCS, Cognizant, IBM), projects, and certifications.
//   - If information is split across sources, synthesize it cleanly.
//   - Keep answers structured, professional, and clear.

//   CONTEXT:
//   ${context}`;

//   try {
//     const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'openai/gpt-oss-20b',
//         messages: [
//           { role: 'system', content: systemPrompt },
//           { role: 'user', content: question }
//         ],
//         temperature: 0.1,
//         stream: false,
//       }),
//     });
//     if (!res.ok) throw new Error(`Groq API Error: ${res.statusText}`);
//     const data = await res.json();
//     return data.choices[0].message.content;
//   } catch (err) {
//     console.error(`[RAG] Generation failed: ${err.message}`);
//     throw err;
//   }
// }

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
//   const { question } = req.body;
//   if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

//   try {
//     const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    
//     // Read bundled chunks
//     const chunksRaw = fs.readFileSync(embeddingsPath, 'utf-8');
//     const chunks = JSON.parse(chunksRaw);

//     let matches = [];

//     if (!isProduction) {
//       // Local development: attempt vector similarity using Ollama embeddings
//       const queryEmbedding = await getLocalEmbedding(question);
//       if (queryEmbedding) {
//         matches = findTopMatches(queryEmbedding, chunks, 4);
//       }
//     }

//     // Production or if local embedding fails: use smart text/keyword matching
//     if (!matches || matches.length === 0) {
//       matches = findKeywordMatches(question, chunks);
//     }

//     if (matches.length === 0) {
//       return res.status(200).json({
//         answer: "I'm sorry, I don't have specific information about that in my knowledge base. Please contact Raja directly for more details!",
//         sources: []
//       });
//     }

//     const answer = await generateAnswer(question, matches);
//     res.status(200).json({ answer, sources: [...new Set(matches.map((m) => m.id))] });
//   } catch (err) {
//     console.error('[RAG] CRITICAL ERROR:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// api/chat.js
// import { Index } from '@upstash/vector';

// const vectorIndex = new Index({
//   url: process.env.UPSTASH_VECTOR_REST_URL,
//   token: process.env.UPSTASH_VECTOR_REST_TOKEN,
// });

// const SOURCES_MARKER = '@@SOURCES@@';

// async function getRetrievalSet(question, { topK = 8, minScore = 0.45 } = {}) {
//   const results = await vectorIndex.query({ data: question, topK, includeMetadata: true });

//   const scored = results.map((r) => ({
//     id: r.id, score: r.score, text: r.metadata.text, category: r.metadata.category,
//   }));

//   const topScore = scored[0]?.score ?? 0;
//   const topCategory = scored[0]?.category;
//   let relevant = scored.filter((c) => c.score >= minScore);

//   if (relevant.length > 1 && topScore - relevant[1].score > 0.15) {
//     relevant = [relevant[0]];
//   }

//   const sameCategoryChunks = scored.filter(
//     (c) => c.category === topCategory && c.score >= minScore * 0.85
//   );

//   return [...relevant, ...sameCategoryChunks]
//     .filter((chunk, i, arr) => arr.findIndex((c) => c.id === chunk.id) === i)
//     .slice(0, 8);
// }

// async function generateAnswer(question, matches) {
//   const context = matches.map((m) => `[${m.id} | ${m.category}] ${m.text}`).join('\n\n');
//   const systemPrompt = `You are Raja Chatterjee's professional portfolio assistant.

// Rules:
// - Only use the CONTEXT below to answer. Do not use outside knowledge.
// - If the context doesn't contain enough information, say so honestly.
// - Keep answers concise and professional.

// CONTEXT:
// ${context}`;

//   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//     method: 'POST',
//     headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: 'openai/gpt-oss-20b',
//       messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }],
//       temperature: 0.1,
//       stream: false,
//     }),
//   });
//   if (!res.ok) throw new Error(`Groq API Error: ${res.statusText}`);
//   const data = await res.json();
//   return data.choices[0].message.content;
// }

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
//   const { question } = req.body;
//   if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

//   try {
//     const matches = await getRetrievalSet(question);

//     if (matches.length === 0) {
//       return res.status(200).json({
//         answer: "I don't have specific information about that. Please contact Raja directly for more details!",
//         sources: [],
//       });
//     }

//     const answer = await generateAnswer(question, matches);
//     res.status(200).json({ answer, sources: [...new Set(matches.map((m) => m.id))] });
//   } catch (err) {
//     console.error('[RAG] CRITICAL ERROR:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// Update 3 - Added Gemini API as a fallback 

// api/chat.mjs
import { Index } from '@upstash/vector';

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

async function getRetrievalSet(question, { topK = 8, minScore = 0.45 } = {}) {
  const results = await vectorIndex.query({ data: question, topK, includeMetadata: true });

  const scored = results.map((r) => ({
    id: r.id, score: r.score, text: r.metadata.text, category: r.metadata.category,
  }));

  const topScore = scored[0]?.score ?? 0;
  const topCategory = scored[0]?.category;
  let relevant = scored.filter((c) => c.score >= minScore);

  if (relevant.length > 1 && topScore - relevant[1].score > 0.15) {
    relevant = [relevant[0]];
  }

  const sameCategoryChunks = scored.filter(
    (c) => c.category === topCategory && c.score >= minScore * 0.85
  );

  return [...relevant, ...sameCategoryChunks]
    .filter((chunk, i, arr) => arr.findIndex((c) => c.id === chunk.id) === i)
    .slice(0, 8);
}

function buildSystemPrompt(context) {
  return `You are Raja Chatterjee's professional portfolio assistant.

Rules:
- Only use the CONTEXT below to answer. Do not use outside knowledge.
- If the context doesn't contain enough information, say so honestly.
- Keep answers concise and professional.

CONTEXT:
${context}`;
}

async function callGroq(systemPrompt, question) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s max
  try{
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }],
      temperature: 0.1,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Groq returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}
finally{
  clearTimeout(timeout);
}
}

async function callGemini(systemPrompt, question) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s max

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nQUESTION: ${question}` }] }],
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) throw new Error(`Gemini returned ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateAnswer(question, matches) {
  const context = matches.map((m) => `[${m.id} | ${m.category}] ${m.text}`).join('\n\n');
  const systemPrompt = buildSystemPrompt(context);

  try {
    return await callGroq(systemPrompt, question);
  } catch (groqErr) {
    console.error('[RAG] Groq failed, trying Gemini fallback:', groqErr.message);
  }

  try {
    return await callGemini(systemPrompt, question);
  } catch (geminiErr) {
    console.error('[RAG] Gemini fallback also failed:', geminiErr.message);
    throw geminiErr;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { question } = req.body;
  if (!question || typeof question !== 'string') return res.status(400).json({ error: 'Missing question' });

  try {
    const matches = await getRetrievalSet(question);

    if (matches.length === 0) {
      return res.status(200).json({
        answer: "I don't have specific information about that. Please contact Raja directly for more details!",
        sources: [],
      });
    }

    const answer = await generateAnswer(question, matches);
    res.status(200).json({ answer, sources: [...new Set(matches.map((m) => m.id))] });
  } catch (err) {
    console.error('[RAG] CRITICAL ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}