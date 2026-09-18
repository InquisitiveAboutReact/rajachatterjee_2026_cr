// import React, { useState, useEffect, useRef } from 'react';

// const KNOWLEDGE_BASE = [
//   {
//     topic: "overview",
//     keywords: ["who", "raja", "chatterjee", "role", "title", "about", "bio", "summary", "background"],
//     content: "Raja Chatterjee is a Technical Delivery Leader & Digital Builder with over 18+ years of experience across technical delivery, program management, and full-stack cloud development. He leads global teams through ambitious technology programs, combining delivery discipline, technical depth, and AI-enabled workflows."
//   },
//   {
//     topic: "companies",
//     keywords: ["companies", "company", "employer", "employers", "worked", "organization", "organizations", "where", "firms", "previous", "raja's", "rajesh"],
//     content: "Raja's previous companies before he joined TCS, were Cognizant, IBM, Intelligroup, Sanguine IT Solutions and Hinnovation Research Center"
//   },
//   {
//     topic: "experience",
//     keywords: ["years", "management", "leadership", "teams", "delivery", "history", "career"],
//     content: "Raja has 18+ years of experience in technology leadership, program delivery ownership, cloud architecture, and multi-disciplinary software engineering. He has managed distributed global teams across complex enterprise initiatives."
//   },
//   {
//     topic: "certifications",
//     keywords: ["certifications", "certified", "oracle", "azure", "itil", "ibm", "credentials", "badges", "claude"],
//     content: "Raja holds top industry certifications:\n1. Claude Certified Associate - Foundations (2026)\n2. Oracle Cloud Infrastructure Certified Enterprise AI Professional (2026)\n3. Oracle Global Human Resources Cloud 2025 Certified Implementation Professional\n4. Oracle Payroll Cloud 2026 Certified Implementation Professional\n5. Microsoft AZ-300 Azure Architect Technologies (2020)\n6. ITIL Foundation Service Management (2015)\n7. IBM WebSphere Portal 6.1 Application Development (2011)"
//   },
//   {
//     topic: "projects",
//     keywords: ["projects", "work", "portfolio", "ssr", "nextjs", "webpack", "react", "architecture", "github"],
//     content: "Selected Work Highlights:\n• Server-Side Rendering (SSR): Built with Next.js, Express & React for fast, resilient web experiences.\n• CSR & SSR Hybrid Architecture: Engineered from first principles with Webpack and React.\n• AI Delivery Copilot: AI-enabled workflow exploration for delivery risk summarization and team velocity."
//   },
//   {
//     topic: "skills",
//     keywords: ["skills", "stack", "technologies", "tech", "salesforce", "node", "guidewire", "cloud", "agile", "cicd"],
//     content: "Raja's Core Tech Stack & Skills include: Salesforce, React & Node.js, Cloud Architecture & CI/CD Pipelines, Agile & Scaled Delivery Management, Guidewire, Azure, and AI-Driven Workflows."
//   },
//   {
//     topic: "contact",
//     keywords: ["contact", "email", "linkedin", "hire", "collaborate", "reach", "github", "connect"],
//     content: "To contact Raja, please click on the below Linkedin & Github Link :-\n1. Linkedin = <a href=\"https://www.linkedin.com/in/rajachatterjee84/\" target=\"_blank\">LinkedIn</a>\n2. Github = <a href=\"https://github.com/InquisitiveAboutReact\" target=\"_blank\">Github</a>",
//   },
//   {
//     topic: "cv",
//     keywords: ["cv", "resume", "download", "pdf", "file"],
//     content: "Recruiters can view and download Raja's official CV (PDF) directly from the top navigation bar or hero section using the 'Download CV' button."
//   }
// ];

// function getDynamicGreeting() {
//   const hour = new Date().getHours(); 
//   let timeOfDay = "Good Evening";
  
//   if (hour >= 4 && hour < 12) {
//     timeOfDay = "Good Morning"; 
//   } else if (hour >= 12 && hour < 17) {
//     timeOfDay = "Good Afternoon"; 
//   } else if (hour >= 17 && hour < 24) {
//     timeOfDay = "Good Evening"; 
//   } else {
//     timeOfDay = "Good Morning"; 
//   }
  
//   return `Hello ${timeOfDay}, how can I help you today with Raja's information?`;
// }

// function retrieveRAGResponse(query) {
//   const lower = query.toLowerCase().replace(/rajesh/g, "raja's").trim();

//   const greetingTriggers = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"];
//   const isGreeting = greetingTriggers.some(trigger => lower === trigger || lower.startsWith(trigger));

//   if (isGreeting) {
//     return getDynamicGreeting();
//   }

//   if (
//     lower.includes('company') || 
//     lower.includes('companies') || 
//     lower.includes('employer') || 
//     lower.includes('employers') || 
//     lower.includes('worked') ||
//     lower.includes('previous')
//   ) {
//     const companyEntry = KNOWLEDGE_BASE.find(e => e.topic === 'companies');
//     if (companyEntry) return companyEntry.content;
//   }

//   let bestMatch = null;
//   let maxScore = 0;

//   KNOWLEDGE_BASE.forEach(entry => {
//     let score = 0;
//     entry.keywords.forEach(kw => {
//       if (lower.includes(kw)) score += 2;
//     });
//     if (score > maxScore) {
//       maxScore = score;
//       bestMatch = entry;
//     }
//   });

//   if (bestMatch && maxScore > 0) {
//     return bestMatch.content;
//   }

//   if (lower.includes('contact')) {
//     const contactEntry = KNOWLEDGE_BASE.find(e => e.topic === 'contact');
//     if (contactEntry) return contactEntry.content;
//   }

//   return "I don't have sufficient knowledge for this question, I am still under training";
// }

// export default function RAGChatbot({ onQuery }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: 'assistant',
//       text: "Hello! I am Raja's AI Copilot. Ask me anything about his 18+ years of delivery leadership, Oracle & Azure certifications, technical stack, or project portfolio."
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
  
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const messagesEndRef = useRef(null);

//   // Check if speech recognition is natively supported by the browser
//   const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     if (isOpen) scrollToBottom();
//   }, [messages, isOpen]);

//   const speakText = (text) => {
//     if (!('speechSynthesis' in window)) return;
//     window.speechSynthesis.cancel();

//     const plainText = text.replace(/<[^>]*>?/gm, '');
//     const utterance = new SpeechSynthesisUtterance(plainText);
//     utterance.rate = 1.0;
//     utterance.pitch = 1.0;

//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);

//     window.speechSynthesis.speak(utterance);
//   };

//   const stopSpeaking = () => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       setIsSpeaking(false);
//     }
//   };

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
//     // Graceful fallback for Safari or unsupported environments
//     if (!SpeechRecognition) {
//       alert("Voice input is currently optimized for Chrome/Edge. Please type your question or use the quick prompt buttons below!");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     recognition.onstart = () => {
//       setIsListening(true);
//     };
    
//     recognition.onresult = (event) => {
//       const speechToText = event.results[0][0].transcript;
//       if (speechToText) {
//         setInputValue('');
//         handleSend(speechToText);
//       }
//     };

//     recognition.onerror = (event) => {
//       console.warn("Speech recognition notice:", event.error);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };

//     try {
//       recognition.start();
//     } catch (err) {
//       console.error("Recognition start failed:", err);
//       setIsListening(false);
//     }
//   };

//   const handleSend = (textToSend) => {
//     const rawQuery = textToSend || inputValue;
//     if (!rawQuery.trim()) return;

//     const cleanQuery = rawQuery.replace(/^["“]|["”]$/g, '').trim();

//     const userMsg = { id: Date.now(), sender: 'user', text: cleanQuery };
//     setMessages(prev => [...prev, userMsg]);
//     setInputValue('');

//     if (typeof onQuery === 'function') {
//       onQuery();
//     }

//     setIsTyping(true);

//     setTimeout(() => {
//       const responseText = retrieveRAGResponse(cleanQuery);
//       const assistantMsg = { id: Date.now() + 1, sender: 'assistant', text: responseText };
//       setMessages(prev => [...prev, assistantMsg]);
//       setIsTyping(false);

//       speakText(responseText);
//     }, 600);
//   };

//   return (
//     <div className="rag-chatbot-wrapper">
//       <button 
//         className={`rag-chat-trigger ${isOpen ? 'active' : ''}`}
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="Toggle RAG AI Assistant"
//       >
//         <span className="sparkle-icon">✦</span>
//         <span className="trigger-label">{isOpen ? 'Close Chatbot' : 'Raja AI Chatbot'}</span>
//         <span className="status-dot"></span>
//       </button>

//       {isOpen && (
//         <div className="rag-chat-modal">
//           <div className="rag-chat-header">
//             <div className="header-info">
//               <div className="avatar-spark">✦</div>
//               <div>
//                 <h4>Raja's AI Chatbot</h4>
//                 <p className="status-subtext">
//                   <span className="live-dot"></span> Grounded Profile RAG Engine
//                 </p>
//                 <span className="training-warning">
//                   Under Training & Can make mistakes
//                 </span>
//               </div>
//             </div>
//             <button className="close-btn" onClick={() => { stopSpeaking(); setIsOpen(false); }}>✕</button>
//           </div>

//           <div className="rag-chat-messages">
//             {messages.map(msg => (
//               <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
//                 {msg.sender === 'assistant' && (
//                   <div className={`bot-avatar ${isSpeaking ? 'speaking' : ''}`}>✦</div>
//                 )}
//                 <div className="chat-bubble">
//                   {msg.sender === 'assistant' && msg.text.includes('<a') ? (
//                     <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: msg.text }} />
//                   ) : (
//                     <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
//                   )}
//                   {msg.sender === 'assistant' && (
//                     <button 
//                       className="speak-audio-btn" 
//                       onClick={() => speakText(msg.text)}
//                       title="Read aloud"
//                       style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '4px' }}
//                     >
//                       🔊
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {isTyping && (
//               <div className="chat-bubble-row assistant">
//                 <div className="bot-avatar">✦</div>
//                 <div className="chat-bubble typing">
//                   <span></span><span></span><span></span>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="rag-quick-prompts">
//             <button onClick={() => handleSend("What companies did Raja work for?")}>Companies</button>
//             <button onClick={() => handleSend("What certifications does he hold?")}>Certifications</button>
//             <button onClick={() => handleSend("Show selected projects")}>Projects</button>
//             <button onClick={() => handleSend("How can I contact Raja?")}>Contact Info</button>
//           </div>

//           <form className="rag-chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
//             <input
//               type="text"
//               placeholder={isListening ? "Listening to your voice..." : "Ask about Raja's experience, companies..."}
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//             />

//             {isSpeechSupported && (
//               <button 
//                 type="button" 
//                 onClick={startListening} 
//                 className={`mic-btn ${isListening ? 'listening' : ''}`}
//                 title="Speak to Assistant"
//                 style={{ background: isListening ? '#ef4444' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 6px' }}
//               >
//                 {isListening ? '🔴' : '🎤'}
//               </button>
//             )}

//             {isSpeaking && (
//               <button 
//                 type="button" 
//                 onClick={stopSpeaking} 
//                 className="stop-speech-btn" 
//                 title="Stop Audio"
//                 style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
//               >
//                 ⏹️
//               </button>
//             )}

//             <button type="submit" disabled={!inputValue.trim()}>
//               <span>➔</span>
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';

const KNOWLEDGE_BASE = [
  {
    topic: "overview",
    keywords: ["who", "raja", "chatterjee", "role", "title", "about", "bio", "summary", "background"],
    content: "Raja Chatterjee is a Technical Delivery Leader & Digital Builder with over 18+ years of experience across technical delivery, program management, and full-stack cloud development. He leads global teams through ambitious technology programs, combining delivery discipline, technical depth, and AI-enabled workflows."
  },
  {
    topic: "companies",
    keywords: ["companies", "company", "employer", "employers", "worked", "organization", "organizations", "where", "firms", "previous", "raja's"],
    content: "Raja's previous companies before he joined TCS, were Cognizant, IBM, Intelligroup, Sanguine IT Solutions and Hinnovation Research Center"
  },
  {
    topic: "experience",
    keywords: ["years", "management", "leadership", "teams", "delivery", "history", "career"],
    content: "Raja has 18+ years of experience in technology leadership, program delivery ownership, cloud architecture, and multi-disciplinary software engineering. He has managed distributed global teams across complex enterprise initiatives."
  },
  {
    topic: "certifications",
    keywords: ["certifications", "certified", "oracle", "azure", "itil", "ibm", "credentials", "badges", "claude"],
    content: "Raja holds top industry certifications:\n1. Claude Certified Associate - Foundations (2026)\n2. Oracle Cloud Infrastructure Certified Enterprise AI Professional (2026)\n3. Oracle Global Human Resources Cloud 2025 Certified Implementation Professional\n4. Oracle Payroll Cloud 2026 Certified Implementation Professional\n5. Microsoft AZ-300 Azure Architect Technologies (2020)\n6. ITIL Foundation Service Management (2015)\n7. IBM WebSphere Portal 6.1 Application Development (2011)"
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
    keywords: ["contact", "email", "linkedin", "hire", "collaborate", "reach", "github", "connect", "whatsapp"],
    content: "You can contact Raja by any of the below :-\n1. <a href=\"https://www.linkedin.com/in/rajachatterjee84/\" target=\"_blank\" style=\"color: #60a5fa; text-decoration: underline;\">Linkedin</a>\n2. WhatsApp (Through Portal when he's available)\n3. Via Mail (Through Portal when his status is busy or away)\n4. <a href=\"https://github.com/InquisitiveAboutReact\" target=\"_blank\" style=\"color: #60a5fa; text-decoration: underline;\">Github</a>"
  },
  {
    topic: "cv",
    keywords: ["cv", "resume", "download", "pdf", "file"],
    content: "Recruiters can view and download Raja's official CV (PDF) directly from the top navigation bar or hero section using the 'Download CV' button."
  }
];

function getDynamicGreeting() {
  const hour = new Date().getHours(); 
  let timeOfDay = "Good Evening";
  
  if (hour >= 4 && hour < 12) {
    timeOfDay = "Good Morning"; 
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "Good Afternoon"; 
  } else if (hour >= 17 && hour < 24) {
    timeOfDay = "Good Evening"; 
  } else {
    timeOfDay = "Good Morning"; 
  }
  
  return `Hello ${timeOfDay}, how can I help you today with Raja's information?`;
}

function retrieveRAGResponse(query) {
  const lower = query.toLowerCase().replace(/rajesh/g, "raja's").trim();

  const greetingTriggers = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"];
  const isGreeting = greetingTriggers.some(trigger => lower === trigger || lower.startsWith(trigger));

  if (isGreeting) {
    return getDynamicGreeting();
  }

  if (lower.includes('contact') || lower.includes('reach') || lower.includes('hire') || lower.includes('connect')) {
    const contactEntry = KNOWLEDGE_BASE.find(e => e.topic === 'contact');
    if (contactEntry) return contactEntry.content;
  }

  if (
    lower.includes('company') || 
    lower.includes('companies') || 
    lower.includes('employer') || 
    lower.includes('employers') || 
    lower.includes('worked') ||
    lower.includes('previous')
  ) {
    const companyEntry = KNOWLEDGE_BASE.find(e => e.topic === 'companies');
    if (companyEntry) return companyEntry.content;
  }

  let bestMatch = null;
  let maxScore = 0;

  KNOWLEDGE_BASE.forEach(entry => {
    let score = 0;
    entry.keywords.forEach(kw => {
      if (lower.includes(kw)) score += 2;
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  });

  if (bestMatch && maxScore > 0) {
    return bestMatch.content;
  }

  return "I don't have sufficient knowledge for this question, I am still under training";
}

export default function RAGChatbot({ onQuery }) {
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
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const plainText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceNotice("Voice input requires Chrome/Edge. Please type your message or use quick prompts below.");
      setTimeout(() => setVoiceNotice(''), 5000);
      return;
    }

    setVoiceNotice('');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText) {
        setInputValue('');
        handleSend(speechToText);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition notice:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start failed:", err);
      setIsListening(false);
    }
  };

  const handleSend = (textToSend) => {
    const rawQuery = textToSend || inputValue;
    if (!rawQuery.trim()) return;

    const cleanQuery = rawQuery.replace(/^["“]|["”]$/g, '').trim();

    const userMsg = { id: Date.now(), sender: 'user', text: cleanQuery };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setVoiceNotice('');

    if (typeof onQuery === 'function') {
      onQuery();
    }

    setIsTyping(true);

    setTimeout(() => {
      const responseText = retrieveRAGResponse(cleanQuery);
      const assistantMsg = { id: Date.now() + 1, sender: 'assistant', text: responseText };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      speakText(responseText);
    }, 600);
  };

  return (
    <div className="rag-chatbot-wrapper">
      <button 
        className={`rag-chat-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle RAG AI Assistant"
      >
        <span className="sparkle-icon">✦</span>
        <span className="trigger-label">{isOpen ? 'Close Chatbot' : 'Raja AI Chatbot'}</span>
        <span className="status-dot"></span>
      </button>

      {isOpen && (
        <div className="rag-chat-modal">
          <div className="rag-chat-header">
            <div className="header-info">
              <div className="avatar-spark">✦</div>
              <div>
                <h4>Raja's AI Chatbot</h4>
                <p className="status-subtext">
                  <span className="live-dot"></span> Grounded Profile RAG Engine
                </p>
                <span className="training-warning">
                  Under Training & Can make mistakes
                </span>
              </div>
            </div>
            <button className="close-btn" onClick={() => { stopSpeaking(); setIsOpen(false); }}>✕</button>
          </div>

          <div className="rag-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div className={`bot-avatar ${isSpeaking ? 'speaking' : ''}`}>✦</div>
                )}
                <div className="chat-bubble">
                  {msg.sender === 'assistant' && msg.text.includes('<a') ? (
                    <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  )}
                  {msg.sender === 'assistant' && (
                    <button 
                      className="speak-audio-btn" 
                      onClick={() => speakText(msg.text)}
                      title="Read aloud"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '4px' }}
                    >
                      🔊
                    </button>
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

          <div className="rag-quick-prompts">
            <button onClick={() => handleSend("What companies did Raja work for?")}>Companies</button>
            <button onClick={() => handleSend("What certifications does he hold?")}>Certifications</button>
            <button onClick={() => handleSend("Show selected projects")}>Projects</button>
            <button onClick={() => handleSend("How can I contact Raja?")}>Contact Info</button>
          </div>

          {voiceNotice && (
            <div className="voice-notice-banner" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '8px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              margin: '0 12px 8px 12px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              {voiceNotice}
            </div>
          )}

          <form className="rag-chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask about Raja's experience, companies..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button 
              type="button" 
              onClick={startListening} 
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title="Speak to Assistant"
              style={{ background: isListening ? '#ef4444' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 6px' }}
            >
              {isListening ? '🔴' : '🎤'}
            </button>

            {isSpeaking && (
              <button 
                type="button" 
                onClick={stopSpeaking} 
                className="stop-speech-btn" 
                title="Stop Audio"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
              >
                ⏹️
              </button>
            )}

            <button type="submit" disabled={!inputValue.trim()}>
              <span>➔</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}