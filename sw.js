// قم بتغيير رقم الإصدار عند إجراء أي تعديل رئيسي
const CACHE_NAME = 'seventy-seven-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './qrcode.png'
];

// 1. التثبيت والتخزين المؤقت المبدئي + التفعيل الفوري
self.addEventListener('install', (event) => {
  self.skipWaiting(); // يتجاوز حالة الانتظار ويفعل الـ Service Worker الجديد فورًا
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. التفعيل وحذف الكاش القديم + السيطرة الفورية على الصفحات
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // السيطرة على كافة التبويبات المفتوحة فورًا
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// 3. استراتيجية الجلب (Network First): محاولة الشبكة أولاً، مع العودة للكاش عند انقطاع الاتصال
self.addEventListener('fetch', (event) => {
  // التجاهل للطلبات غير الشائعة مثل طلبات Chrome Extensions
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // تحديث الكاش بالنسخة الجديدة المستلمة من السيرفر
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // في حال فشل الشبكة (Offline)، يتم إرجاع الملف من الكاش
        return caches.match(event.request);
      })
  );
});
