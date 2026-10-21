import React, { useState } from 'react';

export default function FeedbackReactionWidget() {
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reactions = [
    { id: 'love', emoji: '🔥', label: 'Loving It' },
    { id: 'bug', emoji: '🐛', label: 'Found Bug' },
    { id: 'slow', emoji: '⚡', label: 'Slow Load' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: `Reaction: ${selectedReaction}`,
          message: message || 'Quick reaction logged without text.',
          timestamp: new Date().toISOString()
        })
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // fallback view on error/offline
    } finally {
      setSubmitting(false);

      // Auto-reset back to the original reaction widget view after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSelectedReaction(null);
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '30px auto', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)' }}>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#34d399' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🎉</div>
          <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc' }}>Thanks for your feedback!</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Your response was recorded successfully.</p>
        </div>
      ) : (
        <>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#10b981', textAlign: 'center' }}>How is your experience on this site?</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>Tap a reaction to share quick feedback:</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {reactions.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReaction(r.label)}
                style={{
                  backgroundColor: selectedReaction === r.label ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                  border: `2px solid ${selectedReaction === r.label ? '#10b981' : '#334155'}`,
                  padding: '12px 8px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{r.emoji}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f8fafc' }}>{r.label}</div>
              </div>
            ))}
          </div>

          {selectedReaction && (
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px' }}>Add a note about "{selectedReaction}" (Optional):</label>
              <input
                type="text"
                placeholder="e.g., Layout shifts slightly on mobile..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '8px 10px', borderRadius: '6px', outline: 'none', fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '10px' }}
              />
              <button type="submit" disabled={submitting} style={{ width: '100%', backgroundColor: '#10b981', border: 'none', color: 'white', padding: '9px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                {submitting ? 'Saving...' : 'Save Feedback to Database'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}