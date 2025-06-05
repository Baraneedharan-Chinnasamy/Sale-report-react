import { useState } from 'react';
import axios from 'axios';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // Step 1: Login
      const loginResponse = await axios.post(
        'http://localhost:8000/api/login?business=Authentication',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        }
      );

      // Step 2: Fetch user info
      const userResponse = await axios.get(
        'http://localhost:8000/api/users?business=Authentication',
        {
          withCredentials: true,
        }
      );

      // Step 3: Store user info in localStorage
      const userData = userResponse.data;
      localStorage.setItem('user', JSON.stringify(userData));

      return { message: loginResponse.data.message, user: userData };
    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || 'Login failed');
      } else {
        setError('Network error');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
