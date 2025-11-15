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
    // Create a simple PDF using HTML canvas and download
    const content = editedCoverLetter;
    const lines = content.split('\n');
    
    // Create a temporary canvas to measure text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.font = '12px Arial';
    
    // Create PDF content
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    const lineHeight = 6;
    
    // Simple PDF generation using data URL
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
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 2cm;
            max-width: 21cm;
          }
          pre {
            white-space: pre-wrap;
            font-family: Arial, sans-serif;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
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
              Review and edit your cover letter as needed
            </p>
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
              � Download as TXT
            </button>
            <button onClick={handleDownloadPDF} style={styles.actionButton}>
              📕 Download as PDF
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
};


export default CoverLetterMaker;





