import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Education, EducationFormData } from '../../types/portfolio.types';

const EducationSection: React.FC = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: 'bachelor',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    description: '',
    institution_url: '',
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const data = await portfolioService.getEducation();
      setEducation(data || []);
    } catch (err) {
      console.error('Failed to fetch education:', err);
      setError('Failed to load education');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Format dates and prepare submission data
    const submissionData = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.is_current || !formData.end_date ? null : formData.end_date,
    };

    try {
      if (editingEdu) {
        console.log('Updating education ID:', editingEdu.id, 'with data:', submissionData);
        await portfolioService.updateEducation(editingEdu.id, submissionData);
        alert('Education updated successfully!');
      } else {
        console.log('Creating new education with data:', submissionData);
        await portfolioService.createEducation(submissionData);
        alert('Education added successfully!');
      }
      resetForm();
      await fetchEducation();
    } catch (err: any) {
      console.error('Failed to save education:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message || 'Failed to save education';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      try {
        await portfolioService.deleteEducation(id);
        await fetchEducation();
        alert('Education deleted successfully!');
      } catch (err: any) {
        console.error('Failed to delete education:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Failed to delete education';
        setError(errorMsg);
        alert('Error: ' + errorMsg);
      }
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingEdu(edu);
    
    // Format dates for date inputs
    const formatDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      start_date: formatDate(edu.start_date),
      end_date: formatDate(edu.end_date),
      is_current: edu.is_current,
      grade: edu.grade || '',
      description: edu.description || '',
      institution_url: edu.institution_url || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: 'bachelor',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      grade: '',
      description: '',
      institution_url: '',
    });
    setEditingEdu(null);
    setShowForm(false);
  };

  const degreeLabels: Record<string, string> = {
    high_school: 'High School',
    associate: 'Associate Degree',
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    phd: 'Ph.D.',
    certificate: 'Certificate',
    bootcamp: 'Bootcamp',
    other: 'Other',
  };

  // Format date range display
  const formatDateRange = (edu: Education) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const startDate = formatDate(edu.start_date);
    const endDate = edu.is_current ? 'Present' : (edu.end_date ? formatDate(edu.end_date) : 'N/A');
    const duration = edu.duration ? ` • ${edu.duration}` : '';

    return `${startDate} - ${endDate}${duration}`;
  };

  if (loading) {
    return <div style={styles.loading}>Loading education...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Education</h2>
          <p style={styles.subtitle}>Your academic background</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEdu(null);
            if (!showForm) {
              // Reset form when opening for add
              setFormData({
                institution: '',
                degree: 'bachelor',
                field_of_study: '',
                start_date: '',
                end_date: '',
                is_current: false,
                grade: '',
                description: ''
              });
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingEdu ? 'Cancel' : '+ Add Education'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Add Form - Only show when adding new education (not editing) */}
      {showForm && !editingEdu && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Education</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="edu-institution" style={styles.label}>Institution *</label>
                <input
                  id="edu-institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., Harvard University"
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="edu-degree" style={styles.label}>Degree *</label>
                <select
                  id="edu-degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="high_school">High School</option>
                  <option value="associate">Associate Degree</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">Ph.D.</option>
                  <option value="certificate">Certificate</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="edu-field" style={styles.label}>Field of Study *</label>
                <input
                  id="edu-field"
                  type="text"
                  value={formData.field_of_study}
                  onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="edu-start" style={styles.label}>Start Date *</label>
                <input
                  id="edu-start"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="edu-end" style={styles.label}>End Date</label>
                <input
                  id="edu-end"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  style={styles.input}
                  disabled={formData.is_current}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="edu-grade" style={styles.label}>Grade/GPA</label>
                <input
                  id="edu-grade"
                  type="text"
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
            </div>
            
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="edu-current"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                style={styles.checkbox}
              />
              <label htmlFor="edu-current" style={styles.checkboxLabel}>Currently enrolled</label>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="edu-description" style={styles.label}>Description</label>
              <textarea
                id="edu-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...styles.input, ...styles.textarea }}
                rows={2}
                placeholder="Achievements, courses, activities..."
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton} disabled={saving}>
                {saving ? 'Saving...' : 'Add Education'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Education List */}
      {education.length === 0 && !showForm ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎓</div>
          <h3 style={styles.emptyTitle}>No education added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Education" to showcase your academic background!
          </p>
        </div>
      ) : (
        <div style={styles.educationList}>
          {education.map((edu) => (
            <div key={edu.id}>
              {/* Education Card */}
              <div style={styles.eduCard}>
                <div style={styles.eduCardHeader}>
                  <div style={styles.eduContent}>
                    <div style={styles.degreeHeader}>
                      <h3 style={styles.degreeTitle}>{degreeLabels[edu.degree] || edu.degree}</h3>
                      {edu.is_current && (
                        <span style={styles.currentBadge}>Current</span>
                      )}
                    </div>
                    <p style={styles.fieldOfStudy}>{edu.field_of_study}</p>
                    <p style={styles.institution}>{edu.institution}</p>
                    <p style={styles.dateRange}>
                      📅 {formatDateRange(edu)}
                    </p>
                    {edu.grade && (
                      <p style={styles.grade}>
                        <span style={styles.gradeLabel}>GPA:</span> {edu.grade}
                      </p>
                    )}
                    {edu.description && (
                      <p style={styles.description}>{edu.description}</p>
                    )}
                  </div>
                  <div style={styles.eduActions}>
                    <button onClick={() => handleEdit(edu)} style={styles.editButton} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(edu.id)} style={styles.deleteButton} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form - Show below this card when editing */}
              {editingEdu?.id === edu.id && (
                <div style={{ ...styles.editForm, marginTop: '16px' }}>
                  <h3 style={styles.formTitle}>Edit Education</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label htmlFor={`edu-institution-${edu.id}`} style={styles.label}>Institution *</label>
                        <input
                          id={`edu-institution-${edu.id}`}
                          type="text"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          style={styles.input}
                          required
                          placeholder="e.g., Harvard University"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`edu-degree-${edu.id}`} style={styles.label}>Degree *</label>
                        <select
                          id={`edu-degree-${edu.id}`}
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value as any })}
                          style={styles.select}
                          required
                        >
                          <option value="high_school">High School</option>
                          <option value="associate">Associate Degree</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">Ph.D.</option>
                          <option value="certificate">Certificate</option>
                          <option value="bootcamp">Bootcamp</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`edu-field-${edu.id}`} style={styles.label}>Field of Study *</label>
                        <input
                          id={`edu-field-${edu.id}`}
                          type="text"
                          value={formData.field_of_study}
                          onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                          style={styles.input}
                          placeholder="e.g., Computer Science"
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`edu-start-${edu.id}`} style={styles.label}>Start Date *</label>
                        <input
                          id={`edu-start-${edu.id}`}
                          type="date"
                          value={formData.start_date || ''}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`edu-end-${edu.id}`} style={styles.label}>End Date</label>
                        <input
                          id={`edu-end-${edu.id}`}
                          type="date"
                          value={formData.end_date || ''}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          style={styles.input}
                          disabled={formData.is_current}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`edu-grade-${edu.id}`} style={styles.label}>Grade/GPA</label>
                        <input
                          id={`edu-grade-${edu.id}`}
                          type="text"
                          value={formData.grade || ''}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          style={styles.input}
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                    </div>
                    
                    <div style={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id={`edu-current-${edu.id}`}
                        checked={formData.is_current}
                        onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                        style={styles.checkbox}
                      />
                      <label htmlFor={`edu-current-${edu.id}`} style={styles.checkboxLabel}>Currently enrolled</label>
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor={`edu-description-${edu.id}`} style={styles.label}>Description</label>
                      <textarea
                        id={`edu-description-${edu.id}`}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ ...styles.input, ...styles.textarea }}
                        rows={2}
                        placeholder="Achievements, courses, activities..."
                      />
                    </div>

                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitButton} disabled={saving}>
                        {saving ? 'Saving...' : 'Update Education'}
                      </button>
                      <button type="button" onClick={resetForm} style={styles.cancelButton}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: '4px',
    fontSize: '14px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '32px',
    color: '#6B7280',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#991B1B',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#991B1B',
    padding: '0 8px',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#111827',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '60px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '14px',
    margin: '0',
  },
  educationList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  eduCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  eduCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eduContent: {
    flex: '1',
  },
  degreeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  degreeTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  },
  currentBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontWeight: '500',
  },
  fieldOfStudy: {
    fontSize: '16px',
    color: '#374151',
    fontWeight: '500',
    margin: '4px 0',
  },
  institution: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0',
  },
  dateRange: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '8px',
  },
  grade: {
    fontSize: '13px',
    color: '#374151',
    marginTop: '8px',
  },
  gradeLabel: {
    fontWeight: '500',
  },
  description: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '12px',
    lineHeight: '1.5',
  },
  eduActions: {
    display: 'flex',
    gap: '8px',
    marginLeft: '16px',
  },
  editButton: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    borderRadius: '4px',
  },
  deleteButton: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    borderRadius: '4px',
  },
  editForm: {
    backgroundColor: '#f7fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
};

export default EducationSection;
