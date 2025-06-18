import React, { useState } from 'react';
import TabContainer from './components/TabContainer';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Wrapper component for Login with navigation
const LoginWrapper = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Set up global forgot password handler for the Login component
  React.useEffect(() => {
    window.onForgotPassword = handleForgotPassword;
    return () => {
      window.onForgotPassword = null;
    };
  }, []);

  return <Login onLogin={onLogin} />;
};

// Wrapper component for ForgotPassword with navigation
const ForgotPasswordWrapper = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/login');
  };

  const handleSuccess = (email, token) => {
    // Navigate to reset password with state
    navigate('/reset-password', { 
      state: { email, token } 
    });
  };

  return (
    <ForgotPassword 
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
};

// Wrapper component for ResetPassword with navigation
const ResetPasswordWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and token from navigation state
  const { email, token } = location.state || {};
  
  // Redirect to forgot password if no email/token
  React.useEffect(() => {
    if (!email || !token) {
      navigate('/forgot-password');
    }
  }, [email, token, navigate]);

  const handleBack = () => {
    navigate('/forgot-password');
  };

  const handleSuccess = () => {
    // Navigate back to login with success message
    navigate('/login', { 
      state: { message: 'Password reset successful! Please login with your new password.' }
    });
  };

  if (!email || !token) {
    return null; // Will redirect in useEffect
  }

  return (
    <ResetPassword
      email={email}
      token={token}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
};

// Updated Login wrapper to handle success messages
const LoginWithMessage = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  
  // Check for success message from navigation state
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      setTimeout(() => {
        setSuccessMessage('');
        // Clear the navigation state
        navigate('/login', { replace: true });
      }, 5000);
    }
  }, [location.state, navigate]);

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Set up global forgot password handler for the Login component
  React.useEffect(() => {
    window.onForgotPassword = handleForgotPassword;
    return () => {
      window.onForgotPassword = null;
    };
  }, []);

  return (
    <div>
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '12px 24px',
          zIndex: 1000,
          fontSize: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          ✓ {successMessage}
        </div>
      )}
      <Login onLogin={onLogin} />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginWithMessage onLogin={handleLogin} />
        } />
        
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordWrapper />
        } />
        
        <Route path="/reset-password" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPasswordWrapper />
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? <TabContainer onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;