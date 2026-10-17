// scripts/visualizeEmbeddings.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PCA } from 'ml-pca';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'embeddings-output.json'), 'utf-8')
);

const vectors = data.map((d) => d.embedding);
const pca = new PCA(vectors);
const projected = pca.predict(vectors, { nComponents: 2 }).to2DArray();

const result = data.map((d, i) => ({
  id: d.id,
  category: d.category,
  x: projected[i][0],
  y: projected[i][1],
}));

console.log(JSON.stringify(result, null, 2));

// --- write an HTML file you can open locally ---
const categories = [...new Set(result.map((d) => d.category))];
const colors = { certification: '#f5a623', skill: '#8a7bff', project: '#4fd1c5', experience: '#e0457b' };

const datasets = categories.map((cat) => ({
  label: cat,
  data: result.filter((d) => d.category === cat).map((d) => ({ x: d.x, y: d.y, id: d.id })),
  backgroundColor: colors[cat] || '#f5f5f7',
  pointRadius: 7,
}));

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Embedding Space — Your Knowledge Chunks</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    body { background:#0d1220; color:#f5f5f7; font-family: sans-serif; padding: 2rem; }
    #chart-container { max-width: 800px; margin: auto; }
  </style>
</head>
<body>
  <h2>Your Knowledge Chunks in Embedding Space</h2>
  <p style="color:#9aa0b4">Each point is one chunk from your RAG knowledge base, compressed from 768 dimensions to 2 via PCA. Closer points are more semantically similar.</p>
  <div id="chart-container">
    <canvas id="chart"></canvas>
  </div>
  <script>
    const datasets = ${JSON.stringify(datasets)};
    new Chart(document.getElementById('chart'), {
      type: 'scatter',
      data: { datasets },
      options: {
        plugins: {
          legend: { labels: { color: '#f5f5f7' } },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.raw.id
            }
          }
        },
        scales: {
          x: { ticks: { color: '#9aa0b4' }, grid: { color: '#2a2f45' } },
          y: { ticks: { color: '#9aa0b4' }, grid: { color: '#2a2f45' } }
        }
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'embedding-plot.html'), html);
console.log('Wrote scripts/embedding-plot.html — open it in your browser.');