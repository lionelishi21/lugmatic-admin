import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  loginUser,
  logout,
  clearError,
} from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      const resultAction = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        // Only admin and artist roles can access the dashboard
        if (userData.role !== 'admin' && userData.role !== 'artist') {
          // Clear stored tokens since this user isn't allowed
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          dispatch(logout());
          throw new Error('Access denied. Only admin and artist accounts can access this dashboard.');
        }
        
        // Verify token was stored before navigating
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Token not stored after login');
        }
        
        // Navigate based on user role using React Router
        const targetPath = userData.role === 'admin' ? '/admin' : '/artist';
        navigate(targetPath, { replace: true });
        
        return userData;
      }
      
      if (loginUser.rejected.match(resultAction)) {
        const error = resultAction.payload as string || 'Login failed';
        throw new Error(error);
      }
    },
    [dispatch, navigate]
  );

  const logoutUser = useCallback(async () => {
    try {
      // Try to call backend logout endpoint (fire-and-forget)
      // This helps invalidate the token on the server side
      apiService.logout().catch((error) => {
        // Silently fail - we still want to logout locally
        if (process.env.NODE_ENV === 'development') {
          console.warn('Backend logout failed:', error);
        }
      });
    } catch (error) {
      // Ignore errors - ensure local logout happens regardless
      if (process.env.NODE_ENV === 'development') {
        console.warn('Logout error:', error);
      }
    } finally {
      // Always clear local state and redirect
      // This ensures logout works even if backend is unreachable
      dispatch(logout());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    logout: logoutUser,
    clearAuthError,
  };
}; 