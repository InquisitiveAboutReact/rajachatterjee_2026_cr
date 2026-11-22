// src/components/Chatbot/RAGChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import './RAGChatbot.css';

const WELCOME_TEXT =
  "Hello! I am Raja's AI Copilot. Ask me anything about his 18+ years of delivery leadership, Oracle & Azure certifications, technical stack, or project portfolio.";

const GREETING_TRIGGERS = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];

const LOADING_PHRASES = ['Thinking...', 'Checking the knowledge base...', 'Almost there...'];

const QUICK_PROMPTS = [
  { label: 'Get CV 📄', query: 'Show me your CV / Resume' },
  { label: 'Companies', query: 'What companies did Raja work for?' },
  { label: 'Certifications', query: 'What certifications does he hold?' },
  { label: 'Projects', query: 'Show selected projects' },
  { label: 'Contact Info', query: 'How can I contact Raja?' },
];

const DEFAULT_CV_URL = '/Raja_Chatterjee_CV.pdf';

const cvButtonBase = {
  color: '#ffffff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

/* ---------- Helpers ---------- */

function getDynamicGreeting() {
  const hour = new Date().getHours();
  let timeOfDay = 'Good Evening';

  if (hour >= 4 && hour < 12) timeOfDay = 'Good Morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'Good Afternoon';

  return `Hello ${timeOfDay}, how can I help you today with Raja's information?`;
}

// Safe rendering for assistant replies. <br> becomes a line break, https links become
// real links, and all other tags are removed. React escapes the remaining text, so
// model output cannot inject HTML.
const stripTags = (s) => s.replace(/<[^>]*>/g, '');

function renderLinkedLine(line) {
  const nodes = [];
  const linkPattern = /<a\s+href="(https?:\/\/[^"]+)"[^>]*>(.*?)<\/a>/gi;
  let last = 0;
  let match;

  while ((match = linkPattern.exec(line)) !== null) {
    if (match.index > last) nodes.push(stripTags(line.slice(last, match.index)));
    nodes.push(
      <a key={`link-${match.index}`} href={match[1]} target="_blank" rel="noopener noreferrer">
        {stripTags(match[2])}
      </a>
    );
    last = linkPattern.lastIndex;
  }

  if (last < line.length) nodes.push(stripTags(line.slice(last)));
  return nodes;
}

function AssistantText({ text }) {
  const lines = String(text || '').split(/<br\s*\/?>|\n/i);
  return lines.map((line, i) => (
    <React.Fragment key={`line-${i}`}>
      {i > 0 && <br />}
      {renderLinkedLine(line)}
    </React.Fragment>
  ));
}

function CvActions() {
  const openInNewTab = () => {
    const url = localStorage.getItem('user_uploaded_cv_url') || DEFAULT_CV_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadPdf = () => {
    const modalBtn =
      document.querySelector('.cv-modal-download-btn') || document.querySelector('[data-cv-download]');
    if (modalBtn) {
      modalBtn.click();
      return;
    }
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL || ''}/Raja_Chatterjee_CV.pdf`;
    link.target = '_blank';
    link.download = 'Raja_Chatterjee_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={openInNewTab}
        style={{ ...cvButtonBase, backgroundColor: '#3b82f6', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}
      >
        👁️ Open in New Tab
      </button>
      <button
        onClick={downloadPdf}
        style={{ ...cvButtonBase, backgroundColor: '#10b981', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
      >
        📥 Download PDF
      </button>
    </div>
  );
}

/* ---------- Component ---------- */

export default function RAGChatbot({ onQuery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, sender: 'assistant', text: WELCOME_TEXT }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_PHRASES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  const messagesEndRef = useRef(null);

  const isSpeechSupported =
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Replace <br> with a pause so sentences don't run together, then remove remaining tags.
    const plainText = text.replace(/<br\s*\/?>/gi, '. ').replace(/<[^>]*>?/gm, '');
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
      setVoiceNotice('Voice input requires Chrome/Edge. Please type your message or use quick prompts below.');
      setTimeout(() => setVoiceNotice(''), 5000);
      return;
    }

    setVoiceNotice('');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputValue('');
        handleSend(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (err) {
      console.error('Recognition start failed:', err);
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend) => {
    const fromForm = typeof textToSend !== 'string';
    const rawQuery = fromForm ? inputValue : textToSend;
    if (!rawQuery.trim() || isTyping) return;

    const cleanQuery = rawQuery.replace(/^["“]|["”]$/g, '').trim();
    const lowerQuery = cleanQuery.toLowerCase();

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: cleanQuery }]);
    // Only clear the text box when the message was typed there, so quick prompts
    // don't wipe a half-written question.
    if (fromForm) setInputValue('');
    setVoiceNotice('');

    if (typeof onQuery === 'function') onQuery();

    // Whole-word match, so "history" or "hire" don't trigger the greeting.
    const isGreeting = GREETING_TRIGGERS.some((trigger) => new RegExp(`^${trigger}\\b`).test(lowerQuery));
    if (isGreeting) {
      const greetingText = getDynamicGreeting();
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'assistant', text: greetingText }]);
      speakText(greetingText);
      return;
    }

    setIsTyping(true);
    setLoadingMessage(LOADING_PHRASES[0]);
    let phraseIndex = 0;
    const loadingInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % LOADING_PHRASES.length;
      setLoadingMessage(LOADING_PHRASES[phraseIndex]);
    }, 3000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQuery }),
      });
      if (!res.ok) throw new Error(`Chat API request failed (${res.status})`);

      const data = await res.json();
      const reply = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.answer || '',
        action: data.action || null,
      };
      setMessages((prev) => [...prev, reply]);
      speakText(reply.text);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: "Sorry, I'm having trouble answering right now — please try again in a moment.",
        },
      ]);
    } finally {
      clearInterval(loadingInterval);
      setIsTyping(false);
    }
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
                <div className="training-warning">
                  AI Assistant Active (Beta)
                  <p className="maintenance-alert">
                    Note: This AI can only answer related to Raja's portfolio. Out of context questions might not get
                    responded as per expectations.
                  </p>
                </div>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
              }}
            >
              ✕
            </button>
          </div>

          <div className="rag-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div className={`bot-avatar ${isSpeaking ? 'speaking' : ''}`}>✦</div>
                )}
                <div className="chat-bubble">
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {msg.sender === 'assistant' ? <AssistantText text={msg.text} /> : msg.text}
                  </p>

                  {msg.action === 'download_cv' && <CvActions />}

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
                  <p style={{ fontSize: '12px', color: '#8a94ad', marginBottom: '4px' }}>{loadingMessage}</p>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="rag-quick-prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt.label} onClick={() => handleSend(prompt.query)}>
                {prompt.label}
              </button>
            ))}
          </div>

          {voiceNotice && (
            <div
              className="voice-notice-banner"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                margin: '0 12px 8px 12px',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              {voiceNotice}
            </div>
          )}

          <form
            className="rag-chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder={isListening ? 'Listening to your voice...' : "Ask about Raja's experience, companies..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />

            {isSpeechSupported && (
              <button
                type="button"
                onClick={startListening}
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                title="Speak to Assistant"
                style={{
                  background: isListening ? '#ef4444' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 6px',
                }}
              >
                {isListening ? '🔴' : '🎤'}
              </button>
            )}

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

            <button type="submit" disabled={!inputValue.trim() || isTyping}>
              <span>➔</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}