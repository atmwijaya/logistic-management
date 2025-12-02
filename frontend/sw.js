// sw.js - di root project
console.log('✅ Custom Service Worker loaded');

self.addEventListener('install', (event) => {
  console.log('🟡 Service Worker: Installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
  console.log('✅ Service Worker now controlling page');
});

self.addEventListener('fetch', (event) => {
  // Log semua fetch requests
  console.log('🔍 Fetch:', event.request.url);
});