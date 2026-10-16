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

// نختم الإصدار أثناء بناء الإنتاج فقط حتى لا يتغير الملف في git عند التطوير.
if (process.argv.includes("build")) {
  stampVersion();
}

// سياسة أمان المحتوى (CSP).
// ملاحظة: نحتفظ بـ 'unsafe-inline' للسكربتات لأن Next يحقن سكربتات مضمّنة وسكربت الثيم،
// والـ nonce يتطلب تصييرًا ديناميكيًا يتعارض مع cacheComponents. ما نقيّده فعليًا:
// المصادر الخارجية للسكربت/الإطارات/الكائنات، والقاعدة، ونماذج الإرسال.
// connect-src مفتوح على https لأن المستخدم يختار مزوّد الذكاء الاصطناعي بنفسه (BYOK)،
// ويسمح بـ Ollama المحلي عبر http://localhost.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:*${isDev ? " ws:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

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
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
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
