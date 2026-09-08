// import React, { useState, useEffect } from 'react';
// import './AnalyticsModal.css';

// export default function Analytics({ isOpen, onClose }) {
//   // Date Range State (Defaults to static range)
//   const [startDate, setStartDate] = useState('2026-05-12');
//   const [endDate, setEndDate] = useState('2026-05-18');

//   // Prevent background body scrolling when modal is open on mobile
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   // Static Metrics Data
//   const staticData = {
//     totalVisitors: '1,248',
//     avgScrollDepth: '72%',
//     timelineEngagement: '68%',
//     projectsEngagement: '75%',
//     cvDownloads: 54,
//     copilotQueries: 37,
//     hireRequests: 18,
//     topQuery: '“Tell me about Raja\'s experience in Oracle Retail projects”',
//     referrals: [
//       { source: 'LinkedIn Post', percent: '42%', count: 524, color: '#3b82f6' },
//       { source: 'GitHub Profile', percent: '28%', count: 349, color: '#10b981' },
//       { source: 'Direct / Bookmark', percent: '16%', count: 200, color: '#a855f7' },
//       { source: 'WhatsApp / Personal Share', percent: '8%', count: 100, color: '#f97316' },
//       { source: 'Other Websites', percent: '6%', count: 75, color: '#eab308' }
//     ],
//     chartData: [
//       { date: 'May 12', height: '40%' },
//       { date: 'May 13', height: '60%' },
//       { date: 'May 14', height: '75%' },
//       { date: 'May 15', height: '55%' },
//       { date: 'May 16', height: '70%' },
//       { date: 'May 17', height: '85%' },
//       { date: 'May 18', height: '100%', active: true, label: '1,248 Visitors' }
//     ]
//   };

//   const handlePickerClick = (e) => {
//     if (e.target.showPicker) {
//       e.target.showPicker();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div 
//       className="analytics-modal-overlay" 
//       onClick={onClose} 
//       role="dialog" 
//       aria-modal="true"
//     >
//       <div 
//         className="analytics-modal-container" 
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Header */}
//         <div className="analytics-modal-header">
//           <div className="header-title-group">
//             <div className="dashboard-icon">📈</div>
//             <div>
//               <h2>
//                 Portfolio Traffic Dashboard{' '}
//                 <span className="wip-tag">( Work in progress, used static data )</span>
//               </h2>
//               <p className="subtitle">Understand visitor interest, recruiter interactions & traffic sources</p>
//             </div>
//           </div>

//           <div className="header-controls">
//             {/* Native Date Range Selector with Gold Calendar SVG */}
//             <div className="date-picker-wrapper">
//               <svg 
//                 className="calendar-icon-svg" 
//                 width="20" 
//                 height="20" 
//                 viewBox="0 0 24 24" 
//                 fill="none" 
//                 stroke="#facc15" 
//                 strokeWidth="2" 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round"
//               >
//                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                 <line x1="16" y1="2" x2="16" y2="6"></line>
//                 <line x1="8" y1="2" x2="8" y2="6"></line>
//                 <line x1="3" y1="10" x2="21" y2="10"></line>
//               </svg>

//               <input
//                 type="date"
//                 className="custom-date-input"
//                 value={startDate}
//                 onClick={handlePickerClick}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//               <span className="date-sep">–</span>
//               <input
//                 type="date"
//                 className="custom-date-input"
//                 value={endDate}
//                 onClick={handlePickerClick}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>

//             <button onClick={onClose} className="close-btn" aria-label="Close modal">
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* Dashboard Content Grid */}
//         <div className="analytics-modal-body">
//           {/* Top Row: Metric Boxes */}
//           <div className="top-metrics-row">
//             {/* 1. Gold / Yellow Metrics */}
//             <div className="metric-box gold-box">
//               <div className="box-header">
//                 <h3>⭐ 1. GOLD / YELLOW METRICS</h3>
//                 <span>Track high-level interest & engagement depth</span>
//               </div>
//               <div className="sub-grid">
//                 <div className="stat-card">
//                   <p className="stat-label">👥 Total Visitors</p>
//                   <p className="stat-value gold-text">{staticData.totalVisitors}</p>
//                   <p className="stat-trend">↑ 18.6% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">🎯 Avg. Scroll Depth</p>
//                   <p className="stat-value gold-text">{staticData.avgScrollDepth}</p>
//                   <p className="stat-trend">↑ 11.3% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">⏱ Timeline Section Engagement</p>
//                   <p className="stat-value gold-text">{staticData.timelineEngagement}</p>
//                   <p className="stat-trend">↑ 15.7% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">🎯 Projects Section Engagement</p>
//                   <p className="stat-value gold-text">{staticData.projectsEngagement}</p>
//                   <p className="stat-trend">↑ 15.7% vs last 7 days</p>
//                 </div>
//               </div>
//             </div>

//             {/* 2. Purple Interaction Badges */}
//             <div className="metric-box purple-box">
//               <div className="box-header">
//                 <h3>👥 2. PURPLE INTERACTION BADGES</h3>
//                 <span>Show direct recruiter actions on your portfolio</span>
//               </div>
//               <div className="sub-grid three-cols">
//                 <div className="stat-card">
//                   <p className="stat-label">📄 CV / Resume Downloads</p>
//                   <p className="stat-value purple-text">{staticData.cvDownloads}</p>
//                   <p className="stat-trend">↑ 28.6% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">💬 RAG Copilot Queries</p>
//                   <p className="stat-value purple-text">{staticData.copilotQueries}</p>
//                   <p className="stat-trend">↑ 32.1% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">👤 Contact / Hire Requests</p>
//                   <p className="stat-value purple-text">{staticData.hireRequests}</p>
//                   <p className="stat-trend">↑ 20.0% vs last 7 days</p>
//                 </div>
//               </div>
//               <div className="top-query-banner">
//                 <span className="query-label">✦ Top Copilot Query:</span>
//                 <span className="query-text">{staticData.topQuery}</span>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Row: Referral Breakdown & Chart */}
//           <div className="referral-box">
//             <div className="referral-header">
//               <div className="box-header">
//                 <h3>🌿 3. REFERRAL BREAKDOWN</h3>
//                 <span>See where your portfolio traffic is coming from</span>
//               </div>
//               <div className="time-filters">
//                 <button className="filter-btn active">7D</button>
//                 <button className="filter-btn">30D</button>
//                 <button className="filter-btn">90D</button>
//               </div>
//             </div>

//             <div className="referral-grid">
//               {/* Traffic Sources List */}
//               <div className="sources-column">
//                 <h4>Top Traffic Sources</h4>
//                 <div className="sources-list">
//                   {staticData.referrals.map((item, idx) => (
//                     <div className="source-row" key={idx}>
//                       <span className="dot" style={{ backgroundColor: item.color }}></span>
//                       <span className="source-name">{item.source}</span>
//                       <span className="source-pct">{item.percent}</span>
//                       <span className="source-cnt">{item.count}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Bar Chart Visualization */}
//               <div className="chart-column">
//                 <h4>Traffic Over Time</h4>
//                 <div className="bar-chart-container">
//                   {staticData.chartData.map((bar, idx) => (
//                     <div className="bar-group" key={idx}>
//                       {bar.label && <div className="bar-tooltip">{bar.label}</div>}
//                       <div 
//                         className={`bar-fill ${bar.active ? 'active' : ''}`} 
//                         style={{ height: bar.height }}
//                       ></div>
//                       <span className="bar-date">{bar.date}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


// Updated Code as I've integrated Dynamic Values fetching directly from Vercel 

// import React, { useState, useEffect } from 'react';
// import './AnalyticsModal.css';

// export default function AnalyticsModal({ isOpen, onClose }) {
//   // Date Range State
//   const [startDate, setStartDate] = useState('2026-05-12');
//   const [endDate, setEndDate] = useState('2026-05-18');

//   // Dynamic Metrics State
//   const [metrics, setMetrics] = useState({
//     totalVisitors: '1,248',
//     avgScrollDepth: '72%',
//     timelineEngagement: '68%',
//     projectsEngagement: '75%',
//     cvDownloads: 54,
//     copilotQueries: 37,
//     hireRequests: 18,
//     loading: true
//   });

//   // Prevent background body scrolling when modal is open on mobile
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   // Fetch Live Data from Vercel API Route
//   useEffect(() => {
//     if (!isOpen) return;

//     async function fetchLiveAnalytics() {
//       try {
//         const response = await fetch('/api/analytics');
//         const data = await response.json();
        
//         setMetrics({
//           totalVisitors: data.totalVisitors || '1,248',
//           avgScrollDepth: data.avgScrollDepth || '72%',
//           timelineEngagement: data.timelineEngagement || '68%',
//           projectsEngagement: data.projectEngagement || '75%',
//           cvDownloads: data.cvDownloads || 54,
//           copilotQueries: data.ragQueries || data.copilotQueries || 37,
//           hireRequests: data.contactRequests || data.hireRequests || 18,
//           loading: false
//         });
//       } catch (err) {
//         console.error('Failed to load analytics payload:', err);
//         setMetrics(prev => ({ ...prev, loading: false }));
//       }
//     }

//     fetchLiveAnalytics();
//   }, [isOpen]);

//   const staticData = {
//     topQuery: '“Tell me about Raja\'s experience in Oracle Retail projects”',
//     referrals: [
//       { source: 'LinkedIn Post', percent: '42%', count: 524, color: '#3b82f6' },
//       { source: 'GitHub Profile', percent: '28%', count: 349, color: '#10b981' },
//       { source: 'Direct / Bookmark', percent: '16%', count: 200, color: '#a855f7' },
//       { source: 'WhatsApp / Personal Share', percent: '8%', count: 100, color: '#f97316' },
//       { source: 'Other Websites', percent: '6%', count: 75, color: '#eab308' }
//     ],
//     chartData: [
//       { date: 'May 12', height: '40%' },
//       { date: 'May 13', height: '60%' },
//       { date: 'May 14', height: '75%' },
//       { date: 'May 15', height: '55%' },
//       { date: 'May 16', height: '70%' },
//       { date: 'May 17', height: '85%' },
//       { date: 'May 18', height: '100%', active: true, label: '1,248 Visitors' }
//     ]
//   };

//   const handlePickerClick = (e) => {
//     if (e.target.showPicker) {
//       e.target.showPicker();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div 
//       className="analytics-modal-overlay" 
//       onClick={onClose} 
//       role="dialog" 
//       aria-modal="true"
//     >
//       <div 
//         className="analytics-modal-container" 
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Header */}
//         <div className="analytics-modal-header">
//           <div className="header-title-group">
//             <div className="dashboard-icon">📈</div>
//             <div>
//               <h2>
//                 Portfolio Traffic Dashboard{' '}
//                 <span className="wip-tag">
//                   {metrics.loading ? ' (Syncing...) ' : ' (Vercel Live Data) '}
//                 </span>
//               </h2>
//               <p className="subtitle">Understand visitor interest, recruiter interactions & traffic sources</p>
//             </div>
//           </div>

//           <div className="header-controls">
//             {/* Native Date Range Selector with Gold Calendar SVG */}
//             <div className="date-picker-wrapper">
//               <svg 
//                 className="calendar-icon-svg" 
//                 width="20" 
//                 height="20" 
//                 viewBox="0 0 24 24" 
//                 fill="none" 
//                 stroke="#facc15" 
//                 strokeWidth="2" 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round"
//               >
//                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                 <line x1="16" y1="2" x2="16" y2="6"></line>
//                 <line x1="8" y1="2" x2="8" y2="6"></line>
//                 <line x1="3" y1="10" x2="21" y2="10"></line>
//               </svg>

//               <input
//                 type="date"
//                 className="custom-date-input"
//                 value={startDate}
//                 onClick={handlePickerClick}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//               <span className="date-sep">–</span>
//               <input
//                 type="date"
//                 className="custom-date-input"
//                 value={endDate}
//                 onClick={handlePickerClick}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>

//             <button onClick={onClose} className="close-btn" aria-label="Close modal">
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* Dashboard Content Grid */}
//         <div className="analytics-modal-body">
//           {/* Top Row: Metric Boxes */}
//           <div className="top-metrics-row">
//             {/* 1. Gold / Yellow Metrics */}
//             <div className="metric-box gold-box">
//               <div className="box-header">
//                 <h3>⭐ 1. GOLD / YELLOW METRICS</h3>
//                 <span>Track high-level interest & engagement depth</span>
//               </div>
//               <div className="sub-grid">
//                 <div className="stat-card">
//                   <p className="stat-label">👥 Total Visitors</p>
//                   <p className="stat-value gold-text">{metrics.totalVisitors}</p>
//                   <p className="stat-trend">↑ 18.6% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">🎯 Avg. Scroll Depth</p>
//                   <p className="stat-value gold-text">{metrics.avgScrollDepth}</p>
//                   <p className="stat-trend">↑ 11.3% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">⏱ Timeline Section Engagement</p>
//                   <p className="stat-value gold-text">{metrics.timelineEngagement}</p>
//                   <p className="stat-trend">↑ 15.7% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">🎯 Projects Section Engagement</p>
//                   <p className="stat-value gold-text">{metrics.projectsEngagement}</p>
//                   <p className="stat-trend">↑ 15.7% vs last 7 days</p>
//                 </div>
//               </div>
//             </div>

//             {/* 2. Purple Interaction Badges */}
//             <div className="metric-box purple-box">
//               <div className="box-header">
//                 <h3>👥 2. PURPLE INTERACTION BADGES</h3>
//                 <span>Show direct recruiter actions on your portfolio</span>
//               </div>
//               <div className="sub-grid three-cols">
//                 <div className="stat-card">
//                   <p className="stat-label">📄 CV / Resume Downloads</p>
//                   <p className="stat-value purple-text">{metrics.cvDownloads}</p>
//                   <p className="stat-trend">↑ 28.6% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">💬 RAG Copilot Queries</p>
//                   <p className="stat-value purple-text">{metrics.copilotQueries}</p>
//                   <p className="stat-trend">↑ 32.1% vs last 7 days</p>
//                 </div>
//                 <div className="stat-card">
//                   <p className="stat-label">👤 Contact / Hire Requests</p>
//                   <p className="stat-value purple-text">{metrics.hireRequests}</p>
//                   <p className="stat-trend">↑ 20.0% vs last 7 days</p>
//                 </div>
//               </div>
//               <div className="top-query-banner">
//                 <span className="query-label">✦ Top Copilot Query:</span>
//                 <span className="query-text">{staticData.topQuery}</span>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Row: Referral Breakdown & Chart */}
//           <div className="referral-box">
//             <div className="referral-header">
//               <div className="box-header">
//                 <h3>🌿 3. REFERRAL BREAKDOWN</h3>
//                 <span>See where your portfolio traffic is coming from</span>
//               </div>
//               <div className="time-filters">
//                 <button className="filter-btn active">7D</button>
//                 <button className="filter-btn">30D</button>
//                 <button className="filter-btn">90D</button>
//               </div>
//             </div>

//             <div className="referral-grid">
//               {/* Traffic Sources List */}
//               <div className="sources-column">
//                 <h4>Top Traffic Sources</h4>
//                 <div className="sources-list">
//                   {staticData.referrals.map((item, idx) => (
//                     <div className="source-row" key={idx}>
//                       <span className="dot" style={{ backgroundColor: item.color }}></span>
//                       <span className="source-name">{item.source}</span>
//                       <span className="source-pct">{item.percent}</span>
//                       <span className="source-cnt">{item.count}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Bar Chart Visualization */}
//               <div className="chart-column">
//                 <h4>Traffic Over Time</h4>
//                 <div className="bar-chart-container">
//                   {staticData.chartData.map((bar, idx) => (
//                     <div className="bar-group" key={idx}>
//                       {bar.label && <div className="bar-tooltip">{bar.label}</div>}
//                       <div 
//                         className={`bar-fill ${bar.active ? 'active' : ''}`} 
//                         style={{ height: bar.height }}
//                       ></div>
//                       <span className="bar-date">{bar.date}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


// Update -3 

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, FileText, MessageSquare, Send } from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose }) {
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    cvDownloads: 0,
    copilotQueries: 0,
    hireRequests: 0,
  });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics');
        const result = await response.json();

        if (result.success && result.data) {
          setAnalytics(result.data);
          setIsLive(true);
        }
      } catch (error) {
        console.error('Failed to load live analytics:', error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight">Portfolio Traffic Dashboard</h2>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isLive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
            }`}>
              {isLive ? 'Vercel Live Data' : 'Work in progress (Fallback Data)'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          
          {/* Total Visitors */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Total Visitors</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {loading ? '...' : analytics.totalVisitors.toLocaleString()}
            </div>
          </div>

          {/* CV Downloads */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>CV / Resume Downloads</span>
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {loading ? '...' : analytics.cvDownloads.toLocaleString()}
            </div>
          </div>

          {/* Hire Requests */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Send className="w-4 h-4 text-purple-400" />
              <span>Contact / Hire Requests</span>
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {loading ? '...' : analytics.hireRequests.toLocaleString()}
            </div>
          </div>

        </div>

        {/* Copilot Queries */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-slate-300">Total Copilot RAG Queries Handled</span>
          </div>
          <span className="text-xl font-bold text-purple-300">
            {loading ? '...' : analytics.copilotQueries.toLocaleString()}
          </span>
        </div>

      </div>
    </div>
  );
}