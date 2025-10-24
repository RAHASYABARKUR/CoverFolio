import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorPopup from './ErrorPopup';


interface Resume {
 id: number;
 filename: string;
 uploaded_at: string;
 extracted_text?: string;
}


interface PortfolioManagerProps {
 onBack: () => void;
}


const PortfolioManager: React.FC<PortfolioManagerProps> = ({ onBack }) => {
 const navigate = useNavigate();
 const [resumes, setResumes] = useState<Resume[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');


 // Fetch resumes on component mount
 useEffect(() => {
   fetchResumes();
 }, []);


 const fetchResumes = async () => {
   setLoading(true);
   try {
     // TODO: Uncomment when backend is ready
     // const response = await api.get('/resumes/');
     // setResumes(response.data);
    
     // Mock data for now
     await new Promise(resolve => setTimeout(resolve, 500));
     setResumes([]);
   } catch (err: any) {
     setError(err.response?.data?.error || 'Failed to fetch resumes');
   } finally {
     setLoading(false);
   }
 };


 const handleDelete = async (resumeId: number) => {
   if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;


   try {
     // TODO: Uncomment when backend is ready
     // await api.delete(`/resumes/${resumeId}/`);
    
     // Mock delete for now
     setResumes(resumes.filter(r => r.id !== resumeId));
   } catch (err: any) {
     setError(err.response?.data?.error || 'Failed to delete portfolio project');
   }
 };


 const handleGeneratePortfolio = (resumeId: number) => {
   // Navigate to portfolio preview/editor page
   navigate(`/dashboard/portfolio/preview/${resumeId}`);
 };


 return (
   <div style={styles.container}>
     {error && <ErrorPopup message={error} onClose={() => setError('')} />}


     <button onClick={onBack} style={styles.backButton}>
       ← Back to Dashboard
     </button>


     <h1 style={styles.pageTitle}>My Portfolio Workspace</h1>
     <p style={styles.pageSubtitle}>Manage your portfolio projects</p>


     {/* Portfolio Projects Section */}
     <div style={styles.resumesSection}>
       <h2 style={styles.sectionTitle}>Your Portfolio Projects</h2>
      
       {loading ? (
         <div style={styles.loadingContainer}>
           <div style={styles.spinner}></div>
           <p>Loading your portfolio projects...</p>
         </div>
       ) : resumes.length === 0 ? (
         <div style={styles.emptyState}>
           <div style={styles.emptyIcon}>📭</div>
           <h3>No portfolio projects yet</h3>
           <p>Upload your first resume to create a portfolio</p>
         </div>
       ) : (
         <div style={styles.resumesGrid}>
           {resumes.map((resume) => (
             <div key={resume.id} style={styles.resumeCard}>
               <div style={styles.resumeHeader}>
                 <h3 style={styles.resumeTitle}>{resume.filename}</h3>
                 <button
                   onClick={() => handleDelete(resume.id)}
                   style={styles.deleteButton}
                   title="Delete resume"
                 >
                   🗑️
                 </button>
               </div>
              
               <div style={styles.resumeMeta}>
                 <p style={styles.date}>
                   Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                 </p>
               </div>


               {resume.extracted_text && (
                 <div style={styles.resumeContent}>
                   <h4 style={styles.contentTitle}>Extracted Content:</h4>
                   <div style={styles.textPreview}>
                     {resume.extracted_text.substring(0, 200)}
                     {resume.extracted_text.length > 200 ? '...' : ''}
                   </div>
                 </div>
               )}


               <button
                 onClick={() => handleGeneratePortfolio(resume.id)}
                 style={styles.generateButton}
               >
                 Generate Portfolio →
               </button>
             </div>
           ))}
         </div>
       )}
     </div>
   </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   maxWidth: '1200px',
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
 pageTitle: {
   fontSize: '36px',
   fontWeight: 'bold',
   color: 'white',
   marginBottom: '12px',
   textAlign: 'center' as 'center',
 },
 pageSubtitle: {
   fontSize: '18px',
   color: 'rgba(255, 255, 255, 0.9)',
   textAlign: 'center' as 'center',
   marginBottom: '40px',
 },
 sectionTitle: {
   fontSize: '24px',
   fontWeight: '600',
   color: '#1a202c',
   marginBottom: '20px',
 },
 resumesSection: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '32px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
 },
 loadingContainer: {
   textAlign: 'center' as 'center',
   padding: '40px',
 },
 spinner: {
   width: '40px',
   height: '40px',
   border: '4px solid #e2e8f0',
   borderTop: '4px solid #667eea',
   borderRadius: '50%',
   animation: 'spin 1s linear infinite',
   margin: '0 auto 16px',
 },
 emptyState: {
   textAlign: 'center' as 'center',
   padding: '60px 20px',
   color: '#718096',
 },
 emptyIcon: {
   fontSize: '64px',
   marginBottom: '16px',
 },
 resumesGrid: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
   gap: '24px',
 },
 resumeCard: {
   border: '2px solid #e2e8f0',
   borderRadius: '12px',
   padding: '24px',
   backgroundColor: '#f7fafc',
   transition: 'all 0.2s',
 },
 resumeHeader: {
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: '12px',
 },
 resumeTitle: {
   fontSize: '18px',
   fontWeight: '600',
   color: '#1a202c',
   margin: 0,
 },
 deleteButton: {
   background: 'none',
   border: 'none',
   cursor: 'pointer',
   fontSize: '20px',
   padding: '4px',
   transition: 'transform 0.2s',
 },
 resumeMeta: {
   marginBottom: '16px',
 },
 date: {
   fontSize: '14px',
   color: '#718096',
   margin: 0,
 },
 resumeContent: {
   marginTop: '16px',
   marginBottom: '16px',
 },
 contentTitle: {
   fontSize: '14px',
   fontWeight: '600',
   color: '#2d3748',
   marginBottom: '8px',
 },
 textPreview: {
   fontSize: '13px',
   color: '#4a5568',
   lineHeight: '1.5',
   backgroundColor: 'white',
   padding: '12px',
   borderRadius: '8px',
   border: '1px solid #e2e8f0',
 },
 generateButton: {
   width: '100%',
   backgroundColor: '#48bb78',
   color: 'white',
   padding: '10px 20px',
   borderRadius: '8px',
   border: 'none',
   fontSize: '14px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'background-color 0.2s',
   marginTop: '16px',
 },
};


export default PortfolioManager;





