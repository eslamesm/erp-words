"use client";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

let supported: boolean | null = null;

function ctor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const C = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  return C ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  if (supported === null) supported = ctor() !== null;
  return supported;
}

export interface RecognitionCallbacks {
  lang?: string;
  onTranscript?: (text: string, final: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface RecognitionHandle {
  stop: () => void;
}

let active: RecognitionHandle | null = null;

export function startListening(cb: RecognitionCallbacks): RecognitionHandle {
  const C = ctor();
  if (!C) {
    cb.onError?.("unsupported");
    return { stop: () => {} };
  }
  const rec = new C();
  rec.lang = cb.lang ?? "en-US";
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onresult = (e) => {
    let finalText = "";
    let partial = "";
    for (let i = 0; i < e.results.length; i++) {
      const chunk = e.results[i];
      const t = chunk[0]?.transcript ?? "";
      if (chunk.isFinal) finalText = t;
      else if (i === e.results.length - 1) partial = t;
    }
    if (finalText) cb.onTranscript?.(finalText, true);
    else if (partial) cb.onTranscript?.(partial, false);
  };

  rec.onerror = (e) => cb.onError?.(e.error);

  rec.onend = () => {
    active = null;
    cb.onEnd?.();
  };

  const handle = { stop: () => rec.abort() };
  active?.stop();
  active = handle;
  try {
    rec.start();
  } catch {
    active = null;
    cb.onError?.("start-failed");
  }
  return handle;
}

export function stopListening() {
  active?.stop();
  active = null;
}