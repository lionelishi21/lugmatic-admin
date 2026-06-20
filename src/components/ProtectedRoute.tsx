import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAccessToken } from '../services/api';
import { getPrimaryRole } from '../store/slices/authSlice';

interface RootState {
  auth: {
    user: { role?: string; roles?: string[] } | null;
    isAuthenticated: boolean;
    isLoading?: boolean;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super admin' | 'artist' | 'contributor' | 'provider';
}

function getRedirectPath(role: string): string {
  if (role === 'admin' || role === 'super admin') return '/admin';
  if (role === 'contributor') return '/contributor';
  if (role === 'provider') return '/provider';
  return '/artist';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = getAccessToken();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (user) {
    const userRoles: string[] = (user as any).roles?.length > 0 ? (user as any).roles : [user.role || 'user'];
    const primaryRole = getPrimaryRole(user as any);
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super admin');
    const isAllowed = isAdmin || ['artist', 'contributor', 'provider'].some(r => userRoles.includes(r));

    // Regular fan accounts do not belong in this dashboard
    if (!isAllowed) {
      window.location.href = 'https://lugmaticmusic.com';
      return null;
    }

    if (requiredRole) {
      const requiredNorm = requiredRole.toLowerCase().trim();
      const hasRequired = userRoles.includes(requiredNorm) ||
                          (requiredNorm === 'admin' && isAdmin);

      if (!hasRequired) {
        const fallback = getRedirectPath(primaryRole);
        if (window.location.pathname.startsWith(fallback)) return <>{children}</>;
        return <Navigate to={fallback} replace />;
      }
    }
  }

  return <>{children}</>;
}
