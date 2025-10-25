import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Contact, ContactFormData } from '../../types/portfolio.types';

const ContactsSection: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<ContactFormData>({
    contact_type: 'email',
    label: '',
    value: '',
    is_primary: false,
    is_public: true
  });

  // Contact type labels mapping with icons
  const contactTypeLabels: Record<string, { icon: string; label: string; placeholder: string }> = {
    email: { icon: '📧', label: 'Email', placeholder: 'your.email@example.com' },
    phone: { icon: '📱', label: 'Phone', placeholder: '+1 (555) 123-4567' },
    website: { icon: '🌐', label: 'Website', placeholder: 'https://yourwebsite.com' },
    linkedin: { icon: '💼', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    github: { icon: '💻', label: 'GitHub', placeholder: 'https://github.com/username' },
    twitter: { icon: '🐦', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
    instagram: { icon: '📷', label: 'Instagram', placeholder: 'https://instagram.com/username' },
    facebook: { icon: '👥', label: 'Facebook', placeholder: 'https://facebook.com/username' },
    youtube: { icon: '📺', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
    portfolio: { icon: '💼', label: 'Portfolio', placeholder: 'https://yourportfolio.com' },
    blog: { icon: '✍️', label: 'Blog', placeholder: 'https://yourblog.com' },
    other: { icon: '🔗', label: 'Other', placeholder: 'Enter contact info' }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.listContacts();
      console.log('Loaded contacts:', data);
      setContacts(data);
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
      setError(err.response?.data?.error || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.label?.trim() || !formData.value?.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const submitData: ContactFormData = {
        contact_type: formData.contact_type,
        label: formData.label.trim(),
        value: formData.value.trim(),
        is_primary: formData.is_primary,
        is_public: formData.is_public
      };

      console.log('Submitting contact data:', submitData);

      if (editingContact) {
        await portfolioService.updateContact(editingContact.id, submitData);
        alert('Contact updated successfully!');
      } else {
        await portfolioService.createContact(submitData);
        alert('Contact added successfully!');
      }

      resetForm();
      loadContacts();
    } catch (err: any) {
      console.error('Failed to save contact:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.value?.[0] || 'Failed to save contact');
      alert(`Error: ${err.response?.data?.error || err.response?.data?.value?.[0] || 'Failed to save contact'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    console.log('Editing contact:', contact);
    
    setFormData({
      contact_type: contact.contact_type,
      label: contact.label,
      value: contact.value,
      is_primary: contact.is_primary,
      is_public: contact.is_public
    });
    setEditingContact(contact);
    setShowForm(false); // Don't show top form when editing
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await portfolioService.deleteContact(id);
      alert('Contact deleted successfully!');
      loadContacts();
    } catch (err: any) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact');
    }
  };

  const resetForm = () => {
    setFormData({
      contact_type: 'email',
      label: '',
      value: '',
      is_primary: false,
      is_public: true
    });
    setEditingContact(null);
    setShowForm(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading contacts...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Contact Information</h2>
          <p style={styles.subtitle}>Your contact details and social links</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingContact(null);
            if (!showForm) {
              // Reset form when opening for add
              setFormData({
                contact_type: 'email',
                label: '',
                value: '',
                is_primary: false,
                is_public: true
              });
            }
          }}
          style={styles.addButton}
        >
          {showForm && !editingContact ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Add Form - Only show when adding new contact (not editing) */}
      {showForm && !editingContact && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add New Contact</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="contact-type" style={styles.label}>Contact Type *</label>
                <select
                  id="contact-type"
                  value={formData.contact_type}
                  onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📱 Phone</option>
                  <option value="website">🌐 Website</option>
                  <option value="linkedin">💼 LinkedIn</option>
                  <option value="github">💻 GitHub</option>
                  <option value="twitter">🐦 Twitter/X</option>
                  <option value="instagram">📷 Instagram</option>
                  <option value="facebook">👥 Facebook</option>
                  <option value="youtube">📺 YouTube</option>
                  <option value="portfolio">💼 Portfolio</option>
                  <option value="blog">✍️ Blog</option>
                  <option value="other">🔗 Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="contact-label" style={styles.label}>Label *</label>
                <input
                  id="contact-label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., Work Email, Personal Phone"
                />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="contact-value" style={styles.label}>
                  {contactTypeLabels[formData.contact_type]?.label || 'Value'} *
                </label>
                <input
                  id="contact-value"
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={styles.input}
                  required
                  placeholder={contactTypeLabels[formData.contact_type]?.placeholder || 'Enter value'}
                />
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="contact-primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  style={styles.checkbox}
                />
                <label htmlFor="contact-primary" style={styles.checkboxLabel}>
                  ⭐ Primary contact method
                </label>
              </div>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="contact-public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  style={styles.checkbox}
                />
                <label htmlFor="contact-public" style={styles.checkboxLabel}>
                  🌍 Show on public portfolio
                </label>
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton} disabled={saving}>
                {saving ? 'Saving...' : 'Add Contact'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      {contacts.length === 0 && !showForm ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📞</div>
          <h3 style={styles.emptyTitle}>No contacts added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Contact" to add your contact information and social links!
          </p>
        </div>
      ) : (
        <div style={styles.contactsList}>
          {contacts.map((contact) => (
            <div key={contact.id}>
              {/* Contact Card */}
              <div style={styles.contactCard}>
                <div style={styles.contactCardHeader}>
                  <div style={styles.contactContent}>
                    <div style={styles.contactHeader}>
                      <span style={styles.contactIcon}>
                        {contactTypeLabels[contact.contact_type]?.icon || '🔗'}
                      </span>
                      <div style={styles.contactInfo}>
                        <h3 style={styles.contactLabel}>{contact.label}</h3>
                        <p style={styles.contactType}>
                          {contactTypeLabels[contact.contact_type]?.label || contact.contact_type}
                        </p>
                      </div>
                      <div style={styles.badges}>
                        {contact.is_primary && (
                          <span style={styles.primaryBadge}>⭐ Primary</span>
                        )}
                        {contact.is_public ? (
                          <span style={styles.publicBadge}>🌍 Public</span>
                        ) : (
                          <span style={styles.privateBadge}>🔒 Private</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.contactValue}>
                      {contact.contact_type === 'email' ? (
                        <a href={`mailto:${contact.value}`} style={styles.link}>
                          {contact.value}
                        </a>
                      ) : contact.contact_type === 'phone' ? (
                        <a href={`tel:${contact.value}`} style={styles.link}>
                          {contact.value}
                        </a>
                      ) : contact.value.startsWith('http') ? (
                        <a href={contact.value} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          {contact.value}
                        </a>
                      ) : (
                        <span style={styles.valueText}>{contact.value}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.contactActions}>
                    <button onClick={() => handleEdit(contact)} style={styles.editButton} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(contact.id)} style={styles.deleteButton} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form - Show below this card when editing */}
              {editingContact?.id === contact.id && (
                <div style={{ ...styles.editForm, marginTop: '16px' }}>
                  <h3 style={styles.formTitle}>Edit Contact</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label htmlFor={`contact-type-${contact.id}`} style={styles.label}>Contact Type *</label>
                        <select
                          id={`contact-type-${contact.id}`}
                          value={formData.contact_type}
                          onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as any })}
                          style={styles.select}
                          required
                        >
                          <option value="email">📧 Email</option>
                          <option value="phone">📱 Phone</option>
                          <option value="website">🌐 Website</option>
                          <option value="linkedin">💼 LinkedIn</option>
                          <option value="github">💻 GitHub</option>
                          <option value="twitter">🐦 Twitter/X</option>
                          <option value="instagram">📷 Instagram</option>
                          <option value="facebook">👥 Facebook</option>
                          <option value="youtube">📺 YouTube</option>
                          <option value="portfolio">💼 Portfolio</option>
                          <option value="blog">✍️ Blog</option>
                          <option value="other">🔗 Other</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor={`contact-label-${contact.id}`} style={styles.label}>Label *</label>
                        <input
                          id={`contact-label-${contact.id}`}
                          type="text"
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          style={styles.input}
                          required
                          placeholder="e.g., Work Email, Personal Phone"
                        />
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label htmlFor={`contact-value-${contact.id}`} style={styles.label}>
                          {contactTypeLabels[formData.contact_type]?.label || 'Value'} *
                        </label>
                        <input
                          id={`contact-value-${contact.id}`}
                          type="text"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          style={styles.input}
                          required
                          placeholder={contactTypeLabels[formData.contact_type]?.placeholder || 'Enter value'}
                        />
                      </div>
                    </div>

                    <div style={styles.checkboxRow}>
                      <div style={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          id={`contact-primary-${contact.id}`}
                          checked={formData.is_primary}
                          onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                          style={styles.checkbox}
                        />
                        <label htmlFor={`contact-primary-${contact.id}`} style={styles.checkboxLabel}>
                          ⭐ Primary contact method
                        </label>
                      </div>
                      <div style={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          id={`contact-public-${contact.id}`}
                          checked={formData.is_public}
                          onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                          style={styles.checkbox}
                        />
                        <label htmlFor={`contact-public-${contact.id}`} style={styles.checkboxLabel}>
                          🌍 Show on public portfolio
                        </label>
                      </div>
                    </div>

                    <div style={styles.formActions}>
                      <button type="submit" style={styles.submitButton} disabled={saving}>
                        {saving ? 'Saving...' : 'Update Contact'}
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
  checkboxRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  contactsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  contactCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  contactContent: {
    flex: 1,
  },
  contactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap' as const,
  },
  contactIcon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  contactInfo: {
    flex: 1,
    minWidth: '150px',
  },
  contactLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 2px 0',
  },
  contactType: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  primaryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  publicBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  privateBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  contactValue: {
    marginLeft: '44px',
  },
  link: {
    fontSize: '15px',
    color: '#4F46E5',
    textDecoration: 'none',
    fontWeight: '500',
    wordBreak: 'break-all' as const,
  },
  valueText: {
    fontSize: '15px',
    color: '#4B5563',
    wordBreak: 'break-all' as const,
  },
  contactActions: {
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

export default ContactsSection;
