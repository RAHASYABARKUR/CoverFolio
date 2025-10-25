import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import portfolioService from '../services/portfolio.service';
import { Portfolio as PortfolioType } from '../types/portfolio.types';
import PortfolioOverview from '../components/portfolio/PortfolioOverview';
import ProjectsSection from '../components/portfolio/ProjectsSection';
import SkillsSection from '../components/portfolio/SkillsSection';
import ExperienceSection from '../components/portfolio/ExperienceSection';
import EducationSection from '../components/portfolio/EducationSection';

type TabType = 'overview' | 'projects' | 'skills' | 'experience' | 'education';

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      // If portfolio doesn't exist (404), that's okay - user needs to create one
      if (err.response?.status === 404) {
        setPortfolio(null);
      } else {
        setError(err.response?.data?.error || 'Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'projects', label: 'Projects', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'experience', label: 'Experience', icon: '🏢' },
    { id: 'education', label: 'Education', icon: '🎓' },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Portfolio</h1>
          <p style={styles.subtitle}>
            {user?.first_name || user?.email} • {portfolio?.is_public ? '🌍 Public' : '🔒 Private'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {}),
            }}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'overview' && (
          <PortfolioOverview portfolio={portfolio} onUpdate={loadPortfolio} />
        )}
        {activeTab === 'projects' && <ProjectsSection portfolioId={portfolio?.id} />}
        {activeTab === 'skills' && <SkillsSection />}
        {activeTab === 'experience' && <ExperienceSection />}
        {activeTab === 'education' && <EducationSection />}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '24px',
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: 0,
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '24px',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#718096',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    color: '#667eea',
    borderBottomColor: '#667eea',
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: '20px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#718096',
  },
  errorBanner: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#c53030',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Portfolio;
