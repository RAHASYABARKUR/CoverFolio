import React from 'react';

interface ExperienceSectionProps {
  portfolioId?: number;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ portfolioId }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Experience Section</h3>
      <p style={{ color: '#718096' }}>Coming soon! Add your work experience and achievements.</p>
    </div>
  );
};

export default ExperienceSection;
