// api/insights.js
import { Redis } from '@upstash/redis';

const SUMMARY_KEY = 'jd-stats:summary';
const SUMMARY_TTL_MS = 24 * 60 * 60 * 1000;
const TOP_REQUIREMENTS = 5;
const TOP_MISSING = 3;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const sortedEntries = (obj) =>
  Object.entries(obj || {})
    .map(([name, count]) => [name, Number(count)])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

// Estimates the median score from 10-point buckets (0-9 up to 90-100).
function medianFromBuckets(buckets, total) {
  let running = 0;
  for (let b = 0; b <= 9; b++) {
    running += Number(buckets[b] || 0);
    if (running >= total / 2) return b * 10 + 5;
  }
  return 50;
}

async function buildSummary(stats) {
  const lead = stats.topRequirements[0]?.name;
  const fallback = lead
    ? `${stats.total} job descriptions analysed so far. The median fit is about ${stats.medianScore}%, and ${lead} is checked most often.`
    : `${stats.total} job descriptions analysed so far. The median fit is about ${stats.medianScore}%.`;

  if (!process.env.GROQ_API_KEY) return fallback;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.2,
        max_tokens: 200,
        reasoning_effort: 'low',
        stream: false,
        messages: [
          {
            role: 'system',
            content:
            'You write short, factual summaries about job descriptions that visitors analysed on a public portfolio. Write in the third person and never in the first person. Use only the numbers and names provided. Plain text, two sentences at most, no markdown.',
          },
          { role: 'user', content: JSON.stringify(stats) },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const redis = getRedis();
  if (!redis) return res.status(503).json({ ready: false, error: 'Statistics are not configured.' });

  try {
    const [total, verdicts, buckets, checked, missing] = await Promise.all([
      redis.get('jd-stats:total'),
      redis.hgetall('jd-stats:verdict'),
      redis.hgetall('jd-stats:score-buckets'),
      redis.hgetall('jd-stats:req-checked'),
      redis.hgetall('jd-stats:req-missing'),
    ]);

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    const n = Number(total) || 0;
    if (n === 0) return res.status(200).json({ ready: false, total: 0 });

    const verdictList = sortedEntries(verdicts);
    const stats = {
      total: n,
      medianScore: medianFromBuckets(buckets || {}, n),
      topVerdict: verdictList[0]?.[0] ?? 'Not yet',
      topRequirements: sortedEntries(checked)
        .slice(0, TOP_REQUIREMENTS)
        .map(([name, count]) => ({ name, pct: (count / n) * 100 })),
      topMissing: sortedEntries(missing)
        .slice(0, TOP_MISSING)
        .map(([name, count]) => ({ name, pct: (count / n) * 100 })),
    };

    let entry = await redis.get(SUMMARY_KEY);
    if (!entry || Date.now() - entry.generatedAt > SUMMARY_TTL_MS) {
      entry = { text: await buildSummary(stats), generatedAt: Date.now() };
      await redis.set(SUMMARY_KEY, entry);
    }

    return res.status(200).json({
      ready: true,
      ...stats,
      summary: entry.text,
      updatedAt: new Date(entry.generatedAt).toISOString(),
    });
  } catch (err) {
    console.error('[INSIGHTS] error:', err.message);
    return res.status(503).json({ ready: false, error: 'Statistics are temporarily unavailable.' });
  }
}