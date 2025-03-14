const CACHE_NAME = "gambling-hub-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/css/style.css",
    "/modules/app.mjs",
    "/blackjack.html",
    "/deck.html",
    "/poem.html",
    "/quote.html",
    "/modules/blackjack.mjs",
    "/modules/deck.mjs",
    "/modules/poem.mjs",
    "/modules/quote.mjs",
    "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching app shell...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});