"use client";

import { useRouter } from "next/navigation";
import { AboutScreen } from "@/components/ui/AboutScreen";
import { BRAND } from "@/lib/brand";

export default function AboutPage() {
  const router = useRouter();
  return <AboutScreen version={BRAND.version} onBack={() => router.push("/")} />;
}
