import React, { useState } from 'react';
import resumeService, { Resume } from '../services/resume.service';
import api from '../services/api';


const CoverLetterMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'editor'>('upload');
  
  // Upload step state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);
  
  // Form step state
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Editor step state
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState('');
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'modern' | 'creative' | 'header'>('professional');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  // Formatting state
  const [fontFamily, setFontFamily] = useState<'Arial' | 'Times New Roman' | 'Georgia' | 'Garamond' | 'Trebuchet MS'>('Arial');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'justify'>('left');


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };


  const handleUploadResume = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const result = await resumeService.uploadResume(selectedFile);
      setUploadedResume(result);
      setCurrentStep('form');
    } catch (error: any) {
      alert(`Failed to upload resume: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const handleGenerateCoverLetter = async () => {
    if (!role || !jobDescription || !uploadedResume) {
      alert('Please fill in the required fields');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await api.post('/api/resume/generate-cover-letter/', {
        resume_id: uploadedResume.id,
        role,
        company_name: companyName,
        job_description: jobDescription,
      });
      
      setGeneratedCoverLetter(response.data.cover_letter);
      setEditedCoverLetter(response.data.cover_letter);
      setCurrentStep('editor');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate cover letter';
      alert(`Failed to generate cover letter: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editedCoverLetter);
    alert('Cover letter copied to clipboard!');
  };


  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedCoverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${role.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = () => {
    const content = editedCoverLetter;
    const template = getTemplateStyles(selectedTemplate, fontFamily, fontSize, textAlign);
    
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      alert('Please allow pop-ups to download PDF');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cover Letter</title>
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

  const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedCoverLetter.substring(start, end);
    
    if (!selectedText) {
      alert('Please select text to format');
      return;
    }
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }
    
    const newText = 
      editedCoverLetter.substring(0, start) + 
      formattedText + 
      editedCoverLetter.substring(end);
    
    setEditedCoverLetter(newText);
  };

  const convertMarkdownToHtml = (text: string): string => {
    // Split into paragraphs (double line breaks)
    const paragraphs = text.split(/\n\s*\n/);
    
    // Convert each paragraph
    const formattedParagraphs = paragraphs.map(para => {
      // Apply formatting within paragraph
      let formatted = para
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');
      
      // Wrap in paragraph tags if not empty
      return formatted.trim() ? `<p>${formatted}</p>` : '';
    }).filter(p => p); // Remove empty paragraphs
    
    return formattedParagraphs.join('\n');
  };

  const getTemplateStyles = (templateName: string, font: string, size: string, align: string) => {
    const fontSizes = {
      small: '11pt',
      medium: '12pt',
      large: '13pt'
    };
    
    const fontSize = fontSizes[size as keyof typeof fontSizes];
    
    // Get proper font-family with fallbacks
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
    
    // Add Google Fonts import for Calibri alternative (Carlito)
    const fontImport = font === 'Calibri' ? '@import url(\'https://fonts.googleapis.com/css2?family=Carlito&display=swap\');' : '';
    
    const templates = {
      professional: {
        styles: `
          ${fontImport}
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
          ${fontImport}
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
          ${fontImport}
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
          ${fontImport}
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
          .contact-info {
            text-align: right;
            font-size: 9pt;
            line-height: 1.8;
            display: none;
          }
          .contact-item {
            margin: 3px 0;
            display: block;
          }
          .contact-label {
            display: inline-block;
            width: 15px;
            font-weight: bold;
            margin-right: 8px;
          }
          .content-area {
            padding: 40px;
            text-align: ${align};
          }
          .content {
            white-space: pre-wrap;
            line-height: 1.5;
          }
          .content p {
            margin-bottom: 0.3em;
            margin-top: 0;
          }
          .content br {
            display: block;
            margin: 0.05em 0;
            content: "";
          }
          .footer-bar {
            background: linear-gradient(135deg, #4a5578 0%, #2d3561 100%);
            height: 15px;
            margin-top: 40px;
          }
          strong { font-weight: 600; }
          em { font-style: italic; }
          u { text-decoration: underline; }
        `,
        render: (content: string) => {
          // Extract contact info from content
          const lines = content.split('\n').filter(line => line.trim());
          
          // Find name, email, and phone
          let name = 'Your Name';
          let email = '';
          let phone = '';
          
          // Find and extract name, email, and phone
          let contentStartIndex = 0;
          
          for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].trim();
            
            // Check for name (first non-empty line)
            if (i === 0 && line) {
              name = line;
              contentStartIndex = 1;
            }
            
            // Check for email
            if (line.includes('@') && line.includes('.')) {
              email = line;
              contentStartIndex = Math.max(contentStartIndex, i + 1);
            }
            
            // Check for phone number
            if (/[\d\(\)\-\s]{10,}/.test(line) && /\d{3}/.test(line)) {
              phone = line;
              contentStartIndex = Math.max(contentStartIndex, i + 1);
            }
          }
          
          // Get the actual letter content (skip header info)
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


  const isFormValid = role.trim() !== '' && jobDescription.trim() !== '';


  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>


      <h1 style={styles.title}>Cover Letter Maker</h1>
      <p style={styles.subtitle}>Create a personalized cover letter for your job application</p>


      {/* Progress Indicator */}
      <div style={styles.progressContainer}>
        <div style={{...styles.progressStep, ...(currentStep === 'upload' ? styles.progressStepActive : {})}}>
          <div style={styles.progressNumber}>1</div>
          <div style={styles.progressLabel}>Upload Resume</div>
        </div>
        <div style={styles.progressLine}></div>
        <div style={{...styles.progressStep, ...(currentStep === 'form' ? styles.progressStepActive : {})}}>
          <div style={styles.progressNumber}>2</div>
          <div style={styles.progressLabel}>Job Details</div>
        </div>
        <div style={styles.progressLine}></div>
        <div style={{...styles.progressStep, ...(currentStep === 'editor' ? styles.progressStepActive : {})}}>
          <div style={styles.progressNumber}>3</div>
          <div style={styles.progressLabel}>Edit & Export</div>
        </div>
      </div>


      {/* Step 1: Upload Resume */}
      {currentStep === 'upload' && (
        <div style={styles.formCard}>
          <div style={styles.headerSection}>
            <div style={styles.iconWrapper}>
              <span style={styles.formIcon}>📄</span>
            </div>
            <h3 style={styles.formTitle}>Upload Your Resume</h3>
            <p style={styles.formSubtitle}>
              We'll use your resume data to create a personalized cover letter
            </p>
          </div>
          
          <div style={styles.uploadSection}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={styles.fileInput}
              id="resume-upload"
            />
            <label htmlFor="resume-upload" style={styles.fileInputLabel}>
              {selectedFile ? (
                <>
                  <span style={styles.fileIcon}>✓</span>
                  <span>{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <span style={styles.fileIcon}>📎</span>
                  <span>Click to select PDF resume</span>
                </>
              )}
            </label>
            
            <button
              onClick={handleUploadResume}
              disabled={!selectedFile || isUploading}
              style={{
                ...styles.submitButton,
                ...(!selectedFile || isUploading ? styles.submitButtonDisabled : {})
              }}
            >
              {isUploading ? 'Uploading & Parsing...' : 'Upload Resume'}
            </button>
          </div>
        </div>
      )}


      {/* Step 2: Job Details Form */}
      {currentStep === 'form' && (
        <div style={styles.formCard}>
          <button 
            onClick={() => {
              setCurrentStep('upload');
              setSelectedFile(null);
            }} 
            style={styles.stepBackButton}
          >
            ← Back to Upload
          </button>
          
          <div style={styles.headerSection}>
            <div style={styles.iconWrapper}>
              <span style={styles.formIcon}>✍️</span>
            </div>
            <h3 style={styles.formTitle}>Job Application Details</h3>
            <p style={styles.formSubtitle}>
              Provide the job details and we'll craft a compelling cover letter for you
            </p>
          </div>


          <div style={styles.formContent}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Role / Position
                <span style={styles.requiredTag}>*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer, Product Manager, Data Analyst"
                style={styles.formInput}
              />
              <small style={styles.formHint}>
                The specific position you're applying for
              </small>
            </div>


            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Company Name
                <span style={styles.optionalTag}>(Optional)</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Microsoft, Amazon"
                style={styles.formInput}
              />
              <small style={styles.formHint}>
                The company you're applying to
              </small>
            </div>


            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Job Description
                <span style={styles.requiredTag}>*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here. Include key responsibilities, required skills, and qualifications..."
                style={styles.formTextarea}
                rows={8}
              />
              <small style={styles.formHint}>
                Copy and paste the complete job description to help us tailor your cover letter
              </small>
            </div>


            {uploadedResume?.structured_data && (
              <div style={styles.resumeDataPreview}>
                <h4 style={styles.previewTitle}>✓ Your Resume Data</h4>
                <p style={styles.previewText}>
                  <strong>Name:</strong> {uploadedResume.structured_data.name || 'N/A'}
                </p>
                <p style={styles.previewText}>
                  <strong>Email:</strong> {uploadedResume.structured_data.email || 'N/A'}
                </p>
                <p style={styles.previewText}>
                  <strong>Skills:</strong> {uploadedResume.structured_data.skills?.slice(0, 5).join(', ') || 'N/A'}
                </p>
              </div>
            )}


            <div style={styles.buttonContainer}>
              <button
                onClick={handleGenerateCoverLetter}
                style={{
                  ...styles.submitButton,
                  ...(isFormValid ? {} : styles.submitButtonDisabled)
                }}
                disabled={!isFormValid || isGenerating}
              >
                {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter ✨'}
              </button>
            </div>


            <div style={styles.noteSection}>
              <p style={styles.noteText}>
                💡 <strong>Pro Tip:</strong> The AI will automatically use your resume data to personalize the cover letter!
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Step 3: Editor */}
      {currentStep === 'editor' && (
        <div style={styles.formCard}>
          <button 
            onClick={() => setCurrentStep('form')} 
            style={styles.stepBackButton}
          >
            ← Back to Job Details
          </button>
          
          <div style={styles.headerSection}>
            <div style={styles.iconWrapper}>
              <span style={styles.formIcon}>📝</span>
            </div>
            <h3 style={styles.formTitle}>Your Cover Letter</h3>
            <p style={styles.formSubtitle}>
              Review, edit, and choose a template for your cover letter
            </p>
          </div>

          {/* Template Selection */}
          <div style={styles.templateSection}>
            <h4 style={styles.templateSectionTitle}>Choose a Template Style</h4>
            <div style={styles.templateGrid}>
              <div 
                style={{
                  ...styles.templateCard,
                  ...(selectedTemplate === 'professional' ? styles.templateCardActive : {})
                }}
                onClick={() => setSelectedTemplate('professional')}
              >
                <div style={styles.templateIcon}>📋</div>
                <div style={styles.templateName}>Professional</div>
                <div style={styles.templateDescription}>Classic serif font, formal layout</div>
              </div>
              
              <div 
                style={{
                  ...styles.templateCard,
                  ...(selectedTemplate === 'modern' ? styles.templateCardActive : {})
                }}
                onClick={() => setSelectedTemplate('modern')}
              >
                <div style={styles.templateIcon}>✨</div>
                <div style={styles.templateName}>Modern</div>
                <div style={styles.templateDescription}>Clean sans-serif, accent bar</div>
              </div>
              
              <div 
                style={{
                  ...styles.templateCard,
                  ...(selectedTemplate === 'creative' ? styles.templateCardActive : {})
                }}
                onClick={() => setSelectedTemplate('creative')}
              >
                <div style={styles.templateIcon}>🎨</div>
                <div style={styles.templateName}>Creative</div>
                <div style={styles.templateDescription}>Elegant with decorative borders</div>
              </div>
              
              <div 
                style={{
                  ...styles.templateCard,
                  ...(selectedTemplate === 'header' ? styles.templateCardActive : {})
                }}
                onClick={() => setSelectedTemplate('header')}
              >
                <div style={styles.templateIcon}>📰</div>
                <div style={styles.templateName}>Header Style</div>
                <div style={styles.templateDescription}>Professional with header bar</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowTemplatePreview(true)} 
              style={styles.previewButton}
            >
              👁️ Preview Template
            </button>
          </div>

          {/* Formatting Options */}
          <div style={styles.formattingSection}>
            <h4 style={styles.templateSectionTitle}>Formatting Options</h4>
            
            <div style={styles.formattingGrid}>
              <div style={styles.formattingGroup}>
                <label style={styles.formattingLabel}>Font Family</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  style={styles.formattingSelect}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Garamond">Garamond</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                </select>
              </div>
              
              <div style={styles.formattingGroup}>
                <label style={styles.formattingLabel}>Font Size</label>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(e.target.value as any)}
                  style={styles.formattingSelect}
                >
                  <option value="small">Small (11pt)</option>
                  <option value="medium">Medium (12pt)</option>
                  <option value="large">Large (13pt)</option>
                </select>
              </div>
              
              <div style={styles.formattingGroup}>
                <label style={styles.formattingLabel}>Text Alignment</label>
                <select 
                  value={textAlign} 
                  onChange={(e) => setTextAlign(e.target.value as any)}
                  style={styles.formattingSelect}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
            
            <div style={styles.textFormattingToolbar}>
              <div style={styles.toolbarLabel}>Text Formatting (select text first):</div>
              <div style={styles.toolbarButtons}>
                <button 
                  onClick={() => applyFormatting('bold')} 
                  style={styles.toolbarButton}
                  title="Make selected text bold"
                >
                  <strong>B</strong>
                </button>
                <button 
                  onClick={() => applyFormatting('italic')} 
                  style={styles.toolbarButton}
                  title="Make selected text italic"
                >
                  <em>I</em>
                </button>
                <button 
                  onClick={() => applyFormatting('underline')} 
                  style={styles.toolbarButton}
                  title="Underline selected text"
                >
                  <u>U</u>
                </button>
              </div>
              <div style={styles.toolbarHint}>
                💡 Select text in the editor below and click formatting buttons
              </div>
            </div>
          </div>

          <div style={styles.editorSection}>
            <textarea
              value={editedCoverLetter}
              onChange={(e) => setEditedCoverLetter(e.target.value)}
              style={styles.editor}
              rows={20}
            />
          </div>

          <div style={styles.editorActions}>
            <button onClick={handleCopyToClipboard} style={styles.actionButton}>
              📋 Copy to Clipboard
            </button>
            <button onClick={handleDownload} style={styles.actionButton}>
              📄 Download as TXT
            </button>
            <button onClick={handleDownloadPDF} style={styles.actionButton}>
              📕 Download as PDF ({selectedTemplate})
            </button>
            <button 
              onClick={() => {
                setCurrentStep('form');
                setRole('');
                setCompanyName('');
                setJobDescription('');
              }} 
              style={styles.actionButtonSecondary}
            >
              ✏️ Create Another
            </button>
          </div>
        </div>
      )}
      
      {/* Template Preview Modal */}
      {showTemplatePreview && (
        <div style={styles.modalOverlay} onClick={() => setShowTemplatePreview(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Template Preview - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}</h3>
              <button 
                onClick={() => setShowTemplatePreview(false)} 
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.previewFrame}>
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Cover Letter Preview</title>
                      <style>
                        ${getTemplateStyles(selectedTemplate, fontFamily, fontSize, textAlign).styles}
                      </style>
                    </head>
                    <body>
                      ${getTemplateStyles(selectedTemplate, fontFamily, fontSize, textAlign).render(editedCoverLetter)}
                    </body>
                    </html>
                  `}
                  style={styles.previewIframe}
                  title="Template Preview"
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowTemplatePreview(false)} 
                style={styles.modalActionButton}
              >
                Close Preview
              </button>
              <button 
                onClick={() => {
                  setShowTemplatePreview(false);
                  handleDownloadPDF();
                }} 
                style={styles.modalPrimaryButton}
              >
                Download This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   maxWidth: '900px',
   margin: '0 auto',
   padding: '20px',
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
 // Progress indicator
 progressContainer: {
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   marginBottom: '48px',
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
   padding: '24px',
   borderRadius: '12px',
 },
 progressStep: {
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   opacity: 0.5,
 },
 progressStepActive: {
   opacity: 1,
 },
 progressNumber: {
   width: '40px',
   height: '40px',
   borderRadius: '50%',
   backgroundColor: 'white',
   color: '#667eea',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   fontWeight: 'bold',
   marginBottom: '8px',
 },
 progressLabel: {
   color: 'white',
   fontSize: '14px',
   fontWeight: '500',
 },
 progressLine: {
   height: '2px',
   width: '100px',
   backgroundColor: 'rgba(255, 255, 255, 0.3)',
   margin: '0 20px',
   marginBottom: '30px',
 },
 // Upload section
 uploadSection: {
   textAlign: 'center',
   padding: '40px',
 },
 fileInput: {
   display: 'none',
 },
 fileInputLabel: {
   display: 'inline-block',
   padding: '20px 40px',
   backgroundColor: '#f7fafc',
   border: '2px dashed #cbd5e0',
   borderRadius: '12px',
   cursor: 'pointer',
   marginBottom: '24px',
   transition: 'all 0.3s',
   fontSize: '16px',
   color: '#4a5568',
 },
 fileIcon: {
   fontSize: '24px',
   marginRight: '12px',
 },
 formCard: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '48px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
   position: 'relative',
 },
 stepBackButton: {
   position: 'absolute',
   top: '24px',
   left: '24px',
   backgroundColor: 'transparent',
   color: '#667eea',
   border: 'none',
   padding: '8px 16px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'all 0.2s',
   display: 'flex',
   alignItems: 'center',
   gap: '4px',
 },
 headerSection: {
   textAlign: 'center',
   marginBottom: '40px',
   paddingBottom: '32px',
   borderBottom: '2px solid #f7fafc',
 },
 iconWrapper: {
   marginBottom: '16px',
 },
 formIcon: {
   fontSize: '48px',
 },
 formTitle: {
   fontSize: '28px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '12px',
 },
 formSubtitle: {
   fontSize: '15px',
   color: '#718096',
   lineHeight: '1.6',
 },
 formContent: {
   // Container for all form fields
 },
 formGroup: {
   marginBottom: '28px',
 },
 formLabel: {
   display: 'block',
   fontSize: '15px',
   fontWeight: '600',
   color: '#2d3748',
   marginBottom: '10px',
 },
 requiredTag: {
   fontSize: '14px',
   fontWeight: '600',
   color: '#e53e3e',
   marginLeft: '4px',
 },
 optionalTag: {
   fontSize: '12px',
   fontWeight: '400',
   color: '#a0aec0',
   marginLeft: '8px',
 },
 formInput: {
   width: '100%',
   padding: '14px 16px',
   fontSize: '15px',
   border: '2px solid #e2e8f0',
   borderRadius: '10px',
   outline: 'none',
   transition: 'all 0.2s',
   fontFamily: 'inherit',
   boxSizing: 'border-box',
 },
 formTextarea: {
   width: '100%',
   padding: '14px 16px',
   fontSize: '15px',
   border: '2px solid #e2e8f0',
   borderRadius: '10px',
   outline: 'none',
   transition: 'all 0.2s',
   fontFamily: 'inherit',
   resize: 'vertical',
   lineHeight: '1.6',
   boxSizing: 'border-box',
 },
 formHint: {
   display: 'block',
   fontSize: '13px',
   color: '#a0aec0',
   marginTop: '8px',
   lineHeight: '1.5',
 },
 resumeDataPreview: {
   backgroundColor: '#f0fdf4',
   border: '2px solid #86efac',
   borderRadius: '10px',
   padding: '20px',
   marginBottom: '24px',
 },
 previewTitle: {
   color: '#166534',
   marginBottom: '12px',
   fontSize: '16px',
 },
 previewText: {
   color: '#15803d',
   fontSize: '14px',
   marginBottom: '8px',
 },
 buttonContainer: {
   marginTop: '40px',
   marginBottom: '24px',
 },
 submitButton: {
   width: '100%',
   padding: '16px 32px',
   backgroundColor: '#667eea',
   color: 'white',
   border: 'none',
   borderRadius: '12px',
   fontWeight: '600',
   fontSize: '17px',
   cursor: 'pointer',
   transition: 'all 0.3s ease',
   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
 },
 submitButtonDisabled: {
   backgroundColor: '#cbd5e0',
   cursor: 'not-allowed',
   boxShadow: 'none',
 },
 noteSection: {
   backgroundColor: '#f7fafc',
   padding: '20px',
   borderRadius: '10px',
   border: '1px solid #e2e8f0',
 },
 noteText: {
   fontSize: '14px',
   color: '#4a5568',
   lineHeight: '1.6',
   margin: 0,
 },
 // Editor section
 editorSection: {
   marginBottom: '24px',
 },
 editor: {
   width: '100%',
   padding: '20px',
   fontSize: '15px',
   border: '2px solid #e2e8f0',
   borderRadius: '10px',
   outline: 'none',
   fontFamily: 'inherit',
   lineHeight: '1.8',
   boxSizing: 'border-box',
   resize: 'vertical',
 },
 editorActions: {
   display: 'flex',
   gap: '12px',
   flexWrap: 'wrap',
 },
 actionButton: {
   flex: 1,
   minWidth: '150px',
   padding: '12px 24px',
   backgroundColor: '#667eea',
   color: 'white',
   border: 'none',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '15px',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 actionButtonSecondary: {
   flex: 1,
   minWidth: '150px',
   padding: '12px 24px',
   backgroundColor: 'white',
   color: '#667eea',
   border: '2px solid #667eea',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '15px',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 // Template section
 templateSection: {
   marginBottom: '24px',
   padding: '24px',
   backgroundColor: '#f8fafc',
   borderRadius: '12px',
   border: '1px solid #e2e8f0',
 },
 templateSectionTitle: {
   fontSize: '18px',
   fontWeight: '600',
   color: '#2d3748',
   marginBottom: '16px',
   marginTop: 0,
 },
 templateGrid: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
   gap: '12px',
   marginBottom: '16px',
 },
 templateCard: {
   padding: '16px',
   backgroundColor: 'white',
   border: '2px solid #e2e8f0',
   borderRadius: '10px',
   textAlign: 'center',
   cursor: 'pointer',
   transition: 'all 0.3s',
 },
 templateCardActive: {
   borderColor: '#667eea',
   backgroundColor: '#f0f4ff',
   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
 },
 templateIcon: {
   fontSize: '32px',
   marginBottom: '8px',
 },
 templateName: {
   fontWeight: '600',
   fontSize: '15px',
   color: '#2d3748',
   marginBottom: '4px',
 },
 templateDescription: {
   fontSize: '12px',
   color: '#718096',
   lineHeight: '1.4',
 },
 previewButton: {
   width: '100%',
   padding: '12px 24px',
   backgroundColor: 'white',
   color: '#667eea',
   border: '2px solid #667eea',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '15px',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 // Formatting section
 formattingSection: {
   marginBottom: '24px',
   padding: '24px',
   backgroundColor: '#f8fafc',
   borderRadius: '12px',
   border: '1px solid #e2e8f0',
 },
 formattingGrid: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
   gap: '16px',
   marginBottom: '20px',
 },
 formattingGroup: {
   display: 'flex',
   flexDirection: 'column',
 },
 formattingLabel: {
   fontSize: '14px',
   fontWeight: '600',
   color: '#4a5568',
   marginBottom: '8px',
 },
 formattingSelect: {
   padding: '10px 12px',
   fontSize: '14px',
   border: '2px solid #e2e8f0',
   borderRadius: '8px',
   backgroundColor: 'white',
   color: '#2d3748',
   cursor: 'pointer',
   outline: 'none',
   transition: 'border-color 0.2s',
 },
 textFormattingToolbar: {
   padding: '16px',
   backgroundColor: 'white',
   borderRadius: '8px',
   border: '2px solid #e2e8f0',
 },
 toolbarLabel: {
   fontSize: '14px',
   fontWeight: '600',
   color: '#4a5568',
   marginBottom: '12px',
 },
 toolbarButtons: {
   display: 'flex',
   gap: '8px',
   marginBottom: '12px',
 },
 toolbarButton: {
   width: '44px',
   height: '44px',
   backgroundColor: 'white',
   border: '2px solid #667eea',
   borderRadius: '8px',
   fontSize: '16px',
   fontWeight: '600',
   color: '#667eea',
   cursor: 'pointer',
   transition: 'all 0.2s',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
 },
 toolbarHint: {
   fontSize: '12px',
   color: '#718096',
   fontStyle: 'italic',
 },
 // Modal styles
 modalOverlay: {
   position: 'fixed',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   backgroundColor: 'rgba(0, 0, 0, 0.7)',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   zIndex: 1000,
 },
 modalContent: {
   backgroundColor: 'white',
   borderRadius: '16px',
   width: '90%',
   maxWidth: '900px',
   maxHeight: '90vh',
   display: 'flex',
   flexDirection: 'column',
   boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
 },
 modalHeader: {
   padding: '24px 32px',
   borderBottom: '1px solid #e2e8f0',
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 modalTitle: {
   fontSize: '22px',
   fontWeight: '600',
   color: '#2d3748',
   margin: 0,
 },
 modalCloseButton: {
   backgroundColor: 'transparent',
   border: 'none',
   fontSize: '24px',
   color: '#718096',
   cursor: 'pointer',
   padding: '4px 8px',
   lineHeight: 1,
 },
 modalBody: {
   padding: '32px',
   flex: 1,
   overflow: 'auto',
 },
 previewFrame: {
   width: '100%',
   height: '600px',
   border: '1px solid #e2e8f0',
   borderRadius: '8px',
   overflow: 'hidden',
   backgroundColor: 'white',
   boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
 },
 previewIframe: {
   width: '100%',
   height: '100%',
   border: 'none',
 },
 modalFooter: {
   padding: '20px 32px',
   borderTop: '1px solid #e2e8f0',
   display: 'flex',
   gap: '12px',
   justifyContent: 'flex-end',
 },
 modalActionButton: {
   padding: '12px 24px',
   backgroundColor: 'white',
   color: '#667eea',
   border: '2px solid #667eea',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '15px',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 modalPrimaryButton: {
   padding: '12px 24px',
   backgroundColor: '#667eea',
   color: 'white',
   border: 'none',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '15px',
   cursor: 'pointer',
   transition: 'all 0.2s',
   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
 },
};


export default CoverLetterMaker;





