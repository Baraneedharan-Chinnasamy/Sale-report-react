import axios from 'axios';

const useLogout = () => {
  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/logout', {}, {
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
