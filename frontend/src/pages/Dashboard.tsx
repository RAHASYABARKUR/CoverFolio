import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PortfolioMaker from '../components/PortfolioMaker';
import CoverLetterMaker from '../components/CoverLetterMaker';
import PortfolioManager from '../components/PortfolioManager';
import PortfolioEditor from '../components/PortfolioEditor';
import Profile from '../components/Profile';


const Dashboard: React.FC = () => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();


 const handleLogout = () => {
   logout();
   navigate('/login');
 };


 // Determine current view based on URL
 const getCurrentView = () => {
   if (location.pathname === '/dashboard/profile') return 'profile';
   if (location.pathname === '/dashboard/portfolio') return 'portfolio';
   if (location.pathname === '/dashboard/resumes') return 'resumes';
   if (location.pathname.startsWith('/dashboard/portfolio/preview/')) return 'preview';
   if (location.pathname === '/dashboard/coverletter') return 'coverletter';
   return 'home';
 };


 const currentView = getCurrentView();


 // Home view with two main options
 const renderHomeView = () => (
   <div style={styles.optionsContainer}>
     <div style={styles.heroSection}>
       <h1 style={styles.title}>Welcome Back, {user?.first_name || user?.email?.split('@')[0]}! 👋</h1>
       <p style={styles.subtitle}>Transform your career with professional tools designed for success</p>
     </div>


   <div style={styles.statsBar}>
     <div
       style={styles.statItem}
       onClick={() => navigate('/dashboard/resumes')}
       onMouseEnter={(e) => {
         e.currentTarget.style.transform = 'translateY(-4px)';
         e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
       }}
       onMouseLeave={(e) => {
         e.currentTarget.style.transform = 'translateY(0)';
         e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
       }}
     >
       <div style={styles.statIconCircle}>
         <div style={styles.statIcon}>📊</div>
       </div>
       <div>
         <div style={styles.statValue}>0</div>
         <div style={styles.statLabel}>Portfolio Projects</div>
       </div>
     </div>
     <div
       style={styles.statItem}
       onMouseEnter={(e) => {
         e.currentTarget.style.transform = 'translateY(-4px)';
         e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
       }}
       onMouseLeave={(e) => {
         e.currentTarget.style.transform = 'translateY(0)';
         e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
       }}
     >
       <div style={styles.statIconCircle}>
         <div style={styles.statIcon}>📝</div>
       </div>
       <div>
         <div style={styles.statValue}>0</div>
         <div style={styles.statLabel}>Cover Letters</div>
       </div>
     </div>
   </div>


    <h2 style={styles.sectionTitle}>What would you like to create today?</h2>


    <div style={styles.optionsGrid}>
      {/* Profile Option - NEW */}
      <div
        style={{...styles.optionCard, backgroundColor: '#f0f4ff'}}
        onClick={() => navigate('/dashboard/profile')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        }}
      >
        <div style={styles.decorativeCircle1}></div>
        <div style={styles.decorativeCircle2}></div>
        <div style={styles.optionIcon}>👤</div>
        <h2 style={styles.optionTitle}>My Profile</h2>
        <p style={styles.optionDescription}>
          Manage your professional information. Upload and maintain your resume data in one place.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>✓ Upload resume once</div>
          <div style={styles.featureItem}>✓ Edit profile forms</div>
          <div style={styles.featureItem}>✓ Keep data updated</div>
        </div>
        <div style={styles.optionButton}>Manage Profile →</div>
      </div>

      {/* Portfolio Maker Option */}
      <div
        style={styles.optionCard}
        onClick={() => navigate('/dashboard/portfolio')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        }}
      >
        <div style={styles.decorativeCircle1}></div>
        <div style={styles.decorativeCircle2}></div>
        <div style={styles.optionIcon}>📁</div>
        <h2 style={styles.optionTitle}>Portfolio Maker</h2>
        <p style={styles.optionDescription}>
          Create a stunning portfolio website from your resume. Stand out with a professional online presence.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>✓ Use profile data</div>
          <div style={styles.featureItem}>✓ Choose templates</div>
          <div style={styles.featureItem}>✓ Publish instantly</div>
        </div>
        <div style={styles.optionButton}>Get Started →</div>
      </div>


      {/* Cover Letter Maker Option */}
      <div
        style={styles.optionCard}
        onClick={() => navigate('/dashboard/coverletter')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        }}
      >
        <div style={styles.decorativeCircle1}></div>
        <div style={styles.decorativeCircle2}></div>
        <div style={styles.optionIcon}>✉️</div>
        <h2 style={styles.optionTitle}>Cover Letter Maker</h2>
        <p style={styles.optionDescription}>
          Generate professional cover letters tailored to any job. Make every application count.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>✓ AI-powered writing</div>
          <div style={styles.featureItem}>✓ Job-specific content</div>
          <div style={styles.featureItem}>✓ Multiple formats</div>
        </div>
        <div style={styles.optionButton}>Get Started →</div>
      </div>
    </div>
   </div>
 );




 return (
   <div style={styles.container}>
     <nav style={styles.navbar}>
       {/* Animated gradient background bar */}
       <div style={styles.navBackground}>
         <div style={styles.navBackgroundGlow}></div>
       </div>
      
       {/* Decorative floating elements */}
       <div style={styles.decorativeShape1}></div>
       <div style={styles.decorativeShape2}></div>
       <div style={styles.decorativeShape3}></div>


       <div style={styles.navContent}>
         {/* Logo Section with enhanced design */}
         <div style={styles.logoSection}>
           <div
             style={styles.logoIconContainer}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'rotate(360deg) scale(1.05)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
             }}
           >
             <div style={styles.logoIconGlow}></div>
             <div style={styles.logoIcon}>📁</div>
           </div>
           <div>
             <h2 style={styles.logo}>Coverfolio</h2>
             <p style={styles.logoTagline}>✨ Create. Impress. Succeed.</p>
           </div>
         </div>


         {/* Right section with user info */}
         <div style={styles.navRight}>
           <div
             style={styles.userInfo}
             onMouseEnter={(e) => {
               const avatar = e.currentTarget.querySelector('[data-avatar]') as HTMLElement;
               const statusDot = e.currentTarget.querySelector('[data-status]') as HTMLElement;
               if (avatar) {
                 avatar.style.transform = 'scale(1.1)';
                 avatar.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
               }
               if (statusDot) statusDot.style.transform = 'scale(1.2)';
               e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
             }}
             onMouseLeave={(e) => {
               const avatar = e.currentTarget.querySelector('[data-avatar]') as HTMLElement;
               const statusDot = e.currentTarget.querySelector('[data-status]') as HTMLElement;
               if (avatar) {
                 avatar.style.transform = 'scale(1)';
                 avatar.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
               }
               if (statusDot) statusDot.style.transform = 'scale(1)';
               e.currentTarget.style.background = 'transparent';
             }}
           >
             <div>
               <div style={styles.userName}>
                 {user?.first_name || user?.email?.split('@')[0]}
               </div>
               <div style={styles.userEmail}>
                 {user?.email}
               </div>
             </div>
             <div style={{ position: 'relative' }}>
               <div style={styles.userAvatar} data-avatar>
                 {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
               </div>
               <div style={styles.userStatusDot} data-status></div>
             </div>
           </div>
           <button
             onClick={handleLogout}
             style={styles.logoutButton}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
               e.currentTarget.style.color = 'white';
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = 'white';
               e.currentTarget.style.color = '#667eea';
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.2)';
             }}
           >
             <span style={styles.logoutIcon}>→</span> Logout
           </button>
         </div>
       </div>
    </nav>


    <main style={styles.main}>
      {currentView === 'home' && renderHomeView()}
      {currentView === 'profile' && <Profile onBack={() => navigate('/dashboard')} />}
      {currentView === 'portfolio' && <PortfolioMaker onBack={() => navigate('/dashboard')} />}
      {currentView === 'resumes' && <PortfolioManager onBack={() => navigate('/dashboard')} />}
      {currentView === 'preview' && <PortfolioEditor />}
      {currentView === 'coverletter' && <CoverLetterMaker onBack={() => navigate('/dashboard')} />}
    </main>
  </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   minHeight: '100vh',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 },
 navbar: {
   backgroundColor: 'rgba(255, 255, 255, 0.95)',
   backdropFilter: 'blur(20px)',
   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
   padding: '20px 0',
   position: 'sticky' as 'sticky',
   top: 0,
   zIndex: 100,
   borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
 },
 navBackground: {
   position: 'absolute' as 'absolute',
   top: 0,
   left: 0,
   right: 0,
   height: '5px',
   background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
   overflow: 'hidden' as 'hidden',
 },
 navBackgroundGlow: {
   position: 'absolute' as 'absolute',
   top: 0,
   left: '-100%',
   width: '100%',
   height: '100%',
   background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
 },
 decorativeShape1: {
   position: 'absolute' as 'absolute',
   top: '15px',
   left: '10%',
   width: '60px',
   height: '60px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 decorativeShape2: {
   position: 'absolute' as 'absolute',
   top: '25px',
   right: '15%',
   width: '40px',
   height: '40px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(118, 75, 162, 0.12) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 decorativeShape3: {
   position: 'absolute' as 'absolute',
   bottom: '10px',
   left: '50%',
   width: '80px',
   height: '80px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
   transform: 'translateX(-50%)',
 },
 navContent: {
   maxWidth: '1200px',
   margin: '0 auto',
   padding: '0 32px',
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   position: 'relative' as 'relative',
 },
 logoSection: {
   display: 'flex',
   alignItems: 'center',
   gap: '16px',
 },
 logoIconContainer: {
   width: '52px',
   height: '52px',
   borderRadius: '14px',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
   transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
   position: 'relative' as 'relative',
 },
 logoIconGlow: {
   position: 'absolute' as 'absolute',
   inset: '-4px',
   borderRadius: '16px',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   opacity: 0.3,
   filter: 'blur(8px)',
   zIndex: -1,
 },
 logoIcon: {
   fontSize: '28px',
   position: 'relative' as 'relative',
   zIndex: 1,
 },
 logoBadge: {
   fontSize: '9px',
   fontWeight: '800',
   background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
   color: '#1a202c',
   padding: '3px 8px',
   borderRadius: '6px',
   letterSpacing: '0.5px',
   boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
 },
 logo: {
   fontSize: '26px',
   fontWeight: '800',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   WebkitBackgroundClip: 'text',
   WebkitTextFillColor: 'transparent',
   margin: 0,
   letterSpacing: '-0.5px',
 },
 logoTagline: {
   fontSize: '11px',
   color: '#718096',
   margin: 0,
   marginTop: '2px',
   fontWeight: '500',
   letterSpacing: '0.5px',
 },
 viewIndicator: {
   position: 'absolute' as 'absolute',
   left: '50%',
   transform: 'translateX(-50%)',
   display: 'flex',
   alignItems: 'center',
   gap: '10px',
   padding: '10px 20px',
   borderRadius: '12px',
   background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
   border: '1px solid rgba(102, 126, 234, 0.15)',
   backdropFilter: 'blur(10px)',
 },
 viewIndicatorIcon: {
   fontSize: '18px',
 },
 viewIndicatorText: {
   fontSize: '14px',
   fontWeight: '700',
   color: '#667eea',
   letterSpacing: '0.3px',
 },
 navRight: {
   display: 'flex',
   alignItems: 'center',
   gap: '24px',
 },
 navStats: {
   display: 'flex',
   gap: '12px',
 },
 quickStat: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
   padding: '10px 18px',
   borderRadius: '12px',
   background: 'white',
   border: '2px solid rgba(102, 126, 234, 0.1)',
   transition: 'all 0.3s ease',
   cursor: 'pointer',
 },
 quickStatIcon: {
   fontSize: '24px',
 },
 quickStatValue: {
   fontSize: '20px',
   fontWeight: 'bold',
   color: '#667eea',
 },
 quickStatLabel: {
   fontSize: '10px',
   color: '#718096',
   fontWeight: '600',
   textTransform: 'uppercase' as 'uppercase',
   letterSpacing: '0.5px',
 },
 divider: {
   width: '1px',
   height: '40px',
   background: 'linear-gradient(to bottom, transparent, #e2e8f0, transparent)',
 },
 userInfo: {
   display: 'flex',
   alignItems: 'center',
   gap: '16px',
   padding: '8px 16px',
   borderRadius: '12px',
   cursor: 'pointer',
   transition: 'all 0.3s ease',
   flexDirection: 'row-reverse' as 'row-reverse',
 },
 userAvatar: {
   width: '46px',
   height: '46px',
   borderRadius: '50%',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   color: 'white',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   fontWeight: 'bold',
   fontSize: '18px',
   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
   transition: 'all 0.3s ease',
   border: '3px solid white',
 },
 userStatusDot: {
   position: 'absolute' as 'absolute',
   bottom: '2px',
   right: '2px',
   width: '12px',
   height: '12px',
   borderRadius: '50%',
   background: '#48bb78',
   border: '2px solid white',
   boxShadow: '0 0 0 2px rgba(72, 187, 120, 0.2)',
   transition: 'transform 0.3s ease',
 },
 userName: {
   fontSize: '15px',
   fontWeight: '700',
   color: '#1a202c',
   textAlign: 'right' as 'right',
 },
 userEmail: {
   fontSize: '12px',
   color: '#718096',
   textAlign: 'right' as 'right',
   marginTop: '2px',
 },
 logoutButton: {
   backgroundColor: 'white',
   color: '#667eea',
   border: '2px solid #667eea',
   padding: '12px 24px',
   borderRadius: '12px',
   fontSize: '14px',
   fontWeight: '700',
   cursor: 'pointer',
   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
   boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
   display: 'flex',
   alignItems: 'center',
   gap: '8px',
 },
 logoutIcon: {
   fontSize: '18px',
   display: 'inline-block',
   transition: 'transform 0.3s ease',
 },
 main: {
   maxWidth: '1200px',
   margin: '0 auto',
   padding: '40px 24px',
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
 // Home view styles
 optionsContainer: {
   maxWidth: '1000px',
   margin: '0 auto',
 },
 heroSection: {
   textAlign: 'center',
   marginBottom: '40px',
 },
 statsBar: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
   gap: '24px',
   marginBottom: '50px',
 },
 statItem: {
   backgroundColor: 'rgba(255, 255, 255, 0.98)',
   borderRadius: '16px',
   padding: '28px',
   display: 'flex',
   alignItems: 'center',
   gap: '20px',
   boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
   border: '1px solid rgba(255, 255, 255, 0.3)',
   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
   cursor: 'pointer',
 },
 statIconCircle: {
   width: '60px',
   height: '60px',
   borderRadius: '50%',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
 },
 statIcon: {
   fontSize: '32px',
 },
 statValue: {
   fontSize: '28px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '4px',
 },
 statLabel: {
   fontSize: '13px',
   color: '#718096',
   fontWeight: '500',
 },
 sectionTitle: {
   fontSize: '26px',
   fontWeight: 'bold',
   color: 'white',
   textAlign: 'center',
   marginBottom: '32px',
 },
 optionsGrid: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
   gap: '24px',
   marginBottom: '50px',
 },
 optionCard: {
   backgroundColor: 'white',
   borderRadius: '20px',
   padding: '40px',
   boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
   cursor: 'pointer',
   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
   textAlign: 'center',
   position: 'relative' as 'relative',
   overflow: 'hidden',
   border: '2px solid transparent',
 },
 decorativeCircle1: {
   position: 'absolute' as 'absolute',
   top: '-50px',
   right: '-50px',
   width: '150px',
   height: '150px',
   borderRadius: '50%',
   background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
   pointerEvents: 'none' as 'none',
 },
 decorativeCircle2: {
   position: 'absolute' as 'absolute',
   bottom: '-60px',
   left: '-60px',
   width: '180px',
   height: '180px',
   borderRadius: '50%',
   background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%)',
   pointerEvents: 'none' as 'none',
 },
 optionIcon: {
   fontSize: '72px',
   marginBottom: '20px',
   position: 'relative' as 'relative',
   zIndex: 1,
 },
 optionTitle: {
   fontSize: '26px',
   fontWeight: 'bold',
   color: '#1a202c',
   marginBottom: '16px',
   position: 'relative' as 'relative',
   zIndex: 1,
 },
 optionDescription: {
   fontSize: '16px',
   color: '#718096',
   marginBottom: '24px',
   lineHeight: '1.7',
   position: 'relative' as 'relative',
   zIndex: 1,
 },
 featureList: {
   textAlign: 'left',
   marginBottom: '28px',
   padding: '20px',
   backgroundColor: '#f7fafc',
   borderRadius: '12px',
   position: 'relative' as 'relative',
   zIndex: 1,
   border: '1px solid #e2e8f0',
 },
 featureItem: {
   fontSize: '14px',
   color: '#4a5568',
   marginBottom: '10px',
   fontWeight: '500',
 },
 optionButton: {
   display: 'inline-block',
   padding: '14px 36px',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   color: 'white',
   borderRadius: '12px',
   fontWeight: '600',
   fontSize: '16px',
   position: 'relative' as 'relative',
   zIndex: 1,
   boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
   transition: 'all 0.3s ease',
 },
};


export default Dashboard;





