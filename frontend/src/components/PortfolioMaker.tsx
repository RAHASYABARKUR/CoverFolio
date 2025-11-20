import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeService, { Resume } from '../services/resume.service';


const PortfolioMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileResume, setProfileResume] = useState<Resume | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileResume();
  }, []);

  const loadProfileResume = async () => {
    setLoading(true);
    try {
      // Fetch user's resumes
      const resumes = await resumeService.listResumes();
      
      if (resumes.length > 0) {
        // Get the most recent resume as profile resume
        const latestResume = resumes[resumes.length - 1];
        setProfileResume(latestResume);
      }
    } catch (err: any) {
      console.error('Error loading profile resume:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToForms = () => {
    if (profileResume) {
      // Navigate to portfolio editor with the profile resume
      navigate(`/dashboard/portfolio/preview/${profileResume.id}`);
    }
  };

  const handleGoToProfile = () => {
    navigate('/dashboard/profile');
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <h1 style={styles.title}>Portfolio Maker</h1>
      <p style={styles.subtitle}>Create your professional portfolio website</p>

      {loading ? (
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your profile...</p>
        </div>
      ) : error ? (
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Error Loading Profile</h3>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadProfileResume} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : profileResume ? (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h3 style={styles.successTitle}>Profile Loaded Successfully!</h3>
          <p style={styles.successText}>
            Your resume data is ready. Review and customize your portfolio information before choosing a template.
          </p>

          <div style={styles.profileSummary}>
            <h4 style={styles.summaryTitle}>Profile Overview:</h4>
            <div style={styles.summaryContent}>
              {profileResume.structured_data?.name && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Name:</span>
                  <span style={styles.summaryValue}>{profileResume.structured_data.name}</span>
                </div>
              )}
              {profileResume.structured_data?.email && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Email:</span>
                  <span style={styles.summaryValue}>{profileResume.structured_data.email}</span>
                </div>
              )}
              {profileResume.structured_data?.experience && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Experience:</span>
                  <span style={styles.summaryValue}>{profileResume.structured_data.experience.length} positions</span>
                </div>
              )}
              {profileResume.structured_data?.projects && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Projects:</span>
                  <span style={styles.summaryValue}>{profileResume.structured_data.projects.length} projects</span>
                </div>
              )}
              {profileResume.structured_data?.skills && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Skills:</span>
                  <span style={styles.summaryValue}>{profileResume.structured_data.skills.length} skills</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleContinueToForms} 
            style={styles.primaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Continue to Portfolio Forms →
          </button>

          <div style={styles.infoBox}>
            <div style={styles.infoIcon}>💡</div>
            <div style={styles.infoContent}>
              <p style={styles.infoText}>
                <strong>What's Next:</strong> Review and edit your portfolio information in the forms page. 
                You can make any last-minute changes before choosing a template and generating your portfolio website.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noProfileCard}>
          <div style={styles.noProfileIcon}>📝</div>
          <h3 style={styles.noProfileTitle}>No Profile Found</h3>
          <p style={styles.noProfileText}>
            You need to set up your profile before creating a portfolio. 
            Upload your resume in the Profile section to get started.
          </p>
          
          <button 
            onClick={handleGoToProfile} 
            style={styles.setupButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Go to Profile Setup →
          </button>

          <div style={styles.stepsContainer}>
            <h4 style={styles.stepsTitle}>Quick Setup Steps:</h4>
            <ol style={styles.stepsList}>
              <li style={styles.stepItem}>Go to Profile section</li>
              <li style={styles.stepItem}>Upload your resume (PDF, DOC, or DOCX)</li>
              <li style={styles.stepItem}>Your data will be automatically parsed</li>
              <li style={styles.stepItem}>Return here to create your portfolio</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  backButton: {
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    transition: 'all 0.2s',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '12px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: '48px',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    margin: '0 auto 20px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#718096',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#e53e3e',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  successIcon: {
    fontSize: '64px',
    color: '#48bb78',
    textAlign: 'center',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  profileSummary: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '16px',
    marginTop: 0,
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  summaryValue: {
    fontSize: '14px',
    color: '#2d3748',
  },
  primaryButton: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    marginBottom: '24px',
  },
  infoBox: {
    display: 'flex',
    gap: '16px',
    backgroundColor: '#ebf4ff',
    border: '1px solid #bee3f8',
    borderRadius: '12px',
    padding: '20px',
  },
  infoIcon: {
    fontSize: '24px',
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: '14px',
    color: '#2d3748',
    lineHeight: '1.6',
    margin: 0,
  },
  noProfileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  noProfileIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  noProfileTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  noProfileText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  setupButton: {
    padding: '14px 32px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    marginBottom: '32px',
  },
  stepsContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'left',
  },
  stepsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 0,
    marginBottom: '12px',
  },
  stepsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4a5568',
  },
  stepItem: {
    marginBottom: '8px',
    lineHeight: '1.6',
  },
};


export default PortfolioMaker;





