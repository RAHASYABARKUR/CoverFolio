import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Award, AwardFormData } from '../../types/portfolio.types';

const AwardsSection: React.FC = () => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<AwardFormData>({
    title: '',
    issuer: '',
    date: null,
    category: 'other',
    description: '',
    url: ''
  });

  // Category labels mapping
  const categoryLabels: Record<string, string> = {
    academic: '🎓 Academic Achievement',
    professional: '💼 Professional Recognition',
    competition: '🏆 Competition/Contest',
    scholarship: '💰 Scholarship',
    leadership: '👑 Leadership',
    community: '🤝 Community Service',
    publication: '📚 Publication',
    patent: '💡 Patent',
    other: '⭐ Other'
  };

  useEffect(() => {
    loadAwards();
  }, []);

  const loadAwards = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.listAwards();
      console.log('Loaded awards:', data);
      setAwards(data);
    } catch (err: any) {
      console.error('Failed to load awards:', err);
      setError(err.response?.data?.error || 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title?.trim() || !formData.issuer?.trim() || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Format data - ensure date is in YYYY-MM-DD format or null
      const submitData: Partial<AwardFormData> = {
        title: formData.title.trim(),
        issuer: formData.issuer.trim(),
        date: formData.date || null,
        category: formData.category,
        description: formData.description?.trim() || '',
        url: formData.url?.trim() || ''
      };

      console.log('Submitting award data:', submitData);

      if (editingAward) {
        await portfolioService.updateAward(editingAward.id, submitData);
        alert('Award updated successfully!');
      } else {
        await portfolioService.createAward(submitData as AwardFormData);
        alert('Award added successfully!');
      }

      resetForm();
      loadAwards();
    } catch (err: any) {
      console.error('Failed to save award:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save award');
      alert(`Error: ${err.response?.data?.error || 'Failed to save award'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (award: Award) => {
    console.log('Editing award:', award);
    
    // Helper function to format date to YYYY-MM-DD for input[type="date"]
    const formatDate = (dateStr: string | null): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setFormData({
      title: award.title,
      issuer: award.issuer,
      date: formatDate(award.date),
      category: award.category,
      description: award.description || '',
      url: award.url || ''
    });
    setEditingAward(award);
    setShowForm(false); // Don't show top form when editing
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this award?')) {
      return;
    }

    try {
      await portfolioService.deleteAward(id);
      alert('Award deleted successfully!');
      loadAwards();
    } catch (err: any) {
      console.error('Failed to delete award:', err);
      alert('Failed to delete award');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      date: null,
      category: 'other',
      description: '',
      url: ''
    });
    setEditingAward(null);
    setShowForm(false);
  };

  // Helper function to format date for display
  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return <div style={styles.loading}>Loading awards...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Accomplishments & Awards</h2>
          <p style={styles.subtitle}>Recognition and achievements</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAward(null);
            if (!showForm) {
              // Reset form when opening for add
              setFormData({
                title: '',
                issuer: '',
                date: null,
                category: 'other',
                description: '',
                url: ''
              });
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingAward ? 'Cancel' : '+ Add Award'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Add Form - Only show when adding new award (not editing) */}
      {showForm && !editingAward && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Award</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="award-title" style={styles.label}>Award Title *</label>
                <input
                  id="award-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., Dean's List"
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="award-issuer" style={styles.label}>Issuer/Organization *</label>
                <input
                  id="award-issuer"
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Harvard University"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="award-category" style={styles.label}>Category *</label>
                <select
                  id="award-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="academic">🎓 Academic Achievement</option>
                  <option value="professional">💼 Professional Recognition</option>
                  <option value="competition">🏆 Competition/Contest</option>
                  <option value="scholarship">💰 Scholarship</option>
                  <option value="leadership">👑 Leadership</option>
                  <option value="community">🤝 Community Service</option>
                  <option value="publication">📚 Publication</option>
                  <option value="patent">💡 Patent</option>
                  <option value="other">⭐ Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="award-date" style={styles.label}>Date Received *</label>
                <input
                  id="award-date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="award-url" style={styles.label}>URL</label>
                <input
                  id="award-url"
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  style={styles.input}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="award-description" style={styles.label}>Description</label>
              <textarea
                id="award-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...styles.input, ...styles.textarea }}
                rows={3}
                placeholder="Details about the award or accomplishment..."
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton} disabled={saving}>
                {saving ? 'Saving...' : 'Add Award'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Awards List */}
      {awards.length === 0 && !showForm ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏆</div>
          <h3 style={styles.emptyTitle}>No awards added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Award" to showcase your accomplishments and recognition!
          </p>
        </div>
      ) : (
        <div style={styles.awardsList}>
          {awards.map((award) => (
            <div key={award.id}>
              {/* Award Card */}
              <div style={styles.awardCard}>
                <div style={styles.awardCardHeader}>
                  <div style={styles.awardContent}>
                    <div style={styles.awardHeader}>
                      <h3 style={styles.awardTitle}>{award.title}</h3>
                      <span style={styles.categoryBadge}>
                        {categoryLabels[award.category] || award.category}
                      </span>
                    </div>
                    <p style={styles.issuer}>
                      <span style={styles.issuerIcon}>🏢</span> {award.issuer}
                    </p>
                    <p style={styles.date}>
                      📅 {formatDateDisplay(award.date)}
                    </p>
                    {award.description && (
                      <p style={styles.description}>{award.description}</p>
                    )}
                    {award.url && (
                      <a 
                        href={award.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.link}
                      >
                        🔗 View Certificate
                      </a>
                    )}
                  </div>
                  <div style={styles.awardActions}>
                    <button onClick={() => handleEdit(award)} style={styles.editButton} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(award.id)} style={styles.deleteButton} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form - Show below this card when editing */}
              {editingAward?.id === award.id && (
                <div style={{ ...styles.editForm, marginTop: '16px' }}>
                  <h3 style={styles.formTitle}>Edit Award</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`award-title-${award.id}`} style={styles.label}>Award Title *</label>
                        <input
                          id={`award-title-${award.id}`}
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          style={styles.input}
                          required
                          placeholder="e.g., Dean's List"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`award-issuer-${award.id}`} style={styles.label}>Issuer/Organization *</label>
                        <input
                          id={`award-issuer-${award.id}`}
                          type="text"
                          value={formData.issuer}
                          onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                          style={styles.input}
                          placeholder="e.g., Harvard University"
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`award-category-${award.id}`} style={styles.label}>Category *</label>
                        <select
                          id={`award-category-${award.id}`}
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          style={styles.select}
                          required
                        >
                          <option value="academic">🎓 Academic Achievement</option>
                          <option value="professional">💼 Professional Recognition</option>
                          <option value="competition">🏆 Competition/Contest</option>
                          <option value="scholarship">💰 Scholarship</option>
                          <option value="leadership">👑 Leadership</option>
                          <option value="community">🤝 Community Service</option>
                          <option value="publication">📚 Publication</option>
                          <option value="patent">💡 Patent</option>
                          <option value="other">⭐ Other</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`award-date-${award.id}`} style={styles.label}>Date Received *</label>
                        <input
                          id={`award-date-${award.id}`}
                          type="date"
                          value={formData.date || ''}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`award-url-${award.id}`} style={styles.label}>URL</label>
                        <input
                          id={`award-url-${award.id}`}
                          type="url"
                          value={formData.url || ''}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          style={styles.input}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor={`award-description-${award.id}`} style={styles.label}>Description</label>
                      <textarea
                        id={`award-description-${award.id}`}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ ...styles.input, ...styles.textarea }}
                        rows={3}
                        placeholder="Details about the award or accomplishment..."
                      />
                    </div>

                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitButton} disabled={saving}>
                        {saving ? 'Saving...' : 'Update Award'}
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
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#718096',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #F87171',
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
    padding: '0 0 0 8px',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
    marginTop: 0,
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
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    minHeight: '80px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '2px dashed #D1D5DB',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  awardsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  awardCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  awardCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  awardContent: {
    flex: 1,
  },
  awardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  awardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  issuer: {
    fontSize: '15px',
    color: '#4B5563',
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  issuerIcon: {
    fontSize: '14px',
  },
  date: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  description: {
    fontSize: '14px',
    color: '#4B5563',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  link: {
    display: 'inline-block',
    fontSize: '14px',
    color: '#4F46E5',
    textDecoration: 'none',
    marginTop: '8px',
    fontWeight: '500',
  },
  awardActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  editButton: {
    padding: '6px 10px',
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#FEE2E2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  editForm: {
    backgroundColor: '#f7fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
};

export default AwardsSection;
