// import { Index } from '@upstash/vector';

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const index = new Index({
//   url: process.env.UPSTASH_VECTOR_REST_URL,
//   token: process.env.UPSTASH_VECTOR_REST_TOKEN,
// });

// async function main() {
//   const results = await index.query({
//     data: 'Oracle certification skill contact experience',
//     topK: 20,
//     includeMetadata: true,
//   });
//   results.forEach(r => console.log(r.id));
//   console.log(`\nTotal returned: ${results.length}`);
// }

// main();

import { Index } from '@upstash/vector';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

async function main() {
  // Fetch stats to see exact total vector count
  const info = await index.info();
  console.log('Total vectors in Upstash:', info.vectorCount);

  // Query with a company-specific keyword to verify retrieval
  const results = await index.query({
    data: 'Tata Consultancy Services TCS IBM Cognizant',
    topK: 15,
    includeMetadata: true,
  });
  
  console.log('\nTop matching vectors:');
  results.forEach(r => console.log(`- ID: ${r.id} (Score: ${r.score})`));
}

main();
