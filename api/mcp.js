const PORTFOLIO_DATA = {
    profile: {
      name: "Raja Chatterjee",
      title: "IT Technical Delivery Manager & AI Engineer",
      experience: "18+ years in enterprise delivery, OCI, fast formulas, and AI/RAG engineering",
      location: "India",
    },
    certifications: [
      "Oracle Cloud Infrastructure Enterprise AI Professional",
      "Oracle Payroll Cloud Certified Implementation Professional",
      "Claude Certified Associate - Foundations",
      "Microsoft Certified: Azure Solutions Architect",
    ],
    skills: [
      "Technical Delivery Management",
      "Enterprise Software Implementation",
      "Oracle Cloud Infrastructure (OCI)",
      "AI & RAG Engineering",
      "React & Node.js",
      "Docker & n8n Automation",
    ],
  };
  
  export default async function handler(req, res) {
    // 1. Mandatory CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-version, authorization");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    // 2. Handle POST Requests (JSON-RPC 2.0 Direct Response)
    if (req.method === "POST") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
  
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: "Parse error" },
          });
        }
      }
  
      const { id = 1, method, params } = body || {};
  
      // Standard MCP Protocol Methods
      if (method === "initialize") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "raja-chatterjee-portfolio-mcp", version: "1.0.0" },
          },
        });
      }
  
      if (method === "notifications/initialized") {
        return res.status(200).json({ jsonrpc: "2.0", result: {} });
      }
  
      if (method === "tools/list") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "get_candidate_profile",
                description: "Returns executive summary of Raja Chatterjee",
                inputSchema: { type: "object", properties: {} },
              },
              {
                name: "get_certifications",
                description: "Retrieves list of verified technical & AI certifications",
                inputSchema: { type: "object", properties: {} },
              },
              {
                name: "query_skills_and_projects",
                description: "Searches candidate skills and architectural focus areas",
                inputSchema: {
                  type: "object",
                  properties: {
                    keyword: { type: "string", description: "Skill or domain keyword" },
                  },
                  required: ["keyword"],
                },
              },
            ],
          },
        });
      }
  
      if (method === "tools/call") {
        const toolName = params?.name;
        const args = params?.arguments || {};
        let content = [];
  
        if (toolName === "get_candidate_profile") {
          content = [{ type: "text", text: JSON.stringify(PORTFOLIO_DATA.profile, null, 2) }];
        } else if (toolName === "get_certifications") {
          content = [{ type: "text", text: JSON.stringify(PORTFOLIO_DATA.certifications, null, 2) }];
        } else if (toolName === "query_skills_and_projects") {
          const keyword = (args?.keyword || "").toLowerCase();
          const matchedSkills = PORTFOLIO_DATA.skills.filter((s) => s.toLowerCase().includes(keyword));
          content = [
            {
              type: "text",
              text: JSON.stringify({ query: args?.keyword, matchedSkills }, null, 2),
            },
          ];
        } else {
          return res.status(200).json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Tool not found: ${toolName}` },
          });
        }
  
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: { content },
        });
      }
  
      return res.status(200).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      });
    }
  
    // 3. Handle GET Requests (Lightweight SSE Handshake)
    if (req.method === "GET") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.write(`event: endpoint\ndata: /api/mcp\n\n`);
      return res.end();
    }
  
    return res.status(405).json({ error: "Method Not Allowed" });
  }