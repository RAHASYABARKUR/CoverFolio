import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortfolioOverview from './portfolio/PortfolioOverview';
import ProjectsSection from './portfolio/ProjectsSection';
import SkillsSection from './portfolio/SkillsSection';
import ExperienceSection from './portfolio/ExperienceSection';
import EducationSection from './portfolio/EducationSection';
import AwardsSection from './portfolio/AwardsSection';
import HobbiesSection from './portfolio/HobbiesSection';
import ContactsSection from './portfolio/ContactsSection';
import CertificationsSection from './portfolio/CertificationsSection';
import PublicationsPatentsSection from './portfolio/PublicationsPatentsSection';
import OthersSection from './portfolio/OthersSection';
import portfolioService from '../services/portfolio.service';
import { Portfolio } from '../types/portfolio.types';


interface Section {
 id: string;
 title: string;
 icon: string;
}


const PortfolioEditor: React.FC = () => {
 const { resumeId } = useParams<{ resumeId: string }>();
 const navigate = useNavigate();
 const [activeSection, setActiveSection] = useState('overview');
 const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
 const [loading, setLoading] = useState(true);
  
 const sections: Section[] = [
   { id: 'overview', title: 'Overview', icon: '👤' },
   { id: 'experience', title: 'Experience', icon: '💼' },
   { id: 'projects', title: 'Projects', icon: '🚀' },
   { id: 'skills', title: 'Skills', icon: '⚡' },
   { id: 'education', title: 'Education', icon: '🎓' },
   { id: 'certifications', title: 'Certifications', icon: '📜' },
   { id: 'publications', title: 'Publications & Patents', icon: '📚' },
   { id: 'awards', title: 'Accomplishments & Awards', icon: '🏆' },
   { id: 'hobbies', title: 'Hobbies & Interests', icon: '🎯' },
   { id: 'contacts', title: 'Contact Information', icon: '📞' },
   { id: 'others', title: 'Other', icon: '📌' },
 ];

 // Load portfolio data on component mount
 useEffect(() => {
   loadPortfolio();
 }, []);

 const loadPortfolio = async () => {
   try {
     setLoading(true);
     const data = await portfolioService.getPortfolio();
     setPortfolio(data);
   } catch (err: any) {
     // If portfolio doesn't exist (404), that's okay - user can create one
     if (err.response?.status === 404) {
       setPortfolio(null);
     } else {
       console.error('Failed to load portfolio:', err);
     }
   } finally {
     setLoading(false);
   }
 };


 const handleSave = () => {
   alert('Portfolio saved successfully!');
 };

  const handleChooseTemplate = () => {
    if (resumeId) {
      // include resumeId as query param so TemplateGallery can forward it to /editor
      navigate(`/templates?resumeId=${resumeId}`);
    } else {
      // fallback – still works, just no binding to a specific resume
      navigate('/templates');
    }
  };


 const handlePublish = () => {
   alert('Portfolio published! (This feature is coming soon)');
 };

 // Render the appropriate section component based on activeSection
 const renderSectionContent = () => {
   if (loading) {
     return (
       <div style={styles.loadingContainer}>
         <div style={styles.spinner}></div>
         <p style={styles.loadingText}>Loading portfolio...</p>
       </div>
     );
   }

   switch (activeSection) {
     case 'overview':
       return <div style={{ marginTop: '-32px' }}><PortfolioOverview portfolio={portfolio} onUpdate={loadPortfolio} /></div>;
     case 'projects':
       return <ProjectsSection portfolioId={portfolio?.id} />;
     case 'skills':
       return <SkillsSection />;
     case 'experience':
       return <ExperienceSection />;
     case 'education':
       return <EducationSection />;
     case 'certifications':
       return <CertificationsSection />;
     case 'publications':
       return <PublicationsPatentsSection />;
     case 'awards':
       return <AwardsSection />;
     case 'hobbies':
       return <HobbiesSection />;
     case 'contacts':
       return <ContactsSection />;
     case 'others':
       return <OthersSection />;
     default:
       return (
         <div style={styles.placeholderCard}>
           <div style={styles.placeholderIcon}>✏️</div>
           <h3 style={styles.placeholderTitle}>Section Coming Soon</h3>
           <p style={styles.placeholderText}>This section is under development.</p>
         </div>
       );
   }
 };


 return (
   <div style={styles.container}>
     {/* Header */}
     <button onClick={() => navigate('/dashboard/resumes')} style={styles.backButton}>
       ← Back to Portfolio Manager
     </button>
     <div style={styles.header}>
       <h1 style={styles.title}>Portfolio Editor</h1>
       <p style={styles.subtitle}>Resume ID: {resumeId}</p>
     </div>


     {/* Main Editor Area */}
     <div style={styles.editorContainer}>
       {/* Sidebar - Sections Navigation */}
       <div style={styles.sidebar}>
         <h2 style={styles.sidebarTitle}>Sections</h2>
         <div style={styles.sectionsList}>
           {sections.map((section) => (
             <div
               key={section.id}
               style={{
                 ...styles.sectionItem,
                 ...(activeSection === section.id ? styles.sectionItemActive : {}),
               }}
               onClick={() => setActiveSection(section.id)}
             >
               <span style={styles.sectionIcon}>{section.icon}</span>
               <span style={styles.sectionTitle}>{section.title}</span>
               {activeSection === section.id && (
                 <span style={styles.activeIndicator}>→</span>
               )}
             </div>
           ))}
         </div>
           

         {/* Action Buttons in Sidebar */}

         <div style={styles.sidebarActions}>
           <button onClick={handleChooseTemplate} style={styles.chooseTemplateButton}>
            🧩 Choose Template
          </button>
           <button onClick={handleSave} style={styles.saveButton}>
             💾 Save Draft
           </button>
           <button onClick={handlePublish} style={styles.publishButton}>
             🚀 Publish Portfolio
           </button>
         </div>
       </div>


       {/* Main Content Area */}
       <div style={styles.mainContent}>
         <div style={styles.contentCard}>
           {/* Render the actual section component */}
           {renderSectionContent()}
         </div>
       </div>
     </div>
   </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   maxWidth: '1400px',
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
   marginBottom: '24px',
   transition: 'all 0.2s',
   display: 'inline-block',
 },
 header: {
   textAlign: 'center' as 'center',
   marginBottom: '32px',
 },
 title: {
   fontSize: '36px',
   fontWeight: 'bold',
   color: 'white',
   marginBottom: '8px',
 },
 subtitle: {
   fontSize: '16px',
   color: 'rgba(255, 255, 255, 0.8)',
 },
 editorContainer: {
   display: 'grid',
   gridTemplateColumns: '280px 1fr',
   gap: '24px',
   alignItems: 'start',
 },
 sidebar: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '24px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
   position: 'sticky' as 'sticky',
   top: '24px',
 },
 sidebarTitle: {
   fontSize: '20px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '20px',
 },
 sectionsList: {
   marginBottom: '24px',
 },
 sectionItem: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
   padding: '12px 16px',
   borderRadius: '10px',
   marginBottom: '8px',
   cursor: 'pointer',
   transition: 'all 0.2s',
   backgroundColor: 'transparent',
 },
 sectionItemActive: {
   backgroundColor: '#f0f4ff',
   borderLeft: '4px solid #667eea',
 },
 sectionIcon: {
   fontSize: '20px',
 },
 sectionTitle: {
   fontSize: '15px',
   fontWeight: '600',
   color: '#2d3748',
   flex: 1,
 },
 activeIndicator: {
   color: '#667eea',
   fontWeight: 'bold',
 },
 sidebarActions: {
   display: 'flex',
   flexDirection: 'column' as 'column',
   gap: '12px',
   paddingTop: '24px',
   borderTop: '2px solid #e2e8f0',
 },
 saveButton: {
   backgroundColor: 'white',
   color: '#667eea',
   border: '2px solid #667eea',
   padding: '10px 16px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },

 chooseTemplateButton: {
  backgroundColor: 'white',
  color: '#1f2937',
  border: '2px solid #e2e8f0',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
},

 publishButton: {
   backgroundColor: '#48bb78',
   color: 'white',
   border: 'none',
   padding: '10px 16px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 mainContent: {
   minHeight: '600px',
 },
 contentCard: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '32px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
 },
 contentHeader: {
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: '32px',
   paddingBottom: '20px',
   borderBottom: '2px solid #e2e8f0',
 },
 contentHeaderLeft: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
 },
 contentIcon: {
   fontSize: '32px',
 },
 contentTitle: {
   fontSize: '28px',
   fontWeight: 'bold',
   color: '#1a202c',
   margin: 0,
 },
 addButton: {
   backgroundColor: '#667eea',
   color: 'white',
   border: 'none',
   padding: '10px 20px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'all 0.2s',
 },
 sectionContent: {
   minHeight: '400px',
 },
 placeholderCard: {
   textAlign: 'center' as 'center',
   padding: '60px 40px',
   backgroundColor: '#f7fafc',
   borderRadius: '12px',
   border: '2px dashed #cbd5e0',
 },
 placeholderIcon: {
   fontSize: '48px',
   marginBottom: '16px',
 },
 placeholderTitle: {
   fontSize: '24px',
   fontWeight: 'bold',
   color: '#2d3748',
   marginBottom: '12px',
 },
 placeholderText: {
   fontSize: '16px',
   color: '#4a5568',
   marginBottom: '8px',
 },
 placeholderSubtext: {
   fontSize: '14px',
   color: '#718096',
   fontStyle: 'italic' as 'italic',
 },
 previewSection: {
   marginTop: '32px',
 },
 previewTitle: {
   fontSize: '18px',
   fontWeight: 'bold',
   color: '#2d3748',
   marginBottom: '16px',
 },
 previewCard: {
   padding: '24px',
   backgroundColor: '#f7fafc',
   borderRadius: '12px',
   border: '1px solid #e2e8f0',
 },
 previewRole: {
   fontSize: '16px',
   color: '#667eea',
   fontWeight: '600',
   marginBottom: '12px',
 },
 previewBio: {
   fontSize: '14px',
   color: '#4a5568',
   lineHeight: '1.6',
 },
 projectGrid: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
   gap: '16px',
 },
 projectCard: {
   padding: '20px',
   backgroundColor: '#f7fafc',
   borderRadius: '10px',
   border: '1px solid #e2e8f0',
 },
 skillsGrid: {
   display: 'flex',
   flexWrap: 'wrap' as 'wrap',
   gap: '12px',
 },
 skillBadge: {
   padding: '8px 16px',
   backgroundColor: '#667eea',
   color: 'white',
   borderRadius: '20px',
   fontSize: '14px',
   fontWeight: '600',
 },
 loadingContainer: {
   display: 'flex',
   flexDirection: 'column' as 'column',
   alignItems: 'center',
   justifyContent: 'center',
   minHeight: '400px',
 },
 spinner: {
   width: '48px',
   height: '48px',
   border: '4px solid #e2e8f0',
   borderTop: '4px solid #667eea',
   borderRadius: '50%',
   animation: 'spin 1s linear infinite',
 },
 loadingText: {
   marginTop: '16px',
   fontSize: '16px',
   color: '#718096',
 },
};

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Keyframes might already exist
  }
}


export default PortfolioEditor;





