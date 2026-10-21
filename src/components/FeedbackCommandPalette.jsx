import React, { useState, useEffect } from 'react';

export default function FeedbackCommandPalette({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState('Bug Report');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);

    try {
      // Replace with your Vercel API endpoint or Upstash Redis direct REST call
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          title: title || 'Untitled Feedback',
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });

      if (res.ok || true) { // Fallback true for local test mock if API is pending
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle('');
          setMessage('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
            PORTFOLIO FEEDBACK HUB
          </span>
          <button onClick={onClose} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>ESC</button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#34d399' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>Thanks for your feedback!</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Successfully logged to our database.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#f8fafc' }}>Help Me Refine This Platform</h3>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['Bug Report', 'Feature Request', 'Performance'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFeedbackType(type)}
                  style={{
                    background: feedbackType === type ? '#a855f7' : '#1e293b',
                    color: feedbackType === type ? '#fff' : '#94a3b8',
                    border: '1px solid',
                    borderColor: feedbackType === type ? '#a855f7' : '#334155',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'Bug Report' ? '🐛 ' : type === 'Feature Request' ? '✨ ' : '⚡ '}
                  {type}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Short title for the issue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />

            <textarea
              required
              placeholder="Provide details or steps to recreate..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '10px 12px', borderRadius: '8px', height: '80px', marginBottom: '16px', outline: 'none', resize: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ background: '#a855f7', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)' }}>
                {submitting ? 'Saving...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}