// hooks/useForgotPassword.js
import { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;
const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOTP = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_URL}/api/forgot-password?business=Authentication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send OTP');
      }

      setSuccess(data.message);
      return {
        success: true,
        token: data.token,
        message: data.message
      };
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword, token) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/reset-password?business=Authentication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          token
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password');
      }

      setSuccess(data.message);
      return {
        success: true,
        message: data.message
      };
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOTP,
    resetPassword,
    loading,
    error,
    success,
    setError,
    setSuccess
  };
};

export default useForgotPassword;