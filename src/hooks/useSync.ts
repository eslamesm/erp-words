"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";
import {
  getSyncServerState,
  getSyncState,
  startSync,
  stopSync,
  subscribeSync,
  type SyncState,
} from "@/lib/sync";
import type { AuthUser } from "@/lib/auth";

function toUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

let user: AuthUser | null = null;
let loading = true;
const listeners = new Set<() => void>();
let started = false;
let recovering = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function ensureStarted() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) {
    loading = false;
    emit();
    return;
  }
  void sb.auth.getSession().then(({ data }) => {
    user = toUser(data.session);
    loading = false;
    emit();
  });
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") recovering = true;
    user = toUser(session);
    loading = false;
    emit();
  });
}

/** يُنهي وضع استعادة كلمة المرور بعد نجاح التغيير أو إلغائه. */
export function endRecovery() {
  recovering = false;
  emit();
}

export function useAuth() {
  const currentUser = useSyncExternalStore(subscribe, () => user, () => null);
  const isLoading = useSyncExternalStore(subscribe, () => loading, () => true);
  const isRecovering = useSyncExternalStore(subscribe, () => recovering, () => false);
  const sync = useSyncExternalStore<SyncState>(
    subscribeSync,
    getSyncState,
    getSyncServerState
  );

  useEffect(() => {
    ensureStarted();
  }, []);

  useEffect(() => {
    if (currentUser) startSync(currentUser.id);
    else stopSync();
  }, [currentUser]);

  return { user: currentUser, loading: isLoading, sync, enabled: supabaseEnabled, recovering: isRecovering };
}

// ══ حالة الاتصال بالإنترنت ══
function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

function getOnline() {
  return navigator.onLine;
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, getOnline, () => true);
}
