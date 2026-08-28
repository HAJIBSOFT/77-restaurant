const CACHE_NAME = 'seventy-seven-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './qrcode.png' // تذكر إضافة أي ملفات أو صور محلية تستخدمها هنا
];

// تثبيت ملف الخدمة وتخزين الملفات الأساسية مؤقتاً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// تفعيل وتحديث الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// جلب البيانات واستخدام الكاش عند انقطاع الاتصال
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});