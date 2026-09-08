import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

const redis = Redis.fromEnv();

async function seed() {
  console.log('Seeding Upstash Redis keys...');
  
  await redis.set('portfolio:ref_linkedin', 500);
  await redis.set('portfolio:ref_github', 349);
  await redis.set('portfolio:ref_direct', 200);
  await redis.set('portfolio:ref_whatsapp', 100);
  await redis.set('portfolio:ref_others', 75);
  await redis.set('portfolio:totalVisitors', 1800);
  await redis.set('portfolio:cvDownloads', 16);
  await redis.set('portfolio:copilotQueries', 20);
  await redis.set('portfolio:hireRequests', 14);

  console.log('✅ Seeding completed successfully!');
}

seed();