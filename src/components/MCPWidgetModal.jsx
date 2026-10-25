import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Copy,
  Check,
  X,
  MessageSquare,
  Move,
  Minimize2
} from 'lucide-react';

export default function MCPWidgetModal() {
  const [isOpen, setIsOpen] = useState(false);
  // Default to squeezed/minimized launcher state on page load
  const [isExpanded, setIsExpanded] = useState(false); 
  const [selectedTab, setSelectedTab] = useState('cursor');
  const [copiedKey, setCopiedKey] = useState(null);

  // Position initialized inside the CYAN box area (Left side, bottom ~220px)
  const [position, setPosition] = useState({ x: 24, y: 220 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 24, initialY: 220 });
  const hasDraggedRef = useRef(false);

  const mcpUrl = "https://raj-portfolio-custom-mcp.onrender.com/mcp";
  const sseUrl = "https://raj-portfolio-custom-mcp.onrender.com/sse";

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const recruiterPrompts = [
    "Ask MCP: 'Give me my portfolio profile summary'",
    "Ask MCP: 'What certifications does the portfolio list?'",
    "Ask MCP: 'Which portfolio projects use Ollama?'",
    "Ask MCP: 'List all the architecture focus areas in the portfolio.'",
    "Ask MCP: 'What are Raja's key skills in Oracle Cloud Infrastructure (OCI) and Fast Formulas?'",
    "Ask MCP: 'Summarize Raja's 18+ years of experience in enterprise delivery.'",
    "Ask MCP: 'What AI and Cloud Certifications does Raja Chatterjee currently hold?'",
    "Ask MCP: 'Which of Raja's portfolio projects are in progress or still in prototype?'",
  ];

  const platformTabs = [
    { id: 'cursor', label: 'Cursor', icon: '⚡' },
    { id: 'vscode', label: 'VS Code', icon: '💻' },
    { id: 'claude_code', label: 'Claude Code', icon: '🤖' },
    { id: 'claude_desktop', label: 'Claude Desktop', icon: '🖥️' },
    { id: 'cline_roo', label: 'Cline / Roo', icon: '⚙️' },
    { id: 'chatgpt', label: 'ChatGPT', icon: '💬' },
    { id: 'gemini', label: 'Gemini', icon: '✨' },
  ];

  // Drag Handlers - Uses global Pointer Events for butter-smooth movement across the entire DOM
  const handlePointerDown = (e) => {
    // If user clicked the close/minimize button, don't trigger drag
    if (e.target.closest('.no-drag')) return;

    setIsDragging(true);
    hasDraggedRef.current = false;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      // Track if mouse moved significantly to distinguish click vs drag
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasDraggedRef.current = true;
      }

      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 220, dragRef.current.initialX + deltaX)),
        y: Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initialY - deltaY))
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handleLauncherClick = () => {
    // Only open/expand if user did NOT drag the widget around
    if (!hasDraggedRef.current) {
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DRAGGABLE FLOATING WIDGET                              */}
      {/* ========================================================= */}
      <div 
        onPointerDown={handlePointerDown}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          bottom: `${position.y}px`,
          zIndex: 99998,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none'
        }}
        className="group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none"></div>

        {isExpanded ? (
          /* EXPANDED FULL PILL WIDGET */
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#090d16',
              color: '#f8fafc',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              padding: '10px 14px',
              borderRadius: '9999px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(12px)',
              whiteSpace: 'nowrap'
            }}
          >
            {/* Move Grab Icon */}
            <div 
              className="text-cyan-400 hover:text-cyan-300 p-1 flex items-center justify-center bg-cyan-950/50 rounded-full border border-cyan-500/40" 
              title="Grab & drag anywhere"
            >
              <Move size={14} className="animate-pulse" />
            </div>

            {/* Clickable Action to open MCP Config Modal */}
            <button
              onClick={() => {
                if (!hasDraggedRef.current) setIsOpen(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left'
              }}
              aria-label="Connect MCP Server API"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(8, 51, 68, 0.8)',
                border: '1px solid rgba(6, 182, 212, 0.6)',
                color: '#22d3ee',
                flexShrink: 0,
                position: 'relative'
              }}>
                <Cpu size={16} />
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px #10b981'
                }}></span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#f8fafc' }}>
                    ⚡ Connect MCP Server
                  </span>
                  <span style={{
                    fontSize: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(99, 102, 241, 0.25)',
                    color: '#818cf8',
                    padding: '1px 4px',
                    borderRadius: '3px'
                  }}>
                    LIVE
                  </span>
                </div>
                <span style={{ fontSize: '9px', color: '#38bdf8', fontFamily: 'monospace' }}>
                  ✋ Grab & drag anywhere
                </span>
              </div>

              <Sparkles size={14} style={{ color: '#22d3ee', marginLeft: '2px', flexShrink: 0 }} />
            </button>

            {/* Minimize / Squeeze Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              title="Minimize widget"
              className="no-drag"
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(100, 116, 139, 0.5)',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              <Minimize2 size={12} />
            </button>
          </div>
        ) : (
          /* SQUEEZED / MINIMIZED LAUNCHER (Default State on Load) */
          <div
            onClick={handleLauncherClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#090d16',
              border: '1px solid rgba(6, 182, 212, 0.6)',
              borderRadius: '9999px',
              padding: '6px 14px 6px 8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer'
            }}
            title="Click to open Raja's MCP Widget"
          >
            {/* Logo Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(8, 51, 68, 0.9)',
              border: '1px solid rgba(6, 182, 212, 0.6)',
              color: '#22d3ee',
              position: 'relative',
              flexShrink: 0
            }}>
              <Cpu size={15} className="animate-pulse" />
              <span style={{
                position: 'absolute',
                top: '-1px',
                right: '-1px',
                width: '7px',
                height: '7px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                boxShadow: '0 0 6px #10b981'
              }}></span>
            </div>

            {/* Squeezed Label */}
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#38bdf8',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}>
              Check Raja's MCP
            </span>

            <Sparkles size={12} style={{ color: '#22d3ee', flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. TRUE MODAL OVERLAY & POPUP BOX                         */}
      {/* ========================================================= */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(3, 6, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            backgroundColor: '#080d1a',
            border: '1px solid rgba(100, 116, 139, 0.5)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#f1f5f9'
          }}>
            
            <div style={{ height: '4px', width: '100%', background: 'linear-gradient(to right, #6366f1, #06b6d4, #10b981)' }}></div>

            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  flexShrink: 0
                }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Raja Chatterjee's MCP Server
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      ● Live on Render
                    </span>
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Connect your AI tools to query Raja's 18+ years experience & cloud certifications.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Endpoints & Copy Section */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#030712',
              borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0b132b', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0, paddingRight: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#22d3ee', display: 'block', textTransform: 'uppercase' }}>HTTP · Claude &amp; Gemini</span>
                  <code style={{ fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{mcpUrl}</code>
                </div>
                <button onClick={() => handleCopy(mcpUrl, 'mcp')} style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {copiedKey === 'mcp' ? <Check size={14} color="#34d399" /> : <Copy size={14} />} {copiedKey === 'mcp' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0b132b', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0, paddingRight: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#818cf8', display: 'block', textTransform: 'uppercase' }}>SSE · Cursor &amp; VS Code</span>
                  <code style={{ fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{sseUrl}</code>
                </div>
                <button onClick={() => handleCopy(sseUrl, 'sse')} style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {copiedKey === 'sse' ? <Check size={14} color="#34d399" /> : <Copy size={14} />} {copiedKey === 'sse' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Platform Navigation Tabs */}
            <div style={{ padding: '16px 24px 12px 24px', borderBottom: '1px solid rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>Select Your Platform / IDE:</span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {platformTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: selectedTab === tab.id ? '1px solid #22d3ee' : '1px solid #1e293b',
                      backgroundColor: selectedTab === tab.id ? 'rgba(6, 182, 212, 0.2)' : '#0f172a',
                      color: selectedTab === tab.id ? '#22d3ee' : '#94a3b8',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Instructions Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: '320px' }}>
              {selectedTab === 'cursor' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Add this block to your project's <code style={{ color: '#22d3ee' }}>.cursor/mcp.json</code> file:</p>
                  <CodeBlock code={`{\n  "mcpServers": {\n    "raja-portfolio": {\n      "url": "${sseUrl}"\n    }\n  }\n}`} copiedKey={copiedKey} copyId="c_cursor" onCopy={handleCopy} />
                </div>
              )}

              {selectedTab === 'vscode' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Add to your user config <code style={{ color: '#22d3ee' }}>~/.copilot/mcp-config.json</code>:</p>
                  <CodeBlock code={`{\n  "mcpServers": {\n    "raja-portfolio": {\n      "type": "http",\n      "url": "${mcpUrl}",\n      "tools": ["*"]\n    }\n  }\n}`} copiedKey={copiedKey} copyId="c_vs" onCopy={handleCopy} />
                </div>
              )}

              {selectedTab === 'claude_code' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Run this in your terminal (Claude web is tested; Claude Code CLI is still to test):</p>
                  <CodeBlock code={`claude mcp add raja-portfolio ${mcpUrl} --transport http`} copiedKey={copiedKey} copyId="c_cc" onCopy={handleCopy} />
                </div>
              )}

              {selectedTab === 'claude_desktop' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Same steps as Claude on the web (tested):</p>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}><p style={{ margin: '0 0 8px 0' }}>1. Go to <strong>Settings → Connectors</strong>.</p><p style={{ margin: '0 0 8px 0' }}>2. Select <strong>Add custom connector</strong>.</p><p style={{ margin: 0 }}>3. Paste: <code style={{ color: '#22d3ee' }}>{mcpUrl}</code></p></div>
                </div>
              )}

              {selectedTab === 'cline_roo' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Use SSE mode in your extension settings (not yet tested):</p>
                  <div style={{ backgroundColor: '#030712', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    <div><span style={{ color: '#64748b' }}>Name:</span> raja-portfolio</div>
                    <div><span style={{ color: '#64748b' }}>Transport:</span> sse</div>
                    <div><span style={{ color: '#64748b' }}>URL:</span> <span style={{ color: '#22d3ee' }}>{sseUrl}</span></div>
                  </div>
                </div>
              )}

              {selectedTab === 'chatgpt' && (
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 8px 0' }}>1. Go to <strong>Settings → Integrations → MCP Servers</strong>.</p>
                  <p style={{ margin: '0 0 8px 0' }}>2. Select <strong>Add Custom Server</strong>, then choose SSE as the transport.</p>
                  <p style={{ margin: 0 }}>3. Paste Endpoint URL: <code style={{ color: '#22d3ee' }}>{sseUrl}</code></p>
                </div>
              )}

              {selectedTab === 'gemini' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>Add the HTTP endpoint in Gemini (web app):</p>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}><p style={{ margin: '0 0 8px 0' }}>1. Open <strong>Connected apps</strong> in Gemini.</p><p style={{ margin: '0 0 8px 0' }}>2. Select <strong>Connect to an MCP server</strong>.</p><p style={{ margin: '0 0 8px 0' }}>3. Paste: <code style={{ color: '#22d3ee' }}>{mcpUrl}</code></p><p style={{ margin: 0, color: '#94a3b8' }}>Gemini connects to this endpoint. Tool-call testing is still in progress.</p></div>
                </div>
              )}

              {/* Recruiter Sample Prompts */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <MessageSquare size={14} /> Sample Recruiter Prompts to Try:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recruiterPrompts.map((prompt, idx) => (
                    <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#030712', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '10px', fontSize: '12px', color: '#cbd5e1' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt}</span>
                      <button
                        onClick={() => handleCopy(prompt, `p_${idx}`)}
                        style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedKey === `p_${idx}` ? <Check size={12} color="#34d399" /> : <Copy size={12} />} {copiedKey === `p_${idx}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#030712',
              borderTop: '1px solid rgba(30, 41, 59, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span> Active Protocol: MCP v1.0
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function CodeBlock({ code, copiedKey, copyId, onCopy }) {
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{
        padding: '14px',
        borderRadius: '8px',
        backgroundColor: '#030712',
        border: '1px solid #1e293b',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#22d3ee',
        overflowX: 'auto',
        margin: 0,
        lineHeight: '1.5'
      }}>
        {code}
      </pre>
      <button
        onClick={() => onCopy(code, copyId)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#1e293b',
          border: 'none',
          color: '#cbd5e1',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {copiedKey === copyId ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
        {copiedKey === copyId ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}