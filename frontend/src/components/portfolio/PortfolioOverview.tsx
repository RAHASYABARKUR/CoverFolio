import React, { useState } from 'react';
import { Portfolio, PortfolioFormData } from '../../types/portfolio.types';
import portfolioService from '../../services/portfolio.service';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  onUpdate: () => void;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: portfolio?.title || '',
    bio: portfolio?.bio || '',
    location: portfolio?.location || '',
    website: portfolio?.website || '',
    github: portfolio?.github || '',
    linkedin: portfolio?.linkedin || '',
    twitter: portfolio?.twitter || '',
    is_public: portfolio?.is_public || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (portfolio) {
        await portfolioService.updatePortfolio(formData);
      } else {
        await portfolioService.createPortfolio(formData);
      }
      await onUpdate();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (portfolio) {
      setFormData({
        title: portfolio.title,
        bio: portfolio.bio,
        location: portfolio.location,
        website: portfolio.website,
        github: portfolio.github,
        linkedin: portfolio.linkedin,
        twitter: portfolio.twitter || '',
        is_public: portfolio.is_public,
      });
    }
    setIsEditing(true);
  };

  if (!portfolio && !isEditing) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📋</div>
        <h2 style={styles.emptyTitle}>Create Your Portfolio</h2>
        <p style={styles.emptyText}>
          Get started by creating your portfolio profile. Share your professional story with the
          world!
        </p>
        <button onClick={() => setIsEditing(true)} style={styles.createButton}>
          Create Portfolio
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h2 style={styles.sectionTitle}>
          {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
        </h2>

        {error && (
          <div style={styles.errorMessage}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Professional Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Full Stack Developer"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Bio <span style={styles.required}>*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              required
              rows={4}
              style={{ ...styles.input, ...styles.textarea }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Location <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>GitHub</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>LinkedIn</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Twitter</label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/username"
              style={styles.input}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                style={styles.checkbox}
              />
              <span>Make portfolio public</span>
            </label>
            <p style={styles.helpText}>
              Public portfolios can be viewed by anyone with the link
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Saving...' : portfolio ? 'Update Portfolio' : 'Create Portfolio'}
            </button>
            {portfolio && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // This should never be null here due to the checks above, but TypeScript doesn't know that
  if (!portfolio) {
    return null;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Portfolio Overview</h2>
        <button onClick={handleEdit} style={styles.editButton}>
          ✏️ Edit
        </button>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>{portfolio.user_name?.[0] || portfolio.user_email[0]}</div>
          <div>
            <h3 style={styles.profileName}>{portfolio.user_name || portfolio.user_email}</h3>
            <p style={styles.profileTitle}>{portfolio.title}</p>
          </div>
        </div>

        <div style={styles.bioSection}>
          <h4 style={styles.bioTitle}>About</h4>
          <p style={styles.bioText}>{portfolio.bio}</p>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📍</span>
            <span style={styles.infoText}>{portfolio.location}</span>
          </div>

          {portfolio.website && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🌐</span>
              <a href={portfolio.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Website
              </a>
            </div>
          )}

          {portfolio.github && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>💻</span>
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                GitHub
              </a>
            </div>
          )}

          {portfolio.linkedin && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>💼</span>
              <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" style={styles.link}>
                LinkedIn
              </a>
            </div>
          )}

          {portfolio.twitter && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🐦</span>
              <a href={portfolio.twitter} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Twitter
              </a>
            </div>
          )}
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.projects_count || 0}</div>
            <div style={styles.statLabel}>Projects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.skills_count || 0}</div>
            <div style={styles.statLabel}>Skills</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.experiences_count || 0}</div>
            <div style={styles.statLabel}>Experience</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.education_count || 0}</div>
            <div style={styles.statLabel}>Education</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  editButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '32px',
    maxWidth: '500px',
    margin: '0 auto 32px',
  },
  createButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  form: {
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxGroup: {
    marginBottom: '24px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  helpText: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '4px',
    marginLeft: '26px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  submitButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  profileCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 4px 0',
  },
  profileTitle: {
    fontSize: '16px',
    color: '#718096',
    margin: 0,
  },
  bioSection: {
    marginBottom: '24px',
  },
  bioTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  bioText: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.6',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    fontSize: '18px',
  },
  infoText: {
    fontSize: '14px',
    color: '#4a5568',
  },
  link: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  statCard: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
  },
};

export default PortfolioOverview;
