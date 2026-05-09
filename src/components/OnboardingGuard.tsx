import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Preloader from './ui/Preloader';
import api from '@/services/api';

type CheckState = 'idle' | 'checking' | 'approved' | 'needs-onboarding';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const [check, setCheck] = useState<CheckState>('idle');
  const fetched = useRef(false);

  const isArtist = user?.role === 'artist';

  useEffect(() => {
    // Only run for artists, only once
    if (!isArtist || fetched.current) return;
    fetched.current = true;
    setCheck('checking');

    api.get('/onboarding/status')
      .then(res => {
        const data = res.data?.data as { verificationStatus?: string } | null;
        setCheck(data?.verificationStatus === 'approved' ? 'approved' : 'needs-onboarding');
      })
      .catch(() => {
        // API error (e.g. no artist profile yet) — send to onboarding
        setCheck('needs-onboarding');
      });
  }, [isArtist]);

  // Still initialising auth
  if (authLoading) {
    return <Preloader isVisible={true} text="Loading..." />;
  }

  // Non-artists (admins acting on artist pages, etc.) pass straight through
  if (!user || !isArtist) {
    return <>{children}</>;
  }

  // Waiting for the status API call
  if (check === 'idle' || check === 'checking') {
    return <Preloader isVisible={true} text="Verifying artist status..." />;
  }

  // Not yet approved — send to onboarding (the onboarding route is a sibling, outside this guard)
  if (check === 'needs-onboarding') {
    return <Navigate to="/artist/onboarding" replace />;
  }

  // Approved — render the protected content
  return <>{children}</>;
};

export default OnboardingGuard;
