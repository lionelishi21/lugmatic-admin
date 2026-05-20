import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../lib/firebase';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export function usePushNotifications() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    if (!VAPID_KEY) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const setup = async () => {
      try {
        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: sw,
        });

        if (!token) return;

        // Register token with API
        await apiService.post('/user/fcm-token', { token, platform: 'web' }).catch(() => {});

        registered.current = true;

        // Foreground messages
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification ?? {};
          const data = payload.data ?? {};
          const msg = [title, body].filter(Boolean).join(' — ');
          toast(msg || 'New notification', {
            icon: '🔔',
            duration: 6000,
          });
          if (data.url) setTimeout(() => window.location.href = data.url, 6500);
        });
      } catch {
        // Push is optional — fail silently
      }
    };

    setup();
  }, []);
}
