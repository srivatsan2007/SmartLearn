/**
 * SmartLearn Service Worker - PWA & APK Web Application Cache
 * Network-First for JS and HTML assets to ensure instant zero-latency updates.
 */
const CACHE_NAME = "smartlearn-cache-v2";
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
  "./js/app.js?v=2.0.1",
  "./js/auth.js?v=2.0.1",
  "./js/demo-data.js?v=2.0.1",
  "./js/firebase-config.js?v=2.0.1",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn("PWA pre-cache warning:", err));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Cleaning up old PWA cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Always fetch fresh network copy for HTML and JS assets when online
  if (event.request.mode === "navigate" || event.request.url.includes(".js") || event.request.url.includes(".html")) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache first for static images and styles
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
