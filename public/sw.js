/* Service Worker: تحديث ذاتي + شبكة أولًا مع تخزين احتياطي للعمل دون اتصال */
const VERSION = "mv9qsr7i";
const CACHE = `erp-vocab-${VERSION}`;
const CORE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(CORE.map((url) => cache.add(url).catch(() => {})));
      // تفعيل النسخة الجديدة فورًا دون انتظار إغلاق كل النوافذ
      await self.skipWaiting();
    })()
  );
});

// يسمح للصفحة بطلب تفعيل النسخة المنتظرة فورًا
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function offlineResponse() {
  return new Response("أنت غير متصل بالإنترنت.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHtml =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  // صفحات HTML: الشبكة دائمًا (مع تجاهل كاش المتصفح) ثم الكاش عند انقطاع الاتصال.
  // هذا يضمن وصول أحدث نسخة من التطبيق فورًا.
  event.respondWith(
    fetch(req, isHtml ? { cache: "no-store" } : undefined)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (isHtml) {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return offlineResponse();
      })
  );
});
