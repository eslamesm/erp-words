import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ERP Words — مساعدك الذكي لتعلّم الإنجليزية ومصطلحات ERP",
    short_name: "ERP Words",
    description:
      "تعلّم الإنجليزية ومصطلحات أنظمة ERP من خلال المحادثات التفاعلية والتدريبات العملية.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "ar",
    background_color: "#0f172a",
    theme_color: "#059669",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
