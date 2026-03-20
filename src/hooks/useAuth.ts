import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  loginUser,
  logout,
  clearError,
  refreshUser as refreshUserThunk
} from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      const resultAction = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        // Allowed roles for this dashboard
        const allowedRoles = ['admin', 'artist', 'contributor', 'super admin'];
        if (!allowedRoles.includes(userData.role)) {
          // Clear stored tokens since this user isn't allowed
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          dispatch(logout());
          throw new Error('Access denied. You do not have permission to access this portal.');
        }
        
        // Navigate based on user role
        let targetPath = '/artist';
        if (userData.role === 'admin' || userData.role === 'super admin') targetPath = '/admin';
        else if (userData.role === 'contributor') targetPath = '/contributor';

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

  const refreshUser = useCallback(async () => {
    await dispatch(refreshUserThunk());
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      // Try to call backend logout endpoint
      userService.logout().catch(() => {});
    } catch (error) {
      // Ignore errors
    } finally {
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
    refreshUser,
    clearAuthError,
  };
}; 