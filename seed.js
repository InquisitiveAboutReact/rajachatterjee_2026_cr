import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.local from the root folder
dotenv.config({ path: path.join(__dirname, '.env.local') });

const redis = Redis.fromEnv();

async function seed() {
  console.log('Seeding Upstash Redis keys...');
  
  await redis.set('portfolio:ref_linkedin', 500);
  await redis.set('portfolio:ref_github', 349);
  await redis.set('portfolio:ref_direct', 200);
  await redis.set('portfolio:ref_whatsapp', 100);
  await redis.set('portfolio:ref_others', 75);
  await redis.set('portfolio:totalVisitors', 1802);
  await redis.set('portfolio:cvDownloads', 16);
  await redis.set('portfolio:copilotQueries', 20);
  await redis.set('portfolio:hireRequests', 14);

  console.log('✅ Seeding completed successfully!');
}

seed();