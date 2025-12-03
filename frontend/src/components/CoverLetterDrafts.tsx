import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import coverLetterService, { CoverLetter } from '../services/coverLetter.service';

const CoverLetterDrafts: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<CoverLetter | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await coverLetterService.listDrafts();
      setDrafts(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await coverLetterService.deleteDraft(id);
      setDrafts(drafts.filter(d => d.id !== id));
      if (selectedDraft?.id === id) {
        setSelectedDraft(null);
      }
      alert('Draft deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete draft');
    }
  };

  const handleDownload = (draft: CoverLetter) => {
    const element = document.createElement('a');
    const file = new Blob([draft.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${draft.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = (draft: CoverLetter) => {
    const content = draft.content;
    const template = getTemplateStyles(
      draft.template_style,
      draft.font_family,
      draft.font_size,
      draft.text_align
    );
    
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      alert('Please allow pop-ups to download PDF');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${draft.title}</title>
        <style>
          ${template.styles}
        </style>
      </head>
      <body>
        ${template.render(content)}
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
  };

  const convertMarkdownToHtml = (text: string): string => {
    const paragraphs = text.split(/\n\s*\n/);
    const formattedParagraphs = paragraphs.map(para => {
      let formatted = para
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');
      return formatted.trim() ? `<p>${formatted}</p>` : '';
    }).filter(p => p);
    return formattedParagraphs.join('\n');
  };

  const getTemplateStyles = (
    templateName: string,
    font: string,
    size: string,
    align: string
  ) => {
    const fontSizes = {
      small: '11pt',
      medium: '12pt',
      large: '13pt'
    };
    
    const fontSize = fontSizes[size as keyof typeof fontSizes] || '12pt';
    
    const getFontFamily = (fontName: string) => {
      switch(fontName) {
        case 'Arial':
          return 'Arial, Helvetica, sans-serif';
        case 'Times New Roman':
          return '"Times New Roman", Times, serif';
        case 'Georgia':
          return 'Georgia, serif';
        case 'Garamond':
          return 'Garamond, "Hoefler Text", "Times New Roman", serif';
        case 'Trebuchet MS':
          return '"Trebuchet MS", "Lucida Grande", sans-serif';
        default:
          return 'Arial, sans-serif';
      }
    };
    
    const fontFamily = getFontFamily(font);
    
    const templates = {
      professional: {
        styles: `
          @page { margin: 2cm; }
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 2cm;
          }
          .cover-letter {
            max-width: 21cm;
            margin: 0 auto;
            text-align: ${align};
          }
          .content {
            white-space: pre-wrap;
          }
          p {
            margin-bottom: 0.3em;
            margin-top: 0;
          }
          br {
            display: block;
            margin: 0.05em 0;
            content: "";
          }
          strong { font-weight: bold; }
          em { font-style: italic; }
          u { text-decoration: underline; }
        `,
        render: (content: string) => `
          <div class="cover-letter">
            <div class="content">${convertMarkdownToHtml(content)}</div>
          </div>
        `
      },
      modern: {
        styles: `
          @page { margin: 1.5cm; }
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 1.5cm;
            background: #fff;
          }
          .cover-letter {
            max-width: 21cm;
            margin: 0 auto;
            position: relative;
            text-align: ${align};
          }
          .accent-bar {
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #667eea, #764ba2);
            position: absolute;
            left: -20px;
            top: 0;
          }
          .content {
            white-space: pre-wrap;
            padding-left: 20px;
          }
          p {
            margin-bottom: 0.3em;
            margin-top: 0;
          }
          br {
            display: block;
            margin: 0.05em 0;
            content: "";
          }
          strong { font-weight: bold; color: #667eea; }
          em { font-style: italic; }
          u { text-decoration: underline; }
        `,
        render: (content: string) => `
          <div class="cover-letter">
            <div class="accent-bar"></div>
            <div class="content">${convertMarkdownToHtml(content)}</div>
          </div>
        `
      },
      creative: {
        styles: `
          @page { margin: 2cm; }
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.5;
            color: #2d3748;
            margin: 0;
            padding: 2cm;
            background: #fff;
          }
          .cover-letter {
            max-width: 21cm;
            margin: 0 auto;
            border-top: 3px solid #667eea;
            border-bottom: 3px solid #667eea;
            padding: 2em 0;
            text-align: ${align};
          }
          .content {
            white-space: pre-wrap;
          }
          .content::first-letter {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            float: left;
            line-height: 1;
            margin-right: 0.1em;
          }
          p {
            margin-bottom: 0.3em;
            margin-top: 0;
          }
          br {
            display: block;
            margin: 0.05em 0;
            content: "";
          }
          strong { font-weight: bold; }
          em { font-style: italic; }
          u { text-decoration: underline; }
        `,
        render: (content: string) => `
          <div class="cover-letter">
            <div class="content">${convertMarkdownToHtml(content)}</div>
          </div>
        `
      },
      header: {
        styles: `
          @page { margin: 0; }
          body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .cover-letter {
            max-width: 21cm;
            margin: 0 auto;
          }
          .header-bar {
            background: linear-gradient(135deg, #2d3561 0%, #4a5578 100%);
            padding: 30px 40px;
            color: white;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .name-section {
            flex: 1;
          }
          .name {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
          }
          .title {
            font-size: 11pt;
            margin: 0;
            opacity: 0.9;
            font-weight: 400;
            line-height: 1.4;
          }
          .title strong { font-weight: 700; }
          .title em { font-style: italic; }
          .title u { text-decoration: underline; }
          .name strong { font-weight: 900; }
          .name em { font-style: italic; }
          .name u { text-decoration: underline; }
          .content-area {
            padding: 40px;
            text-align: ${align};
          }
          .content {
            white-space: pre-wrap;
            line-height: 1.5;
          }
          .content p {
            margin-bottom: 0.15em;
            margin-top: 0;
          }
          .content br {
            display: block;
            margin: 0.05em 0;
            content: "";
          }
          .content strong { font-weight: 600; }
          .content em { font-style: italic; }
          .content u { text-decoration: underline; }
          .footer-bar {
            background: linear-gradient(135deg, #4a5578 0%, #2d3561 100%);
            height: 15px;
            margin-top: 40px;
          }
        `,
        render: (content: string) => {
          const lines = content.split('\n').filter(line => line.trim());
          const convertMarkdownInline = (text: string): string => {
            return text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/__(.*?)__/g, '<u>$1</u>');
          };
          
          let name = 'Your Name';
          let email = '';
          let phone = '';
          let contentStartIndex = 0;
          
          for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].trim();
            if (i === 0 && line) {
              name = convertMarkdownInline(line);
              contentStartIndex = 1;
            }
            if (line.includes('@') && line.includes('.')) {
              email = convertMarkdownInline(line);
              contentStartIndex = Math.max(contentStartIndex, i + 1);
            }
            if (/[\d\(\)\-\s]{10,}/.test(line) && /\d{3}/.test(line)) {
              phone = convertMarkdownInline(line);
              contentStartIndex = Math.max(contentStartIndex, i + 1);
            }
          }
          
          const letterContent = lines.slice(contentStartIndex).join('\n\n');
          
          return `
          <div class="cover-letter">
            <div class="header-bar">
              <div class="header-content">
                <div class="name-section">
                  <div class="name">${name}</div>
                  ${email ? `<div class="title">${email}</div>` : ''}
                  ${phone ? `<div class="title">${phone}</div>` : ''}
                </div>
              </div>
            </div>
            <div class="content-area">
              <div class="content">${convertMarkdownToHtml(letterContent)}</div>
            </div>
            <div class="footer-bar"></div>
          </div>
          `;
        }
      }
    };
    
    return templates[templateName as keyof typeof templates] || templates.professional;
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <h1 style={styles.title}>My Cover Letter Drafts</h1>
      <p style={styles.subtitle}>
        View, download, and manage your saved cover letter drafts
      </p>

      {loading ? (
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Loading your drafts...</p>
        </div>
      ) : error ? (
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Error</h3>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadDrafts} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : drafts.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>📝</div>
          <h3 style={styles.emptyTitle}>No Drafts Yet</h3>
          <p style={styles.emptyText}>
            You haven't saved any cover letter drafts yet. Create one in the Cover Letter Maker!
          </p>
          <button
            onClick={() => navigate('/dashboard/coverletter')}
            style={styles.createButton}
          >
            Create Cover Letter
          </button>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Drafts ({drafts.length})</h3>
            </div>
            <div style={styles.draftsList}>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  style={{
                    ...styles.draftItem,
                    ...(selectedDraft?.id === draft.id ? styles.draftItemActive : {}),
                  }}
                  onClick={() => setSelectedDraft(draft)}
                >
                  <div style={styles.draftItemIcon}>📄</div>
                  <div style={styles.draftItemContent}>
                    <div style={styles.draftItemTitle}>{draft.title}</div>
                    <div style={styles.draftItemMeta}>
                      {draft.company_name && <span>{draft.company_name} • </span>}
                      {new Date(draft.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.previewPanel}>
            {selectedDraft ? (
              <>
                <div style={styles.previewHeader}>
                  <div>
                    <h2 style={styles.previewTitle}>{selectedDraft.title}</h2>
                    <div style={styles.previewMeta}>
                      {selectedDraft.role && (
                        <span style={styles.metaItem}>
                          <strong>Role:</strong> {selectedDraft.role}
                        </span>
                      )}
                      {selectedDraft.company_name && (
                        <span style={styles.metaItem}>
                          <strong>Company:</strong> {selectedDraft.company_name}
                        </span>
                      )}
                      <span style={styles.metaItem}>
                        <strong>Template:</strong> {selectedDraft.template_style}
                      </span>
                      <span style={styles.metaItem}>
                        <strong>Created:</strong> {new Date(selectedDraft.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.previewContent}>
                  <div style={styles.contentBox}>
                    {selectedDraft.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} style={styles.paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div style={styles.previewActions}>
                  <button
                    onClick={() => handleDownload(selectedDraft)}
                    style={styles.actionButton}
                  >
                    📄 Download TXT
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(selectedDraft)}
                    style={styles.actionButtonPrimary}
                  >
                    📑 Download PDF
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(selectedDraft.id)}
                    style={styles.deleteButton}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.emptyPreview}>
                <div style={styles.emptyPreviewIcon}>👈</div>
                <p style={styles.emptyPreviewText}>
                  Select a draft from the list to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
  },
  backButton: {
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    transition: 'all 0.2s',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '12px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    margin: '0 auto 20px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#e53e3e',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  createButton: {
    padding: '14px 32px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  content: {
    display: 'flex',
    gap: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    minHeight: '600px',
  },
  sidebar: {
    width: '350px',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f7fafc',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  draftsList: {
    flex: 1,
    overflowY: 'auto',
  },
  draftItem: {
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  draftItemActive: {
    backgroundColor: '#f0f4ff',
    borderLeft: '4px solid #667eea',
  },
  draftItemIcon: {
    fontSize: '24px',
  },
  draftItemContent: {
    flex: 1,
  },
  draftItemTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px',
  },
  draftItemMeta: {
    fontSize: '13px',
    color: '#718096',
  },
  previewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  previewHeader: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
  },
  previewTitle: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  previewMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  metaItem: {
    fontSize: '14px',
    color: '#718096',
  },
  previewContent: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '24px',
  },
  contentBox: {
    backgroundColor: '#f7fafc',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    lineHeight: '1.8',
  },
  paragraph: {
    marginBottom: '16px',
    color: '#2d3748',
  },
  previewActions: {
    display: 'flex',
    gap: '12px',
  },
  actionButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionButtonPrimary: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyPreview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyPreviewText: {
    fontSize: '16px',
    color: '#718096',
  },
};

export default CoverLetterDrafts;
