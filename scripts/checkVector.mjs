import { Index } from '@upstash/vector';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

async function main() {
  const info = await index.info();
  console.log('Total vectors in database:', info.vectorCount);

  const results = await index.query({
    data: 'How can I contact Raja?',
    topK: 1,
    includeMetadata: true,
  });
  console.log('\nTop match for contact question:');
  console.log(JSON.stringify(results, null, 2));
}

main();
