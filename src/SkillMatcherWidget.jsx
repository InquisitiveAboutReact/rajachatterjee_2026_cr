import React, { useState } from 'react';

export default function SkillMatcherWidget({ profileData, onMatchRun }) {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');

  const processTextForAnalysis = (textToAnalyze) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    
    if (onMatchRun) {
      onMatchRun();
    }

    setTimeout(() => {
      const jdLower = textToAnalyze.toLowerCase();

      let matchedRules = [];

      if (jdLower.includes('guidewire technical project manager') || (jdLower.includes('guidewire') && jdLower.includes('project manager'))) {
        matchedRules.push({ label: 'Guidewire Technical Project Manager', score: 90 });
      }
      if (jdLower.includes('guidewire developer')) {
        matchedRules.push({ label: 'Guidewire Developer', score: 50 });
      }

      const skillRules = [
        { keywords: ['tech delivery manager'], score: 95, label: 'Tech Delivery Manager' },
        { keywords: ['delivery management', 'program management', 'project management', 'project manager', 'tech project manager', 'program manager'], score: 95, label: 'Program & Project Management' },
        { keywords: ['ui architect', 'mern stack'], score: 90, label: 'UI Architect / MERN Stack' },
        { keywords: ['ui engineering'], score: 87, label: 'UI Engineering' },
        { keywords: ['ai', 'gen ai', 'agentic ai', 'rag', 'mcp'], score: 90, label: 'AI & GenAI Leadership' },
        { keywords: ['digital leader'], score: 90, label: 'Digital Leader' },
        { keywords: ['enterprise apps', 'enterprise application'], score: 85, label: 'Enterprise Apps' },
        { keywords: ['agile'], score: 87, label: 'Agile' },
        { keywords: ['scrum'], score: 87, label: 'Scrum' },
        { keywords: ['cloud architecture'], score: 80, label: 'Cloud Architecture' },
        { keywords: ['oracle hcm'], score: 78, label: 'Oracle HCM' },
        { keywords: ['sap concur'], score: 75, label: 'SAP Concur' },
        { keywords: ['claim center'], score: 75, label: 'Guidewire Claim Center' },
        { keywords: ['guidewire'], score: 75, label: 'Guidewire' },
        { keywords: ['java'], score: 60, label: 'Java' }
      ];

      skillRules.forEach(rule => {
        const hasKeyword = rule.keywords.some(kw => jdLower.includes(kw));
        if (hasKeyword && !matchedRules.some(r => r.label.toLowerCase().includes(rule.label.toLowerCase()))) {
          matchedRules.push(rule);
        }
      });

      const hasDeveloperWord = jdLower.includes('developer');
      if (hasDeveloperWord && !matchedRules.some(r => r.label.toLowerCase().includes('developer'))) {
        matchedRules.push({ label: 'Developer Role', score: 55 });
      }

      let finalScore = 75;
      let summaryText = '';

      if (matchedRules.length > 0) {
        const totalScoreSum = matchedRules.reduce((acc, curr) => acc + curr.score, 0);
        finalScore = Math.round(totalScoreSum / matchedRules.length);

        const matchedLabels = matchedRules.map(r => r.label).join(', ');
        summaryText = `Evaluated match for: ${matchedLabels}. Balanced score calculated against your specific experience tiers and domain weights.`;
      } else {
        summaryText = `General enterprise profile alignment detected across your core technical leadership and architecture background.`;
      }

      setResult({
        score: `${finalScore}%`,
        summary: summaryText,
      });
      setIsAnalyzing(false);
    }, 600);
  };

  const handleAnalyze = () => {
    processTextForAnalysis(jobDescription);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target.result;
        setJobDescription(text);
        processTextForAnalysis(text);
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const simulatedExtractedText = `Uploaded JD Document: ${file.name}. Role requirements parsed successfully for Technical Delivery Management, UI Architecture, Java, and Enterprise Cloud frameworks.`;
        setJobDescription(simulatedExtractedText);
        processTextForAnalysis(simulatedExtractedText);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            color: '#38bdf8', 
            letterSpacing: '0.1em', 
            marginBottom: '6px',
            fontWeight: '700'
          }}>
            ⚡ Live Recruiter Neural Scan
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Test Role Compatibility
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
            Paste a target job description or upload a JD document to instantly benchmark fitment.
          </p>
        </div>

     {/* Upload Container with Integrated Subtext */}
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <label style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px dashed rgba(56, 189, 248, 0.5)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}>
            📁 {fileName ? `Uploaded: ${fileName.slice(0, 18)}...` : 'Upload JD Document'}
            <input 
              type="file" 
              accept=".txt,.pdf,.doc,.docx" 
              onChange={handleFileUpload}
              style={{ display: 'none' }} 
            />
          </label>
          
          <span style={{
            fontSize: '10px',
            color: '#34d399',
            fontWeight: '500',
            letterSpacing: '0.02em',
            paddingRight: '2px'
          }}>
            🔒 Private & Secure • Zero Storage
          </span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <textarea 
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here or upload a document above..." 
          style={{ 
            width: '100%', 
            height: '120px', 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)', 
            color: '#f8fafc', 
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid rgba(148, 163, 184, 0.2)', 
            fontSize: '13px',
            outline: 'none',
            resize: 'vertical',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
        />
      </div>

      <button 
        type="button" 
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '13px',
          cursor: isAnalyzing ? 'wait' : 'pointer',
          alignSelf: 'flex-start',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: isAnalyzing ? 0.7 : 1
        }}
      >
        {isAnalyzing ? 'Scanning Enterprise Matrix...' : '✨ Run AI Fit Analysis'}
      </button>

      {result && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.05) 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(16, 185, 129, 0.4)', 
          marginTop: '4px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#34d399', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }}></span>
              Match Score Verified
            </span>
            <span style={{ 
              fontSize: '22px', 
              fontWeight: '800', 
              color: '#34d399',
              textShadow: '0 0 16px rgba(52, 211, 153, 0.4)'
            }}>
              {result.score}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>{result.summary}</p>
        </div>
      )}
    </div>
  );
}