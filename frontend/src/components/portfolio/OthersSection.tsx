import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Other, OtherFormData } from '../../types/portfolio.types';

const OthersSection: React.FC = () => {
  const [others, setOthers] = useState<Other[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOther, setEditingOther] = useState<Other | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<OtherFormData>({
    title: '',
    category: '',
    description: '',
    date: '',
    url: '',
    tags: ''
  });

  useEffect(() => {
    loadOthers();
  }, []);

  const loadOthers = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.listOthers();
      setOthers(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load others:', err);
      if (err.response?.status === 404 || err.response?.data?.error?.includes('Portfolio not found')) {
        setOthers([]);
      } else {
        setError(err.response?.data?.error || 'Failed to load items');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      alert('Please provide a title');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const submitData: Partial<OtherFormData> = {
        title: formData.title.trim(),
        category: formData.category?.trim() || '',
        description: formData.description?.trim() || '',
        date: formData.date || undefined,
        url: formData.url?.trim() || '',
        tags: formData.tags?.trim() || ''
      };

      if (editingOther) {
        await portfolioService.updateOther(editingOther.id, submitData);
        alert('Item updated successfully!');
      } else {
        await portfolioService.createOther(submitData as OtherFormData);
        alert('Item added successfully!');
      }

      resetForm();
      setShowForm(false);
      loadOthers();
    } catch (err: any) {
      console.error('Failed to save item:', err);
      setError(err.response?.data?.error || 'Failed to save item');
      alert(`Error: ${err.response?.data?.error || 'Failed to save item'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (other: Other) => {
    setFormData({
      title: other.title,
      category: other.category || '',
      description: other.description || '',
      date: other.date || '',
      url: other.url || '',
      tags: other.tags || ''
    });
    setEditingOther(other);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await portfolioService.deleteOther(id);
      alert('Item deleted successfully');
      loadOthers();
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      date: '',
      url: '',
      tags: ''
    });
    setEditingOther(null);
  };

  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTags = (tagsStr: string | undefined): string[] => {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  if (loading) {
    return <div style={styles.loading}>Loading other items...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Other</h2>
        <button
          onClick={() => {
            const newShowForm = !showForm;
            setShowForm(newShowForm);
            setEditingOther(null);
            if (newShowForm) {
              resetForm();
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingOther ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Add Form */}
      {showForm && !editingOther && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Item</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="title" style={styles.label}>Title *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="category" style={styles.label}>Category</label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={styles.input}
                placeholder="e.g., Volunteer Work, Press, Media, Speaking"
              />
            </div>

            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="date" style={styles.label}>Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="description" style={styles.label}>Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                placeholder="Details about this item..."
              />
            </div>

            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="url" style={styles.label}>Link (URL)</label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                style={styles.input}
                placeholder="https://..."
              />
            </div>

            <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
              <label htmlFor="tags" style={styles.label}>Tags</label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                style={styles.input}
                placeholder="Comma-separated tags (e.g., volunteer, community, public speaking)"
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Others List */}
      {others.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            📌 No items added yet.
          </p>
          <p style={styles.emptySubtext}>
            Click "Add Item" to add miscellaneous portfolio items that don't fit in other sections!
          </p>
        </div>
      ) : (
        <div style={styles.othersList}>
          {others.map((other) => (
            <div key={other.id} style={styles.card}>
              {/* Edit Form (inline) */}
              {editingOther?.id === other.id ? (
                <div style={styles.editForm}>
                  <h3 style={styles.formTitle}>Edit Item</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-title-${other.id}`} style={styles.label}>Title *</label>
                      <input
                        id={`edit-title-${other.id}`}
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-category-${other.id}`} style={styles.label}>Category</label>
                      <input
                        id={`edit-category-${other.id}`}
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={styles.input}
                        placeholder="e.g., Volunteer Work, Press, Media, Speaking"
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-date-${other.id}`} style={styles.label}>Date</label>
                      <input
                        id={`edit-date-${other.id}`}
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-description-${other.id}`} style={styles.label}>Description</label>
                      <textarea
                        id={`edit-description-${other.id}`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Details about this item..."
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-url-${other.id}`} style={styles.label}>Link (URL)</label>
                      <input
                        id={`edit-url-${other.id}`}
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        style={styles.input}
                        placeholder="https://..."
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                      <label htmlFor={`edit-tags-${other.id}`} style={styles.label}>Tags</label>
                      <input
                        id={`edit-tags-${other.id}`}
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        style={styles.input}
                        placeholder="Comma-separated tags"
                      />
                    </div>

                    <div style={styles.buttonGroup}>
                      <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingOther(null); resetForm(); }}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Display Card */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{other.title}</h3>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleEdit(other)}
                        style={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(other.id)}
                        style={styles.deleteButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {other.category && (
                    <div style={styles.categoryBadge}>
                      📂 {other.category}
                    </div>
                  )}

                  {other.date && (
                    <div style={styles.date}>
                      📅 {formatDateDisplay(other.date)}
                    </div>
                  )}

                  {other.description && (
                    <p style={styles.description}>{other.description}</p>
                  )}

                  {other.url && (
                    <a
                      href={other.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      🔗 View Link
                    </a>
                  )}

                  {other.tags && getTags(other.tags).length > 0 && (
                    <div style={styles.tagsContainer}>
                      {getTags(other.tags).map((tag, index) => (
                        <span key={index} style={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
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
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  formCard: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #ddd',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
  },
  othersList: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    flex: 1,
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  categoryBadge: {
    display: 'inline-block',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  date: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap' as const,
  },
  link: {
    display: 'inline-block',
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '14px',
    marginBottom: '12px',
    fontWeight: '500',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '12px',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    color: '#555',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  editForm: {
    backgroundColor: '#f7fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
};

export default OthersSection;
