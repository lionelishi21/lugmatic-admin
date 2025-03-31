import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  loginUser,
  logout,
  clearError,
} from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      const resultAction = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        // Navigate based on user role
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/artist');
        }
        
        return userData;
      }
      
      if (loginUser.rejected.match(resultAction)) {
        const error = resultAction.payload as string || 'Login failed';
        throw new Error(error);
      }
    },
    [dispatch, navigate]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
    navigate('/login');
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