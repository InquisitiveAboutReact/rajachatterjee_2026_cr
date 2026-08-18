import React, { useState, useEffect, useRef } from 'react';

const KNOWLEDGE_BASE = [
  {
    topic: "overview",
    keywords: ["who", "raja", "chatterjee", "role", "title", "about", "bio", "summary", "background"],
    content: "Raja Chatterjee is a Technical Delivery Leader & Digital Builder with over 18+ years of experience across technical delivery, program management, and full-stack cloud development. He leads global teams through ambitious technology programs, combining delivery discipline, technical depth, and AI-enabled workflows."
  },
  {
    topic: "experience",
    keywords: ["experience", "years", "management", "leadership", "teams", "delivery", "history", "career"],
    content: "Raja has 18+ years of experience in technology leadership, program delivery ownership, cloud architecture, and multi-disciplinary software engineering. He has managed distributed global teams across complex enterprise initiatives."
  },
  {
    topic: "certifications",
    keywords: ["certifications", "certified", "oracle", "azure", "itil", "ibm", "credentials", "badges"],
    content: "Raja holds top industry certifications:\n1. Oracle Cloud Infrastructure 2026 Certified Enterprise AI Professional\n2. Oracle Global Human Resources Cloud 2025 Certified Implementation Professional\n3. Oracle Payroll Cloud 2026 Certified Implementation Professional\n4. Microsoft AZ-300 Azure Architect Technologies (2020)\n5. ITIL Foundation Service Management (2015)\n6. IBM WebSphere Portal 6.1 Application Development (2011)"
  },
  {
    topic: "projects",
    keywords: ["projects", "work", "portfolio", "ssr", "nextjs", "webpack", "react", "architecture", "github"],
    content: "Selected Work Highlights:\n• Server-Side Rendering (SSR): Built with Next.js, Express & React for fast, resilient web experiences.\n• CSR & SSR Hybrid Architecture: Engineered from first principles with Webpack and React.\n• AI Delivery Copilot: AI-enabled workflow exploration for delivery risk summarization and team velocity."
  },
  {
    topic: "skills",
    keywords: ["skills", "stack", "technologies", "tech", "salesforce", "node", "guidewire", "cloud", "agile", "cicd"],
    content: "Raja's Core Tech Stack & Skills include: Salesforce, React & Node.js, Cloud Architecture & CI/CD Pipelines, Agile & Scaled Delivery Management, Guidewire, Azure, and AI-Driven Workflows."
  },
  {
    topic: "contact",
    keywords: ["contact", "email", "linkedin", "hire", "collaborate", "reach", "github", "connect"],
    content: "To contact Raja, please click on the below Linkedin & Github Link :-\n1. Linkedin = <a href=\"https://www.linkedin.com/in/rajachatterjee84/\" target=\"_blank\">LinkedIn</a>\n2. Github = <a href=\"https://github.com/InquisitiveAboutReact\" target=\"_blank\">Github</a>",
  },
  {
    topic: "cv",
    keywords: ["cv", "resume", "download", "pdf", "file"],
    content: "Recruiters can view and download Raja's official CV (PDF) directly from the top navigation bar or hero section using the 'Download CV' button."
  }
];

function retrieveRAGResponse(query) {
  const lower = query.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  KNOWLEDGE_BASE.forEach(entry => {
    let score = 0;
    entry.keywords.forEach(kw => {
      if (lower.includes(kw)) score += 2;
    });
    if (score >= maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  });

  if (bestMatch && maxScore > 0) {
    return bestMatch.content;
  }

  if (lower.includes('contact')) {
    const contactEntry = KNOWLEDGE_BASE.find(e => e.topic === 'contact');
    if (contactEntry) return contactEntry.content;
  }

  return "I can help with Raja's experience, certifications, projects, skills, CV download, and contact info. Try asking about one of those topics!";
}

export default function RAGChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I am Raja's AI Copilot. Ask me anything about his 18+ years of delivery leadership, Oracle & Azure certifications, technical stack, or project portfolio."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    setIsTyping(true);

    setTimeout(() => {
      const responseText = retrieveRAGResponse(query);
      const assistantMsg = { id: Date.now() + 1, sender: 'assistant', text: responseText };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="rag-chatbot-wrapper">
      {/* Floating Toggle Button */}
      <button 
        className={`rag-chat-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle RAG AI Assistant"
      >
        <span className="sparkle-icon">✦</span>
        <span className="trigger-label">{isOpen ? 'Close Copilot' : 'Raja AI Copilot'}</span>
        <span className="status-dot"></span>
      </button>

      {/* RAG Chat Window */}
      {isOpen && (
        <div className="rag-chat-modal">
          <div className="rag-chat-header">
            <div className="header-info">
              <div className="avatar-spark">✦</div>
              <div>
                <h4>Raja's AI Copilot</h4>
                <p><span className="live-dot"></span> Grounded Profile RAG Engine</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="rag-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === 'assistant' && <div className="bot-avatar">✦</div>}
            <div className="chat-bubble">
              {msg.sender === 'assistant' && msg.text.includes('<a') ? (
                <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: msg.text }} />
              ) : (
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              )}
            </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-row assistant">
                <div className="bot-avatar">✦</div>
                <div className="chat-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="rag-quick-prompts">
            <button onClick={() => handleSend("What is Raja's experience?")}>Experience (18+ yrs)</button>
            <button onClick={() => handleSend("What certifications does he hold?")}>Certifications</button>
            <button onClick={() => handleSend("Show selected projects")}>Projects</button>
            <button onClick={() => handleSend("How can I contact Raja?")}>Contact Info</button>
          </div>

          {/* Input Area */}
          <form className="rag-chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              type="text"
              placeholder="Ask about Raja's experience, certifications, tech stack..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={!inputValue.trim()}>
              <span>➔</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
