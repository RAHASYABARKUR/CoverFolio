import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Experience, ExperienceFormData } from '../../types/portfolio.types';

const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    employment_type: 'full_time',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    technologies: [],
    company_url: '',
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const data = await portfolioService.getExperiences();
      setExperiences(data || []);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      // Remove end_date if it's empty or if is_current is true
      end_date: formData.is_current || !formData.end_date ? undefined : formData.end_date,
    };
    
    console.log('Submitting experience:', { editingExp, submissionData });
    
    try {
      if (editingExp) {
        console.log('Updating experience ID:', editingExp.id);
        const result = await portfolioService.updateExperience(editingExp.id, submissionData);
        console.log('Update result:', result);
      } else {
        console.log('Creating new experience');
        const result = await portfolioService.createExperience(submissionData);
        console.log('Create result:', result);
      }
      resetForm();
      await fetchExperiences();
      alert(editingExp ? 'Experience updated successfully!' : 'Experience added successfully!');
    } catch (err: any) {
      console.error('Failed to save experience:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message || 'Failed to save experience';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await portfolioService.deleteExperience(id);
        fetchExperiences();
      } catch (error) {
        console.error('Failed to delete experience:', error);
      }
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingExp(exp);
    
    // Format dates to YYYY-MM-DD for date inputs
    const formatDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Otherwise parse and format
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      company: exp.company,
      position: exp.position,
      employment_type: exp.employment_type,
      location: exp.location,
      start_date: formatDate(exp.start_date),
      end_date: formatDate(exp.end_date),
      is_current: exp.is_current,
      description: exp.description,
      technologies: exp.technologies || [],
      company_url: exp.company_url || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      employment_type: 'full_time',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      technologies: [],
      company_url: '',
    });
    setEditingExp(null);
    setShowForm(false);
  };

  const employmentTypeColors: Record<string, React.CSSProperties> = {
    full_time: { backgroundColor: '#dbeafe', color: '#1e40af' },
    part_time: { backgroundColor: '#fef3c7', color: '#92400e' },
    contract: { backgroundColor: '#e0e7ff', color: '#3730a3' },
    freelance: { backgroundColor: '#fce7f3', color: '#831843' },
    internship: { backgroundColor: '#d1fae5', color: '#065f46' },
  };

  if (loading) {
    return <div style={styles.loading}>Loading experiences...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.sectionTitle}>Work Experience</h2>
          <p style={styles.subtitle}>Your professional journey</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Experience'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editingExp ? 'Edit Experience' : 'Add New Experience'}
          </h3>
          
          {error && (
            <div style={styles.errorMessage}>
              <span>⚠️</span>
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} style={styles.closeError}>×</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="exp-position" style={styles.label}>Position *</label>
                <input
                  id="exp-position"
                  name="exp-position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="exp-company" style={styles.label}>Company *</label>
                <input
                  id="exp-company"
                  name="exp-company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Tech Corp"
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="exp-type" style={styles.label}>Employment Type</label>
                <select
                  id="exp-type"
                  name="exp-type"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                  style={styles.input}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="exp-location" style={styles.label}>Location</label>
                <input
                  id="exp-location"
                  name="exp-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={styles.input}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="exp-start" style={styles.label}>Start Date *</label>
                <input
                  id="exp-start"
                  name="exp-start"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="exp-end" style={styles.label}>End Date</label>
                <input
                  id="exp-end"
                  name="exp-end"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  style={formData.is_current ? { ...styles.input, ...styles.inputDisabled } : styles.input}
                />
              </div>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                  style={styles.checkbox}
                />
                <span>I currently work here</span>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="exp-description" style={styles.label}>Description *</label>
              <textarea
                id="exp-description"
                name="exp-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                style={{ ...styles.input, ...styles.textarea }}
                placeholder="Brief overview of your role..."
              />
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" disabled={saving} style={styles.submitButton}>
                {saving ? 'Saving...' : (editingExp ? 'Update Experience' : 'Add Experience')}
              </button>
              <button type="button" onClick={resetForm} disabled={saving} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {experiences.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💼</div>
          <h3 style={styles.emptyTitle}>No Experience Yet</h3>
          <p style={styles.emptyText}>Add your work experience to showcase your professional journey</p>
        </div>
      ) : (
        <div style={styles.experiencesGrid}>
          {experiences.map((exp) => (
            <div key={exp.id} style={styles.expCard}>
              <div style={styles.expHeader}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={styles.expPosition}>{exp.position}</h3>
                    <span style={{ ...styles.badge, ...employmentTypeColors[exp.employment_type] }}>
                      {exp.employment_type.replace('_', ' ')}
                    </span>
                    {exp.is_current && (
                      <span style={{ ...styles.badge, backgroundColor: '#d1fae5', color: '#065f46' }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p style={styles.expCompany}>{exp.company}</p>
                  {exp.location && <p style={styles.expLocation}>📍 {exp.location}</p>}
                  <p style={styles.expDuration}>
                    {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                    {exp.is_current ? 'Present' : new Date(exp.end_date!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {exp.duration && ` • ${exp.duration}`}
                  </p>
                  <p style={styles.expDescription}>{exp.description}</p>
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div style={styles.techStack}>
                      {exp.technologies.map((tech, idx) => (
                        <span key={idx} style={styles.techBadge}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(exp)} style={styles.iconButton} title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(exp.id)} style={styles.iconButton} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '4px',
  },
  addButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center' as 'center',
    padding: '48px',
    color: '#718096',
  },
  formCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box' as 'border-box',
  },
  inputDisabled: {
    backgroundColor: '#f7fafc',
    cursor: 'not-allowed',
  },
  textarea: {
    resize: 'vertical' as 'vertical',
    fontFamily: 'inherit',
  },
  checkboxGroup: {
    marginBottom: '16px',
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
    width: '16px',
    height: '16px',
    cursor: 'pointer',
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
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '48px 24px',
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    border: '2px dashed #cbd5e0',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#718096',
  },
  experiencesGrid: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '16px',
  },
  expCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'box-shadow 0.2s',
  },
  expHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expPosition: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  expCompany: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4a5568',
    margin: '4px 0',
  },
  expLocation: {
    fontSize: '13px',
    color: '#718096',
    margin: '4px 0',
  },
  expDuration: {
    fontSize: '13px',
    color: '#718096',
    margin: '4px 0 12px 0',
  },
  expDescription: {
    fontSize: '14px',
    color: '#2d3748',
    lineHeight: '1.6',
    marginTop: '12px',
  },
  badge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '600',
    textTransform: 'capitalize' as 'capitalize',
  },
  techStack: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  techBadge: {
    padding: '4px 10px',
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  errorMessage: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  closeError: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#c53030',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
  },
};

export default ExperienceSection;
