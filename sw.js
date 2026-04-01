// ============================================================
//  RedCW — Service Worker (PWA) con soporte subcarpeta
// ============================================================
const CACHE_NAME = "redcw-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/vercel.json",
  "/config.js",
  "/config-dashboard.js",
  "/config-login.js",
  "/pages/admin.html",
  "/pages/biblioteca.html",
  "/pages/chat.html",
  "/pages/dashboard.html",
  "/encuestas.html",
  "/pages/llamadas.html",
  "/pages/login.html",
  "/pages/perfil.html",
  "/pages/upload.html",
  "//icons/intranet-192.png",
  "/icons/intranet-512.png",

];

// ── Install ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Filtrar URLs externas para el addAll inicial si es necesario
      return cache.addAll(ASSETS_TO_CACHE.filter(u => !u.startsWith("http")));
    })
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch (Network first, fallback to cache) ─────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("supabase.co")) return;
  
  event.respondWith(
    fetch(event.request)
    .then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    })
    .catch(() => caches.match(event.request))
  );
});

// ── Push notifications ───────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "IntraNet", {
      body: data.body || "Nueva notificación",
      icon: "icons/intranet-192.png",
      badge: "icons/intranet-192.png",
    })
  );
});
