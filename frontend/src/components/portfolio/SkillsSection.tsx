import React from 'react';

interface SkillsSectionProps {
  portfolioId?: number;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ portfolioId }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Skills Section</h3>
      <p style={{ color: '#718096' }}>Coming soon! Add your technical and soft skills.</p>
    </div>
  );
};

export default SkillsSection;
