import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Certification, CertificationFormData } from '../../types/portfolio.types';

const CertificationsSection: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    description: ''
  });

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.listCertifications();
      console.log('Loaded certifications:', data);
      setCertifications(data);
    } catch (err: any) {
      console.error('Failed to load certifications:', err);
      setError(err.response?.data?.error || 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim() || !formData.issuing_organization?.trim() || !formData.issue_date) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Format data - ensure dates are in YYYY-MM-DD format or empty string
      const submitData: Partial<CertificationFormData> = {
        name: formData.name.trim(),
        issuing_organization: formData.issuing_organization.trim(),
        issue_date: formData.issue_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        credential_id: formData.credential_id?.trim() || '',
        credential_url: formData.credential_url?.trim() || '',
        description: formData.description?.trim() || ''
      };

      console.log('Submitting certification data:', submitData);

      if (editingCert) {
        await portfolioService.updateCertification(editingCert.id, submitData);
        alert('Certification updated successfully!');
      } else {
        await portfolioService.createCertification(submitData as CertificationFormData);
        alert('Certification added successfully!');
      }

      resetForm();
      loadCertifications();
    } catch (err: any) {
      console.error('Failed to save certification:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save certification');
      alert(`Error: ${err.response?.data?.error || 'Failed to save certification'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cert: Certification) => {
    console.log('Editing certification:', cert);
    
    // Helper function to format date to YYYY-MM-DD for input[type="date"]
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setFormData({
      name: cert.name,
      issuing_organization: cert.issuing_organization,
      issue_date: formatDate(cert.issue_date),
      expiry_date: formatDate(cert.expiry_date),
      credential_id: cert.credential_id || '',
      credential_url: cert.credential_url || '',
      description: cert.description || ''
    });
    setEditingCert(cert);
    setShowForm(false); // Don't show top form when editing
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) {
      return;
    }

    try {
      await portfolioService.deleteCertification(id);
      alert('Certification deleted successfully!');
      loadCertifications();
    } catch (err: any) {
      console.error('Failed to delete certification:', err);
      alert('Failed to delete certification');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
      description: ''
    });
    setEditingCert(null);
    setShowForm(false);
  };

  // Helper function to format date for display
  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Helper function to check if certification is expired
  const isExpired = (expiryDate: string | null | undefined): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  // Helper function to check if certification is expiring soon (within 3 months)
  const isExpiringSoon = (expiryDate: string | null | undefined): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry > today && expiry <= threeMonthsFromNow;
  };

  if (loading) {
    return <div style={styles.loading}>Loading certifications...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Certifications</h2>
          <p style={styles.subtitle}>Your professional certifications and credentials</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingCert(null);
            if (!showForm) {
              // Reset form when opening for add
              setFormData({
                name: '',
                issuing_organization: '',
                issue_date: '',
                expiry_date: '',
                credential_id: '',
                credential_url: '',
                description: ''
              });
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingCert ? 'Cancel' : '+ Add Certification'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Add Form - Only show when adding new certification (not editing) */}
      {showForm && !editingCert && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Certification</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="cert-name" style={styles.label}>Certification Name *</label>
                <input
                  id="cert-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="cert-org" style={styles.label}>Issuing Organization *</label>
                <input
                  id="cert-org"
                  type="text"
                  value={formData.issuing_organization}
                  onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Amazon Web Services"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="cert-credential" style={styles.label}>Credential ID</label>
                <input
                  id="cert-credential"
                  type="text"
                  value={formData.credential_id || ''}
                  onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., ABC123XYZ"
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="cert-issue" style={styles.label}>Issue Date *</label>
                <input
                  id="cert-issue"
                  type="date"
                  value={formData.issue_date || ''}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="cert-expiry" style={styles.label}>Expiry Date</label>
                <input
                  id="cert-expiry"
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="cert-url" style={styles.label}>Credential URL</label>
                <input
                  id="cert-url"
                  type="url"
                  value={formData.credential_url || ''}
                  onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                  style={styles.input}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="cert-description" style={styles.label}>Description</label>
              <textarea
                id="cert-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...styles.input, ...styles.textarea }}
                rows={3}
                placeholder="Details about the certification..."
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton} disabled={saving}>
                {saving ? 'Saving...' : 'Add Certification'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certifications List */}
      {certifications.length === 0 && !showForm ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📜</div>
          <h3 style={styles.emptyTitle}>No certifications added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Certification" to showcase your professional credentials!
          </p>
        </div>
      ) : (
        <div style={styles.certsList}>
          {certifications.map((cert) => (
            <div key={cert.id}>
              {/* Certification Card */}
              <div style={styles.certCard}>
                <div style={styles.certCardHeader}>
                  <div style={styles.certContent}>
                    <div style={styles.certHeader}>
                      <h3 style={styles.certTitle}>{cert.name}</h3>
                      {cert.expiry_date && (
                        <>
                          {isExpired(cert.expiry_date) ? (
                            <span style={styles.expiredBadge}>❌ Expired</span>
                          ) : isExpiringSoon(cert.expiry_date) ? (
                            <span style={styles.expiringSoonBadge}>⚠️ Expiring Soon</span>
                          ) : (
                            <span style={styles.activeBadge}>✅ Active</span>
                          )}
                        </>
                      )}
                      {!cert.expiry_date && (
                        <span style={styles.noExpiryBadge}>♾️ No Expiry</span>
                      )}
                    </div>
                    <p style={styles.organization}>
                      <span style={styles.orgIcon}>🏢</span> {cert.issuing_organization}
                    </p>
                    <div style={styles.dateRow}>
                      <p style={styles.issueDate}>
                        📅 Issued: {formatDateDisplay(cert.issue_date)}
                      </p>
                      {cert.expiry_date && (
                        <p style={styles.expiryDate}>
                          ⏳ Expires: {formatDateDisplay(cert.expiry_date)}
                        </p>
                      )}
                    </div>
                    {cert.credential_id && (
                      <p style={styles.credentialId}>
                        🔑 Credential ID: <code style={styles.code}>{cert.credential_id}</code>
                      </p>
                    )}
                    {cert.description && (
                      <p style={styles.description}>{cert.description}</p>
                    )}
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.link}
                      >
                        🔗 View Credential
                      </a>
                    )}
                  </div>
                  <div style={styles.certActions}>
                    <button onClick={() => handleEdit(cert)} style={styles.editButton} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(cert.id)} style={styles.deleteButton} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form - Show below this card when editing */}
              {editingCert?.id === cert.id && (
                <div style={{ ...styles.editForm, marginTop: '16px' }}>
                  <h3 style={styles.formTitle}>Edit Certification</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`cert-name-${cert.id}`} style={styles.label}>Certification Name *</label>
                        <input
                          id={`cert-name-${cert.id}`}
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={styles.input}
                          required
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`cert-org-${cert.id}`} style={styles.label}>Issuing Organization *</label>
                        <input
                          id={`cert-org-${cert.id}`}
                          type="text"
                          value={formData.issuing_organization}
                          onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                          style={styles.input}
                          placeholder="e.g., Amazon Web Services"
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`cert-credential-${cert.id}`} style={styles.label}>Credential ID</label>
                        <input
                          id={`cert-credential-${cert.id}`}
                          type="text"
                          value={formData.credential_id || ''}
                          onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                          style={styles.input}
                          placeholder="e.g., ABC123XYZ"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`cert-issue-${cert.id}`} style={styles.label}>Issue Date *</label>
                        <input
                          id={`cert-issue-${cert.id}`}
                          type="date"
                          value={formData.issue_date || ''}
                          onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`cert-expiry-${cert.id}`} style={styles.label}>Expiry Date</label>
                        <input
                          id={`cert-expiry-${cert.id}`}
                          type="date"
                          value={formData.expiry_date || ''}
                          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`cert-url-${cert.id}`} style={styles.label}>Credential URL</label>
                        <input
                          id={`cert-url-${cert.id}`}
                          type="url"
                          value={formData.credential_url || ''}
                          onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                          style={styles.input}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor={`cert-description-${cert.id}`} style={styles.label}>Description</label>
                      <textarea
                        id={`cert-description-${cert.id}`}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ ...styles.input, ...styles.textarea }}
                        rows={3}
                        placeholder="Details about the certification..."
                      />
                    </div>

                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitButton} disabled={saving}>
                        {saving ? 'Saving...' : 'Update Certification'}
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
  certsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  certCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  certCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  certContent: {
    flex: 1,
  },
  certHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  certTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  activeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  expiredBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  expiringSoonBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  noExpiryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  organization: {
    fontSize: '15px',
    color: '#4B5563',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  orgIcon: {
    fontSize: '14px',
  },
  dateRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '8px',
  },
  issueDate: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  expiryDate: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  credentialId: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  code: {
    backgroundColor: '#F3F4F6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#374151',
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
  certActions: {
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

export default CertificationsSection;
