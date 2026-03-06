import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to handle session expired 401 errors
 * Listens for sessionExpired event, clears auth state, and redirects to login
 */
export const useSessionExpired = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const handleSessionExpired = (event) => {
      console.log('🔴 Session Expired - logging out and redirecting to login');
      // Clear React auth state
      logout();
      // Redirect to login page
      navigate('/login', { replace: true });
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [navigate, logout]);
};

export default useSessionExpired;
