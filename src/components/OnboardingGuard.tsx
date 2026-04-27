import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArtistContext } from '../context/ArtistContext';
import Preloader from './ui/Preloader';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { currentArtist, loading: artistLoading } = useArtistContext();
  const location = useLocation();

  if (authLoading || artistLoading) {
    return <Preloader isVisible={true} text="Verifying artist status..." />;
  }

  // If not logged in, or not an artist, let the standard ProtectedRoute handle it
  if (!user || user.role !== 'artist') {
    return <>{children}</>;
  }

  // If artist is loaded, check if onboarding is completed
  if (currentArtist) {
    if (!currentArtist.onboardingCompleted) {
      // Prevent redirect loop if already on the onboarding page
      if (location.pathname !== '/artist/onboarding') {
        return <Navigate to="/artist/onboarding" replace />;
      }
    } else {
      // If onboarding is completed but they are trying to access onboarding page
      if (location.pathname === '/artist/onboarding') {
        return <Navigate to="/artist" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default OnboardingGuard;
