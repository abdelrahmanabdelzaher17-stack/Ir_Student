const CACHE_NAME = 'iron-student-pwa-v4';
const ASSETS = [
  './',               // لاحظ النقطة هنا
  './index.html',     // لاحظ النقطة هنا
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'
];
// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installing...');
  self.skipWaiting(); // تفعيل الـ SW فوراً دون انتظار
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching assets...');
        return cache.addAll(ASSETS);
      })
      .then(() => console.log('✅ All assets cached'))
      .catch(err => console.error('❌ Caching failed:', err))
  );
});

// تفعيل Service Worker (وحذف الكاش القديم)
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('🗑️ Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim(); // السيطرة على جميع الصفحات المفتوحة
    })
  );
});

// استراتيجية Cache First مع الرجوع للشبكة
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات الـ extension (مثل chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('🎯 From cache:', event.request.url);
        return response;
      }
      console.log('🌐 From network:', event.request.url);
      return fetch(event.request).catch((error) => {
        console.error('❌ Network failed:', event.request.url, error);
        // إذا كان الطلب لصفحة HTML، أعد الصفحة الرئيسية من الكاش
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
