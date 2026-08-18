import React, { useEffect } from 'react';

const NAV_LINKS = [
  { href: '#work', label: 'Selected Work' },
  { href: '#about', label: 'Intelligence & AI' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

export default function MobileNav({ isOpen, onClose, onOpenCV, theme, onToggleTheme }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <nav
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-nav-header">
          <span className="mobile-nav-brand">RAJA<span>·</span>CHATTERJEE</span>
          <button className="mobile-nav-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <ul className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={handleNavClick}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mobile-nav-actions">
          <button className="theme-toggle-btn mobile-action-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button
            className="cv-cta-btn mobile-action-btn"
            onClick={() => { onOpenCV(); onClose(); }}
          >
            <span>📄</span> Download CV
          </button>
        </div>
      </nav>
    </>
  );
}
