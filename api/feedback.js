// api/feedback.js

import path from 'path';
import dotenv from 'dotenv';

// Load .env.local file for local development
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { type, title, message, timestamp, userAgent } = req.body;
  
      // Support both Vercel KV and Upstash environment variable names
      const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

      // For local testing 
      console.log('--- DEBUG FEEDBACK API ---');
    console.log('Resolved Upstash URL:', UPSTASH_URL ? 'Loaded successfully' : 'MISSING');
    console.log('Resolved Upstash Token:', UPSTASH_TOKEN ? 'Loaded successfully' : 'MISSING');
  
      if (!UPSTASH_URL || !UPSTASH_TOKEN) {
        return res.status(500).json({ error: 'Upstash/KV environment variables missing' });
      }
  
      const payload = JSON.stringify({
        id: 'fb_' + Date.now(),
        type: type || 'General Feedback',
        title: title || 'Feedback Entry',
        message: message || '',
        timestamp: timestamp || new Date().toISOString(),
        userAgent: userAgent || req.headers['user-agent'] || 'Unknown'
      });
  
      // Push into Redis list using your portfolio's namespaced key format
      const redisResponse = await fetch(
        `${UPSTASH_URL}/rpush/portfolio:feedback/${encodeURIComponent(payload)}`,
        {
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`
          }
        }
      );
  
      if (!redisResponse.ok) {
        throw new Error('Failed to write to Upstash Redis');
      }
  
      return res.status(200).json({ success: true, message: 'Saved to Upstash successfully!' });
    } catch (error) {
      console.error('Feedback API Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }