import type { NextConfig } from "next";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// معرّف بناء فريد لكل نشرة — يُستخدم لاكتشاف التحديثات وتفعيلها من داخل التطبيق.
const buildId = Date.now().toString(36);
const buildTime = new Date().toISOString();

// ملاحظة: لم يعد يُكتب public/version.json لأن التطبيق يقرأ الإصدار من مسار ديناميكي
// (/api/version) لا يُخزَّن في الـ CDN. نكتفي بختم إصدار الـ service worker.
function stampVersion() {
  try {
    const publicDir = join(process.cwd(), "public");
    const swPath = join(publicDir, "sw.js");
    if (existsSync(swPath)) {
      const sw = readFileSync(swPath, "utf8").replace(
        /const VERSION = "[^"]*";/,
        `const VERSION = "${buildId}";`
      );
      writeFileSync(swPath, sw, "utf8");
    }
  } catch {
    // تجاهل أخطاء الكتابة — لا يجب أن تُفشل البناء
  }
}

stampVersion();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: buildId,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  allowedDevOrigins: ["192.168.1.4", "192.168.1.*", "192.168.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // توافق خلفي: النسخ المثبّتة القديمة تطلب /version.json، فنوجّهها للمسار الديناميكي.
    return [{ source: "/version.json", destination: "/api/version" }];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
