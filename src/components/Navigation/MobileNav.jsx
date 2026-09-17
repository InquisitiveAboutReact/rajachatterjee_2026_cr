// import React, { useEffect } from 'react';

// const NAV_LINKS = [
//   { href: '#work', label: 'Selected Work' },
//   { href: '#about', label: 'Intelligence & AI' },
//   { href: '#certifications', label: 'Certifications' },
//   { href: '#experience', label: 'Experience' },
//   { href: '#contact', label: 'Contact' },
//   { href: '#analytics', label: 'Analytics' },
// ];

// export default function MobileNav({ isOpen, onClose, onOpenCV, onOpenAnalytics, theme, onToggleTheme }) {
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; };
//   }, [isOpen]);

//   const handleNavClick = (e, href) => {
//     if (href === '#analytics') {
//       e.preventDefault();
//       onClose();
//       onOpenAnalytics();
//     } else {
//       onClose();
//     }
//   };

//   return (
//     <>
//       <div
//         className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
//         onClick={onClose}
//         aria-hidden={!isOpen}
//       />
//       <nav
//         className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
//         aria-label="Mobile navigation"
//         aria-hidden={!isOpen}
//       >
//         <div className="mobile-nav-header">
//           <span className="mobile-nav-brand">RAJA<span>·</span>CHATTERJEE</span>
//           <button className="mobile-nav-close" onClick={onClose} aria-label="Close menu">
//             ✕
//           </button>
//         </div>

//         <div className="mobile-nav-scrollable-content">
//           <ul className="mobile-nav-links">
//             {NAV_LINKS.map((link) => (
//               <li key={link.href}>
//                 <a 
//                   href={link.href} 
//                   onClick={(e) => handleNavClick(e, link.href)}
//                 >
//                   {link.label}
//                 </a>
//               </li>
//             ))}
//           </ul>

//           <div className="mobile-nav-actions">
//             <button className="theme-toggle-btn mobile-action-btn" onClick={onToggleTheme}>
//               {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
//             </button>
//             <button
//               className="cv-cta-btn mobile-action-btn"
//               onClick={() => { onOpenCV(); onClose(); }}
//             >
//               <span>📄</span> Download CV
//             </button>
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }

// Update -2 .. Fixing the visibility of Theme change + Download CV option in Mobile / tab device

import React, { useEffect } from 'react';

const NAV_LINKS = [
  { href: '#work', label: 'Selected Work' },
  { href: '#matcher', label: 'JD Matcher' },
  { href: '#about', label: 'Intelligence & AI' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
  { href: '#analytics-widget', label: 'Traffic Analytics' },
];

export default function MobileNav({ 
  isOpen, 
  onClose, 
  onOpenCV, 
  onOpenAnalytics, 
  theme, 
  onToggleTheme 
}) {
  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="mobile-nav-overlay open" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 99998,
        backdropFilter: 'blur(4px)',
        display: 'block'
      }}
    >
      <div 
        className="mobile-nav-drawer open" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '85%',
          maxWidth: '360px',
          height: '100%',
          background: '#0f172a',
          color: '#fff',
          zIndex: 99999,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
          overflowY: 'auto'
        }}
      >
        <div>
          {/* Header Branding & Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
  RAJA<span style={{ color: '#3b82f6' }}> </span>CHATTERJEE
  </span>
            <button 
              type="button" 
              onClick={onClose} 
              aria-label="Close menu"
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Mobile navigation" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {NAV_LINKS.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                onClick={onClose}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}
              >
                {link.label}
              </a>
            ))}
            <button 
              type="button" 
              onClick={() => { onClose(); onOpenAnalytics(); }}
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', textAlign: 'left', padding: 0, fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}
            >
              📊 Analytics Modal
            </button>
          </nav>
        </div>

        {/* Bottom Actions: Theme Toggle, CV Download, Socials & Last Updated */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button 
              type="button" 
              onClick={() => { onToggleTheme(); onClose(); }} 
              style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              type="button" 
              onClick={() => { onClose(); onOpenCV(); }} 
              style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#2563eb', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              📄 Download CV
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px', fontSize: '13px' }}>
            <a href="https://www.linkedin.com/in/rajachatterjee84/" target="_blank" rel="noreferrer" onClick={onClose} style={{ color: '#94a3b8', textDecoration: 'none' }}>LinkedIn ↗</a>
            <a href="https://github.com/InquisitiveAboutReact" target="_blank" rel="noreferrer" onClick={onClose} style={{ color: '#94a3b8', textDecoration: 'none' }}>GitHub ↗</a>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
            Last Updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

      </div>
    </div>
  );
}