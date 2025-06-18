// components/ResetPassword.js
import React, { useState } from 'react';
import './Login.css'; // Reusing the same styles
import useForgotPassword from './SalesReport/hooks/useForgotPassword';

const ResetPassword = ({ email, token, onBack, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { resetPassword, loading, error, success } = useForgotPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength (optional)
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    const result = await resetPassword(email, otp, newPassword, token);
    
    if (result.success) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
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
          <p className="subtitle">Enter OTP and new password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email-display" className="form-label">Email</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email-display"
                type="email"
                value={email}
                disabled
                className="form-input"
                style={{ backgroundColor: '#f5f5f5', color: '#666' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="otp" className="form-label">OTP</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          {(error || passwordError) && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error || passwordError}
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
                Resetting Password...
              </>
            ) : (
              'Reset Password'
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
            Back
          </button>
        </form>

        <div className="login-footer">
          <p>Enter the OTP sent to your email and create a new password</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;