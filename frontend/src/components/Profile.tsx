import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeService, { Resume } from '../services/resume.service';
import portfolioService from '../services/portfolio.service';
import { Portfolio } from '../types/portfolio.types';

const Profile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileResume, setProfileResume] = useState<Resume | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Fetch user's resumes
      const resumes = await resumeService.listResumes();
      
      // Get the most recent resume as profile resume
      if (resumes.length > 0) {
        const latestResume = resumes[resumes.length - 1];
        setProfileResume(latestResume);
        
        // Fetch portfolio data
        const portfolioData = await portfolioService.getPortfolio();
        setPortfolio(portfolioData);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload resume - backend will auto-populate portfolio
      const result = await resumeService.uploadResume(selectedFile);
      
      setProfileResume(result);
      setSelectedFile(null);
      setSuccessMessage('Resume uploaded successfully! Your profile has been updated.');
      
      // Reload portfolio data
      await loadProfileData();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to upload resume';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleViewPortfolioEditor = () => {
    if (profileResume) {
      navigate(`/dashboard/portfolio/preview/${profileResume.id}`);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={styles.subtitle}>
          Manage your professional information. Upload your resume once and use it across all features.
        </p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeError}>✕</button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successBanner}>
          <span style={styles.successIcon}>✓</span>
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} style={styles.closeSuccess}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      ) : (
        <div style={styles.content}>
          {/* Resume Upload Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <span style={styles.cardIcon}>📄</span>
                Resume Information
              </h2>
            </div>

            {profileResume ? (
              <div style={styles.resumeInfo}>
                <div style={styles.resumeStatus}>
                  <span style={styles.statusBadge}>✓ Resume Uploaded</span>
                  <span style={styles.uploadDate}>
                    Last updated: {new Date(profileResume.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div style={styles.resumeDetails}>
                  <p><strong>Title:</strong> {profileResume.title}</p>
                  {profileResume.structured_data && (
                    <div style={styles.parsedInfo}>
                      <p><strong>Parsed Data:</strong></p>
                      <ul style={styles.parsedList}>
                        {profileResume.structured_data.name && <li>Name: {profileResume.structured_data.name}</li>}
                        {profileResume.structured_data.email && <li>Email: {profileResume.structured_data.email}</li>}
                        {profileResume.structured_data.experience && (
                          <li>Experience: {profileResume.structured_data.experience.length} positions</li>
                        )}
                        {profileResume.structured_data.projects && (
                          <li>Projects: {profileResume.structured_data.projects.length} projects</li>
                        )}
                        {profileResume.structured_data.skills && (
                          <li>Skills: {profileResume.structured_data.skills.length} skills</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={styles.actionButtons}>
                  <button
                    onClick={handleViewPortfolioEditor}
                    style={styles.primaryButton}
                  >
                    View/Edit Profile Forms →
                  </button>
                </div>

                <div style={styles.uploadNewSection}>
                  <p style={styles.uploadNewText}>
                    Want to update your profile? Upload a new resume:
                  </p>
                  <input
                    type="file"
                    id="resume-reupload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                  />
                  <label htmlFor="resume-reupload" style={styles.fileLabel}>
                    {selectedFile ? (
                      <>
                        <span style={styles.fileIcon}>✓</span>
                        <span>{selectedFile.name}</span>
                      </>
                    ) : (
                      <>
                        <span style={styles.fileIcon}>📎</span>
                        <span>Choose New Resume</span>
                      </>
                    )}
                  </label>
                  
                  {selectedFile && (
                    <button
                      onClick={handleUploadResume}
                      disabled={uploading}
                      style={styles.uploadButton}
                    >
                      {uploading ? 'Uploading...' : 'Upload & Update Profile'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.noResume}>
                <div style={styles.uploadIcon}>📄</div>
                <h3 style={styles.noResumeTitle}>No Resume Uploaded</h3>
                <p style={styles.noResumeText}>
                  Upload your resume to set up your profile. This will auto-populate your portfolio information.
                </p>

                <div style={styles.uploadSection}>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                  />
                  <label htmlFor="resume-upload" style={styles.uploadLabelLarge}>
                    {selectedFile ? (
                      <>
                        <span style={styles.fileIconLarge}>✓</span>
                        <span>{selectedFile.name}</span>
                      </>
                    ) : (
                      <>
                        <span style={styles.fileIconLarge}>📎</span>
                        <span>Choose Resume File</span>
                      </>
                    )}
                  </label>
                  
                  {selectedFile && (
                    <button
                      onClick={handleUploadResume}
                      disabled={uploading}
                      style={styles.primaryButtonLarge}
                    >
                      {uploading ? 'Uploading & Parsing...' : 'Upload Resume'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Summary Section */}
          {portfolio && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>
                  <span style={styles.cardIcon}>💼</span>
                  Portfolio Summary
                </h2>
              </div>
              
              <div style={styles.portfolioSummary}>
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryValue}>{portfolio.projects_count || 0}</div>
                    <div style={styles.summaryLabel}>Projects</div>
                  </div>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryValue}>{portfolio.skills_count || 0}</div>
                    <div style={styles.summaryLabel}>Skills</div>
                  </div>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryValue}>{portfolio.experiences_count || 0}</div>
                    <div style={styles.summaryLabel}>Experience</div>
                  </div>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryValue}>{portfolio.education_count || 0}</div>
                    <div style={styles.summaryLabel}>Education</div>
                  </div>
                </div>

                <button
                  onClick={handleViewPortfolioEditor}
                  style={styles.secondaryButton}
                >
                  Edit Portfolio Details
                </button>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>💡</div>
            <div>
              <h3 style={styles.infoTitle}>How It Works</h3>
              <ul style={styles.infoList}>
                <li>Upload your resume once to set up your profile</li>
                <li>Your information will be automatically parsed and saved</li>
                <li>Edit any section manually from the Portfolio Forms page</li>
                <li>Use this profile data to quickly generate portfolios and cover letters</li>
                <li>Re-upload your resume anytime to refresh all your information</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    lineHeight: '1.6',
  },
  errorBanner: {
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#9b2c2c',
  },
  errorIcon: {
    fontSize: '20px',
  },
  closeError: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#9b2c2c',
  },
  successBanner: {
    backgroundColor: '#c6f6d5',
    border: '1px solid #68d391',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#22543d',
  },
  successIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  closeSuccess: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#22543d',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  cardHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  cardIcon: {
    fontSize: '28px',
  },
  resumeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  resumeStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  statusBadge: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  uploadDate: {
    fontSize: '14px',
    color: '#718096',
  },
  resumeDetails: {
    backgroundColor: '#f7fafc',
    padding: '20px',
    borderRadius: '12px',
  },
  parsedInfo: {
    marginTop: '12px',
  },
  parsedList: {
    marginTop: '8px',
    paddingLeft: '20px',
    color: '#4a5568',
    lineHeight: '1.8',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  primaryButton: {
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
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '16px',
  },
  uploadNewSection: {
    borderTop: '1px dashed #cbd5e0',
    paddingTop: '24px',
    marginTop: '8px',
  },
  uploadNewText: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '16px',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#edf2f7',
    border: '2px solid #cbd5e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
    transition: 'all 0.2s',
  },
  fileIcon: {
    fontSize: '18px',
  },
  uploadButton: {
    marginLeft: '12px',
    padding: '10px 20px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  noResume: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  uploadIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  noResumeTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  noResumeText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  uploadLabelLarge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    backgroundColor: '#edf2f7',
    border: '2px dashed #667eea',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#667eea',
    transition: 'all 0.2s',
  },
  fileIconLarge: {
    fontSize: '24px',
  },
  primaryButtonLarge: {
    padding: '14px 32px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  portfolioSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
  },
  summaryItem: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '4px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#718096',
  },
  infoCard: {
    backgroundColor: '#ebf4ff',
    border: '1px solid #bee3f8',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    gap: '16px',
  },
  infoIcon: {
    fontSize: '32px',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c5282',
    marginBottom: '8px',
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#2d3748',
    lineHeight: '1.8',
  },
};

export default Profile;
