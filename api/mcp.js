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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-version, authorization");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    // Handle GET (SSE Handshake transport stream)
    if (req.method === "GET") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
  
      // Wrap initialization metadata in a valid JSON-RPC structure expected by the inspector
      const endpointEvent = JSON.stringify({
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "raja-chatterjee-portfolio-mcp", version: "1.0.0" },
        },
      });
  
      res.write(`event: endpoint\ndata: /api/mcp\n\n`);
      res.write(`data: ${endpointEvent}\n\n`);
      return res.end();
    }
  
    // Handle POST (JSON-RPC 2.0 Requests)
    if (req.method === "POST") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const { id, method, params } = body;
  
      try {
        if (method === "initialize") {
          return res.status(200).send(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {} },
                serverInfo: { name: "raja-chatterjee-portfolio-mcp", version: "1.0.0" },
              },
            })
          );
        }
  
        if (method === "notifications/initialized") {
          return res.status(200).send(JSON.stringify({ jsonrpc: "2.0", result: {} }));
        }
  
        if (method === "tools/list") {
          return res.status(200).send(
            JSON.stringify({
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
            })
          );
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
            throw new Error(`Tool not found: ${toolName}`);
          }
  
          return res.status(200).send(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: { content },
            })
          );
        }
  
        return res.status(200).send(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          })
        );
      } catch (err) {
        return res.status(200).send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: id || null,
            error: { code: -32000, message: err.message },
          })
        );
      }
    }
  
    return res.status(405).send(JSON.stringify({ error: "Method Not Allowed" }));
  }