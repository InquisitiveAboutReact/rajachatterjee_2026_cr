import React, { useState, useRef, useEffect } from 'react';

/*
 * RAG Skill Matcher widget
 * Sends the job description (text, or a .txt/.docx/.pdf file) to POST /api/match-jd.
 * The server first checks that the input is a job description, then scores it.
 */

const API_URL = '/api/match-jd';
const MAX_FILE_MB = 3;
const ACCEPTED = ['.txt', '.docx', '.pdf'];
const REQUEST_TIMEOUT_MS = 60000;

const STAGES = [
  { after: 0, text: 'Reading your document...' },
  { after: 3, text: 'Checking that this is a job description...' },
  { after: 8, text: 'Searching your profile for evidence...' },
  { after: 15, text: 'Scoring each requirement against that evidence...' },
  { after: 25, text: 'Almost done. Long job descriptions take a little longer.' },
];

const TITLES = {
  400: 'Input problem',
  413: 'File too large',
  422: 'Not a job description',
  429: 'Too many requests',
  502: 'Could not analyse',
  503: 'Service unavailable',
};

const KEYFRAMES = '@keyframes bkBar{0%{left:-40%}100%{left:100%}}';

const scoreColor = (n) => (n >= 80 ? '#34d399' : n >= 60 ? '#38bdf8' : n >= 40 ? '#fbbf24' : '#f87171');

const priorityStyle = {
  must: { color: '#f87171', label: 'Must have' },
  should: { color: '#fbbf24', label: 'Should have' },
  nice: { color: '#94a3b8', label: 'Nice to have' },
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

function withTitle(title, message) {
  const err = new Error(message);
  err.title = title;
  return err;
}

export default function SkillMatcherWidget({ onMatchRun }) {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef(null);

  const busy = status === 'loading';

  // Cancel any in-flight request when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Count elapsed seconds while the analysis runs.
  useEffect(() => {
    if (!busy) return undefined;
    setElapsed(0);
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [busy]);

  const showError = (title, message) => {
    setErrorTitle(title);
    setErrorMsg(message);
    setStatus('error');
  };

  const runMatch = async () => {
    if (!file && !jobDescription.trim()) {
      showError('Input problem', 'Paste a job description or upload a document first.');
      return;
    }

    onMatchRun?.();
    setStatus('loading');
    setErrorMsg('');
    setErrorTitle('');
    setResult(null);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const payload = file
        ? { fileName: file.name, fileBase64: await fileToBase64(file) }
        : { jd: jobDescription.trim() };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        throw withTitle(
          TITLES[res.status] || 'Analysis failed',
          data?.error || `Analysis failed (${res.status}). Please try again.`
        );
      }

      setResult(data);
      setStatus('done');
    } catch (err) {
      if (err.name === 'AbortError') {
        showError('Taking longer than expected', 'The analysis was cancelled or took too long. Please try again.');
      } else {
        showError(err.title || 'Analysis failed', err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      clearTimeout(timer);
    }
  };

  const handleFileUpload = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    const ext = '.' + picked.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      showError('Unsupported file', `Please upload ${ACCEPTED.join(', ')}.`);
      return;
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      showError(TITLES[413], `The limit is ${MAX_FILE_MB} MB.`);
      return;
    }
    setFile(picked);
    setStatus('idle');
    setErrorMsg('');
    setErrorTitle('');
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
    setErrorTitle('');
  };

  const stage = [...STAGES].reverse().find((s) => elapsed >= s.after)?.text ?? STAGES[0].text;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>
      <style>{KEYFRAMES}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: '700' }}>
            ⚡ Live Recruiter Neural Scan
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Test Role Compatibility
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
            Paste a target job description or upload a JD document. The score is grounded in my actual project and certification record.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <label style={{
            background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed rgba(56, 189, 248, 0.5)',
            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', color: '#38bdf8',
            cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
          }}>
            📁 {file ? `Uploaded: ${file.name.slice(0, 18)}${file.name.length > 18 ? '...' : ''}` : 'Upload JD Document'}
            <input type="file" accept={ACCEPTED.join(',')} onChange={handleFileUpload} disabled={busy} style={{ display: 'none' }} />
          </label>
          {file && (
            <button type="button" onClick={clearFile} disabled={busy}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
              Remove file
            </button>
          )}
          <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '500', letterSpacing: '0.02em', paddingRight: '2px' }}>
            🔒 Private & Secure • Zero Storage
          </span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={busy || !!file}
          placeholder={file ? 'Using the uploaded document. Remove it to paste text instead.' : 'Paste job description here or upload a document above...'}
          style={{
            width: '100%', height: '120px', boxSizing: 'border-box',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
            color: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)',
            fontSize: '13px', outline: 'none', resize: 'vertical', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            opacity: file ? 0.6 : 1,
          }}
          onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
        />
      </div>

      <button
        type="button"
        onClick={runMatch}
        disabled={busy}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', color: '#fff', border: 'none',
          padding: '12px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '13px',
          cursor: busy ? 'wait' : 'pointer', alignSelf: 'flex-start',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)', opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? 'Analysing...' : '✨ Run AI Fit Analysis'}
      </button>

      {busy && (
        <div role="status" aria-live="polite" style={{
          display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.35)', background: 'rgba(15, 23, 42, 0.7)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{stage}</span>
            <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{elapsed}s</span>
          </div>
          <div style={{ position: 'relative', height: '4px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.2)', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: '40%', borderRadius: '999px',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', animation: 'bkBar 1.4s ease-in-out infinite',
            }} />
          </div>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div role="alert" style={{
          padding: '12px 14px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5',
          border: `1px solid ${errorTitle === 'Not a job description' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
          color: errorTitle === 'Not a job description' ? '#fde68a' : '#fca5a5',
        }}>
          {errorTitle && <strong style={{ display: 'block', marginBottom: '4px' }}>{errorTitle}</strong>}
          {errorMsg}
        </div>
      )}

      {status === 'done' && result && <ResultPanel result={result} />}
    </div>
  );
}

function ResultPanel({ result }) {
  const score = Math.round(result.score ?? 0);
  const color = scoreColor(score);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.05) 100%)',
      padding: '20px', borderRadius: '12px', border: `1px solid ${color}66`, display: 'flex', flexDirection: 'column', gap: '18px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
          {result.verdict || 'Match Score Verified'}
        </span>
        <span style={{ fontSize: '22px', fontWeight: '800', color }}>{score}%</span>
      </div>

      {result.scoring && (
        <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '-10px' }}>
          Met {result.scoring.met} · Partly met {result.scoring.partial} · Missing {result.scoring.missing}
          {result.scoring.capApplied ? ' · score capped because a must-have is missing' : ''}
        </span>
      )}

      {result.summary && (
        <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>{result.summary}</p>
      )}

      {result.matchedSkills?.length > 0 && (
        <Section title="Evidence from my profile">
          {result.matchedSkills.map((m, i) => (
            <Item key={`${m.skill}-${i}`}
              title={m.skill}
              badge={m.strength === 'strong' ? 'Strong' : 'Moderate'}
              badgeColor={m.strength === 'strong' ? '#34d399' : '#38bdf8'}
              body={m.evidence}
              meta={m.source} />
          ))}
        </Section>
      )}

      {result.gaps?.length > 0 && (
        <Section title="Gaps against this role">
          {result.gaps.map((g, i) => {
            const p = priorityStyle[g.priority] || priorityStyle.nice;
            return <Item key={`${g.skill}-${i}`} title={g.skill} badge={p.label} badgeColor={p.color} body={g.note} />;
          })}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      {children}
    </div>
  );
}

function Item({ title, badge, badgeColor, body, meta }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <strong style={{ fontSize: '13px', color: '#f1f5f9' }}>{title}</strong>
        {badge && (
          <span style={{ fontSize: '10px', fontWeight: '700', color: badgeColor, border: `1px solid ${badgeColor}`, padding: '1px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
            {badge}
          </span>
        )}
      </div>
      {body && <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>{body}</p>}
      {meta && <span style={{ fontSize: '11px', color: '#64748b' }}>Source: {meta}</span>}
    </div>
  );
}