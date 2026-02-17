import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { initializeAuth } from '../store/slices/authSlice';

/**
 * Component to initialize authentication state from localStorage on app start.
 * Validates token if /auth/me endpoint exists, otherwise just checks token presence.
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!initialized.current) {
      initialized.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;

