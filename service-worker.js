const CACHE_NAME = 'rubber-counter-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// ติดตั้ง: เก็บไฟล์หลักของแอพไว้ใน cache เพื่อให้เปิดได้แม้ไม่มีเน็ต
// (หมายเหตุ: Google Maps script และตัวแผนที่เองยังต้องใช้อินเทอร์เน็ตเสมอ
// service worker นี้ช่วยให้ "ตัวแอพ" เปิดขึ้นได้เร็วและได้แม้สัญญาณอ่อน)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// เปิดใช้งาน: ล้าง cache เวอร์ชันเก่าทิ้ง
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ดึงไฟล์: ลองหาจาก cache ก่อน ถ้าไม่มีค่อยไปดึงจากเน็ต (cache-first สำหรับ asset ของแอพเอง)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ปล่อยให้ request ไปยัง Google Maps/Google APIs ผ่านเน็ตตามปกติ ไม่ไปแทรกแซง
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
