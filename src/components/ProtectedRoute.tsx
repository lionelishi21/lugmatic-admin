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
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Wait for auth initialization
  if (isLoading) {
    return null; // Or a loading spinner
  }

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

  // If a specific role is required, check the user's role
  const targetRole = requiredRole?.toLowerCase().trim();

  console.log(`[AuthDebug] Current Path: ${window.location.pathname}`);
  console.log(`[AuthDebug] User Role: ${normalizedUserRole}`);
  console.log(`[AuthDebug] Target Role: ${targetRole}`);

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
