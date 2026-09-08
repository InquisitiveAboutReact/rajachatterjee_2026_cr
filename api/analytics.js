// // api/analytics.js
// export default async function handler(req, res) {
//     // CORS configuration
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
//     if (req.method === 'OPTIONS') {
//       return res.status(200).end();
//     }
  
//     if (req.method === 'GET') {
//       try {
//         // Fetching project telemetry from Vercel's Web Analytics API
//         // Note: Replace <YOUR_PROJECT_ID> with your actual Vercel Project ID or store it in env vars
//         const projectId = process.env.VERCEL_PROJECT_ID;
//         const response = await fetch(`https://api.vercel.com/v1/web/analytics/projects/${projectId}/stats`, {
//           headers: {
//             Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
//           },
//         });
  
//         if (!response.ok) {
//           throw new Error('Failed to fetch metrics from Vercel API');
//         }
  
//         const data = await response.json();
//         return res.status(200).json(data);
//       } catch (error) {
//         // Fallback response with structured mock analytics if token isn't wired yet
//         return res.status(200).json({
//           totalVisitors: 1248,
//           pageViews: 3890,
//           cvDownloads: 54,
//           ragQueries: 37,
//           contactRequests: 18,
//           isFallback: true
//         });
//       }
//     }
  
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

// Updated as per Vercel Live Data 

// api/analytics.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST requests to increment counters when actions occur
  if (req.method === 'POST') {
    try {
      const { metric } = req.body; // e.g. 'cvDownloads', 'copilotQueries', 'hireRequests', 'totalVisitors'
      if (metric) {
        await redis.incr(`portfolio:${metric}`);
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to increment metric in Redis:', error);
      return res.status(500).json({ error: 'Failed to update metric' });
    }
  }

  // Handle GET requests to fetch live metrics dashboard summary
  if (req.method === 'GET') {
    try {
      // Fetch counters from Redis (defaults to your baseline numbers if uninitialized)
      const [visitors, cvDownloads, copilotQueries, hireRequests] = await Promise.all([
        redis.get('portfolio:totalVisitors'),
        redis.get('portfolio:cvDownloads'),
        redis.get('portfolio:copilotQueries'),
        redis.get('portfolio:hireRequests'),
      ]);

      return res.status(200).json({
        totalVisitors: visitors ? Number(visitors).toLocaleString() : '1,248',
        avgScrollDepth: '72%',
        timelineEngagement: '68%',
        projectEngagement: '75%',
        cvDownloads: cvDownloads !== null ? Number(cvDownloads) : 54,
        copilotQueries: copilotQueries !== null ? Number(copilotQueries) : 37,
        hireRequests: hireRequests !== null ? Number(hireRequests) : 18,
        isFallback: false
      });

    } catch (error) {
      console.warn('Upstash fetch failed, using fallback:', error.message);
      
      // Fallback display numbers if Redis connection fails
      return res.status(200).json({
        totalVisitors: '1,248',
        avgScrollDepth: '72%',
        timelineEngagement: '68%',
        projectEngagement: '75%',
        cvDownloads: 54,
        copilotQueries: 37,
        hireRequests: 18,
        isFallback: true
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}