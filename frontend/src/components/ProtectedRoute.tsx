import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const ProtectedRoute: React.FC = () => {
 const { isAuthenticated, loading } = useAuth();


 if (loading) {
   return (
     <div style={styles.loadingContainer}>
       <div style={styles.spinner}></div>
       <p>Loading...</p>
     </div>
   );
 }


 return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};


const styles: { [key: string]: React.CSSProperties } = {
 loadingContainer: {
   display: 'flex',
   flexDirection: 'column',
   justifyContent: 'center',
   alignItems: 'center',
   height: '100vh',
   gap: '20px',
 },
 spinner: {
   border: '4px solid #f3f3f3',
   borderTop: '4px solid #3498db',
   borderRadius: '50%',
   width: '40px',
   height: '40px',
   animation: 'spin 1s linear infinite',
 },
};


export default ProtectedRoute;

