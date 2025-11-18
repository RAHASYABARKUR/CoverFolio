import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TemplateGallery from "./pages/TemplateGallery";
import Editor from "./pages/Editor";
import AIChatbot from './components/AIChatbot';

const App: React.FC = () => {
 return (
   <Router>
     <AuthProvider>
       <Routes>
         {/* Guest-only Routes (redirect to dashboard if logged in) */}
         <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
         <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
         <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
         <Route path="/templates" element={<TemplateGallery />} />
         <Route path="/editor" element={<Editor />} />
        
         {/* Protected Routes (require authentication) */}
         <Route element={<ProtectedRoute />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/dashboard/portfolio" element={<Dashboard />} />
           <Route path="/dashboard/resumes" element={<Dashboard />} />
           <Route path="/dashboard/portfolio/preview/:resumeId" element={<Dashboard />} />
           <Route path="/dashboard/coverletter" element={<Dashboard />} />
         </Route>
        
         {/* Catch all - redirect to home */}
         <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
       
       {/* AI Chatbot - Available on all pages */}
       <AIChatbot />
     </AuthProvider>
   </Router>
 );
};


export default App;





