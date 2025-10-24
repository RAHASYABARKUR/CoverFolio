import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


interface Section {
 id: string;
 title: string;
 icon: string;
 content: string;
}


const PortfolioEditor: React.FC = () => {
 const { resumeId } = useParams<{ resumeId: string }>();
 const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const sections: Section[] = [
   { id: 'overview', title: 'Overview', icon: '👤', content: 'Personal information and summary' },
   { id: 'experience', title: 'Experience', icon: '💼', content: 'Work experience and achievements' },
   { id: 'projects', title: 'Projects', icon: '🚀', content: 'Portfolio projects and case studies' },
   { id: 'skills', title: 'Skills', icon: '⚡', content: 'Technical and soft skills' },
   { id: 'education', title: 'Education', icon: '🎓', content: 'Educational background' },
   { id: 'contact', title: 'Contact', icon: '📧', content: 'Contact information and social links' },
 ];


 const handleSave = () => {
   alert('Portfolio saved successfully!');
 };


 const handlePublish = () => {
   alert('Portfolio published! (This feature is coming soon)');
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
           {/* Section Header */}
           <div style={styles.contentHeader}>
             <div style={styles.contentHeaderLeft}>
               <span style={styles.contentIcon}>
                 {sections.find(s => s.id === activeSection)?.icon}
               </span>
               <h2 style={styles.contentTitle}>
                 {sections.find(s => s.id === activeSection)?.title}
               </h2>
             </div>
             <button style={styles.addButton}>+ Add Item</button>
           </div>


           {/* Section Content */}
           <div style={styles.sectionContent}>
             <div style={styles.placeholderCard}>
               <div style={styles.placeholderIcon}>✏️</div>
               <h3 style={styles.placeholderTitle}>
                 Edit Your {sections.find(s => s.id === activeSection)?.title}
               </h3>
               <p style={styles.placeholderText}>
                 {sections.find(s => s.id === activeSection)?.content}
               </p>
               <p style={styles.placeholderSubtext}>
                 This editor is coming soon! You'll be able to add, edit, and organize your portfolio content here.
               </p>
             </div>


             {/* Example content preview */}
             {activeSection === 'overview' && (
               <div style={styles.previewSection}>
                 <h4 style={styles.previewTitle}>Preview:</h4>
                 <div style={styles.previewCard}>
                   <h3>John Doe</h3>
                   <p style={styles.previewRole}>Full Stack Developer</p>
                   <p style={styles.previewBio}>
                     Passionate developer with 5+ years of experience building scalable web applications.
                     Specialized in React, Node.js, and cloud technologies.
                   </p>
                 </div>
               </div>
             )}


             {activeSection === 'projects' && (
               <div style={styles.previewSection}>
                 <h4 style={styles.previewTitle}>Sample Projects:</h4>
                 <div style={styles.projectGrid}>
                   <div style={styles.projectCard}>
                     <h4>Project 1</h4>
                     <p>E-commerce Platform</p>
                   </div>
                   <div style={styles.projectCard}>
                     <h4>Project 2</h4>
                     <p>Task Management App</p>
                   </div>
                 </div>
               </div>
             )}


             {activeSection === 'skills' && (
               <div style={styles.previewSection}>
                 <h4 style={styles.previewTitle}>Sample Skills:</h4>
                 <div style={styles.skillsGrid}>
                   {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill) => (
                     <div key={skill} style={styles.skillBadge}>{skill}</div>
                   ))}
                 </div>
               </div>
             )}
           </div>
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
};


export default PortfolioEditor;





