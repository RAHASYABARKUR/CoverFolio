import React, { useState } from 'react';


const PortfolioMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
 const [selectedFile, setSelectedFile] = useState<File | null>(null);
 const [hobbies, setHobbies] = useState('');
 const [additionalInfo, setAdditionalInfo] = useState('');


 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0];
   if (file) {
     setSelectedFile(file);
   }
 };


 const handleFileUpload = () => {
   if (selectedFile) {
     // TODO: Implement file upload logic
     console.log('Uploading file:', selectedFile.name);
     console.log('Hobbies:', hobbies);
     console.log('Additional Info:', additionalInfo);
     alert('Resume upload functionality coming soon!');
   }
 };


 return (
   <div style={styles.container}>
     <button onClick={onBack} style={styles.backButton}>
       ← Back to Dashboard
     </button>


     <h1 style={styles.title}>Portfolio Maker</h1>
     <p style={styles.subtitle}>Upload your resume to get started</p>


     <div style={styles.uploadCard}>
       <div style={styles.uploadIcon}>📄</div>
       <h3 style={styles.uploadTitle}>Upload Your Resume</h3>
       <p style={styles.uploadText}>
         Supported formats: PDF, DOC, DOCX
       </p>


       <input
         type="file"
         id="resume-upload"
         accept=".pdf,.doc,.docx"
         onChange={handleFileSelect}
         style={styles.fileInput}
       />
       <label htmlFor="resume-upload" style={styles.uploadButton}>
         Choose File
       </label>


       {selectedFile && (
         <div style={styles.selectedFile}>
           <p style={styles.fileName}>✓ {selectedFile.name}</p>
         </div>
       )}
     </div>


     {/* Additional Information Form */}
     <div style={styles.formCard}>
       <h3 style={styles.formTitle}>Additional Information</h3>
       <p style={styles.formSubtitle}>Tell us more about yourself to enhance your portfolio</p>


       <div style={styles.formGroup}>
         <label style={styles.formLabel}>
           Hobbies & Interests
           <span style={styles.optionalTag}>(Optional)</span>
         </label>
         <input
           type="text"
           value={hobbies}
           onChange={(e) => setHobbies(e.target.value)}
           placeholder="e.g., Photography, Hiking, Reading, Cooking"
           style={styles.formInput}
         />
         <small style={styles.formHint}>
           Separate multiple hobbies with commas
         </small>
       </div>


       <div style={styles.formGroup}>
         <label style={styles.formLabel}>
           Additional Information
           <span style={styles.optionalTag}>(Optional)</span>
         </label>
         <textarea
           value={additionalInfo}
           onChange={(e) => setAdditionalInfo(e.target.value)}
           placeholder="Any other information you'd like to include in your portfolio (achievements, certifications, languages, etc.)"
           style={styles.formTextarea}
           rows={5}
         />
         <small style={styles.formHint}>
           This will be displayed in your portfolio's "About Me" section
         </small>
       </div>


       <button
         onClick={handleFileUpload}
         style={{
           ...styles.submitButton,
           ...(selectedFile ? {} : {
             backgroundColor: '#cbd5e0',
             cursor: 'not-allowed',
             boxShadow: 'none',
           })
         }}
         disabled={!selectedFile}
         onMouseEnter={(e) => {
           if (selectedFile) {
             e.currentTarget.style.backgroundColor = '#38a169';
             e.currentTarget.style.transform = 'translateY(-2px)';
             e.currentTarget.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.4)';
           }
         }}
         onMouseLeave={(e) => {
           if (selectedFile) {
             e.currentTarget.style.backgroundColor = '#48bb78';
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
           }
         }}
       >
         {selectedFile ? 'Generate Portfolio →' : 'Please upload a resume first'}
       </button>
     </div>
   </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   maxWidth: '700px',
   margin: '0 auto',
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
   fontSize: '20px',
   color: 'rgba(255, 255, 255, 0.9)',
   textAlign: 'center',
   marginBottom: '48px',
 },
 uploadCard: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '48px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
   textAlign: 'center',
 },
 uploadIcon: {
   fontSize: '64px',
   marginBottom: '24px',
 },
 uploadTitle: {
   fontSize: '24px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '12px',
 },
 uploadText: {
   fontSize: '16px',
   color: '#718096',
   marginBottom: '32px',
 },
 fileInput: {
   display: 'none',
 },
 uploadButton: {
   display: 'inline-block',
   padding: '12px 32px',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   color: 'white',
   borderRadius: '8px',
   fontWeight: '600',
   fontSize: '16px',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 selectedFile: {
   marginTop: '24px',
   padding: '20px',
   backgroundColor: '#f7fafc',
   borderRadius: '8px',
 },
 fileName: {
   fontSize: '16px',
   color: '#2d3748',
   fontWeight: '600',
   marginBottom: 0,
 },
 formCard: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '40px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
   marginTop: '24px',
 },
 formTitle: {
   fontSize: '24px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '8px',
   textAlign: 'center' as 'center',
 },
 formSubtitle: {
   fontSize: '14px',
   color: '#718096',
   textAlign: 'center' as 'center',
   marginBottom: '32px',
 },
 formGroup: {
   marginBottom: '24px',
 },
 formLabel: {
   display: 'block',
   fontSize: '14px',
   fontWeight: '600',
   color: '#2d3748',
   marginBottom: '8px',
 },
 optionalTag: {
   fontSize: '12px',
   fontWeight: '400',
   color: '#a0aec0',
   marginLeft: '8px',
 },
 formInput: {
   width: '100%',
   padding: '12px 16px',
   fontSize: '14px',
   border: '2px solid #e2e8f0',
   borderRadius: '8px',
   outline: 'none',
   transition: 'all 0.2s',
   fontFamily: 'inherit',
   boxSizing: 'border-box' as 'border-box',
 },
 formTextarea: {
   width: '100%',
   padding: '12px 16px',
   fontSize: '14px',
   border: '2px solid #e2e8f0',
   borderRadius: '8px',
   outline: 'none',
   transition: 'all 0.2s',
   fontFamily: 'inherit',
   resize: 'vertical' as 'vertical',
   lineHeight: '1.6',
   boxSizing: 'border-box' as 'border-box',
 },
 formHint: {
   display: 'block',
   fontSize: '12px',
   color: '#a0aec0',
   marginTop: '6px',
 },
 submitButton: {
   width: '100%',
   padding: '14px 32px',
   backgroundColor: '#48bb78',
   color: 'white',
   border: 'none',
   borderRadius: '12px',
   fontWeight: '600',
   fontSize: '16px',
   cursor: 'pointer',
   transition: 'all 0.3s ease',
   boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
 },
};


export default PortfolioMaker;





