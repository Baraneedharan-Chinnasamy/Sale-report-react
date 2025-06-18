// components/ForgotPassword.js
import React, { useState } from 'react';
import './Login.css'; // Reusing the same styles
import useForgotPassword from './SalesReport/hooks/useForgotPassword';

const ForgotPassword = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const { sendOTP, loading, error, success } = useForgotPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await sendOTP(email);
    
    if (result.success) {
      // Pass email and token to the reset password page
      onSuccess(email, result.token);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon"></div>
            <h1 className="logo-text">REPORTRIX</h1>
          </div>
          <p className="subtitle">Reset your password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {success && (
            <div className="success-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              {success}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>

          <button 
            type="button" 
            className="back-button" 
            onClick={onBack}
            style={{
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              marginTop: '10px'
            }}
          >
            Back to Login
          </button>
        </form>

        <div className="login-footer">
          <p>Enter your email to receive an OTP for password reset</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;