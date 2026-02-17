import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAccessToken } from '../services/api';

interface RootState {
  auth: {
    user: { role?: string } | null;
    isAuthenticated: boolean;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'artist';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = getAccessToken();
  const { user } = useSelector((state: RootState) => state.auth);

  // No token = not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Block regular users entirely - only admin and artist can access this dashboard
  if (user && user.role !== 'admin' && user.role !== 'artist') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check the user's role
  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect non-admins away from admin pages, and vice versa
    const fallback = user.role === 'admin' ? '/admin' : '/artist';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

