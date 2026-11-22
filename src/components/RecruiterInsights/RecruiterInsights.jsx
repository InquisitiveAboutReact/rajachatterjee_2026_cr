import React, { useEffect, useState } from 'react';

const TOP_COLORS = ['#22d3ee', '#6366f1', '#10b981', '#a78bfa'];
const MISSING_COLORS = ['#f87171', '#fb923c', '#fcd34d'];

const card = {
  background: '#111c3a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '14px 16px',
};

const label = { fontSize: '12px', color: '#94a3b8' };

function Bar({ name, pct, color, nameWidth }) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${nameWidth} 1fr 44px`, alignItems: 'center', gap: '10px', fontSize: '13px' }}>
      <span>{name}</span>
      <div style={{ background: '#1e293b', borderRadius: '6px', height: '10px' }}>
        <div style={{ background: color, width: `${width}%`, height: '10px', borderRadius: '6px' }} />
      </div>
      <span style={{ color: '#94a3b8', textAlign: 'right' }}>{Math.round(pct)}%</span>
    </div>
  );
}

export default function RecruiterInsights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/insights')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const ready = data?.ready === true;

  return (
    <div>
      <div className="section-kicker"><span>05</span> Recruiter insights</div>
      <h2>What recruiters <em>check most.</em></h2>
      <p className="ai-copy">Updated daily from anonymous matcher runs. Only counts are shown, never job descriptions.</p>

      {ready && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', margin: '22px 0' }}>
            <div style={{ ...card, borderLeft: '3px solid #22d3ee' }}>
              <div style={label}>Job descriptions analysed</div>
              <div style={{ fontSize: '26px', fontWeight: 500, color: '#22d3ee', marginTop: '4px' }}>{data.total}</div>
            </div>
            <div style={{ ...card, borderLeft: '3px solid #10b981' }}>
              <div style={label}>Median fit score</div>
              <div style={{ fontSize: '26px', fontWeight: 500, color: '#10b981', marginTop: '4px' }}>{Math.round(data.medianScore)}%</div>
            </div>
            <div style={{ ...card, borderLeft: '3px solid #fcd34d' }}>
              <div style={label}>Most common verdict</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#fcd34d', marginTop: '8px' }}>{data.topVerdict}</div>
            </div>
          </div>

          <div style={{ ...card, padding: '16px 18px', marginBottom: '22px' }}>
            <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 500, marginBottom: '6px' }}>AI summary</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.7 }}>{data.summary}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ ...label, marginBottom: '12px' }}>Top requirements checked</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {data.topRequirements.map((item, i) => (
                  <Bar key={item.name} name={item.name} pct={item.pct} color={TOP_COLORS[i % TOP_COLORS.length]} nameWidth="120px" />
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...label, marginBottom: '12px' }}>Most often missing</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {data.topMissing.map((item, i) => (
                  <Bar key={item.name} name={item.name} pct={item.pct} color={MISSING_COLORS[i % MISSING_COLORS.length]} nameWidth="150px" />
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '20px' }}>Only aggregate counts are shown. No job descriptions are stored.</div>
        </>
      )}

      {!ready && data && (
        <p className="ai-copy" style={{ fontSize: '14px' }}>Insights appear once enough job descriptions have been analysed.</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '22px' }}>
        <a className="btn-secondary" href="https://www.salesforce.com/trailblazer/rajachatterjee2024" target="_blank" rel="noreferrer">Salesforce Trailblazer ↗</a>
        <a className="btn-secondary" href="#certifications">Oracle HCM and OIC path ↗</a>
      </div>
    </div>
  );
}