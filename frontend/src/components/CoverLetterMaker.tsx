import React, { useState } from 'react';


const CoverLetterMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
 const [role, setRole] = useState('');
 const [jobDescription, setJobDescription] = useState('');
 const [additionalInfo, setAdditionalInfo] = useState('');
 const [companyName, setCompanyName] = useState('');


 const handleGenerate = () => {
   if (!role || !jobDescription) {
     alert('Please fill in the required fields (Role and Job Description)');
     return;
   }
  
   // TODO: Implement cover letter generation logic
   console.log('Generating cover letter:', {
     role,
     companyName,
     jobDescription,
     additionalInfo,
   });
   alert('Cover letter generation functionality coming soon!');
 };


 const isFormValid = role.trim() !== '' && jobDescription.trim() !== '';


 return (
   <div style={styles.container}>
     <button onClick={onBack} style={styles.backButton}>
       ← Back to Dashboard
     </button>


     <h1 style={styles.title}>Cover Letter Maker</h1>
     <p style={styles.subtitle}>Create a personalized cover letter for your job application</p>


     <div style={styles.formCard}>
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


         <div style={styles.formGroup}>
           <label style={styles.formLabel}>
             Things You'd Like to Include
             <span style={styles.optionalTag}>(Optional)</span>
           </label>
           <textarea
             value={additionalInfo}
             onChange={(e) => setAdditionalInfo(e.target.value)}
             placeholder="Include specific achievements, projects, or experiences you want to highlight. For example:&#10;- Led a team of 5 developers&#10;- Increased revenue by 30%&#10;- Built a mobile app with 100k+ downloads"
             style={styles.formTextarea}
             rows={6}
           />
           <small style={styles.formHint}>
             Any specific accomplishments, skills, or experiences you want to emphasize in your cover letter
           </small>
         </div>


         <div style={styles.buttonContainer}>
           <button
             onClick={handleGenerate}
             style={{
               ...styles.submitButton,
               ...(isFormValid ? {} : {
                 backgroundColor: '#cbd5e0',
                 cursor: 'not-allowed',
                 boxShadow: 'none',
               })
             }}
             disabled={!isFormValid}
             onMouseEnter={(e) => {
               if (isFormValid) {
                 e.currentTarget.style.backgroundColor = '#5a67d8';
                 e.currentTarget.style.transform = 'translateY(-2px)';
                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
               }
             }}
             onMouseLeave={(e) => {
               if (isFormValid) {
                 e.currentTarget.style.backgroundColor = '#667eea';
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
               }
             }}
           >
             {isFormValid ? 'Generate Cover Letter ✨' : 'Please fill in required fields'}
           </button>
         </div>


         <div style={styles.noteSection}>
           <p style={styles.noteText}>
             💡 <strong>Pro Tip:</strong> The more specific details you provide, the more personalized and compelling your cover letter will be.
           </p>
         </div>
       </div>
     </div>
   </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   maxWidth: '800px',
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
   fontSize: '18px',
   color: 'rgba(255, 255, 255, 0.9)',
   textAlign: 'center',
   marginBottom: '48px',
 },
 formCard: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '48px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
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
};


export default CoverLetterMaker;

