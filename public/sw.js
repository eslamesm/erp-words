/* Service Worker: تحديث ذاتي + شبكة أولًا مع تخزين احتياطي للعمل دون اتصال */
const VERSION = "mvca8gj4";
const CACHE = `erp-vocab-${VERSION}`;
const CORE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// صفحات تُخزَّن مسبقًا مع ملفاتها (JS/CSS) لتعمل دون اتصال من أول مرة.
const ROUTES = [
  "/lesson",
  "/learn",
  "/words",
  "/quiz",
  "/phrases",
  "/conversations",
  "/games",
  "/progress",
  "/daily",
  "/paths",
  "/settings",
];

const STATIC_RE = /\/_next\/static\/[^"'\s\\)<>]+/g;

async function precacheRoute(cache, url) {
  try {
    const res = await fetch(url, { cache: "reload" });
    if (!res || res.status !== 200) return;
    const html = await res.clone().text();
    await cache.put(url, res);
    const assets = new Set(html.replace(/\\u002F|\\\//g, "/").match(STATIC_RE) || []);
    await Promise.all(
      [...assets].map(async (a) => {
        if (await cache.match(a)) return;
        try {
          const r = await fetch(a);
          if (r && r.status === 200) await cache.put(a, r);
        } catch {
          // تجاهل: أصل واحد فاشل لا يمنع البقية
        }
      })
    );
  } catch {
    // تجاهل أخطاء الشبكة أثناء التثبيت
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(CORE.map((url) => cache.add(url).catch(() => {})));
      // الصفحة الرئيسية وبقية المسارات الأساسية مع أصولها
      await precacheRoute(cache, "/");
      await Promise.all(ROUTES.map((r) => precacheRoute(cache, r)));
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

// عند النقر على إشعار التذكير اليومي: التركيز على نافذة التطبيق أو فتحها على صفحة المراجعة.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = data.url || "/learn";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              // بعض المتصفحات تمنع التنقل؛ نكتفي بالتركيز
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
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
  // واجهات API (الإصدار وغيره) لا تُخزَّن أبدًا
  if (url.pathname.startsWith("/api/") || url.pathname === "/version.json") return;

  // ملفات Next المجزّأة بالتجزئة (ثابتة): الكاش أولًا للسرعة والعمل دون اتصال
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
      )
    );
    return;
  }

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
