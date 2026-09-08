import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis';

// Load .env.local securely from the root folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Automatically reads from process.env (secured locally, never committed)
const redis = Redis.fromEnv();

async function resetMetrics() {
  try {
    console.log('Resetting metrics to 0...');
    
    await redis.set('portfolio:cvDownloads', 0);
    await redis.set('portfolio:copilotQueries', 0);
    await redis.set('portfolio:hireRequests', 0);
    await redis.set('portfolio:totalVisitors', 0);
    await redis.set('portfolio:ref_linkedin', 0);
    await redis.set('portfolio:ref_github', 0);
    await redis.set('portfolio:ref_direct', 0);
    await redis.set('portfolio:ref_whatsapp', 0);
    await redis.set('portfolio:ref_others', 0);

    console.log('✅ All portfolio metrics successfully reset to 0!');
  } catch (err) {
    console.error('❌ Failed to reset metrics:', err);
  }
}

resetMetrics();