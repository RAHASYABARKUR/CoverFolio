import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>CoverFolio</h1>
        <p style={styles.subtitle}>Smart Resume Parser & Portfolio Manager</p>
        <p style={styles.description}>
          Upload your resume, extract key information, and manage your professional portfolio with ease.
        </p>
        
        <div style={styles.buttonContainer}>
          <Link to="/register" style={styles.primaryButton}>
            Get Started
          </Link>
          <Link to="/login" style={styles.secondaryButton}>
            Sign In
          </Link>
        </div>
        
        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📄</div>
            <h3 style={styles.featureTitle}>Resume Parsing</h3>
            <p style={styles.featureDescription}>
              Upload PDF resumes and automatically extract key information
            </p>
          </div>
          
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🔐</div>
            <h3 style={styles.featureTitle}>Secure Storage</h3>
            <p style={styles.featureDescription}>
              Your data is protected with industry-standard security
            </p>
          </div>
          
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Portfolio Management</h3>
            <p style={styles.featureDescription}>
              Organize and manage multiple resumes and portfolios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    textAlign: 'center',
    maxWidth: '800px',
    color: 'white',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '24px',
    opacity: 0.9,
  },
  description: {
    fontSize: '1.1rem',
    marginBottom: '40px',
    opacity: 0.8,
    lineHeight: '1.6',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '60px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: 'white',
    color: '#667eea',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '600',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '600',
    border: '2px solid white',
    transition: 'background-color 0.2s',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    marginTop: '40px',
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '32px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '12px',
  },
  featureDescription: {
    fontSize: '0.95rem',
    opacity: 0.8,
    lineHeight: '1.5',
  },
};

export default Home;
