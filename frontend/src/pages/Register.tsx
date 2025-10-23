

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ErrorPopup from '../components/ErrorPopup';




const Register: React.FC = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [password2, setPassword2] = useState('');
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);




const { register } = useAuth();
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
   if (!email.includes('@') || !email.includes('.')) {
    setError('Please enter a valid email address (e.g., name@example.com)');
    return;
  }
   if (!password) {
    setError('Please enter a password');
    return;
  }




  if (password.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }
   if (!password2) {
    setError('Please confirm your password');
    return;
  }




  if (password !== password2) {
    setError('Passwords do not match. Please make sure both passwords are identical.');
    return;
  }




  setLoading(true);
  setError(''); // Clear previous errors




  try {
    await register({
      email,
      password,
      password2,
      first_name: firstName,
      last_name: lastName,
    });
    navigate('/dashboard');
  } catch (err: any) {
    // Extract detailed error message
    let errorMessage = err.message || 'Registration failed. Please try again.';
  
    // Make error messages more user-friendly
    if (errorMessage.includes('unique')) {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (errorMessage.includes('password')) {
      errorMessage = 'Password does not meet requirements. Please use at least 8 characters with a mix of letters and numbers.';
    }
  
    setError(errorMessage);
  
    // Don't clear the form fields on error - let user see what they typed
  
  } finally {
    setLoading(false);
  }
};




return (
  <div style={styles.container}>
    {error && <ErrorPopup message={error} onClose={handleCloseError} />}
  
    <div style={styles.card}>
      <h1 style={styles.title}>Create Account</h1>
      <p style={styles.subtitle}>Sign up to get started</p>




      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={styles.input}
              placeholder="John"
            />
          </div>




          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={styles.input}
              placeholder="Doe"
            />
          </div>
        </div>




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




        <div>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            label="Password"
          />
          <small style={styles.hint}>Must be at least 8 characters</small>
        </div>




        <PasswordInput
          value={password2}
          onChange={setPassword2}
          required
          label="Confirm Password"
        />




        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>




      <p style={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" style={styles.link}>
          Sign in
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
},
card: {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '40px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
},
title: {
  fontSize: '28px',
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
formRow: {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
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
hint: {
  fontSize: '12px',
  color: '#a0aec0',
  display: 'block',
  marginTop: '4px',
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




export default Register;



