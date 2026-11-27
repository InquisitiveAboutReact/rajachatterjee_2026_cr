import React, { useState } from 'react';

const AgentSandboxWidget = ({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Safe fallback if parent component doesn't pass isOpen/setIsOpen props
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const [query, setQuery] = useState('Analyze enterprise delivery experience');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const quickPrompts = [
    'Summarize OCI Certifications',
    'Analyze enterprise delivery experience',
    'What are Raja core AI tech stacks?'
  ];

  const WEBHOOK_URL = '/api/sandbox';

  const handleRunAgent = async (e, presetText) => {
    if (e) e.preventDefault();
    const activeQuery = presetText || query;
    if (!activeQuery.trim()) return;

    if (presetText) setQuery(presetText);
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: activeQuery }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const rawData = await res.json();
      const payload = Array.isArray(rawData) ? rawData[0] : rawData;

      const outputText =
        payload?.output ||
        payload?.text ||
        (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));

      const steps = Array.isArray(payload?.executionSteps)
        ? payload.executionSteps
        : [
            { node: 'Webhook Trigger', timeMs: 14, status: 'success' },
            { node: 'AI Agent (LLM)', timeMs: 1240, status: 'success' },
            { node: 'Code Formatter', timeMs: 5, status: 'success' }
          ];

      setResponse({ output: outputText, executionSteps: steps });
    } catch (err) {
      console.error('Sandbox Execution Error:', err);
      setResponse({
        output: `Execution Error: ${err.message}. Ensure your n8n workflow is published and active.`,
        executionSteps: [{ node: 'Webhook Request', timeMs: 0, status: 'error' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const getNodeStyle = (nodeIndex) => {
    const isError = response?.executionSteps?.[0]?.status === 'error';
    const isComplete = !!response && !loading && !isError;

    let borderColor = 'rgba(71, 85, 105, 0.7)';
    let glow = 'none';
    let badgeColor = '#64748b';

    if (loading) {
      borderColor = '#fbbf24';
      glow = '0 0 15px rgba(251, 191, 36, 0.25)';
      badgeColor = '#fbbf24';
    } else if (isError && nodeIndex === 0) {
      borderColor = '#f43f5e';
      glow = '0 0 15px rgba(244, 63, 94, 0.3)';
      badgeColor = '#f43f5e';
    } else if (isComplete) {
      borderColor = '#10b981';
      glow = '0 0 15px rgba(16, 185, 129, 0.22)';
      badgeColor = '#10b981';
    }

    return { borderColor, glow, badgeColor };
  };

  const nodes = [
    { id: 'webhook', title: 'Webhook', sub: 'POST /trigger', icon: '⚡', color: '#ec4899' },
    { id: 'agent', title: 'AI Agent', sub: 'Orchestrator + LLM', icon: '🤖', color: '#8b5cf6' },
    { id: 'code', title: 'Code Formatter', sub: 'JSON Schema', icon: '{ }', color: '#f59e0b' },
    { id: 'respond', title: 'Respond', sub: '200 OK Payload', icon: '↩', color: '#06b6d4' }
  ];

  return (
    <>
      {/* 1. Floating Trigger Pill Button (Hidden when modal is open) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            borderRadius: '9999px',
            backgroundColor: '#0b1324',
            border: '1px solid rgba(6, 182, 212, 0.45)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.2)',
            color: '#22d3ee',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 22px rgba(6, 182, 212, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.2)';
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}
          />
          <span>Live N8N test sandbox</span>
        </button>
      )}

      {/* 2. Modal Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          {/* Modal Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '940px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '18px',
              backgroundColor: '#0d1323',
              border: '1px solid rgba(6, 182, 212, 0.28)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(6, 182, 212, 0.12)',
              color: '#f1f5f9',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            {/* Header Row with Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', backgroundColor: 'rgba(8, 51, 68, 0.85)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
                  LIVE n8n AGENTIC SANDBOX
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <span>Pipeline: {loading ? 'Executing...' : 'Active'}</span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: loading ? '#fbbf24' : '#34d399', boxShadow: loading ? '0 0 8px #fbbf24' : '0 0 8px #34d399' }} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Sandbox"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(71, 85, 105, 0.6)',
                  color: '#cbd5e1',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Title & Subtitle */}
            <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 6px 0' }}>
              Interactive AI Workflow Canvas
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Test live n8n node execution telemetry, agent reasoning, and portfolio responses in real time.
            </p>

            {/* 3. Visual n8n Node Architecture Canvas */}
            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: '#070b14',
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                border: '1px solid rgba(30, 41, 59, 0.95)',
                marginBottom: '22px',
                overflowX: 'auto'
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                N8N WORKFLOW TOPOLOGY
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '640px', gap: '8px' }}>
                {nodes.map((node, idx) => {
                  const styleState = getNodeStyle(idx);
                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Box */}
                      <div
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: '#111827',
                          border: `1.5px solid ${styleState.borderColor}`,
                          boxShadow: styleState.glow,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          position: 'relative',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: `${node.color}20`,
                            border: `1px solid ${node.color}60`,
                            color: node.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {node.icon}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                            {node.title}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {node.sub}
                          </div>
                        </div>
                        {/* Status Dot */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: styleState.badgeColor
                          }}
                        />
                      </div>

                      {/* Connector Line between Nodes */}
                      {idx < nodes.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                          <div
                            style={{
                              height: '2px',
                              width: '100%',
                              backgroundColor: loading
                                ? '#fbbf24'
                                : response
                                ? '#10b981'
                                : '#334155',
                              transition: 'background-color 0.3s ease'
                            }}
                          />
                          <span
                            style={{
                              fontSize: '10px',
                              color: loading ? '#fbbf24' : response ? '#10b981' : '#475569',
                              marginLeft: '-4px'
                            }}
                          >
                            ▶
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '4px' }}>Quick Prompts:</span>
              {quickPrompts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={loading}
                  onClick={() => handleRunAgent(null, preset)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(30, 41, 59, 0.75)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(51, 65, 85, 0.85)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleRunAgent} style={{ display: 'flex', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about certifications, enterprise delivery, or AI architecture..."
                disabled={loading}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(51, 65, 85, 0.85)',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 22px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#030712',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.65 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minWidth: '125px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
                }}
              >
                {loading ? <span>Running...</span> : <span>Execute &rarr;</span>}
              </button>
            </form>

            {/* Telemetry & Output Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
              {/* Left Panel: Telemetry */}
              <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#090d16', border: '1px solid rgba(30, 41, 59, 0.9)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#22d3ee', margin: '0 0 14px 0' }}>
                  WORKFLOW NODE TELEMETRY
                </h3>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' }}>
                    <div style={{ height: '34px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
                    <div style={{ height: '34px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
                    <div style={{ height: '34px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
                  </div>
                ) : response?.executionSteps ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {response.executionSteps.map((step, idx) => {
                      const isError = step.status === 'error';
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#111827',
                            borderLeft: `2px solid ${isError ? '#f43f5e' : '#34d399'}`
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>{step.node}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isError ? '#f43f5e' : '#34d399' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#64748b', padding: '20px 0' }}>
                    Awaiting execution sequence...
                  </div>
                )}
              </div>

              {/* Right Panel: Agent Output */}
              <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#090d16', border: '1px solid rgba(30, 41, 59, 0.9)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#c084fc', margin: '0 0 14px 0' }}>
                  AGENT OUTPUT RESPONSE
                </h3>

                <div
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(30, 41, 59, 0.9)',
                    backgroundColor: '#0b101b',
                    fontSize: '13px',
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto',
                    maxHeight: '240px',
                    boxSizing: 'border-box'
                  }}
                >
                  {loading ? (
                    <span style={{ color: '#94a3b8' }}>Inferencing via n8n agent pipeline...</span>
                  ) : response?.output ? (
                    response.output
                  ) : (
                    <span style={{ color: '#64748b' }}>Type a prompt or click a quick preset above to execute your live n8n AI workflow.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentSandboxWidget;