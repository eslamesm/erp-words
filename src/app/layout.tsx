import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { CloudSync } from "@/components/CloudSync";
import { ScheduleReminder } from "@/components/ScheduleReminder";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { VoicePreference } from "@/components/VoicePreference";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { AssistantWidget } from "@/components/AssistantWidget";

export const metadata: Metadata = {
  title: "ERP Words — تعلم مفردات إنجليزية لنظم ERP",
  description: "تطبيق لتعلم وتثبيت المفردات الإنجليزية الخاصة بأنظمة ERP وإدارتها",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ERP Words",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{(function(){var s=JSON.parse(localStorage.getItem("erp-vocab:settings")||"{}");var t=s.theme||"system";var d=t==="dark"||(t==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");var L=s.language==="en"?"en":"ar";var e=document.documentElement;e.lang=L;e.dir=L==="ar"?"rtl":"ltr";})()}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider />
        <LanguageProvider />
        <VoicePreference />
        <CloudSync />
        <ScheduleReminder />
        <Nav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 sm:pb-6">{children}</main>
        <footer className="border-t border-slate-200 py-4 pb-24 text-center text-xs text-slate-500 sm:pb-4 dark:border-slate-800 dark:text-slate-400">
          ERP Words — تعلم المفردات الإنجليزية لأنظمة Enterprise Resource Planning
        </footer>
        <ServiceWorkerRegister />
        <WelcomeSplash />
        <AssistantWidget />
      </body>
    </html>
  );
}