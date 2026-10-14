"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { setPreferredVoice } from "@/lib/speech";

// يطبّق الصوت المختار في الإعدادات على محرّك النطق العام عند بدء التطبيق وعند تغيير الإعداد.
export function VoicePreference() {
  const { settings } = useProgress();
  const voiceName = settings?.voiceName ?? "";

  useEffect(() => {
    setPreferredVoice(voiceName);
  }, [voiceName]);

  return null;
}
