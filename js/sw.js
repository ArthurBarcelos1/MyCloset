const CACHE_NAME = "MyCloset-v1.960.000";

const urlsToCache = [
    "./",
    "./index.html",
    "./catalogo.html",
    "./designs.html",
    "./liked.html",
    "./home.html",
    "./admin.html",

    "./css/styles.css",

    "./js/admin.js",
    "./js/app.js",
    "./js/auth.js",
    "./js/categories.js",
    "./js/editModal.js",
    "./js/firebase.js",
    "./js/functions.js",
    "./js/home.js",
    "./js/like.js",
    "./js/liked.js",
    "./js/load.js",
    "./js/logout.js",
    "./js/model.js",
    "./js/new.js",
    "./js/removeBG.js",
    "./js/role.js",
    "./js/search.js",
    "./js/vton.js",

    "./icons/new.png",
    "./icons/MainIcon.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
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