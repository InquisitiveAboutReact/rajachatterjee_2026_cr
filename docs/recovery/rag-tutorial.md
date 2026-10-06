# 🎓 The "Zero-to-Hero" Guide: Building a Grounded RAG Pipeline for Your Portfolio

This guide walks through the implementation of a Retrieval-Augmented Generation (RAG) system used to power a professional portfolio chatbot. Instead of relying on a general LLM that might hallucinate, we use a "grounded" approach where the AI only answers based on verified profile data.

## 🏗️ The Architecture
The pipeline follows a four-stage process:
`Knowledge Base` $\rightarrow$ `Embedding Engine` $\rightarrow$ `Vector Database` $\rightarrow$ `LLM Generator`

### 1. The Knowledge Base (Data Layer)
We don't provide the LLM with one giant biography. Instead, we use **Chunking**.
- **What it is**: Breaking a profile into small, self-contained "chunks" (e.g., one project per chunk).
- **Why it matters**: It prevents the LLM from getting confused and allows the search engine to find the *exact* sentence needed.
- **Implementation**: Files in `src/data/knowledge/*.js` export arrays of objects containing `id`, `category`, and `text`.

### 2. The Embedding Engine (The Translator)
Computers cannot "read" text; they read numbers (vectors).
- **The Process**: We use an embedding model (like `nomic-embed-text` via Ollama) to turn a sentence into a list of 768 numbers.
- **The Logic**: Sentences with similar meanings end up with similar numbers.
- **Script**: `scripts/generateEmbeddings.mjs` iterates through all chunks and generates these vectors.

### 3. The Vector Database (The Memory)
We use **Upstash Vector**, a serverless database designed for high-speed similarity search.
- **Storage**: We store the vector and the original text as metadata.
- **Querying**: When a user asks a question, we embed the question and ask Upstash: *"Give me the top 3 vectors most similar to this question."*

### 4. The LLM Generator (The Voice)
Finally, we use a model like **Llama 3.2** or **Groq** to synthesize the answer.
- **The Prompt**: We send a system prompt: *"You are Raja's assistant. Use ONLY the following context to answer. If it's not there, say you don't know."*
- **The Result**: A response that is factually accurate and grounded in the data.

## 🛠️ Local Setup Guide
To run this pipeline locally:
1. **Install Ollama**: Run `ollama pull llama3.2` and `ollama pull nomic-embed-text`.
2. **Upstash Setup**: Create a free index at Upstash and add the `URL` and `TOKEN` to your `.env.local`.
3. **Ingest Data**: Run `node --env-file=.env.local scripts/generateEmbeddings.mjs`.
4. **Launch**: Run `vercel dev` and start chatting!

---
*This architecture transforms a simple chatbot into a professional AI agent, demonstrating a deep understanding of modern LLM orchestration.*
