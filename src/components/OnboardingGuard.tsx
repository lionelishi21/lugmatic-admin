import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Preloader from './ui/Preloader';
import api from '@/services/api';

interface OnboardingStatus {
  verificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  onboardingCompleted: boolean;
  onboardingStep: number;
  rejectionReason?: string;
}

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { currentArtist, loading: artistLoading } = useSelector((state: RootState) => state.artist);
  const location = useLocation();

  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch live onboarding status when artist is loaded
  useEffect(() => {
    if (!user || user.role !== 'artist' || !currentArtist) return;
    setStatusLoading(true);
    api.get('/onboarding/status')
      .then(res => setOnboardingStatus(res.data.data as OnboardingStatus))
      .catch(() => setOnboardingStatus(null))
      .finally(() => setStatusLoading(false));
  }, [user, currentArtist]);

  if (authLoading || artistLoading || statusLoading) {
    return <Preloader isVisible={true} text="Verifying artist status..." />;
  }

  // Non-artists pass through unchanged
  if (!user || user.role !== 'artist') {
    return <>{children}</>;
  }

  const path = location.pathname;
  const onOnboardingPage = path === '/artist/onboarding';

  if (currentArtist && onboardingStatus) {
    const { verificationStatus } = onboardingStatus;

    // Approved — full access, bounce off onboarding page
    if (verificationStatus === 'approved') {
      if (onOnboardingPage) return <Navigate to="/artist" replace />;
      return <>{children}</>;
    }

    // Pending review — lock everything except the onboarding status page
    if (verificationStatus === 'pending') {
      if (!onOnboardingPage) return <Navigate to="/artist/onboarding" replace />;
      return <>{children}</>;
    }

    // Rejected — redirect to onboarding so they can revise and resubmit
    if (verificationStatus === 'rejected') {
      if (!onOnboardingPage) return <Navigate to="/artist/onboarding" replace />;
      return <>{children}</>;
    }

    // Not yet submitted — force onboarding
    if (!onboardingStatus.onboardingCompleted) {
      if (!onOnboardingPage) return <Navigate to="/artist/onboarding" replace />;
      return <>{children}</>;
    }
  } else if (currentArtist && !onboardingStatus) {
    // Status fetch failed or not yet available — fall back to local artist data
    if (!currentArtist.onboardingCompleted && !onOnboardingPage) {
      return <Navigate to="/artist/onboarding" replace />;
    }
    if (currentArtist.onboardingCompleted && onOnboardingPage) {
      return <Navigate to="/artist" replace />;
    }
  }

  return <>{children}</>;
};

export default OnboardingGuard;
