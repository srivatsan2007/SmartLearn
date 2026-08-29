/**
 * SmartLearn Service Worker - PWA & APK Web Application Cache
 */
const CACHE_NAME = "smartlearn-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./student-dashboard.html",
  "./teacher-dashboard.html",
  "./parent-dashboard.html",
  "./admin-dashboard.html",
  "./assignments.html",
  "./study-materials.html",
  "./quizzes.html",
  "./css/style.css",
  "./css/dashboard.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/demo-data.js",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
