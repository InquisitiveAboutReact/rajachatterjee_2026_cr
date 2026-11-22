import React, { useEffect, useState } from 'react';

const TOP_COLORS = ['#22d3ee', '#6366f1', '#10b981', '#a78bfa', '#38bdf8'];
const MISSING_COLORS = ['#f87171', '#fb923c', '#fcd34d'];

const card = {
  background: '#111c3a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '14px 16px',
};

const label = { fontSize: '12px', color: '#94a3b8' };

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function Bar({ name, pct, color, nameWidth }) {
  const width = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${nameWidth} 1fr 44px`, alignItems: 'center', gap: '10px', fontSize: '13px' }}>
      <span>{cap(name)}</span>
      <div style={{ background: '#1e293b', borderRadius: '6px', height: '10px' }}>
        <div style={{ background: color, width: `${width}%`, height: '10px', borderRadius: '6px' }} />
      </div>
      <span style={{ color: '#94a3b8', textAlign: 'right' }}>{width}%</span>
    </div>
  );
}

export default function RecruiterInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/insights', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive) setData(d);
        })
        .catch(() => {
          if (alive) setData(null);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const ready = data?.ready === true;
  const topRequirements = data?.topRequirements || [];
  const topMissing = data?.topMissing || [];
  const updated = ready && data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div>
      <div className="section-kicker"><span>05</span> Recruiter insights</div>
      <h2>What recruiters <em>check most.</em></h2>
      <p className="ai-copy">Live counts from the job description matcher. Only aggregate numbers are shown, never job descriptions.</p>

      {ready ? (
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
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#fcd34d', marginTop: '8px' }}>{cap(data.topVerdict)}</div>
            </div>
          </div>

          {data.summary && (
            <div style={{ ...card, padding: '16px 18px', marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 500, marginBottom: '6px' }}>AI summary</div>
              <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.7 }}>{data.summary}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ ...label, marginBottom: '12px' }}>Top requirements checked</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {topRequirements.map((item, i) => (
                  <Bar key={item.name} name={item.name} pct={item.pct} color={TOP_COLORS[i % TOP_COLORS.length]} nameWidth="120px" />
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...label, marginBottom: '12px' }}>Most often missing</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {topMissing.length > 0 ? (
                  topMissing.map((item, i) => (
                    <Bar key={item.name} name={item.name} pct={item.pct} color={MISSING_COLORS[i % MISSING_COLORS.length]} nameWidth="150px" />
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>No gaps recorded yet.</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '20px' }}>
            Only aggregate counts are shown. Updated {updated}.
          </div>
        </>
      ) : (
        <p className="ai-copy" style={{ fontSize: '14px', marginTop: '22px' }}>
          {loading
            ? 'Loading live data.'
            : 'No analyses yet. Run the matcher above, and this panel will update with live numbers.'}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '22px' }}>
        <a className="btn-secondary" href="https://www.salesforce.com/trailblazer/rajachatterjee2024" target="_blank" rel="noreferrer">Salesforce Trailblazer ↗</a>
        <a className="btn-secondary" href="#certifications">Oracle HCM and OIC path ↗</a>
      </div>
    </div>
  );
}