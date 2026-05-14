import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface AdSenseProps {
  className?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'autorelaxed';
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense = ({ className, slot = '1168640841', format = 'autorelaxed' }: AdSenseProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Logic to hide ads for subscribed users
  // Note: We need a reliable way to check subscription status. 
  // Assuming 'admin' and users with a subscription record don't see ads.
  const isSubscribed = user?.role === 'admin' || user?.role === 'super admin'; 
  
  useEffect(() => {
    if (isSubscribed) return;
    
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [isSubscribed]);

  if (isSubscribed) return null;

  return (
    <div className={`adsense-container overflow-hidden my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6524318430609026"
        data-ad-slot={slot}
        data-ad-format={format}
      />
    </div>
  );
};

export default AdSense;
