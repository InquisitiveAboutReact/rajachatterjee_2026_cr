import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize Server
const server = new Server(
  {
    name: "raja-chatterjee-portfolio-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Portfolio Data
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

// Register Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_candidate_profile",
      description: "Returns an executive summary of Raja Chatterjee's background and core roles.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_certifications",
      description: "Retrieves verified technical and AI certifications.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "query_skills_and_projects",
      description: "Searches candidate skills and architectural focus areas by keyword.",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Skill or domain to search for" },
        },
        required: ["keyword"],
      },
    },
  ],
}));

// Register Tool Execution Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_candidate_profile":
      return { content: [{ type: "text", text: JSON.stringify(PORTFOLIO_DATA.profile, null, 2) }] };

    case "get_certifications":
      return { content: [{ type: "text", text: JSON.stringify(PORTFOLIO_DATA.certifications, null, 2) }] };

    case "query_skills_and_projects": {
      const keyword = (args?.keyword || "").toLowerCase();
      const matchedSkills = PORTFOLIO_DATA.skills.filter((skill) =>
        skill.toLowerCase().includes(keyword)
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query: args?.keyword,
                matchedSkills: matchedSkills.length > 0 ? matchedSkills : ["No exact match found, but experience covers general IT delivery & AI."],
              },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

// Single active transport session for single-turn serverless invocations
let serverTransport = null;

export default async function handler(req, res) {
  // 1. Mandatory CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-version");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 2. Handle GET (SSE stream establishment)
    if (req.method === "GET") {
      serverTransport = new SSEServerTransport("/api/mcp", res);
      await server.connect(serverTransport);
      return;
    }

    // 3. Handle POST (JSON-RPC messages from external clients)
    if (req.method === "POST") {
      if (!serverTransport) {
        serverTransport = new SSEServerTransport("/api/mcp", res);
        await server.connect(serverTransport);
      }
      await serverTransport.handlePostMessage(req, res, req.body);
      return;
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Vercel MCP Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
}