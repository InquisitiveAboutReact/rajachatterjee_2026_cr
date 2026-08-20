import React from 'react';
import './Timeline.css';

const milestones = [
  {
    company: 'Tata Consultancy Services',
    project: 'Global Retail Customer',
    role: '',
    period: 'Jul 2025 – Present',
    description: 'Leading technical delivery and architecture for core retail platforms.'
  },
  {
    company: 'Tata Consultancy Services',
    project: 'MAANG Company (Payments Domain)',
    role: 'Technical Project Lead',
    period: 'Feb 2023 – Jun 2025',
    description: 'Managed large-scale delivery, engineering teams, and high-throughput payment domain workflows.'
  },
  {
    company: 'Tata Consultancy Services',
    project: 'US-Based Retail Company',
    role: 'Manager – Projects',
    period: 'Apr 2021 – Feb 2023',
    description: 'Oversaw project execution, client stakeholder management, and program delivery.'
  },
  {
    company: 'Cognizant Technology Solutions',
    project: 'Australian Insurance Company & UK-Based Education Organization',
    role: 'Technical Scrum Master & Manager Projects',
    period: 'Jan 2019 – Apr 2021',
    description: 'Led UI architecture, client interaction, and frontend delivery strategy.'
  },
  {
    company: 'IBM India Pvt Ltd',
    project: '',
    role: '',
    period: 'May 2010 – May 2018',
    description: 'Delivered enterprise solutions, full-stack applications, and technical leadership across engagement teams.'
  },
  {
    company: 'Intelligroup, Sanguine IT Solutions, Hinnovation Research Center',
    project: '',
    role: 'Earlier Career — Software Engineer / Developer / Programmer',
    period: '2008 – 2010',
    description: 'Hands-on core software development, web engineering, and system programming.'
  }
];

export default function Timeline() {
  return (
    <div className="career-section">
      {/* Centered Blue Gradient Heading */}
      <h2 style={{ 
        fontSize: '2.2rem', 
        fontWeight: 800, 
        marginBottom: '36px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'block'
      }}>
        Career Hierarchy
      </h2>

      <div className="timeline">
        {milestones.map((item, index) => (
          <div 
            className="timeline-item" 
            key={index}
            data-umami-event="Milestone View"
            data-umami-event-company={item.company}
          >
            <div className="timeline-dot" aria-hidden="true"></div>
            <div className="timeline-content">
              <span className="timeline-date">{item.period}</span>
              <h3 className="timeline-company">
                {item.company}
                {item.project && (
                  <span className="timeline-project" style={{ fontWeight: 700, color: '#4338ca' }}>
                    {' '}— {item.project}
                  </span>
                )}
              </h3>
              {item.role && <p className="timeline-role">{item.role}</p>}
              <p className="timeline-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}