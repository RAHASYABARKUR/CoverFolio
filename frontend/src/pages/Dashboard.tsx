import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorPopup from '../components/ErrorPopup';

interface Resume {
  id: number;
  title: string;
  file_path: string;
  extracted_text: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/resume/list/');
      setResumes(response.data.resumes);
    } catch (err: any) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      const response = await api.post('/api/resume/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResumes(prev => [response.data.resume, ...prev]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await api.delete(`/api/resume/${resumeId}/delete/`);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
    } catch (err: any) {
      setError('Failed to delete resume');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      {error && <ErrorPopup message={error} onClose={() => setError('')} />}
      
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>CoverFolio Dashboard</h1>
          <div style={styles.userInfo}>
            <span style={styles.welcomeText}>
              Welcome, {user?.first_name || user?.email}!
            </span>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.uploadSection}>
          <h2 style={styles.sectionTitle}>Upload Resume</h2>
          <div style={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              style={styles.fileInput}
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                ...styles.uploadButton,
                ...(uploading ? styles.buttonDisabled : {}),
              }}
            >
              {uploading ? 'Uploading...' : 'Choose PDF File'}
            </button>
            <p style={styles.uploadHint}>Select a PDF resume to upload and parse</p>
          </div>
        </div>

        <div style={styles.resumesSection}>
          <h2 style={styles.sectionTitle}>Your Resumes</h2>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📄</div>
              <h3>No resumes uploaded yet</h3>
              <p>Upload your first resume to get started!</p>
            </div>
          ) : (
            <div style={styles.resumesGrid}>
              {resumes.map((resume) => (
                <div key={resume.id} style={styles.resumeCard}>
                  <div style={styles.resumeHeader}>
                    <h3 style={styles.resumeTitle}>{resume.title}</h3>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      style={styles.deleteButton}
                      title="Delete resume"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={styles.resumeMeta}>
                    <span style={styles.date}>Uploaded: {formatDate(resume.created_at)}</span>
                  </div>
                  
                  <div style={styles.resumeContent}>
                    <h4 style={styles.contentTitle}>Extracted Text:</h4>
                    <div style={styles.textPreview}>
                      {resume.extracted_text.substring(0, 200)}
                      {resume.extracted_text.length > 200 && '...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '20px 0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  welcomeText: {
    color: '#4a5568',
    fontSize: '16px',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  uploadSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
  },
  uploadArea: {
    textAlign: 'center',
    padding: '40px',
    border: '2px dashed #cbd5e0',
    borderRadius: '8px',
    backgroundColor: '#f7fafc',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '12px',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    cursor: 'not-allowed',
  },
  uploadHint: {
    color: '#718096',
    fontSize: '14px',
    margin: 0,
  },
  resumesSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
  },
  resumesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  resumeCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f7fafc',
  },
  resumeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  resumeTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  resumeMeta: {
    marginBottom: '16px',
  },
  date: {
    fontSize: '12px',
    color: '#718096',
  },
  resumeContent: {
    marginTop: '16px',
  },
  contentTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  textPreview: {
    fontSize: '12px',
    color: '#4a5568',
    lineHeight: '1.5',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
};

export default Dashboard;
