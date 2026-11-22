// api/chat.mjs
import { Index } from '@upstash/vector';

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const TOP_K = 8;
const MIN_SCORE = 0.45;
const LLM_TIMEOUT_MS = 20000;
const MAX_QUESTION_CHARS = 500;
const MAX_ANSWER_TOKENS = 1200;
const RETRY_WAIT_MS = 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Intent checks. Word boundaries stop words like "discovery" from matching "cv".
const CV_PATTERN = /\b(cv|resume|curriculum vitae)\b|download profile/i;
const PROJECT_PATTERN = /\b(projects?|portfolio)\b/i;

const NO_ANSWER_TEXT =
  "I don't have specific information about that. Please contact Raja directly for more details!";
const BUSY_TEXT = 'The assistant is busy right now. Please try again in a moment.';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const httpError = (status, message) => Object.assign(new Error(message), { status });

// Carries the provider's HTTP status so the caller can decide whether to retry.
class ProviderError extends Error {
  constructor(provider, status, message) {
    super(message || `${provider} returned ${status}`);
    this.provider = provider;
    this.providerStatus = status;
  }
}

/* ---------- Retrieval ---------- */

async function queryIndex(question, filter) {
  const results = await vectorIndex.query({
    data: question,
    topK: TOP_K,
    includeMetadata: true,
    ...(filter && { filter }),
  });

  return results
    .filter((r) => r.metadata?.text)
    .map((r) => ({
      id: r.id,
      score: r.score,
      text: r.metadata.text,
      category: r.metadata.category ?? 'general',
    }));
}

async function getRetrievalSet(question, isProjectQuestion) {
  let scored = [];

  // For project questions, search only entries categorised as "project".
  if (isProjectQuestion) {
    scored = await queryIndex(question, "category = 'project'");
    if (!scored.some((c) => c.score >= MIN_SCORE)) scored = [];
  }
  if (scored.length === 0) {
    scored = await queryIndex(question);
  }

  scored.sort((a, b) => b.score - a.score);

  const top = scored[0];
  // Nothing relevant: return no sources instead of the nearest unrelated entries.
  if (!top || top.score < MIN_SCORE) return [];

  let relevant = scored.filter((c) => c.score >= MIN_SCORE);
  if (relevant.length > 1 && top.score - relevant[1].score > 0.15) {
    relevant = [top];
  }

  const sameCategory = scored.filter(
    (c) => c.category === top.category && c.score >= MIN_SCORE * 0.85
  );

  return [...relevant, ...sameCategory]
    .filter((chunk, i, arr) => arr.findIndex((c) => c.id === chunk.id) === i)
    .slice(0, 8);
}

/* ---------- LLM providers ---------- */

async function withTimeout(task) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function callGroq(systemPrompt, question) {
  return withTimeout(async (signal) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.1,
        max_tokens: MAX_ANSWER_TOKENS,
        reasoning_effort: 'low',
        stream: false,
      }),
      signal,
    });
    if (!res.ok) throw new ProviderError('Groq', res.status);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new ProviderError('Groq', 0, 'Groq returned an empty answer');
    return content;
  });
}

function callGemini(systemPrompt, question) {
  return withTimeout(async (signal) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nQUESTION: ${question}` }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal,
      }
    );
    if (!res.ok) throw new ProviderError('Gemini', res.status);
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) throw new ProviderError('Gemini', 0, 'Gemini returned an empty answer');
    return content;
  });
}

// Gemini returns 503 under high demand and 429 when rate-limited. Both are temporary.
async function callGeminiWithRetry(systemPrompt, question) {
  try {
    return await callGemini(systemPrompt, question);
  } catch (err) {
    if (![429, 503].includes(err.providerStatus)) throw err;
    await sleep(RETRY_WAIT_MS);
    return callGemini(systemPrompt, question);
  }
}

/* ---------- Prompt and answer ---------- */

function buildSystemPrompt(context, isProjectQuestion) {
  const projectRule = isProjectQuestion
    ? '- The user is asking about PROJECTS. List only entries that describe projects. Never present employers, job roles or companies as projects.'
    : '- Answer from the most relevant entries. Do not list unrelated employers or skills.';

  return `You are Raja Chatterjee's professional portfolio assistant.

RULES:
- Answer ONLY from the CONTEXT below. Do not use outside knowledge.
- If the context does not contain the answer, say so briefly and suggest contacting Raja.
${projectRule}
- Write plain text only. No Markdown, no asterisks, no tables, no pipe characters, no HTML tags.
- Do not show entry IDs or category names in the answer.
- For lists, use one hyphen-prefixed line per item.
- List each employer or certification only once.
- Keep the answer under 120 words.

CONTEXT:
${context}`;
}

// Safety net: strips leftover Markdown or HTML and removes repeated lines.
function cleanAnswer(text) {
  const cleaned = String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[•*]\s+/gm, '- ')
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, '')
    .replace(/\|/g, ' ');

  const seen = new Set();
  const lines = cleaned.split('\n').filter((line) => {
    const key = line.trim().toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function generateAnswer(question, matches, isProjectQuestion) {
  const context = matches.map((m) => `[${m.id} | ${m.category}] ${m.text}`).join('\n\n');
  const systemPrompt = buildSystemPrompt(context, isProjectQuestion);

  try {
    return await callGroq(systemPrompt, question);
  } catch (err) {
    console.error('[RAG] Groq failed, trying Gemini:', err.message);
  }

  try {
    return await callGeminiWithRetry(systemPrompt, question);
  } catch (err) {
    console.error('[RAG] Gemini failed:', err.message);
    throw httpError(503, BUSY_TEXT);
  }
}

/* ---------- Handler ---------- */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const question = req.body?.question;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }
  const cleanQuestion = question.trim().slice(0, MAX_QUESTION_CHARS);

  try {
    // Fast path: CV request. No model call needed.
    if (CV_PATTERN.test(cleanQuestion)) {
      return res.status(200).json({
        answer: "Here is Raja's professional CV! You can download it directly using the button below:",
        sources: ['contact-cv'],
        action: 'download_cv',
      });
    }

    const isProjectQuestion = PROJECT_PATTERN.test(cleanQuestion);
    const matches = await getRetrievalSet(cleanQuestion, isProjectQuestion);

    if (matches.length === 0) {
      return res.status(200).json({ answer: NO_ANSWER_TEXT, sources: [] });
    }

    const answer = cleanAnswer(await generateAnswer(cleanQuestion, matches, isProjectQuestion));
    if (!answer) {
      return res.status(200).json({ answer: NO_ANSWER_TEXT, sources: [] });
    }

    return res.status(200).json({
      answer,
      sources: [...new Set(matches.map((m) => m.id))],
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('[RAG] CRITICAL ERROR:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}