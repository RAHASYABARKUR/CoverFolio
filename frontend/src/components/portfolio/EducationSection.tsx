import React from 'react';

interface EducationSectionProps {
  portfolioId?: number;
}

const EducationSection: React.FC<EducationSectionProps> = ({ portfolioId }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Education Section</h3>
      <p style={{ color: '#718096' }}>Coming soon! Add your educational background.</p>
    </div>
  );
};

export default EducationSection;
