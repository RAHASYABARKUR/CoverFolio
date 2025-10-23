import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


interface GuestRouteProps {
 children: React.ReactNode;
}


/**
* Wrapper component that redirects authenticated users away from guest-only pages
* (like login, register, home)
*/
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
 const { user } = useAuth();


 // If user is authenticated, redirect to dashboard
 if (user) {
   return <Navigate to="/dashboard" replace />;
 }


 // Otherwise, render the guest page
 return <>{children}</>;
};


export default GuestRoute;






