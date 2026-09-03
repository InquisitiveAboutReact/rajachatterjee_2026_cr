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
import Footer from './components/BodyComponent/Footer';
import { SpeedInsights } from "@vercel/speed-insights/react";

const Arrow = () => <span aria-hidden="true">↗</span>;

// Vercel Domain & Dynamic Routing
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

  // Time-based default engine
  const getDynamicStatus = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour < 20) {
      return { status: 'available', label: 'Available to chat / discuss', color: '#10b981', ping: true };
    } else if (currentHour >= 20 && currentHour < 23) {
      return { status: 'away', label: 'Away / Intermittent', color: '#f59e0b', ping: false };
    } else {
      return { status: 'busy', label: 'Busy / Do Not Disturb', color: '#ef4444', ping: false };
    }
  };

  const [currentStatus, setCurrentStatus] = useState(getDynamicStatus);

  // 1. Detect Admin Mode & Fetch Remote Status with 15-Minute Expiration Validation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }

    async function fetchGlobalStatus() {
      try {
        const response = await fetch(VERCEL_API_URL);
        if (response.ok) {
          const data = await response.json();
          
          // Check if remote payload has a timestamp and TTL
          if (data && data.updatedAt && data.ttlHours) {
            const now = Date.now();
            const ageInHours = (now - data.updatedAt) / (1000 * 60 * 60);

            // If manual status was updated less than 15 mins (0.25 hrs) ago, use it
            if (ageInHours < data.ttlHours) {
              setCurrentStatus(data);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Unable to fetch remote status, falling back to dynamic time:', err);
      }

      // Expired or invalid response -> fallback to local time schedule
      setCurrentStatus(getDynamicStatus());
    }

    fetchGlobalStatus();
  }, []);

  // 2. Cycle Status with 15-Minute Expiration Metadata
  const cycleStatus = async () => {
    const statuses = [
      { status: 'available', label: 'Available to chat / discuss', color: '#10b981', ping: true },
      { status: 'busy', label: 'Busy. Please wait or contact me via email', color: '#ef4444', ping: false },
      { status: 'away', label: 'Away. Send me a mail instead? Click on "Say Hello" below in the page', color: '#f59e0b', ping: false }
    ];

    const currentIndex = statuses.findIndex((s) => s.status === currentStatus.status);
    const nextStatus = {
      ...statuses[(currentIndex + 1) % statuses.length],
      updatedAt: Date.now(),
      ttlHours: 2 // 2 hours
    };

    // Optimistic UI Update
    setCurrentStatus(nextStatus);

    // Save to Remote Redis Database
    try {
      await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextStatus),
      });
    } catch (err) {
      console.error('Failed to sync status globally:', err);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const sectionIds = NAV_SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Raja Chatterjee | Technical Delivery Leader',
      text: 'Explore Raja Chatterjee\'s portfolio — 18+ years in delivery leadership, cloud architecture, and AI.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  return (
    <main className="app-root">
      <ScrollProgress />

      <header className="nav-header">
        <div className="shell nav-inner">
          <a className="brand" href="#top">
            RAJA<span>·</span>CHATTERJEE
          </a>

          <nav className="nav-links" aria-label="Main navigation">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={activeSection === section.id ? 'active' : ''}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="nav-controls">
            <button
              type="button"
              className="share-btn"
              onClick={() => setIsAnalyticsOpen(true)}
              title="View Portfolio Analytics"
              aria-label="View Portfolio Analytics"
            >
              📊 Analytics
            </button>
            <button
              type="button"
              className="share-btn"
              onClick={handleShare}
              title="Share profile"
              aria-label="Share profile"
            >
              ↗ Share
            </button>
            <button type="button" className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button type="button" className="cv-cta-btn" onClick={() => setIsCVModalOpen(true)}>
              <span aria-hidden="true">📄</span> Download CV
            </button>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileNavOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenCV={() => setIsCVModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <section className="hero shell" id="top">
        <div className="eyebrow">
          <span className="eyebrow-pulse" />
          <h4>Available for strategic collaborations &amp; open for new opportunities</h4>
        </div>

        <div className="hero-grid">
          <div className="hero-content">
            <p className="intro-tag">Technical Delivery Leader | Enterprise AI &amp; Digital Builder</p>
            <h1>
              Making complex<br />
              <em>work beautifully</em><br />
              clear.
            </h1>
            <p className="hero-description">
              I lead global teams through ambitious technology programs—combining 18+ years of delivery discipline, cloud architecture depth, and a practical curiosity for what&apos;s next.
            </p>

            <div className="hero-actions">
              <button type="button" className="btn-primary" onClick={() => setIsCVModalOpen(true)}>
                <span aria-hidden="true">📄</span> Download CV (PDF)
              </button>
              <a href="#work" className="btn-secondary">
                View Selected Work ↓
              </a>
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer" className="btn-secondary">
                Connect on LinkedIn <Arrow />
              </a>
            </div>
          </div>

          <aside className="portrait-card-v2">
            <div className="portrait-image-wrapper">
              <img src={profileImage} alt="Raja Chatterjee" loading="eager" className="portrait-img" />
            </div>            

            {/* Single Wrapper Admin / Readonly Status Button */}
            <div 
              className={`status-pill-btn ${isAdmin ? 'admin-mode' : 'readonly'}`}
              onClick={isAdmin ? cycleStatus : undefined}
              title={isAdmin ? "Admin Mode: Click to toggle status" : undefined}
              role={isAdmin ? "button" : undefined}
              tabIndex={isAdmin ? 0 : undefined}
            >
              <span className="status-dot-wrapper">
                <span className="status-dot" style={{ backgroundColor: currentStatus.color }} />
                {currentStatus.ping && (
                  <span className="status-pulse-ring" style={{ backgroundColor: currentStatus.color }} />
                )}
              </span>
              <span className="status-text">{currentStatus.label}</span>
              {isAdmin && <small className="status-toggle-hint">⚙️</small>}
            </div>
          </aside>
        </div>
      </section>

      <section className="ticker-bar" aria-label="Core Capabilities">
        <div className="ticker-track">
          <div className="ticker-item">PROGRAM DELIVERY <b>✦</b></div>
          <div className="ticker-item">PRODUCT THINKING <b>✦</b></div>
          <div className="ticker-item">AI-ENABLED WORKFLOWS <b>✦</b></div>
          <div className="ticker-item">GLOBAL TEAMS <b>✦</b></div>
          <div className="ticker-item">ENTERPRISE CLOUD ARCHITECTURE <b>✦</b></div>
          <div className="ticker-item">PROGRAM DELIVERY <b>✦</b></div>
          <div className="ticker-item">PRODUCT THINKING <b>✦</b></div>
          <div className="ticker-item">AI-ENABLED WORKFLOWS <b>✦</b></div>
          <div className="ticker-item">GLOBAL TEAMS <b>✦</b></div>
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

        <section className="articles-section">
          <br /><br />
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#b99110', fontWeight: 600 }}>Technical Articles Section </h2>
          <div className="articles-grid-fixed">
            <a 
              className="project-card article-card-custom" 
              href="https://medium.com/@i.gooner168/technical-deep-dive-resolving-branch-conflicts-ci-build-failures-in-vercel-for-multi-branch-13a20ab27fe8?sharedUserId=i.gooner168" 
              target="_blank" 
              rel="noreferrer"
            >
              <div className="project-type" style={{ color: '#10b981', fontWeight: 600 }}>
                03 / ARTICLE • DEVOPS
              </div>
              <div className="project-visual" style={{ color: '#2b24fb', borderColor: '#1f293d' }}>
                [ Vercel ➔ Git ➔ Deploy ]
              </div>
              <div className="project-footer" style={{ display: 'flex', justifyContent: 'center', items: 'center', gap: '8px', textAlign: 'center' }}>
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
              I&apos;m exploring thoughtful ways to make delivery teams sharper: clearer signals, less manual overhead, and more time for the decisions that need humans.
            </p>
            <div className="ai-links">
              <a className="btn-secondary" href="https://www.salesforce.com/trailblazer/rajachatterjee2024" target="_blank" rel="noreferrer">
                Explore my learning path into Salesforce <Arrow />
              </a>
              <a className="btn-secondary" href="#certifications">
                Explore my learning path into Oracle HCM &amp; OIC Enterprise AI <Arrow />
              </a>
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
                <p>Combines 18+ years of cloud delivery leadership with grounded RAG architectures and high-performance, modular UI pipelines.</p>
                <div className="metrics-row">
                  <span><strong>18+</strong> yrs leadership</span>
                  <span><strong>99.9%</strong> grounded confidence</span>
                  <span><strong>100</strong> Web Vitals score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell certifications reveal-section" id="certifications">
        <div className="section-kicker"><span>03</span> Verified learning</div>
        <div className="work-heading">
          <h2>Credentials that<br /><em>keep evolving.</em></h2>
          <p>Recent Oracle certifications that complement a foundation in enterprise delivery and cloud architecture.</p>
        </div>

        <div className="cert-grid">
          {certifications.map((cert) => (
            <article className="cert-card" key={cert.title}>
              <div className="cert-image">
                <img src={cert.image} alt={cert.title} loading="lazy" />
              </div>
              <span className="cert-year">{cert.year}</span>
              <h3>{cert.title}</h3>
              <p>{cert.detail}</p>
            </article>
          ))}
        </div>

        <div className="legacy-certs">
          <span>Also certified in:</span>
          <div className="legacy-list">
            <p><b>AZ-300</b> Azure Architect Technologies <em>2020</em></p>
            <p><b>ITIL</b> Foundation — Service Management <em>2015</em></p>
            <p><b>LOT-959</b> IBM WebSphere Portal 6.1 <em>2011</em></p>
          </div>
        </div>
      </section>

      <section className="shell experience reveal-section" id="experience">
        <div className="section-kicker"><span>04</span> The detail</div>
        <div className="cred-grid">
          <div>
            <h2>Experience that<br />travels well.</h2>
            <p className="experience-copy">
              18+ years across technical delivery, program management, and full-stack development. I help distributed teams create the conditions for excellent work.
            </p>
            <div className="tags-cloud">
              <span className="tag-pill">Salesforce</span>
              <span className="tag-pill">React / Node</span>
              <span className="tag-pill">Cloud &amp; CI/CD</span>
              <span className="tag-pill">Agile delivery</span>
              <span className="tag-pill">Guidewire</span>
              <span className="tag-pill">Azure</span>
            </div>
          </div>

          <div className="numbers-col">
            <div className="number-item">
              <strong>18+</strong>
              <small>years in technology</small>
            </div>
            <div className="number-item">
              <strong>360°</strong>
              <small>delivery ownership</small>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <Timeline />
        </div>
      </section>

      <footer id="contact" className="reveal-section">
        <div className="shell footer-inner">
          <div>
            <div className="section-kicker"><span>05</span> Start a conversation</div>
            <h2>Have an idea<br />worth <em>moving?</em></h2>
          </div>
          <div>
            <p className="footer-tagline">Let&apos;s make the complicated parts feel simple.</p>
            <a href="mailto:i.gooner168@gmail.com" className="email-link">
              Say hello <Arrow />
            </a>
            <div className="socials-row">
              <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com/InquisitiveAboutReact" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </div>

        <div className="shell footer-bottom">
          <div className="footer-meta">
            <span>© 2026 Raja Chatterjee, all rights reserved.</span>
            <span className="footer-tagline">
              Designed &amp; Maintained by Raja for clarity &amp; impact
            </span>
            <span className="footer-date">
              Last Updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </footer>

      <CVModal isOpen={isCVModalOpen} onClose={() => setIsCVModalOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <RAGChatbot />
      <SpeedInsights />
      <ScrollToTop />
    </main>
  );
}

export default App;