// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const auth = useAuth();

  // --- Standard Email/Password Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.token) {
            auth.login(response.data.token);
            navigate('/dashboard');
        } else {
            setError('An unexpected error occurred. No token received.');
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
             setError(err.response.data.msg); // Shows "Please verify your email" if not verified
        } else {
             setError('Invalid email or password. Please try again.');
        }
    }
  };

  // --- Google Auth Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to our backend
      const response = await api.post('/auth/google', { 
        idToken: credentialResponse.credential 
      });
      
      if (response.data && response.data.token) {
        auth.login(response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Google authentication failed on our server.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtext">Please enter your details to sign in.</p>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
          <button type="submit" className="auth-button">Sign In</button>
        </form>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
           <p style={{ marginBottom: '15px' }}>OR</p>
           <div style={{ display: 'flex', justifyContent: 'center' }}>
             <GoogleLogin 
               onSuccess={handleGoogleSuccess}
               onError={() => setError('Google Login Widget Failed.')}
             />
           </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;