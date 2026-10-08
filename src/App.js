
import './suppressResizeObserver';
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import profileImage from './images/raja-profile-2026.jpg';
import oracleHrBadge from './images/oracle-hr-2025.jpg';
import oracleAiBadge from './images/oracle-ai-2026.jpg';
import oraclePayrollBadge from './images/oracle-payroll-2026.jpg';
import claudeCCAFBadge from './images/CCAF-O.jpg';
import n8nWorkflowImage from './images/n8n.png';
import vercelGitCicdImage from './images/Vercel-Git-cicd.png';
import CVModal from './components/CVManager/CVModal';
import RAGChatbot from './components/Chatbot/RAGChatbot';
import MobileNav from './components/Navigation/MobileNav';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollProgress from './components/common/ScrollProgress';
import Timeline from './components/Timeline/Timeline';
import AnalyticsModal from './components/AnalyticsModal/AnalyticsModal';
import SkillMatcherWidget from './SkillMatcherWidget'; 
import { RAJA_PROFILE } from './data/profileData';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import n8nVideo from './images/n8n_jev_prod.mp4';

// Robust global interceptor to stop ResizeObserver development overlay errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
      return;
    }
    originalError(...args);
  };

  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
}

const Arrow = () => <span aria-hidden="true">↗</span>;


const VERCEL_DOMAIN = 'https://rajachatterjee-2026-cr.vercel.app';
const VERCEL_API_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')
  ? `${VERCEL_DOMAIN}/api/status`
  : '/api/status';

const NAV_SECTIONS = [
  { id: 'work', label: 'Selected Work' },
  { id: 'matcher', label: 'JD Matcher' },
  { id: 'about', label: 'Intelligence & AI' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

const STATUS_OPTIONS = [
  { status: 'available', label: 'Available to chat / discuss', color: '#10b981', ping: true },
  { status: 'busy', label: 'Busy. Please wait or contact via email', color: '#ef4444', ping: false },
  { 
    status: 'away', 
    label: (
      <>
        Away. Mail me:{' '}
        <a href="mailto:i.gooner168@gmail.com" style={{ color: '#f59e0b', textDecoration: 'underline' }}>
          Say Hello ↗
        </a>
      </>
    ), 
    color: '#f59e0b', 
    ping: false 
  }
];

const certifications = [
  { image: claudeCCAFBadge, title: 'Claude Certified Associate Foundation', detail: 'Claude Certified Associates - Foundation', year: '2026' },
  { image: oracleAiBadge, title: 'Oracle Cloud Infrastructure', detail: 'Certified Enterprise AI Professional', year: '2026' },
  { image: oraclePayrollBadge, title: 'Oracle Payroll Cloud', detail: '2026 Certified Implementation Professional', year: '2026' },
  { image: oracleHrBadge, title: 'Oracle Global Human Resources Cloud', detail: '2025 Certified Implementation Professional', year: '2025' },
];

const trackAnalyticsEvent = async (metricName, value = null) => {
  try {
    const trackingUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')
      ? `${VERCEL_DOMAIN}/api/analytics`
      : '/api/analytics';

    await fetch(trackingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric: metricName, value })
    });
  } catch (err) {
    console.error('Tracking error:', err);
  }
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedN8nImage, setSelectedN8nImage] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const hasTrackedProjects = useRef(false);
  const hasTrackedTimeline = useRef(false);
  const maxScrollRef = useRef(0);

  const getDynamicStatus = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour < 20) return STATUS_OPTIONS[0];
    if (currentHour >= 20 && currentHour < 23) return STATUS_OPTIONS[2];
    return STATUS_OPTIONS[1];
  };

  const [currentStatus, setCurrentStatus] = useState(getDynamicStatus);

  const handleOpenCV = () => {
    trackAnalyticsEvent('cvDownloads');
    setIsCVModalOpen(true);
  };

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('portfolio_visited');
    if (!hasVisited) {
      sessionStorage.setItem('portfolio_visited', 'true');
      trackAnalyticsEvent('totalVisitors');
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        if (scrollPercent > maxScrollRef.current) {
          maxScrollRef.current = scrollPercent;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleBeforeUnload = () => {
      if (maxScrollRef.current > 0) {
        trackAnalyticsEvent('scrollDepthScore', maxScrollRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'work' && !hasTrackedProjects.current) {
            hasTrackedProjects.current = true;
            trackAnalyticsEvent('projectsEngagement');
          }
          if (entry.target.id === 'experience' && !hasTrackedTimeline.current) {
            hasTrackedTimeline.current = true;
            trackAnalyticsEvent('timelineEngagement');
          }
        }
      });
    };

    const sectionObserver = new IntersectionObserver(observerCallback, { threshold: 0.3 });
    const workEl = document.getElementById('work');
    const expEl = document.getElementById('experience');

    if (workEl) sectionObserver.observe(workEl);
    if (expEl) sectionObserver.observe(expEl);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setIsAdmin(true);

    async function fetchGlobalStatus() {
      try {
        const response = await fetch(VERCEL_API_URL);
        if (response.ok) {
          const data = await response.json();
          if (data && data.updatedAt && data.ttlHours) {
            const ageInHours = (Date.now() - data.updatedAt) / (1000 * 60 * 60);
            if (ageInHours < data.ttlHours) {
              const matched = STATUS_OPTIONS.find((s) => s.status === data.status);
              setCurrentStatus(matched || data);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Fallback to dynamic time status:', err);
      }
      setCurrentStatus(getDynamicStatus());
    }
    fetchGlobalStatus();
  }, []);

  const handleStatusSelect = async (e) => {
    const selectedKey = e.target.value;
    const selected = STATUS_OPTIONS.find((s) => s.status === selectedKey);
    if (!selected) return;

    const nextStatus = { ...selected, updatedAt: Date.now(), ttlHours: 2 };
    setCurrentStatus(nextStatus);

    try {
      await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextStatus),
      });
    } catch (err) {
      console.error('Failed sync:', err);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
  
    if (!ref) {
      if (!sessionStorage.getItem('tracked_direct')) {
        trackAnalyticsEvent('ref_direct');
        sessionStorage.setItem('tracked_direct', 'true');
      }
    }
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const handleShare = async () => {
    const shareData = { title: 'Raja Chatterjee', url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    trackAnalyticsEvent('hireRequests');
    trackAnalyticsEvent('ref_whatsapp');
    const phoneNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "";
    const messageToSend = userMessage.trim() || "Hi Raja, I saw your portfolio and wanted to connect";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageToSend)}`, '_blank');
  };

  return (
    <main className="app-root">
      <ScrollProgress />
      
      <header className="nav-header">
        <div className="shell nav-inner">
          <a className="brand" href="#top">RAJA<span>·</span>CHATTERJEE</a>
          <nav className="nav-links" aria-label="Main navigation">
            {NAV_SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={activeSection === section.id ? 'active' : ''}>
                {section.label}
              </a>
            ))}
          </nav>
          <div className="nav-controls">
            <button type="button" className="share-btn" onClick={() => setIsAnalyticsOpen(true)} title="Analytics">📊 Analytics</button>
            <button type="button" className="share-btn" onClick={handleShare} title="Share">↗ Share</button>
            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button type="button" className="cv-cta-btn" onClick={handleOpenCV}>📄 Download CV</button>
            <button type="button" className="mobile-menu-btn" 
              onClick={() => setIsMobileNavOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
        onOpenCV={handleOpenCV} 
        onOpenAnalytics={() => {
          setIsMobileNavOpen(false);
          setIsAnalyticsOpen(true);
        }} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />

      <section className="hero shell" id="top" style={{ paddingBottom: '30px' }}>
        <div className="eyebrow" style={{ marginBottom: '16px' }}>
          <span className="eyebrow-pulse" />
          <h4>Available for strategic collaborations &amp; open for new opportunities</h4>
        </div>

        <div className="hero-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 360px)', 
          alignItems: 'center', 
          gap: '30px'
        }}>
          <div className="hero-content">
            <p className="intro-tag">Technical Delivery Leader | Enterprise AI &amp; Digital Builder</p>
            <h1>
              Making complex<br />
              <em>work beautifully</em><br />
              clear.
            </h1>
            <p className="hero-description" style={{ marginBottom: '24px' }}>
              I lead global teams through ambitious technology programs—combining 18+ years of delivery discipline, cloud architecture depth, and practical curiosity.
            </p>

            <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button type="button" className="btn-primary" onClick={handleOpenCV}>📄 Download CV (PDF)</button>
              <a href="#work" className="btn-secondary">View Selected Work ↓</a>
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer" className="btn-secondary" onClick={() => trackAnalyticsEvent('ref_linkedin')}>Connect on LinkedIn <Arrow /></a>
            </div>
          </div>

          <aside className="portrait-card-v2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div 
              className="portrait-image-wrapper" 
              style={{ 
                width: '220px', 
                height: '220px', 
                borderRadius: '50%', 
                padding: '4px', 
                background: currentStatus.status === 'away' 
                  ? 'linear-gradient(135deg, #f59e0b, #3b82f6)' 
                  : currentStatus.status === 'busy' 
                  ? 'linear-gradient(135deg, #ef4444, #f97316)' 
                  : 'linear-gradient(135deg, #10b981, #3b82f6)',
                boxShadow: currentStatus.status === 'away' 
                  ? '0 0 25px rgba(245, 158, 11, 0.25)' 
                  : currentStatus.status === 'busy' 
                  ? '0 0 25px rgba(239, 68, 68, 0.25)' 
                  : '0 0 25px rgba(16, 185, 129, 0.25)', 
                position: 'relative' 
              }}
            >
              <img src={profileImage} alt="Raja Chatterjee" loading="eager" className="portrait-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              <span className={`status-dot-badge ${currentStatus.status}`} />
            </div>            
            
            {isAdmin && (
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '10px', border: '1px solid #475569', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="status-dot" style={{ backgroundColor: currentStatus.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>Admin Override</span>
                </div>
                <select value={currentStatus.status} onChange={handleStatusSelect} style={{ width: '100%', padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #64748b', fontSize: '12px' }}>
                  <option value="available">🟢 Available</option>
                  <option value="busy">🔴 Busy</option>
                  <option value="away">🟡 Away</option>
                </select>
              </div>
            )}

            {currentStatus.status === 'available' ? (
              <div style={{ background: '#0b141a', border: '1px solid #222d34', borderRadius: '10px', padding: '12px', width: '100%', color: '#e9edef', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #222d34', paddingBottom: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '7px', height: '7px', backgroundColor: '#00a884', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Chat with Raja • Online</span>
                </div>
                <div style={{ background: '#202c33', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', marginBottom: '6px' }}>
                  👋 Hi! Drop a note below:
                </div>
                <form onSubmit={handleWhatsAppSubmit}>
                  <input 
                    type="text" 
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Hi Raja, I'd love to connect regarding..." 
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', background: '#2a3942', border: 'none', color: '#fff', fontSize: '11px', marginBottom: '6px', outline: 'none' }} 
                  />
                  <button type="submit" style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#00a884', color: '#111b21', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Send via WhatsApp ➔</button>
                </form>
              </div>
            ) : (
              <div className="status-pill-btn readonly" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="status-dot-wrapper">
                  <span className="status-dot" style={{ backgroundColor: currentStatus.color }} />
                </span>
                <span className="status-text" style={{ fontSize: '12px' }}>{currentStatus.label}</span>
              </div>
            )}
          </aside>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
          marginTop: '40px', 
          paddingTop: '24px',
          textAlign: 'left'
        }}>
          <div style={{ minWidth: '140px' }}>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>18+</span>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Years of IT Experience</p>
          </div>
          <div style={{ minWidth: '140px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>Enterprise Apps</span>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Oracle Cloud & UI Full Stack Architecture</p>
          </div>
          <div style={{ minWidth: '140px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>AI Focused</span>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Claude & OIC Enterprise AI certified. Building Intelligent Solutions</p>
          </div>
          <div style={{ minWidth: '140px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>Global Teams</span>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Delivery Leadership, Global Customers, Stakeholder Management</p>
          </div>
        </div>
      </section>

      <section className="ticker-bar" aria-label="Core Capabilities">
        <div className="ticker-track">
          <div className="ticker-item">PROGRAM DELIVERY <b>✦</b></div>
          <div className="ticker-item">PRODUCT THINKING <b>✦</b></div>
          <div className="ticker-item">AI-ENABLED WORKFLOWS <b>✦</b></div>
          <div className="ticker-item">GLOBAL TEAMS <b>✦</b></div>
          <div className="ticker-item">ENTERPRISE CLOUD ARCHITECTURE <b>✦</b></div>
        </div>
      </section>

      <section className="shell work-section reveal-section" id="work">
        <div className="section-kicker"><span>01</span> Selected work</div>
        <div className="work-heading">
          <h2>Building momentum<br />where it matters.</h2>
          <p>From technical strategy to dependable delivery, I turn moving parts into progress.</p>
        </div>

     <div className="projects-section">
          {/* Full-width Top Card */}
          <div className="project-card full-width-card">
            <div className="project-type">01 / New Ideas , AI & Automation Mind !!</div>
            
            {/* Clickable Image Container with Zoom Trigger */}
            <h4>JEV Emulator vs Ollama+Wiki API (Click to expand the image)</h4>
            <div 
           
              className="project-visual workflow-visual-container" 
              onClick={() => setSelectedN8nImage(n8nWorkflowImage)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={n8nWorkflowImage} 
                alt="JEV Emulator vs Ollama and Wiki API Architecture" 
                className="workflow-img-contain"
              />
            </div>

            {/* Video Player Container */}
            <div className="video-container" style={{ width: '100%', maxWidth: '900px', margin: '20px auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <video 
                controls 
                width="100%" 
                preload="metadata"
                style={{ display: 'block', width: '100%', height: 'auto', background: '#000' }}
              >
                <source src={n8nVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="project-footer">
              <h3>Click to Play the Video</h3>
              <Arrow />
            </div>
            <p>Comparative structural analysis of emulation layers versus local LLM and retrieval-augmented pipeline patterns.</p>
          </div>

        <section className="articles-section" style={{ marginTop: '40px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 18px', color: '#b99110', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '1.1rem' }}>Technical Articles Section</h2>
          <div className="articles-grid-fixed">
            <a className="project-card article-card-custom" href="https://medium.com/@i.gooner168/technical-deep-dive-resolving-branch-conflicts-ci-build-failures-in-vercel-for-multi-branch-13a20ab27fe8?sharedUserId=i.gooner168" target="_blank" rel="noreferrer" onClick={() => trackAnalyticsEvent('ref_others')}>
              <div className="project-type" style={{ color: '#10b981', fontWeight: 600 }}> ARTICLE • DEVOPS</div>
              <div className="project-visual" style={{ color: '#2b24fb', borderColor: '#1f293d' }}>
                <img
                  src={vercelGitCicdImage}
                  alt="Vercel Git CI/CD architecture diagram for deployment troubleshooting article"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', background: '#0b1220' }}
                />
              </div>
              <div className="project-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <h3>Resolving Vercel Branch Conflicts</h3>
                <Arrow />
              </div>
              <p>Debugging multi-branch deployments, gh-pages isolation, and CI environment build rules.</p>
            </a>
            <a className="project-card article-card-custom" href="https://medium.com/@i.gooner168/i-benchmarked-a-direct-llm-call-against-an-ai-agent-in-n8n-inspired-by-typesafe-ais-jev-a00281fa762e" target="_blank" rel="noreferrer" onClick={() => trackAnalyticsEvent('ref_others')}>
              <div className="project-type" style={{ color: '#10b981', fontWeight: 600 }}> ARTICLE • AI & Automation</div>
              <div className="project-visual" style={{ color: '#2b24fb', borderColor: '#1f293d' }}>
                <img
                  src={n8nWorkflowImage}
                  alt="n8n workflow architecture diagram for the article on JEV, Ollama, and AI agents"
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <div className="project-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <h3>TypeSafe AI's Jev (Emulator) + n8n + Ollama Integration</h3>
                <Arrow />
              </div>
              <p>I Benchmarked a Direct LLM Call Against an AI Agent in n8n, Inspired by TypeSafe AI’s Jev</p>
            </a>
          </div>
        </section>

        <div style={{ textAlign: 'center', margin: '0 0 18px', color: '#b99110', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '1.1rem' }}>
          A couple of projects on Server Side Rendering
        </div>

          {/* Two Column Grid for 02 and 03 */}
          <div className="projects-grid-row">
            <a className="project-card" href="#work" onClick={(e) => e.preventDefault()}>
              <div className="project-type">02 / ENGINEERING</div>
              <div className="project-visual">
                <code>&lt;/&gt; SSR Next.js</code>
              </div>
              <div className="project-footer">
                <h3>Server-Side Rendering</h3>
                <Arrow />
              </div>
              <p>Faster, resilient web experiences with Next.js, Express & React.</p>
            </a>

            <a className="project-card" href="#work" onClick={(e) => e.preventDefault()}>
              <div className="project-type">03 / ARCHITECTURE</div>
              <div className="project-visual">
                <span>[ Client &rarr; Server &rarr; Build ]</span>
              </div>
              <div className="project-footer">
                <h3>React, CSR & SSR</h3>
                <Arrow />
              </div>
              <p>A flexible rendering setup built from first principles with Webpack.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Recruiter Job Description Matcher Section */}
      <section className="shell reveal-section" id="matcher" style={{ margin: '60px auto' }}>
        <div className="section-kicker">
          <span>04</span> <h2>Recruiter Portal</h2>
        </div>
        <div className="work-heading">
          <h2>
            AI Enabled Live Job Description<br />
            <em>Skill Matcher.</em>
          </h2>
          <p>Paste a target job description below to verify dynamic skill alignment against my enterprise profile.</p>
        </div>
        <div 
          style={{ 
            background: '#1e293b', 
            padding: '32px', 
            borderRadius: '16px', 
            border: '1px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <SkillMatcherWidget 
            profileData={RAJA_PROFILE} 
            onMatchRun={() => trackAnalyticsEvent('jd_match_executed')} 
          />
        </div>
      </section>

      <section className="ai-section reveal-section" id="about">
        <div className="shell ai-grid">
          <div>
            <div className="section-kicker"><span>05</span> Intelligence, applied</div>
            <h2>Human judgement,<br /><em>AI momentum.</em></h2>
            <p className="ai-copy">
              I&apos;m exploring thoughtful ways to make delivery teams sharper: clearer signals, less manual overhead, and more time for human decisions.
            </p>
            <div className="ai-links">
              <a className="btn-secondary" href="https://www.salesforce.com/trailblazer/rajachatterjee2024" target="_blank" rel="noreferrer">Salesforce Trailblazer <Arrow /></a>
              <a className="btn-secondary" href="#certifications">Oracle HCM &amp; OIC Path <Arrow /></a>
            </div>
          </div>

          <div className="ai-window">
            <div className="window-top">
              <span /><span /><span />
              <label>RAJA / Enterprise AI builder</label>
            </div>
            <div className="prompt-box">
              <b>Ask the delivery copilot</b>
              <p>&ldquo;How does Raja lead enterprise AI and cloud architecture programs?&rdquo;</p>
            </div>
            <div className="response-box">
              <div className="spark-icon" aria-hidden="true">✦</div>
              <div>
                <b>Grounded execution, zero noise.</b>
                <p>Combines 18+ years of cloud delivery leadership with modular UI pipelines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell certifications reveal-section" id="certifications">
        <div className="section-kicker"><span>06</span> Verified learning</div>
        <div className="work-heading">
          <h2>Credentials that<br /><em>keep evolving.</em></h2>
          <p>Recent Oracle certifications complementing enterprise delivery foundations.</p>
        </div>

        <div className="cert-grid">
          {certifications.map((cert) => (
            <article className="cert-card" key={cert.title}>
              <div className="cert-image"><img src={cert.image} alt={cert.title} loading="lazy" /></div>
              <span className="cert-year">{cert.year}</span>
              <h3>{cert.title}</h3>
              <p>{cert.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell experience reveal-section" id="experience">
        <div className="section-kicker"><span></span> The detail</div>
        <div className="cred-grid">
          <div>
            <h2>Experience that<br />travels well.</h2>
            <p className="experience-copy">18+ years across technical delivery, program management, and full-stack development.</p>
            <div className="tags-cloud">
              <span className="tag-pill">Enterprise AI Architect </span>
              <span className="tag-pill">UI Full Stack</span>
              <span className="tag-pill">Container Services, Oracle Cloud Fusion HCM</span>
              <span className="tag-pill">Products [SAP Concur, Guidewire]</span>
              <span className="tag-pill">ITIL, Managed Services, Agile delivery</span>
            </div>
          </div>
          <div className="numbers-col">
            <div className="number-item"><strong>18+</strong><small>years in technology</small></div>
            <div className="number-item"><strong>360°</strong><small>delivery ownership</small></div>
          </div>
        </div>
        <div style={{ marginTop: '30px' }}><Timeline /></div>
      </section>

      <footer id="contact" className="reveal-section">
        <div className="shell footer-inner">
          <div>
            <div className="section-kicker"><span></span> Start a conversation</div>
            <h2>Have an idea<br />worth <em>moving?</em></h2>
          </div>
          <div>
            <p className="footer-tagline">Let&apos;s make the complicated parts feel simple.</p>
            <a href="mailto:i.gooner168@gmail.com" className="email-link">Say hello <Arrow /></a>
            <div className="socials-row">
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer" onClick={() => trackAnalyticsEvent('ref_linkedin')}>LinkedIn</a>
              <a href="https://github.com/InquisitiveAboutReact" target="_blank" rel="noreferrer" onClick={() => trackAnalyticsEvent('ref_github')}>GitHub</a>
            </div>
          </div>
        </div>
        <div className="shell footer-bottom">
        <div className="security-badge" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 12px', 
          background: 'rgba(16, 185, 129, 0.1)', // Very faint green
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          color: '#10b981' // Green text/icon
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>Secured & CSP Protected</span>
        </div>
          <div className="footer-meta">
            <span>© 2026 Raja Chatterjee, all rights reserved.</span>
            <span className="footer-date">Last Updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          
        </div>
    
      </footer>

      {/* Modals & Overlays */}
      <CVModal isOpen={isCVModalOpen} onClose={() => setIsCVModalOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />

      {/* n8n Image Zoom Modal Lightbox Overlay */}
      {selectedN8nImage && (
        <div className="n8n-lightbox-overlay" onClick={() => setSelectedN8nImage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="n8n-lightbox-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <button 
              className="n8n-lightbox-close" 
              onClick={() => setSelectedN8nImage(null)}
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}
            >
              &times;
            </button>
            <img 
              src={selectedN8nImage} 
              alt="Expanded n8n Workflow Architecture" 
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
            />
          </div>
        </div>
      )}
      
      <RAGChatbot onQuery={() => trackAnalyticsEvent('copilotQueries')} />
      <SpeedInsights />
      <Analytics /> 
      <ScrollToTop />
    </main>
  );
}

export default App;