

import React from 'react';


interface ErrorPopupProps {
 message: string;
 onClose: () => void;
}


const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
 // No auto-close - user must manually dismiss the error


 return (
   <>
     {/* Backdrop */}
     <div style={styles.backdrop} onClick={onClose}></div>
    
     {/* Popup */}
     <div style={styles.popup}>
       {/* Close X button at top right */}
       <button onClick={onClose} style={styles.closeX} aria-label="Close">
         ✕
       </button>
      
       <div style={styles.header}>
         <div style={styles.iconContainer}>
           <span style={styles.icon}>⚠️</span>
         </div>
         <h3 style={styles.title}>Error</h3>
       </div>
      
       <p style={styles.message}>
         {message.split('\n').map((line, index) => (
           <span key={index}>
             {line}
             {index < message.split('\n').length - 1 && <br />}
           </span>
         ))}
       </p>
      
       <button onClick={onClose} style={styles.closeButton}>
         Got it
       </button>
     </div>
   </>
 );
};


const styles: { [key: string]: React.CSSProperties } = {
 backdrop: {
   position: 'fixed',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   zIndex: 999,
   animation: 'fadeIn 0.2s ease-in',
 },
 popup: {
   position: 'fixed',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   backgroundColor: 'white',
   borderRadius: '12px',
   padding: '24px',
   maxWidth: '450px',
   width: '90%',
   boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
   zIndex: 1000,
   animation: 'slideIn 0.3s ease-out',
   maxHeight: '80vh',
   overflow: 'auto',
 },
 header: {
   display: 'flex',
   alignItems: 'center',
   gap: '12px',
   marginBottom: '16px',
 },
 iconContainer: {
   width: '40px',
   height: '40px',
   borderRadius: '50%',
   backgroundColor: '#fee',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
 },
 icon: {
   fontSize: '24px',
 },
 title: {
   margin: 0,
   fontSize: '20px',
   fontWeight: '600',
   color: '#c53030',
 },
 message: {
   margin: '0 0 24px 0',
   fontSize: '14px',
   color: '#2d3748',
   lineHeight: '1.6',
   whiteSpace: 'pre-line',
 },
 closeButton: {
   width: '100%',
   padding: '12px',
   backgroundColor: '#667eea',
   color: 'white',
   border: 'none',
   borderRadius: '8px',
   fontSize: '16px',
   fontWeight: '600',
   cursor: 'pointer',
   transition: 'background-color 0.2s',
 },
 closeX: {
   position: 'absolute',
   top: '16px',
   right: '16px',
   background: 'transparent',
   border: 'none',
   fontSize: '24px',
   color: '#718096',
   cursor: 'pointer',
   padding: '4px 8px',
   lineHeight: '1',
   transition: 'color 0.2s',
   fontWeight: '300',
 },
};


export default ErrorPopup;








