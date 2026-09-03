import { Redis } from '@upstash/redis';

// Expressly load the KV_ environment variables provided by Vercel
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const status = await redis.get('portfolio_global_status');
      return res.status(200).json(status || null);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch status' });
    }
  }

  if (req.method === 'POST') {
    try {
      const newStatus = req.body;
      await redis.set('portfolio_global_status', newStatus);
      return res.status(200).json({ success: true, status: newStatus });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }
}