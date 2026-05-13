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
  const normalizedUserRole = (user?.role || '').toLowerCase().trim();
  const allowedRoles = ['admin', 'artist', 'contributor', 'super admin', 'superadmin'];

  // Regular users belong on the fan webapp, not here
  if (user && !allowedRoles.includes(normalizedUserRole)) {
    window.location.href = 'https://lugmaticmusic.com';
    return null;
  }

  if (requiredRole && user && normalizedUserRole !== targetRole) {
    // If user is super admin, they can access admin pages
    const isAdmin = normalizedUserRole.includes('admin');
    if (targetRole === 'admin' && isAdmin) return <>{children}</>;

    // Redirect to their respective dashboard
    let fallback = '/artist';
    if (isAdmin) fallback = '/admin';
    else if (normalizedUserRole === 'contributor') fallback = '/contributor';
    
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
