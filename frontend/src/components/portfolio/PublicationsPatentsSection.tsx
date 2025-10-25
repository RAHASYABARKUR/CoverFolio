import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Publication, PublicationFormData, Patent, PatentFormData } from '../../types/portfolio.types';

const PublicationsPatentsSection: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'publications' | 'patents'>('publications');
  
  // Publications state
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [showPubForm, setShowPubForm] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [savingPub, setSavingPub] = useState(false);
  
  const [pubFormData, setPubFormData] = useState<PublicationFormData>({
    title: '',
    authors: '',
    publication_type: 'journal',
    publisher: '',
    publication_date: '',
    doi: '',
    url: '',
    description: '',
    citation_count: 0
  });

  // Patents state
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loadingPatents, setLoadingPatents] = useState(true);
  const [showPatentForm, setShowPatentForm] = useState(false);
  const [editingPatent, setEditingPatent] = useState<Patent | null>(null);
  const [savingPatent, setSavingPatent] = useState(false);
  
  const [patentFormData, setPatentFormData] = useState<PatentFormData>({
    title: '',
    inventors: '',
    patent_number: '',
    status: 'filed',
    filing_date: '',
    issue_date: '',
    patent_office: '',
    url: '',
    description: ''
  });

  // Common state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublications();
    loadPatents();
  }, []);

  // Publications functions
  const loadPublications = async () => {
    try {
      setLoadingPubs(true);
      const data = await portfolioService.listPublications();
      setPublications(data);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Failed to load publications:', err);
      console.error('Error details:', err.response);
      // Don't set error state for 404 on empty list, just use empty array
      if (err.response?.status === 404 || err.response?.data?.error?.includes('Portfolio not found')) {
        console.log('No portfolio found yet, using empty publications list');
        setPublications([]);
      } else {
        setError(err.response?.data?.error || 'Failed to load publications');
        setPublications([]);
      }
    } finally {
      setLoadingPubs(false);
    }
  };

  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pubFormData.title?.trim() || !pubFormData.authors?.trim() || !pubFormData.publication_date) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingPub(true);
    setError(null);

    try {
      const submitData: Partial<PublicationFormData> = {
        title: pubFormData.title.trim(),
        authors: pubFormData.authors.trim(),
        publication_type: pubFormData.publication_type,
        publisher: pubFormData.publisher?.trim() || '',
        publication_date: pubFormData.publication_date || undefined,
        doi: pubFormData.doi?.trim() || '',
        url: pubFormData.url?.trim() || '',
        description: pubFormData.description?.trim() || '',
        citation_count: pubFormData.citation_count || 0
      };

      console.log('Submitting publication data:', submitData);

      if (editingPub) {
        await portfolioService.updatePublication(editingPub.id, submitData);
        alert('Publication updated successfully!');
      } else {
        await portfolioService.createPublication(submitData as PublicationFormData);
        alert('Publication added successfully!');
      }

      resetPublicationForm();
      setShowPubForm(false); // Close the form after successful save
      loadPublications();
    } catch (err: any) {
      console.error('Failed to save publication:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save publication');
      alert(`Error: ${err.response?.data?.error || 'Failed to save publication'}`);
    } finally {
      setSavingPub(false);
    }
  };

  const handleEditPublication = (pub: Publication) => {
    console.log('Editing publication:', pub);
    
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setPubFormData({
      title: pub.title,
      authors: pub.authors,
      publication_type: pub.publication_type,
      publisher: pub.publisher || '',
      publication_date: formatDate(pub.publication_date),
      doi: pub.doi || '',
      url: pub.url || '',
      description: pub.description || '',
      citation_count: pub.citation_count || 0
    });
    setEditingPub(pub);
    setShowPubForm(false);
  };

  const handleDeletePublication = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      await portfolioService.deletePublication(id);
      alert('Publication deleted successfully!');
      loadPublications();
    } catch (err: any) {
      console.error('Failed to delete publication:', err);
      alert('Failed to delete publication');
    }
  };

  const resetPublicationForm = () => {
    setPubFormData({
      title: '',
      authors: '',
      publication_type: 'journal',
      publisher: '',
      publication_date: '',
      doi: '',
      url: '',
      description: '',
      citation_count: 0
    });
    setEditingPub(null);
    // Don't close the form - let the caller handle that
  };

  // Patents functions
  const loadPatents = async () => {
    try {
      setLoadingPatents(true);
      const data = await portfolioService.listPatents();
      setPatents(data);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Failed to load patents:', err);
      console.error('Error details:', err.response);
      // Don't set error state for 404 on empty list, just use empty array
      if (err.response?.status === 404 || err.response?.data?.error?.includes('Portfolio not found')) {
        console.log('No portfolio found yet, using empty patents list');
        setPatents([]);
      } else {
        setError(err.response?.data?.error || 'Failed to load patents');
        setPatents([]);
      }
    } finally {
      setLoadingPatents(false);
    }
  };

  const handlePatentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patentFormData.title?.trim() || !patentFormData.inventors?.trim() || !patentFormData.filing_date) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingPatent(true);
    setError(null);

    try {
      const submitData: Partial<PatentFormData> = {
        title: patentFormData.title.trim(),
        inventors: patentFormData.inventors.trim(),
        patent_number: patentFormData.patent_number?.trim() || '',
        status: patentFormData.status,
        filing_date: patentFormData.filing_date || undefined,
        issue_date: patentFormData.issue_date || undefined,
        patent_office: patentFormData.patent_office?.trim() || '',
        url: patentFormData.url?.trim() || '',
        description: patentFormData.description?.trim() || ''
      };

      console.log('Submitting patent data:', submitData);

      if (editingPatent) {
        await portfolioService.updatePatent(editingPatent.id, submitData);
        alert('Patent updated successfully!');
      } else {
        await portfolioService.createPatent(submitData as PatentFormData);
        alert('Patent added successfully!');
      }

      resetPatentForm();
      setShowPatentForm(false); // Close the form after successful save
      loadPatents();
    } catch (err: any) {
      console.error('Failed to save patent:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save patent');
      alert(`Error: ${err.response?.data?.error || 'Failed to save patent'}`);
    } finally {
      setSavingPatent(false);
    }
  };

  const handleEditPatent = (patent: Patent) => {
    console.log('Editing patent:', patent);
    
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setPatentFormData({
      title: patent.title,
      inventors: patent.inventors,
      patent_number: patent.patent_number || '',
      status: patent.status,
      filing_date: formatDate(patent.filing_date),
      issue_date: formatDate(patent.issue_date),
      patent_office: patent.patent_office || '',
      url: patent.url || '',
      description: patent.description || ''
    });
    setEditingPatent(patent);
    setShowPatentForm(false);
  };

  const handleDeletePatent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patent?')) {
      return;
    }

    try {
      await portfolioService.deletePatent(id);
      alert('Patent deleted successfully!');
      loadPatents();
    } catch (err: any) {
      console.error('Failed to delete patent:', err);
      alert('Failed to delete patent');
    }
  };

  const resetPatentForm = () => {
    setPatentFormData({
      title: '',
      inventors: '',
      patent_number: '',
      status: 'filed',
      filing_date: '',
      issue_date: '',
      patent_office: '',
      url: '',
      description: ''
    });
    setEditingPatent(null);
    // Don't close the form - let the caller handle that
  };

  // Helper functions
  const formatDateDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getPublicationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      journal: 'Journal Article',
      conference: 'Conference Paper',
      book: 'Book',
      chapter: 'Book Chapter',
      thesis: 'Thesis/Dissertation',
      preprint: 'Preprint',
      magazine: 'Magazine Article',
      blog: 'Blog Post',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusBadgeStyle = (status: string) => {
    const statusStyles: Record<string, React.CSSProperties> = {
      granted: { ...styles.statusBadge, backgroundColor: '#D1FAE5', color: '#065F46' },
      pending: { ...styles.statusBadge, backgroundColor: '#FEF3C7', color: '#92400E' },
      filed: { ...styles.statusBadge, backgroundColor: '#E0E7FF', color: '#3730A3' },
      published: { ...styles.statusBadge, backgroundColor: '#DBEAFE', color: '#1E40AF' },
      expired: { ...styles.statusBadge, backgroundColor: '#FEE2E2', color: '#991B1B' }
    };
    return statusStyles[status] || styles.statusBadge;
  };

  const loading = loadingPubs || loadingPatents;

  if (loading) {
    return <div style={styles.loading}>Loading publications & patents...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Publications & Patents</h2>
          <p style={styles.subtitle}>Your research publications and intellectual property</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('publications')}
          style={activeTab === 'publications' ? styles.activeTab : styles.inactiveTab}
        >
          📄 Publications ({publications.length})
        </button>
        <button
          onClick={() => setActiveTab('patents')}
          style={activeTab === 'patents' ? styles.activeTab : styles.inactiveTab}
        >
          ⚖️ Patents ({patents.length})
        </button>
      </div>

      {/* Publications Tab */}
      {activeTab === 'publications' && (
        <div style={styles.tabContent}>
          <div style={styles.tabHeader}>
            <button
              onClick={() => {
                const newShowPubForm = !showPubForm;
                setShowPubForm(newShowPubForm);
                setEditingPub(null);
                if (newShowPubForm) {
                  // Reset form when opening
                  resetPublicationForm();
                }
              }}
              style={styles.addButton}
            >
              {showPubForm && !editingPub ? 'Cancel' : '+ Add Publication'}
            </button>
          </div>

          {/* Add Form */}
          {showPubForm && !editingPub && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Add New Publication</h3>
              <form onSubmit={handlePublicationSubmit}>
                <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                  <label htmlFor="pub-title" style={styles.label}>Title *</label>
                  <input
                    id="pub-title"
                    type="text"
                    value={pubFormData.title}
                    onChange={(e) => setPubFormData({ ...pubFormData, title: e.target.value })}
                    style={styles.input}
                    required
                    placeholder="Publication title"
                  />
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-authors" style={styles.label}>Authors *</label>
                    <input
                      id="pub-authors"
                      type="text"
                      value={pubFormData.authors}
                      onChange={(e) => setPubFormData({ ...pubFormData, authors: e.target.value })}
                      style={styles.input}
                      required
                      placeholder="Comma-separated list"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-type" style={styles.label}>Type *</label>
                    <select
                      id="pub-type"
                      value={pubFormData.publication_type}
                      onChange={(e) => setPubFormData({ ...pubFormData, publication_type: e.target.value as any })}
                      style={styles.select}
                      required
                    >
                      <option value="journal">Journal Article</option>
                      <option value="conference">Conference Paper</option>
                      <option value="book">Book</option>
                      <option value="chapter">Book Chapter</option>
                      <option value="thesis">Thesis/Dissertation</option>
                      <option value="preprint">Preprint</option>
                      <option value="magazine">Magazine Article</option>
                      <option value="blog">Blog Post</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-publisher" style={styles.label}>Publisher/Journal</label>
                    <input
                      id="pub-publisher"
                      type="text"
                      value={pubFormData.publisher || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, publisher: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., IEEE, Springer, etc."
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-date" style={styles.label}>Publication Date *</label>
                    <input
                      id="pub-date"
                      type="date"
                      value={pubFormData.publication_date}
                      onChange={(e) => setPubFormData({ ...pubFormData, publication_date: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-doi" style={styles.label}>DOI</label>
                    <input
                      id="pub-doi"
                      type="text"
                      value={pubFormData.doi || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, doi: e.target.value })}
                      style={styles.input}
                      placeholder="10.1234/example"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="pub-citations" style={styles.label}>Citation Count</label>
                    <input
                      id="pub-citations"
                      type="number"
                      value={pubFormData.citation_count || 0}
                      onChange={(e) => setPubFormData({ ...pubFormData, citation_count: parseInt(e.target.value) || 0 })}
                      style={styles.input}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                  <label htmlFor="pub-url" style={styles.label}>URL</label>
                  <input
                    id="pub-url"
                    type="url"
                    value={pubFormData.url || ''}
                    onChange={(e) => setPubFormData({ ...pubFormData, url: e.target.value })}
                    style={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="pub-description" style={styles.label}>Abstract/Description</label>
                  <textarea
                    id="pub-description"
                    value={pubFormData.description || ''}
                    onChange={(e) => setPubFormData({ ...pubFormData, description: e.target.value })}
                    style={{ ...styles.input, ...styles.textarea }}
                    rows={3}
                    placeholder="Brief abstract or summary..."
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.submitButton} disabled={savingPub}>
                    {savingPub ? 'Saving...' : 'Add Publication'}
                  </button>
                  <button type="button" onClick={resetPublicationForm} style={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Publications List */}
          {publications.length === 0 && !showPubForm ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📄</div>
              <h3 style={styles.emptyTitle}>No publications added yet</h3>
              <p style={styles.emptyText}>
                Click "Add Publication" to showcase your research work!
              </p>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {publications.map((pub) => (
                <div key={pub.id}>
                  {/* Publication Card */}
                  <div style={styles.itemCard}>
                    <div style={styles.itemCardHeader}>
                      <div style={styles.itemContent}>
                        <div style={styles.itemHeader}>
                          <h3 style={styles.itemTitle}>{pub.title}</h3>
                          <span style={styles.typeBadge}>
                            {getPublicationTypeLabel(pub.publication_type)}
                          </span>
                        </div>
                        <p style={styles.authors}>👤 {pub.authors}</p>
                        {pub.publisher && (
                          <p style={styles.publisher}>
                            🏢 {pub.publisher} • 📅 {formatDateDisplay(pub.publication_date)}
                          </p>
                        )}
                        {!pub.publisher && (
                          <p style={styles.publisher}>
                            📅 {formatDateDisplay(pub.publication_date)}
                          </p>
                        )}
                        {pub.doi && (
                          <p style={styles.doi}>
                            🔗 DOI: <code style={styles.code}>{pub.doi}</code>
                          </p>
                        )}
                        {pub.citation_count > 0 && (
                          <p style={styles.citations}>
                            📊 Citations: <strong>{pub.citation_count}</strong>
                          </p>
                        )}
                        {pub.description && (
                          <p style={styles.description}>{pub.description}</p>
                        )}
                        {pub.url && (
                          <a 
                            href={pub.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={styles.link}
                          >
                            🔗 View Publication
                          </a>
                        )}
                      </div>
                      <div style={styles.itemActions}>
                        <button onClick={() => handleEditPublication(pub)} style={styles.editButton} title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDeletePublication(pub.id)} style={styles.deleteButton} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingPub?.id === pub.id && (
                    <div style={{ ...styles.editForm, marginTop: '16px' }}>
                      <h3 style={styles.formTitle}>Edit Publication</h3>
                      <form onSubmit={handlePublicationSubmit}>
                        <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                          <label htmlFor={`pub-title-${pub.id}`} style={styles.label}>Title *</label>
                          <input
                            id={`pub-title-${pub.id}`}
                            type="text"
                            value={pubFormData.title}
                            onChange={(e) => setPubFormData({ ...pubFormData, title: e.target.value })}
                            style={styles.input}
                            required
                            placeholder="Publication title"
                          />
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-authors-${pub.id}`} style={styles.label}>Authors *</label>
                            <input
                              id={`pub-authors-${pub.id}`}
                              type="text"
                              value={pubFormData.authors}
                              onChange={(e) => setPubFormData({ ...pubFormData, authors: e.target.value })}
                              style={styles.input}
                              required
                              placeholder="Comma-separated list"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-type-${pub.id}`} style={styles.label}>Type *</label>
                            <select
                              id={`pub-type-${pub.id}`}
                              value={pubFormData.publication_type}
                              onChange={(e) => setPubFormData({ ...pubFormData, publication_type: e.target.value as any })}
                              style={styles.select}
                              required
                            >
                              <option value="journal">Journal Article</option>
                              <option value="conference">Conference Paper</option>
                              <option value="book">Book</option>
                              <option value="chapter">Book Chapter</option>
                              <option value="thesis">Thesis/Dissertation</option>
                              <option value="preprint">Preprint</option>
                              <option value="magazine">Magazine Article</option>
                              <option value="blog">Blog Post</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-publisher-${pub.id}`} style={styles.label}>Publisher/Journal</label>
                            <input
                              id={`pub-publisher-${pub.id}`}
                              type="text"
                              value={pubFormData.publisher || ''}
                              onChange={(e) => setPubFormData({ ...pubFormData, publisher: e.target.value })}
                              style={styles.input}
                              placeholder="e.g., IEEE, Springer, etc."
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-date-${pub.id}`} style={styles.label}>Publication Date *</label>
                            <input
                              id={`pub-date-${pub.id}`}
                              type="date"
                              value={pubFormData.publication_date}
                              onChange={(e) => setPubFormData({ ...pubFormData, publication_date: e.target.value })}
                              style={styles.input}
                              required
                            />
                          </div>
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-doi-${pub.id}`} style={styles.label}>DOI</label>
                            <input
                              id={`pub-doi-${pub.id}`}
                              type="text"
                              value={pubFormData.doi || ''}
                              onChange={(e) => setPubFormData({ ...pubFormData, doi: e.target.value })}
                              style={styles.input}
                              placeholder="10.1234/example"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`pub-citations-${pub.id}`} style={styles.label}>Citation Count</label>
                            <input
                              id={`pub-citations-${pub.id}`}
                              type="number"
                              value={pubFormData.citation_count || 0}
                              onChange={(e) => setPubFormData({ ...pubFormData, citation_count: parseInt(e.target.value) || 0 })}
                              style={styles.input}
                              min="0"
                            />
                          </div>
                        </div>

                        <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                          <label htmlFor={`pub-url-${pub.id}`} style={styles.label}>URL</label>
                          <input
                            id={`pub-url-${pub.id}`}
                            type="url"
                            value={pubFormData.url || ''}
                            onChange={(e) => setPubFormData({ ...pubFormData, url: e.target.value })}
                            style={styles.input}
                            placeholder="https://..."
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label htmlFor={`pub-description-${pub.id}`} style={styles.label}>Abstract/Description</label>
                          <textarea
                            id={`pub-description-${pub.id}`}
                            value={pubFormData.description || ''}
                            onChange={(e) => setPubFormData({ ...pubFormData, description: e.target.value })}
                            style={{ ...styles.input, ...styles.textarea }}
                            rows={3}
                            placeholder="Brief abstract or summary..."
                          />
                        </div>

                        <div style={styles.formActions}>
                          <button type="submit" style={styles.submitButton} disabled={savingPub}>
                            {savingPub ? 'Saving...' : 'Update Publication'}
                          </button>
                          <button type="button" onClick={resetPublicationForm} style={styles.cancelButton}>
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
      )}

      {/* Patents Tab */}
      {activeTab === 'patents' && (
        <div style={styles.tabContent}>
          <div style={styles.tabHeader}>
            <button
              onClick={() => {
                const newShowPatentForm = !showPatentForm;
                setShowPatentForm(newShowPatentForm);
                setEditingPatent(null);
                if (newShowPatentForm) {
                  // Reset form when opening
                  resetPatentForm();
                }
              }}
              style={styles.addButton}
            >
              {showPatentForm && !editingPatent ? 'Cancel' : '+ Add Patent'}
            </button>
          </div>

          {/* Add Form */}
          {showPatentForm && !editingPatent && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Add New Patent</h3>
              <form onSubmit={handlePatentSubmit}>
                <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                  <label htmlFor="patent-title" style={styles.label}>Title *</label>
                  <input
                    id="patent-title"
                    type="text"
                    value={patentFormData.title}
                    onChange={(e) => setPatentFormData({ ...patentFormData, title: e.target.value })}
                    style={styles.input}
                    required
                    placeholder="Patent title"
                  />
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-inventors" style={styles.label}>Inventors *</label>
                    <input
                      id="patent-inventors"
                      type="text"
                      value={patentFormData.inventors}
                      onChange={(e) => setPatentFormData({ ...patentFormData, inventors: e.target.value })}
                      style={styles.input}
                      required
                      placeholder="Comma-separated list"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-number" style={styles.label}>Patent Number</label>
                    <input
                      id="patent-number"
                      type="text"
                      value={patentFormData.patent_number || ''}
                      onChange={(e) => setPatentFormData({ ...patentFormData, patent_number: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., US1234567"
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-status" style={styles.label}>Status *</label>
                    <select
                      id="patent-status"
                      value={patentFormData.status}
                      onChange={(e) => setPatentFormData({ ...patentFormData, status: e.target.value as any })}
                      style={styles.select}
                      required
                    >
                      <option value="granted">Granted</option>
                      <option value="pending">Pending</option>
                      <option value="filed">Filed</option>
                      <option value="published">Published</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-office" style={styles.label}>Patent Office</label>
                    <input
                      id="patent-office"
                      type="text"
                      value={patentFormData.patent_office || ''}
                      onChange={(e) => setPatentFormData({ ...patentFormData, patent_office: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., USPTO, EPO, etc."
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-filing" style={styles.label}>Filing Date *</label>
                    <input
                      id="patent-filing"
                      type="date"
                      value={patentFormData.filing_date}
                      onChange={(e) => setPatentFormData({ ...patentFormData, filing_date: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="patent-issue" style={styles.label}>Issue Date</label>
                    <input
                      id="patent-issue"
                      type="date"
                      value={patentFormData.issue_date || ''}
                      onChange={(e) => setPatentFormData({ ...patentFormData, issue_date: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                  <label htmlFor="patent-url" style={styles.label}>URL</label>
                  <input
                    id="patent-url"
                    type="url"
                    value={patentFormData.url || ''}
                    onChange={(e) => setPatentFormData({ ...patentFormData, url: e.target.value })}
                    style={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="patent-description" style={styles.label}>Abstract/Description</label>
                  <textarea
                    id="patent-description"
                    value={patentFormData.description || ''}
                    onChange={(e) => setPatentFormData({ ...patentFormData, description: e.target.value })}
                    style={{ ...styles.input, ...styles.textarea }}
                    rows={3}
                    placeholder="Brief abstract or summary..."
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.submitButton} disabled={savingPatent}>
                    {savingPatent ? 'Saving...' : 'Add Patent'}
                  </button>
                  <button type="button" onClick={resetPatentForm} style={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Patents List */}
          {patents.length === 0 && !showPatentForm ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⚖️</div>
              <h3 style={styles.emptyTitle}>No patents added yet</h3>
              <p style={styles.emptyText}>
                Click "Add Patent" to showcase your intellectual property!
              </p>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {patents.map((patent) => (
                <div key={patent.id}>
                  {/* Patent Card */}
                  <div style={styles.itemCard}>
                    <div style={styles.itemCardHeader}>
                      <div style={styles.itemContent}>
                        <div style={styles.itemHeader}>
                          <h3 style={styles.itemTitle}>{patent.title}</h3>
                          <span style={getStatusBadgeStyle(patent.status)}>
                            {patent.status.charAt(0).toUpperCase() + patent.status.slice(1)}
                          </span>
                        </div>
                        <p style={styles.authors}>👤 {patent.inventors}</p>
                        {patent.patent_number && (
                          <p style={styles.patentNumber}>
                            🔑 Patent #: <code style={styles.code}>{patent.patent_number}</code>
                          </p>
                        )}
                        <div style={styles.dateRow}>
                          <p style={styles.dateInfo}>
                            📅 Filed: {formatDateDisplay(patent.filing_date)}
                          </p>
                          {patent.issue_date && (
                            <p style={styles.dateInfo}>
                              ✅ Issued: {formatDateDisplay(patent.issue_date)}
                            </p>
                          )}
                        </div>
                        {patent.patent_office && (
                          <p style={styles.office}>
                            🏢 {patent.patent_office}
                          </p>
                        )}
                        {patent.description && (
                          <p style={styles.description}>{patent.description}</p>
                        )}
                        {patent.url && (
                          <a 
                            href={patent.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={styles.link}
                          >
                            🔗 View Patent
                          </a>
                        )}
                      </div>
                      <div style={styles.itemActions}>
                        <button onClick={() => handleEditPatent(patent)} style={styles.editButton} title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDeletePatent(patent.id)} style={styles.deleteButton} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingPatent?.id === patent.id && (
                    <div style={{ ...styles.editForm, marginTop: '16px' }}>
                      <h3 style={styles.formTitle}>Edit Patent</h3>
                      <form onSubmit={handlePatentSubmit}>
                        <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                          <label htmlFor={`patent-title-${patent.id}`} style={styles.label}>Title *</label>
                          <input
                            id={`patent-title-${patent.id}`}
                            type="text"
                            value={patentFormData.title}
                            onChange={(e) => setPatentFormData({ ...patentFormData, title: e.target.value })}
                            style={styles.input}
                            required
                            placeholder="Patent title"
                          />
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-inventors-${patent.id}`} style={styles.label}>Inventors *</label>
                            <input
                              id={`patent-inventors-${patent.id}`}
                              type="text"
                              value={patentFormData.inventors}
                              onChange={(e) => setPatentFormData({ ...patentFormData, inventors: e.target.value })}
                              style={styles.input}
                              required
                              placeholder="Comma-separated list"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-number-${patent.id}`} style={styles.label}>Patent Number</label>
                            <input
                              id={`patent-number-${patent.id}`}
                              type="text"
                              value={patentFormData.patent_number || ''}
                              onChange={(e) => setPatentFormData({ ...patentFormData, patent_number: e.target.value })}
                              style={styles.input}
                              placeholder="e.g., US1234567"
                            />
                          </div>
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-status-${patent.id}`} style={styles.label}>Status *</label>
                            <select
                              id={`patent-status-${patent.id}`}
                              value={patentFormData.status}
                              onChange={(e) => setPatentFormData({ ...patentFormData, status: e.target.value as any })}
                              style={styles.select}
                              required
                            >
                              <option value="granted">Granted</option>
                              <option value="pending">Pending</option>
                              <option value="filed">Filed</option>
                              <option value="published">Published</option>
                              <option value="expired">Expired</option>
                            </select>
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-office-${patent.id}`} style={styles.label}>Patent Office</label>
                            <input
                              id={`patent-office-${patent.id}`}
                              type="text"
                              value={patentFormData.patent_office || ''}
                              onChange={(e) => setPatentFormData({ ...patentFormData, patent_office: e.target.value })}
                              style={styles.input}
                              placeholder="e.g., USPTO, EPO, etc."
                            />
                          </div>
                        </div>

                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-filing-${patent.id}`} style={styles.label}>Filing Date *</label>
                            <input
                              id={`patent-filing-${patent.id}`}
                              type="date"
                              value={patentFormData.filing_date}
                              onChange={(e) => setPatentFormData({ ...patentFormData, filing_date: e.target.value })}
                              style={styles.input}
                              required
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label htmlFor={`patent-issue-${patent.id}`} style={styles.label}>Issue Date</label>
                            <input
                              id={`patent-issue-${patent.id}`}
                              type="date"
                              value={patentFormData.issue_date || ''}
                              onChange={(e) => setPatentFormData({ ...patentFormData, issue_date: e.target.value })}
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div style={{ ...styles.formGroup, marginBottom: '16px' }}>
                          <label htmlFor={`patent-url-${patent.id}`} style={styles.label}>URL</label>
                          <input
                            id={`patent-url-${patent.id}`}
                            type="url"
                            value={patentFormData.url || ''}
                            onChange={(e) => setPatentFormData({ ...patentFormData, url: e.target.value })}
                            style={styles.input}
                            placeholder="https://..."
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label htmlFor={`patent-description-${patent.id}`} style={styles.label}>Abstract/Description</label>
                          <textarea
                            id={`patent-description-${patent.id}`}
                            value={patentFormData.description || ''}
                            onChange={(e) => setPatentFormData({ ...patentFormData, description: e.target.value })}
                            style={{ ...styles.input, ...styles.textarea }}
                            rows={3}
                            placeholder="Brief abstract or summary..."
                          />
                        </div>

                        <div style={styles.formActions}>
                          <button type="submit" style={styles.submitButton} disabled={savingPatent}>
                            {savingPatent ? 'Saving...' : 'Update Patent'}
                          </button>
                          <button type="button" onClick={resetPatentForm} style={styles.cancelButton}>
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
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #E5E7EB',
  },
  activeTab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid #4F46E5',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  inactiveTab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  tabContent: {
    minHeight: '200px',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
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
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
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
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    transition: 'box-shadow 0.2s',
  },
  itemCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  itemTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  authors: {
    fontSize: '14px',
    color: '#4B5563',
    margin: '0 0 8px 0',
  },
  publisher: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  doi: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  citations: {
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
  patentNumber: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  dateRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '8px',
  },
  dateInfo: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  office: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  itemActions: {
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

export default PublicationsPatentsSection;
