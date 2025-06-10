import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useLogout = () => {
  const logout = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/logout`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return { error: error.response?.data?.message || 'Logout failed' };
    }
  };

  return { logout };
};

export default useLogout;
