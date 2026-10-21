// api/feedback-export.js

import path from 'path';
import dotenv from 'dotenv';

// Load .env.local file for local development
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default async function handler(req, res) {
    const pin = req.headers['x-admin-pin'];
    const expectedPin = process.env.CV_ADMIN_PIN || '7890';
  
    if (pin !== expectedPin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
      if (!UPSTASH_URL || !UPSTASH_TOKEN) {
        return res.status(500).json({ error: 'Upstash/KV environment variables missing' });
      }
  
      // Match the exact key used in feedback.js
      const redisRes = await fetch(`${UPSTASH_URL}/lrange/portfolio:feedback/0/-1`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      
      const data = await redisRes.json();
      const records = (data.result || []).map(item => JSON.parse(item));
  
      // Convert JSON records to CSV format
      let csv = 'ID,Timestamp,Type,Title,Message,UserAgent\n';
      records.forEach(r => {
        csv += `"${r.id}","${r.timestamp}","${r.type}","${r.title || ''}","${(r.message || '').replace(/"/g, '""')}","${r.userAgent || ''}"\n`;
      });
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=portfolio_feedback.csv');
      return res.status(200).send(csv);
    } catch (err) {
      console.error('Export Error:', err);
      return res.status(500).json({ error: 'Failed to export feedback' });
    }
  }