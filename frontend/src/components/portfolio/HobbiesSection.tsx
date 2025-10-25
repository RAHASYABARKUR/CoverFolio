import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Hobby, HobbyFormData } from '../../types/portfolio.types';

const HobbiesSection: React.FC = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<HobbyFormData>({
    name: '',
    description: '',
    category: 'other',
    start_date: '',
    end_date: '',
    is_current: false,
    achievements: ''
  });

  // Category labels mapping
  const categoryLabels: Record<string, string> = {
    sports: '⚽ Sports',
    arts: '🎨 Arts & Music',
    volunteer: '🤝 Volunteering',
    club: '👥 Clubs & Organizations',
    creative: '💡 Creative Pursuits',
    other: '🌟 Other'
  };

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.listHobbies();
      console.log('Loaded hobbies:', data);
      setHobbies(data);
    } catch (err: any) {
      console.error('Failed to load hobbies:', err);
      setError(err.response?.data?.error || 'Failed to load hobbies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim() || !formData.description?.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Format data - ensure dates are in YYYY-MM-DD format or null
      const submitData: Partial<HobbyFormData> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        start_date: formData.start_date || undefined,
        end_date: formData.is_current ? undefined : (formData.end_date || undefined),
        is_current: formData.is_current,
        achievements: formData.achievements?.trim() || ''
      };

      console.log('Submitting hobby data:', submitData);

      if (editingHobby) {
        await portfolioService.updateHobby(editingHobby.id, submitData);
        alert('Hobby updated successfully!');
      } else {
        await portfolioService.createHobby(submitData as HobbyFormData);
        alert('Hobby added successfully!');
      }

      resetForm();
      loadHobbies();
    } catch (err: any) {
      console.error('Failed to save hobby:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save hobby');
      alert(`Error: ${err.response?.data?.error || 'Failed to save hobby'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hobby: Hobby) => {
    console.log('Editing hobby:', hobby);
    
    // Helper function to format date to YYYY-MM-DD for input[type="date"]
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setFormData({
      name: hobby.name,
      description: hobby.description,
      category: hobby.category,
      start_date: formatDate(hobby.start_date),
      end_date: formatDate(hobby.end_date),
      is_current: hobby.is_current,
      achievements: hobby.achievements || ''
    });
    setEditingHobby(hobby);
    setShowForm(false); // Don't show top form when editing
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this hobby?')) {
      return;
    }

    try {
      await portfolioService.deleteHobby(id);
      alert('Hobby deleted successfully!');
      loadHobbies();
    } catch (err: any) {
      console.error('Failed to delete hobby:', err);
      alert('Failed to delete hobby');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'other',
      start_date: '',
      end_date: '',
      is_current: false,
      achievements: ''
    });
    setEditingHobby(null);
    setShowForm(false);
  };

  // Helper function to format date for display
  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Helper function to calculate duration
  const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined, isCurrent: boolean): string => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0 && diffMonths > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    } else if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    return 'Less than a month';
  };

  const formatDateRange = (hobby: Hobby): string => {
    if (!hobby.start_date) return 'No dates specified';
    
    const start = formatDateDisplay(hobby.start_date);
    const end = hobby.is_current ? 'Present' : formatDateDisplay(hobby.end_date);
    const duration = calculateDuration(hobby.start_date, hobby.end_date, hobby.is_current);
    
    if (end) {
      return `${start} - ${end} • ${duration}`;
    }
    return start;
  };

  if (loading) {
    return <div style={styles.loading}>Loading hobbies...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Hobbies & Interests</h2>
          <p style={styles.subtitle}>Your extracurricular activities and interests</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingHobby(null);
            if (!showForm) {
              // Reset form when opening for add
              setFormData({
                name: '',
                description: '',
                category: 'other',
                start_date: '',
                end_date: '',
                is_current: false,
                achievements: ''
              });
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingHobby ? 'Cancel' : '+ Add Hobby'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Add Form - Only show when adding new hobby (not editing) */}
      {showForm && !editingHobby && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Hobby</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="hobby-name" style={styles.label}>Activity Name *</label>
                <input
                  id="hobby-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., Photography, Volunteering, Chess"
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="hobby-category" style={styles.label}>Category *</label>
                <select
                  id="hobby-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="sports">⚽ Sports</option>
                  <option value="arts">🎨 Arts & Music</option>
                  <option value="volunteer">🤝 Volunteering</option>
                  <option value="club">👥 Clubs & Organizations</option>
                  <option value="creative">💡 Creative Pursuits</option>
                  <option value="other">🌟 Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="hobby-start" style={styles.label}>Start Date</label>
                <input
                  id="hobby-start"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="hobby-end" style={styles.label}>End Date</label>
                <input
                  id="hobby-end"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  style={styles.input}
                  disabled={formData.is_current}
                />
              </div>
            </div>
            
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="hobby-current"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                style={styles.checkbox}
              />
              <label htmlFor="hobby-current" style={styles.checkboxLabel}>Currently active</label>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="hobby-description" style={styles.label}>Description *</label>
              <textarea
                id="hobby-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...styles.input, ...styles.textarea }}
                rows={3}
                required
                placeholder="Describe your involvement and what you enjoy about this activity..."
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="hobby-achievements" style={styles.label}>Achievements</label>
              <textarea
                id="hobby-achievements"
                value={formData.achievements || ''}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                style={{ ...styles.input, ...styles.textarea }}
                rows={2}
                placeholder="Any notable achievements, roles, or accomplishments..."
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton} disabled={saving}>
                {saving ? 'Saving...' : 'Add Hobby'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hobbies List */}
      {hobbies.length === 0 && !showForm ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎯</div>
          <h3 style={styles.emptyTitle}>No hobbies added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Hobby" to showcase your interests and extracurricular activities!
          </p>
        </div>
      ) : (
        <div style={styles.hobbiesList}>
          {hobbies.map((hobby) => (
            <div key={hobby.id}>
              {/* Hobby Card */}
              <div style={styles.hobbyCard}>
                <div style={styles.hobbyCardHeader}>
                  <div style={styles.hobbyContent}>
                    <div style={styles.hobbyHeader}>
                      <h3 style={styles.hobbyTitle}>{hobby.name}</h3>
                      <span style={styles.categoryBadge}>
                        {categoryLabels[hobby.category] || hobby.category}
                      </span>
                      {hobby.is_current && (
                        <span style={styles.currentBadge}>Active</span>
                      )}
                    </div>
                    {(hobby.start_date || hobby.end_date) && (
                      <p style={styles.dateRange}>
                        📅 {formatDateRange(hobby)}
                      </p>
                    )}
                    <p style={styles.description}>{hobby.description}</p>
                    {hobby.achievements && (
                      <div style={styles.achievementsBox}>
                        <strong style={styles.achievementsLabel}>Achievements:</strong>
                        <p style={styles.achievementsText}>{hobby.achievements}</p>
                      </div>
                    )}
                  </div>
                  <div style={styles.hobbyActions}>
                    <button onClick={() => handleEdit(hobby)} style={styles.editButton} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(hobby.id)} style={styles.deleteButton} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form - Show below this card when editing */}
              {editingHobby?.id === hobby.id && (
                <div style={{ ...styles.editForm, marginTop: '16px' }}>
                  <h3 style={styles.formTitle}>Edit Hobby</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`hobby-name-${hobby.id}`} style={styles.label}>Activity Name *</label>
                        <input
                          id={`hobby-name-${hobby.id}`}
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={styles.input}
                          required
                          placeholder="e.g., Photography, Volunteering, Chess"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`hobby-category-${hobby.id}`} style={styles.label}>Category *</label>
                        <select
                          id={`hobby-category-${hobby.id}`}
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          style={styles.select}
                          required
                        >
                          <option value="sports">⚽ Sports</option>
                          <option value="arts">🎨 Arts & Music</option>
                          <option value="volunteer">🤝 Volunteering</option>
                          <option value="club">👥 Clubs & Organizations</option>
                          <option value="creative">💡 Creative Pursuits</option>
                          <option value="other">🌟 Other</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`hobby-start-${hobby.id}`} style={styles.label}>Start Date</label>
                        <input
                          id={`hobby-start-${hobby.id}`}
                          type="date"
                          value={formData.start_date || ''}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`hobby-end-${hobby.id}`} style={styles.label}>End Date</label>
                        <input
                          id={`hobby-end-${hobby.id}`}
                          type="date"
                          value={formData.end_date || ''}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          style={styles.input}
                          disabled={formData.is_current}
                        />
                      </div>
                    </div>
                    
                    <div style={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id={`hobby-current-${hobby.id}`}
                        checked={formData.is_current}
                        onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                        style={styles.checkbox}
                      />
                      <label htmlFor={`hobby-current-${hobby.id}`} style={styles.checkboxLabel}>Currently active</label>
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor={`hobby-description-${hobby.id}`} style={styles.label}>Description *</label>
                      <textarea
                        id={`hobby-description-${hobby.id}`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ ...styles.input, ...styles.textarea }}
                        rows={3}
                        required
                        placeholder="Describe your involvement and what you enjoy about this activity..."
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor={`hobby-achievements-${hobby.id}`} style={styles.label}>Achievements</label>
                      <textarea
                        id={`hobby-achievements-${hobby.id}`}
                        value={formData.achievements || ''}
                        onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                        style={{ ...styles.input, ...styles.textarea }}
                        rows={2}
                        placeholder="Any notable achievements, roles, or accomplishments..."
                      />
                    </div>

                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitButton} disabled={saving}>
                        {saving ? 'Saving...' : 'Update Hobby'}
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none' as const,
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
  hobbiesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  hobbyCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  hobbyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  hobbyContent: {
    flex: 1,
  },
  hobbyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  hobbyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  currentBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  dateRange: {
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
  achievementsBox: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#FEF3C7',
    borderRadius: '8px',
    border: '1px solid #FCD34D',
  },
  achievementsLabel: {
    fontSize: '13px',
    color: '#92400E',
    fontWeight: '600',
    display: 'block',
    marginBottom: '4px',
  },
  achievementsText: {
    fontSize: '14px',
    color: '#78350F',
    margin: 0,
    lineHeight: '1.5',
  },
  hobbyActions: {
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

export default HobbiesSection;
