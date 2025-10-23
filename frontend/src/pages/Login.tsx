import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ErrorPopup from '../components/ErrorPopup';




const Login: React.FC = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);




const { login } = useAuth();
const navigate = useNavigate();




// Stable onClose function to prevent unnecessary re-renders
const handleCloseError = useCallback(() => {
  setError('');
}, []);




const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // Prevent form submission and page reload
  e.preventDefault();
  e.stopPropagation();
   // Don't submit if already loading
  if (loading) {
    return;
  }
   // Client-side validation
  if (!email) {
    setError('Please enter your email address');
    return;
  }
   if (!email.includes('@')) {
    setError('Please enter a valid email address');
    return;
  }
   if (!password) {
    setError('Please enter your password');
    return;
  }
   if (password.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }
   setLoading(true);
  setError(''); // Clear previous errors




  try {
    await login({ email, password });
    navigate('/dashboard');
 } catch (err: any) {
   // Extract error message from response
   let errorMessage = 'Login failed. Please try again.';
 
   if (err.message) {
     errorMessage = err.message;
   }
 
   setError(errorMessage);
 
   // Don't clear the form fields on error - let user see what they typed
 
 } finally {
   setLoading(false);
 }
};








return (
  <div style={styles.container}>
    {/* Floating decorative shapes */}
    <div style={styles.shape1}></div>
    <div style={styles.shape2}></div>
    <div style={styles.shape3}></div>
    <div style={styles.shape4}></div>


    {/* Always render ErrorPopup conditionally based on error state */}
    {error && (
      <ErrorPopup
        message={error}
        onClose={handleCloseError}
      />
    )}
  
  
    <div style={styles.card}>
      {/* Coverfolio Branding */}
      <div style={styles.brandingSection}>
        <div style={styles.logoIconContainer}>
          <span style={styles.logoIcon}>📁</span>
        </div>
        <h2 style={styles.brandName}>Coverfolio</h2>
        <p style={styles.brandTagline}>✨ Create. Impress. Succeed</p>
      </div>


      <h1 style={styles.title}>Welcome Back</h1>
      <p style={styles.subtitle}>Sign in to your account</p>




      <form
        onSubmit={handleSubmit}
        style={styles.form}
        noValidate
      >
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="you@example.com"
          />
        </div>




        <PasswordInput
          value={password}
          onChange={setPassword}
          required
          label="Password"
        />




        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>




      <p style={styles.footer}>
        Don't have an account?{' '}
        <Link to="/register" style={styles.link}>
          Sign up
        </Link>
      </p>
    </div>
  </div>
);
};




const styles: { [key: string]: React.CSSProperties } = {
container: {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px',
  position: 'relative' as 'relative',
  overflow: 'hidden',
},
// Floating decorative shapes
shape1: {
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '5%',
  width: '250px',
  height: '250px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
  pointerEvents: 'none' as 'none',
},
shape2: {
  position: 'absolute' as 'absolute',
  top: '60%',
  right: '8%',
  width: '200px',
  height: '200px',
  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
  pointerEvents: 'none' as 'none',
},
shape3: {
  position: 'absolute' as 'absolute',
  bottom: '10%',
  left: '10%',
  width: '180px',
  height: '180px',
  borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
  pointerEvents: 'none' as 'none',
},
shape4: {
  position: 'absolute' as 'absolute',
  top: '30%',
  right: '15%',
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
  pointerEvents: 'none' as 'none',
},
card: {
  position: 'relative' as 'relative',
  zIndex: 1,
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '40px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
},
// Branding section
brandingSection: {
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '2px solid #f7fafc',
},
logoIconContainer: {
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
},
logoIcon: {
  fontSize: '32px',
},
brandName: {
  fontSize: '28px',
  fontWeight: '800',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
  marginBottom: '8px',
  letterSpacing: '-0.5px',
},
brandTagline: {
  fontSize: '13px',
  color: '#718096',
  margin: 0,
  fontWeight: '500',
},
title: {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '8px',
  color: '#1a202c',
  textAlign: 'center',
},
subtitle: {
  fontSize: '14px',
  color: '#718096',
  marginBottom: '32px',
  textAlign: 'center',
},
form: {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
},
formGroup: {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
},
label: {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2d3748',
},
input: {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  transition: 'border-color 0.2s',
  outline: 'none',
},
button: {
  backgroundColor: '#667eea',
  color: 'white',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '8px',
},
buttonDisabled: {
  backgroundColor: '#a0aec0',
  cursor: 'not-allowed',
},
footer: {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '14px',
  color: '#718096',
},
link: {
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: '600',
},
};




export default Login;



