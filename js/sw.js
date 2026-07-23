const CACHE_NAME = "MyCloset-v1.1.0";

const urlsToCache = [
    "./",
    "./index.html",
    "./catalogo.html",
    "./designs.html",
    "./liked.html",
    "./login.html",

    "./css/styles.css",

    "./js/app.js",

    "./images/icons/icon-192.png",
    "./images/icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});