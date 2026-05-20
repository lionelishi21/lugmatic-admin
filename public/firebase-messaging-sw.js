// Firebase Cloud Messaging Service Worker — Lugmatic Artist Studio
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDyVC_Kh0kV9EC6B0lYFVO3StUgA6P7884',
  authDomain:        'lugmatic-fe310.firebaseapp.com',
  projectId:         'lugmatic-fe310',
  storageBucket:     'lugmatic-fe310.firebasestorage.app',
  messagingSenderId: '518032014474',
  appId:             '1:518032014474:web:d32f7b1fbadd66f2cec173',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  const data = payload.data ?? {};

  self.registration.showNotification(title || 'Lugmatic Studio', {
    body:  body || 'You have a new notification',
    icon:  icon || '/logo.png',
    badge: '/logo.png',
    tag:   data.type || 'studio-notification',
    data:  { url: data.url || '/artist', type: data.type },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/artist';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(url) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
