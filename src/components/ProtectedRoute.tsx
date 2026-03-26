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
  requiredRole?: 'admin' | 'artist' | 'contributor';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = getAccessToken();
  const { user } = useSelector((state: RootState) => state.auth);

  // No token = not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allowed roles
  const allowedRoles = ['admin', 'artist', 'contributor', 'super admin'];

  // Regular users belong on the fan webapp, not here
  if (user && !allowedRoles.includes(user.role || '')) {
    window.location.href = 'https://lugmaticmusic.com';
    return null;
  }

  // If a specific role is required, check the user's role
  if (requiredRole && user && user.role !== requiredRole) {
    // If user is super admin, they can access admin pages
    if (requiredRole === 'admin' && user.role === 'super admin') return <>{children}</>;

    // Redirect to their respective dashboard
    let fallback = '/artist';
    if (user.role === 'admin' || user.role === 'super admin') fallback = '/admin';
    else if (user.role === 'contributor') fallback = '/contributor';
    
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
