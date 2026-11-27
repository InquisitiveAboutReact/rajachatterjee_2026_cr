const N8N_URL = process.env.N8N_WEBHOOK_URL;
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET;
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const MAX_PROMPT_CHARS = 500;
const RATE_LIMIT_PER_HOUR = 10;
const UPSTREAM_TIMEOUT_MS = 25000;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim();
  return first || 'unknown';
}

// Fixed one-hour window per IP. If Redis is unreachable, requests are allowed,
// so a Redis outage doesn't take the sandbox down. The n8n secret still protects the workflow.
async function withinRateLimit(ip) {
  if (!KV_URL || !KV_TOKEN) return true;
  const bucket = Math.floor(Date.now() / 3_600_000);
  const key = `sandbox-rl:${ip}:${bucket}`;
  try {
    const r = await fetch(`${KV_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, 7200]]),
      signal: AbortSignal.timeout(3000),
    });
    const data = await r.json();
    const count = Number(data?.[0]?.result);
    return Number.isFinite(count) ? count <= RATE_LIMIT_PER_HOUR : true;
  } catch {
    return true;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!N8N_URL || !N8N_SECRET) return res.status(500).json({ error: 'Sandbox not configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'Prompt too long' });
  }

  if (!(await withinRateLimit(clientIp(req)))) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  try {
    const upstream = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Sandbox-Secret': N8N_SECRET },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Sandbox workflow unavailable' });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch {
    return res.status(502).json({ error: 'Sandbox workflow unavailable' });
  }
}