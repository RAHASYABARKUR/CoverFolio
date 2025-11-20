import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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


const ProfileFormsEditor: React.FC = () => {
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

 // Render the appropriate section component based on activeSection
 const renderSectionContent = () => {
   if (loading) {
     return (
       <div style={styles.loadingContainer}>
         <div style={styles.spinner}></div>
         <p style={styles.loadingText}>Loading profile data...</p>
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
       return null;
   }
 };


 return (
   <div style={styles.container}>
     <button onClick={() => navigate('/dashboard/profile')} style={styles.backButton}>
       ← Back to Profile
     </button>


     <div style={styles.header}>
       <h1 style={styles.title}>Edit Profile Data</h1>
       <p style={styles.subtitle}>
         Update your professional information. Changes are saved automatically.
       </p>
     </div>


     <div style={styles.editorContainer}>
       {/* Sidebar with section navigation */}
       <div style={styles.sidebar}>
         <h3 style={styles.sidebarTitle}>Sections</h3>
         
         <div style={styles.sectionList}>
           {sections.map((section) => (
             <div
               key={section.id}
               onClick={() => setActiveSection(section.id)}
               style={{
                 ...styles.sectionItem,
                 ...(activeSection === section.id ? styles.sectionItemActive : {}),
               }}
             >
               <span style={styles.sectionIcon}>{section.icon}</span>
               <span style={styles.sectionTitle}>{section.title}</span>
               {activeSection === section.id && (
                 <span style={styles.activeIndicator}>→</span>
               )}
             </div>
           ))}
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
 },
 header: {
   marginBottom: '32px',
   textAlign: 'center' as 'center',
 },
 title: {
   fontSize: '36px',
   fontWeight: 'bold',
   color: 'white',
   marginBottom: '12px',
 },
 subtitle: {
   fontSize: '18px',
   color: 'rgba(255, 255, 255, 0.95)',
   lineHeight: '1.6',
 },
 editorContainer: {
   display: 'grid',
   gridTemplateColumns: '280px 1fr',
   gap: '32px',
 },
 sidebar: {
   backgroundColor: 'white',
   borderRadius: '16px',
   padding: '24px',
   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
   height: 'fit-content',
   position: 'sticky' as 'sticky',
   top: '24px',
 },
 sidebarTitle: {
   fontSize: '18px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginTop: 0,
   marginBottom: '20px',
   paddingBottom: '12px',
   borderBottom: '2px solid #e2e8f0',
 },
 sectionList: {
   display: 'flex',
   flexDirection: 'column' as 'column',
   gap: '8px',
 },
 sectionItem: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
   padding: '12px 16px',
   borderRadius: '8px',
   cursor: 'pointer',
   transition: 'all 0.2s',
   backgroundColor: 'white',
 },
 sectionItemActive: {
   backgroundColor: '#f0f4ff',
   color: '#667eea',
 },
 sectionIcon: {
   fontSize: '20px',
 },
 sectionTitle: {
   fontSize: '14px',
   fontWeight: '500',
   color: '#2d3748',
   flex: 1,
 },
 activeIndicator: {
   color: '#667eea',
   fontWeight: 'bold',
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
 loadingContainer: {
   display: 'flex',
   flexDirection: 'column' as 'column',
   alignItems: 'center',
   justifyContent: 'center',
   padding: '60px 20px',
 },
 spinner: {
   width: '48px',
   height: '48px',
   border: '4px solid #e2e8f0',
   borderTop: '4px solid #667eea',
   borderRadius: '50%',
   animation: 'spin 1s linear infinite',
   marginBottom: '16px',
 },
 loadingText: {
   fontSize: '16px',
   color: '#718096',
 },
};


export default ProfileFormsEditor;
