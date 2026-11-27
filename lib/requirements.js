// lib/requirements.js
// Shared by the matcher and the insights API, so typed requirements are treated the same way.

const CANONICAL = {
    'tech dm': 'Tech DM',
    'technical delivery manager': 'Tech DM',
    'technical delivery leader': 'Tech DM',
    'gen ai': 'Gen AI',
    'genai': 'Gen AI',
    'generative ai': 'Gen AI',
    'mcp': 'MCP',
    'model context protocol': 'MCP',
    'rag': 'RAG',
    'retrieval augmented generation': 'RAG',
    'safe agile': 'SAFe Agile',
    'scaled agile': 'SAFe Agile',
    'pmp': 'PMP',
    'oracle hcm': 'Oracle HCM',
    'oracle fusion hcm': 'Oracle HCM',
    'sap concur': 'SAP Concur',
    'concur': 'SAP Concur',
    'aws': 'AWS',
    'sql': 'SQL',
    'mongodb': 'MongoDB',
    'mongo db': 'MongoDB',
    'react': 'React',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'html': 'HTML',
    'css': 'CSS',
    'javascript': 'JavaScript',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'docker': 'Docker',
    'claude': 'Claude',
    'guidewire': 'Guidewire',
    'program management': 'Program Management',
    'agile': 'Agile',
  };
  
  const ALIASES = Object.keys(CANONICAL);
  
  function editDistance(a, b) {
    const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[b.length];
  }
  
  function clean(raw) {
    return String(raw || '')
      .toLowerCase()
      .replace(/[^a-z0-9+#.\- ]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[.\-\s]+$/, '')
      .trim();
  }
  
  export function normaliseKeyword(raw) {
    const key = clean(raw);
    if (!key) return '';
    if (CANONICAL[key]) return CANONICAL[key];
  
    // Correct small typos in known names: one edit for words of 5+ characters, two for 9+.
    const max = key.length >= 9 ? 2 : key.length >= 5 ? 1 : 0;
    if (max > 0) {
      let best = null;
      let bestDist = max + 1;
      for (const alias of ALIASES) {
        if (Math.abs(alias.length - key.length) > max) continue;
        const d = editDistance(key, alias);
        if (d < bestDist) {
          best = alias;
          bestDist = d;
        }
      }
      if (best) return CANONICAL[best];
    }
  
    // Unknown requirements are title-cased, so "service delivery manager" reads correctly.
    return key.replace(/\b\w/g, (c) => c.toUpperCase());
  }