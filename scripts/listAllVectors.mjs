import { Index } from '@upstash/vector';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

async function main() {
  const results = await index.query({
    data: 'Oracle certification skill contact experience',
    topK: 20,
    includeMetadata: true,
  });
  results.forEach(r => console.log(r.id));
  console.log(`\nTotal returned: ${results.length}`);
}

main();
