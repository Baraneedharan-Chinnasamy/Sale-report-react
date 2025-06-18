import React, { useState } from 'react';
import './Login.css';
import useLogin from './SalesReport/hooks/authy';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, error: authError } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result) {
      onLogin();
    } else {
      setError(authError || 'Invalid credentials');
    }
  };

  const handleForgotPassword = () => {
    // This will be handled by the wrapper component in App.js
    if (window.onForgotPassword) {
      window.onForgotPassword();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">
            </div>
            <h1 className="logo-text">REPORTRIX</h1>
          </div>
          <p className="subtitle">Transforming sales data into actionable reports</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <circle cx="12" cy="16" r="1" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>

          {/* Forgot Password Button */}
          <button 
            type="button" 
            className="forgot-password-button"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </form>

        <div className="login-footer">
          <p>Secure access to your sales analytics</p>
        </div>
      </div>
    </div>
  );
};

export default Login;