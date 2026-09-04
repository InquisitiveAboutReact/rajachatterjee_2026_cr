import React, { useState, useEffect } from 'react';
import './App.css';
import profileImage from './images/raja-profile-2026.jpg';
import oracleHrBadge from './images/oracle-hr-2025.jpg';
import oracleAiBadge from './images/oracle-ai-2026.jpg';
import oraclePayrollBadge from './images/oracle-payroll-2026.jpg';
import claudeCCAFBadge from './images/CCAF-O.jpg';
import CVModal from './components/CVManager/CVModal';
import RAGChatbot from './components/Chatbot/RAGChatbot';
import MobileNav from './components/Navigation/MobileNav';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollProgress from './components/common/ScrollProgress';
import Timeline from './components/Timeline/Timeline';
import AnalyticsModal from './components/AnalyticsModal/AnalyticsModal';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"

const Arrow = () => <span aria-hidden="true">↗</span>;

const VERCEL_DOMAIN = 'https://rajachatterjee-2026-cr.vercel.app';
const VERCEL_API_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')
  ? `${VERCEL_DOMAIN}/api/status`
  : '/api/status';

const NAV_SECTIONS = [
  { id: 'work', label: 'Selected Work' },
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

function App() {
  const [theme, setTheme] = useState('dark');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const getDynamicStatus = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour < 20) return STATUS_OPTIONS[0];
    if (currentHour >= 20 && currentHour < 23) return STATUS_OPTIONS[2];
    return STATUS_OPTIONS[1];
  };

  const [currentStatus, setCurrentStatus] = useState(getDynamicStatus);

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
            <button type="button" className="cv-cta-btn" onClick={() => setIsCVModalOpen(true)}>📄 Download CV</button>
            <button type="button" className="mobile-menu-btn" onClick={() => setIsMobileNavOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} onOpenCV={() => setIsCVModalOpen(true)} onOpenAnalytics={() => setIsAnalyticsOpen(true)} theme={theme} onToggleTheme={toggleTheme} />

      {/* COMPACT & SOLID HERO SECTION */}
      <section className="hero shell" id="top" style={{ paddingBottom: '30px' }}>
        <div className="eyebrow" style={{ marginBottom: '16px' }}>
          <span className="eyebrow-pulse" />
          <h4>Available for strategic collaborations &amp; open for new opportunities</h4>
        </div>

                <div className="hero-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 360px)', 
          alignItems: 'center', 
          gap: '30px' // Tighter gap between text and profile card
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
              <button type="button" className="btn-primary" onClick={() => setIsCVModalOpen(true)}>📄 Download CV (PDF)</button>
              <a href="#work" className="btn-secondary">View Selected Work ↓</a>
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer" className="btn-secondary">Connect on LinkedIn <Arrow /></a>
            </div>
          </div>

          <aside className="portrait-card-v2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div className="portrait-image-wrapper" style={{ width: '220px', height: '220px', borderRadius: '50%', padding: '4px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)' }}>
              <img src={profileImage} alt="Raja Chatterjee" loading="eager" className="portrait-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const msg = e.target.elements.message.value;
                  if (!msg) return;
                  const phoneNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "";
                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                }}>
                  <input type="text" name="message" placeholder="Type message..." style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', background: '#2a3942', border: 'none', color: '#fff', fontSize: '11px', marginBottom: '6px', outline: 'none' }} />
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

        {/* INTEGRATED COMPACT METRICS BAR */}
        <div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', /* Changed from flex-start to space-between */
  flexWrap: 'wrap', 
  gap: '16px', /* Reduced gap */
  borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
  marginTop: '40px', 
  paddingTop: '24px',
  textAlign: 'left'
}}>
  <div style={{ minWidth: '140px' }}> {/* Removed flex: 1 */}
    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>18+</span>
    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Years of IT Experience</p>
  </div>
  <div style={{ minWidth: '140px' }}> {/* Removed flex: 1 */}
    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>Enterprise Apps</span>
    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Oracle Cloud & UI Full Stack Architecture</p>
  </div>
  <div style={{ minWidth: '140px' }}> {/* Removed flex: 1 */}
    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>AI Focused</span>
    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>Claude & OIC Enterprise AI certified. Building Intelligent Solutions</p>
  </div>
  <div style={{ minWidth: '140px' }}> {/* Removed flex: 1 */}
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

        <div className="projects-grid">
          <a className="project-card" href="https://github.com/InquisitiveAboutReact/SSR-NextJS-Heroku" target="_blank" rel="noreferrer">
            <div className="project-type">01 / Engineering</div>
            <div className="project-visual">&lt;/&gt; SSR Next.js</div>
            <div className="project-footer">
              <h3>Server-Side Rendering</h3>
              <Arrow />
            </div>
            <p>Faster, resilient web experiences with Next.js, Express &amp; React.</p>
          </a>

          <a className="project-card" href="https://github.com/InquisitiveAboutReact/SSR-CSR-Express-Webpack-React" target="_blank" rel="noreferrer">
            <div className="project-type">02 / Architecture</div>
            <div className="project-visual">[ Client ➔ Server ➔ Build ]</div>
            <div className="project-footer">
              <h3>React, CSR &amp; SSR</h3>
              <Arrow />
            </div>
            <p>A flexible rendering setup built from first principles with Webpack.</p>
          </a>
        </div>

        <section className="articles-section" style={{ marginTop: '40px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#b99110', fontWeight: 600, fontSize: '1.5rem' }}>Technical Articles Section</h2>
          <div className="articles-grid-fixed">
            <a className="project-card article-card-custom" href="https://medium.com/@i.gooner168/technical-deep-dive-resolving-branch-conflicts-ci-build-failures-in-vercel-for-multi-branch-13a20ab27fe8?sharedUserId=i.gooner168" target="_blank" rel="noreferrer">
              <div className="project-type" style={{ color: '#10b981', fontWeight: 600 }}>03 / ARTICLE • DEVOPS</div>
              <div className="project-visual" style={{ color: '#2b24fb', borderColor: '#1f293d' }}>[ Vercel ➔ Git ➔ Deploy ]</div>
              <div className="project-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <h3>Resolving Vercel Branch Conflicts</h3>
                <Arrow />
              </div>
              <p>Debugging multi-branch deployments, gh-pages isolation, and CI environment build rules.</p>
            </a>
          </div>
        </section>
      </section>

      <section className="ai-section reveal-section" id="about">
        <div className="shell ai-grid">
          <div>
            <div className="section-kicker"><span>02</span> Intelligence, applied</div>
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
              <label>RAJA / AI DELIVERY COPILOT</label>
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
        <div className="section-kicker"><span>03</span> Verified learning</div>
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
        <div className="section-kicker"><span>04</span> The detail</div>
        <div className="cred-grid">
          <div>
            <h2>Experience that<br />travels well.</h2>
            <p className="experience-copy">18+ years across technical delivery, program management, and full-stack development.</p>
            <div className="tags-cloud">
              <span className="tag-pill">Salesforce</span>
              <span className="tag-pill">React / Node</span>
              <span className="tag-pill">Cloud &amp; CI/CD</span>
              <span className="tag-pill">Agile delivery</span>
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
            <div className="section-kicker"><span>05</span> Start a conversation</div>
            <h2>Have an idea<br />worth <em>moving?</em></h2>
          </div>
          <div>
            <p className="footer-tagline">Let&apos;s make the complicated parts feel simple.</p>
            <a href="mailto:i.gooner168@gmail.com" className="email-link">Say hello <Arrow /></a>
            <div className="socials-row">
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com/InquisitiveAboutReact" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </div>
        <div className="shell footer-bottom">
          <div className="footer-meta">
            <span>© 2026 Raja Chatterjee, all rights reserved.</span>
            <span className="footer-date">Last Updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </footer>

      <CVModal isOpen={isCVModalOpen} onClose={() => setIsCVModalOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <RAGChatbot />
      <SpeedInsights />
      <Analytics />
      <ScrollToTop />
    </main>
  );
}

export default App;