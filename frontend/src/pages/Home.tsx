import React from 'react';
import { Link } from 'react-router-dom';


const Home: React.FC = () => {
 return (
   <div style={styles.container}>
     {/* Floating decorative shapes */}
     <div style={styles.shape1}></div>
     <div style={styles.shape2}></div>
     <div style={styles.shape3}></div>
     <div style={styles.shape4}></div>
     <div style={styles.shape5}></div>
     <div style={styles.shape6}></div>


     {/* Top navigation bar */}
     <nav style={styles.navbar}>
       <div style={styles.navContent}>
         <div style={styles.logoSection}>
           <div style={styles.logoIconContainer}>
             <span style={styles.logoIcon}>📁</span>
           </div>
           <div>
             <h2 style={styles.logo}>Coverfolio</h2>
             <p style={styles.logoTagline}>✨ Create. Impress. Succeed</p>
           </div>
         </div>
         <div style={styles.navButtons}>
           <Link to="/login" style={styles.navLoginButton}>
             Sign In
           </Link>
           <Link to="/register" style={styles.navRegisterButton}>
             Sign Up →
           </Link>
         </div>
       </div>
     </nav>


     {/* Hero Section */}
     <div style={styles.content}>
       <div style={styles.heroBadge}>
         <span style={styles.heroBadgeIcon}>✨</span>
         <span style={styles.heroBadgeText}>The Future of Professional Portfolios</span>
       </div>


       <h1 style={styles.title}>
         Transform Your Resume Into a
         <span style={styles.titleHighlight}> Stunning Portfolio</span>
       </h1>
      
       <p style={styles.subtitle}>
         Welcome to <strong>Coverfolio</strong> — where your career documents become powerful digital experiences.
         Create professional portfolios and compelling cover letters in minutes, no coding required.
       </p>
      
       <div style={styles.buttonGroup}>
         <Link
           to="/register"
           style={styles.primaryButton}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-4px)';
             e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 255, 255, 0.4)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.25)';
           }}
         >
           Sign Up Free
         </Link>
         <Link
           to="/login"
           style={styles.secondaryButton}
           onMouseEnter={(e) => {
             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
             e.currentTarget.style.transform = 'translateY(-4px)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
             e.currentTarget.style.transform = 'translateY(0)';
           }}
         >
           Sign In
         </Link>
       </div>


       {/* Feature cards with enhanced design */}
       <div style={styles.features}>
         <div
           style={styles.feature}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-8px)';
             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
           }}
         >
           <div style={styles.featureIconWrapper}>
             <div style={styles.featureIcon}>📂</div>
           </div>
           <h3 style={styles.featureTitle}>Portfolio Maker</h3>
           <p style={styles.featureText}>
             Upload your resume and instantly generate a beautiful, responsive portfolio website
           </p>
           <div style={styles.featureHighlight}>Quick & Easy</div>
         </div>
        
         <div
           style={styles.feature}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-8px)';
             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
           }}
         >
           <div style={styles.featureIconWrapper}>
             <div style={styles.featureIcon}>✉️</div>
           </div>
           <h3 style={styles.featureTitle}>Cover Letter Generator</h3>
           <p style={styles.featureText}>
             Create personalized, compelling cover letters tailored to any job description
           </p>
           <div style={styles.featureHighlight}>AI-Powered</div>
         </div>
        
         <div
           style={styles.feature}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-8px)';
             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
           }}
         >
           <div style={styles.featureIconWrapper}>
             <div style={styles.featureIcon}>⚡</div>
           </div>
           <h3 style={styles.featureTitle}>Stand Out</h3>
           <p style={styles.featureText}>
             Impress recruiters with professional designs that showcase your unique talents
           </p>
           <div style={styles.featureHighlight}>Professional</div>
         </div>
       </div>
     </div>
   </div>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 container: {
   minHeight: '100vh',
   display: 'flex',
   flexDirection: 'column' as 'column',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   padding: '0',
   position: 'relative' as 'relative',
   overflow: 'hidden',
 },
 // Floating decorative shapes
 shape1: {
   position: 'absolute' as 'absolute',
   top: '10%',
   left: '5%',
   width: '300px',
   height: '300px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 shape2: {
   position: 'absolute' as 'absolute',
   top: '60%',
   right: '8%',
   width: '250px',
   height: '250px',
   borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 shape3: {
   position: 'absolute' as 'absolute',
   bottom: '15%',
   left: '10%',
   width: '200px',
   height: '200px',
   borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 shape4: {
   position: 'absolute' as 'absolute',
   top: '30%',
   right: '15%',
   width: '180px',
   height: '180px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 shape5: {
   position: 'absolute' as 'absolute',
   bottom: '5%',
   right: '20%',
   width: '150px',
   height: '150px',
   borderRadius: '40% 60% 60% 40% / 60% 30% 70% 40%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
 },
 shape6: {
   position: 'absolute' as 'absolute',
   top: '50%',
   left: '50%',
   width: '400px',
   height: '400px',
   borderRadius: '50%',
   background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
   pointerEvents: 'none' as 'none',
   transform: 'translate(-50%, -50%)',
 },
 // Navigation bar
 navbar: {
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
   backdropFilter: 'blur(20px)',
   padding: '20px 0',
   position: 'sticky' as 'sticky',
   top: 0,
   zIndex: 100,
   borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
 },
 navContent: {
   maxWidth: '1200px',
   margin: '0 auto',
   padding: '0 32px',
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 logoSection: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
 },
 logoIconContainer: {
   width: '48px',
   height: '48px',
   borderRadius: '12px',
   background: 'white',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
 },
 logoIcon: {
   fontSize: '26px',
 },
 logo: {
   fontSize: '24px',
   fontWeight: '800',
   color: 'white',
   margin: 0,
   letterSpacing: '-0.5px',
 },
 logoTagline: {
   fontSize: '11px',
   color: 'rgba(255, 255, 255, 0.85)',
   margin: 0,
   marginTop: '2px',
   fontWeight: '500',
 },
 navButtons: {
   display: 'flex',
   gap: '12px',
   alignItems: 'center',
 },
 navLoginButton: {
   color: 'white',
   padding: '10px 20px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '600',
   textDecoration: 'none',
   transition: 'all 0.2s',
   background: 'transparent',
 },
 navRegisterButton: {
   background: 'white',
   color: '#667eea',
   padding: '10px 20px',
   borderRadius: '8px',
   fontSize: '14px',
   fontWeight: '700',
   textDecoration: 'none',
   transition: 'all 0.2s',
   boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)',
 },
 // Hero section
 content: {
   maxWidth: '1100px',
   margin: '0 auto',
   padding: '40px 32px 32px',
   textAlign: 'center' as 'center',
   color: 'white',
   position: 'relative' as 'relative',
   zIndex: 1,
 },
 heroBadge: {
   display: 'inline-flex',
   alignItems: 'center',
   gap: '8px',
   background: 'rgba(255, 255, 255, 0.15)',
   backdropFilter: 'blur(10px)',
   padding: '8px 16px',
   borderRadius: '50px',
   marginBottom: '20px',
   border: '1px solid rgba(255, 255, 255, 0.2)',
 },
 heroBadgeIcon: {
   fontSize: '14px',
 },
 heroBadgeText: {
   fontSize: '12px',
   fontWeight: '600',
   letterSpacing: '0.3px',
 },
 title: {
   fontSize: '44px',
   fontWeight: '900',
   marginBottom: '16px',
   lineHeight: '1.2',
   letterSpacing: '-1px',
 },
 titleHighlight: {
   background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)',
   WebkitBackgroundClip: 'text',
   WebkitTextFillColor: 'transparent',
   display: 'inline-block',
 },
 subtitle: {
   fontSize: '17px',
   marginBottom: '32px',
   opacity: 0.95,
   maxWidth: '700px',
   margin: '0 auto 32px',
   lineHeight: '1.6',
 },
 buttonGroup: {
   display: 'flex',
   gap: '16px',
   justifyContent: 'center',
   marginBottom: '50px',
   flexWrap: 'wrap' as 'wrap',
 },
 primaryButton: {
   backgroundColor: 'white',
   color: '#667eea',
   padding: '14px 32px',
   borderRadius: '12px',
   fontSize: '16px',
   fontWeight: '700',
   textDecoration: 'none',
   display: 'inline-block',
   transition: 'all 0.3s ease',
   boxShadow: '0 8px 24px rgba(255, 255, 255, 0.25)',
 },
 secondaryButton: {
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
   color: 'white',
   border: '2px solid rgba(255, 255, 255, 0.4)',
   padding: '14px 32px',
   borderRadius: '12px',
   fontSize: '16px',
   fontWeight: '700',
   textDecoration: 'none',
   display: 'inline-block',
   transition: 'all 0.3s ease',
   backdropFilter: 'blur(10px)',
 },
 features: {
   display: 'grid',
   gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
   gap: '24px',
   marginTop: '0px',
 },
 feature: {
   backgroundColor: 'white',
   padding: '28px 24px',
   borderRadius: '16px',
   backdropFilter: 'blur(10px)',
   transition: 'all 0.3s ease',
   position: 'relative' as 'relative',
   boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
   textAlign: 'left' as 'left',
 },
 featureIconWrapper: {
   width: '56px',
   height: '56px',
   borderRadius: '12px',
   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   marginBottom: '16px',
   boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
 },
 featureIcon: {
   fontSize: '28px',
 },
 featureTitle: {
   fontSize: '18px',
   fontWeight: '700',
   marginBottom: '8px',
   color: '#1a202c',
 },
 featureText: {
   fontSize: '14px',
   color: '#4a5568',
   lineHeight: '1.6',
   marginBottom: '12px',
 },
 featureHighlight: {
   display: 'inline-block',
   padding: '4px 12px',
   background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
   color: '#667eea',
   borderRadius: '6px',
   fontSize: '11px',
   fontWeight: '700',
   letterSpacing: '0.5px',
 },
};


export default Home;



