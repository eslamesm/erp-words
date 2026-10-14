import { getSupabase } from "@/lib/supabase";
import {
  applySyncDoc,
  buildSyncDoc,
  bookmarksStore,
  conversationsStore,
  dailyStore,
  ensureOwner,
  markSynced,
  mergeDocs,
  notesStore,
  profileStore,
  progressStore,
  pronunciationStore,
  settingsStore,
  statsStore,
  type SyncDoc,
} from "@/lib/storage";

export type SyncStatus =
  | "off"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export interface SyncState {
  status: SyncStatus;
  lastSync?: number;
  error?: string;
}

const INITIAL: SyncState = { status: "off" };
const TABLE = "user_state";

let state: SyncState = INITIAL;
const listeners = new Set<() => void>();

function setState(next: SyncState) {
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeSync(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getSyncState(): SyncState {
  return state;
}

export function getSyncServerState(): SyncState {
  return INITIAL;
}

let currentUserId: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let applying = false;
let watching = false;

function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export async function pushPull(uid: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  if (!isOnline()) {
    setState({ status: "offline" });
    return;
  }
  if (running) return;
  running = true;
  setState({ status: "syncing" });
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("data")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) throw error;

    const local = buildSyncDoc();
    const remote = (data?.data as SyncDoc | undefined) ?? null;
    const merged = remote ? mergeDocs(local, remote) : local;

    applying = true;
    applySyncDoc(merged);
    applying = false;

    const remoteStores = remote ? JSON.stringify(remote.stores) : "";
    const mergedStores = JSON.stringify(merged.stores);
    if (remoteStores !== mergedStores) {
      const { error: upErr } = await sb
        .from(TABLE)
        .upsert(
          { user_id: uid, data: merged, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (upErr) throw upErr;
    }

    markSynced();
    setState({ status: "synced", lastSync: Date.now(), error: undefined });
  } catch (e) {
    applying = false;
    setState({
      status: isOnline() ? "error" : "offline",
      error: e instanceof Error ? e.message : "خطأ غير معروف",
    });
  } finally {
    running = false;
  }
}

export function schedulePush() {
  if (!currentUserId || applying) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    if (currentUserId) void pushPull(currentUserId);
  }, 1500);
}

export function startSync(uid: string) {
  ensureOwner(uid);
  currentUserId = uid;
  startWatching();
  setState({ status: "connecting" });
  void pushPull(uid);
}

export function stopSync() {
  currentUserId = null;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  setState({ status: "off" });
}

export function syncNow(): Promise<void> {
  return currentUserId ? pushPull(currentUserId) : Promise.resolve();
}

export function getCurrentSyncUser(): string | null {
  return currentUserId;
}

export function startWatching() {
  if (watching || typeof window === "undefined") return;
  watching = true;
  const stores = [
    progressStore,
    bookmarksStore,
    conversationsStore,
    statsStore,
    settingsStore,
    profileStore,
    notesStore,
    dailyStore,
    pronunciationStore,
  ];
  for (const s of stores) s.subscribe(() => schedulePush());

  window.addEventListener("online", () => {
    if (currentUserId) void pushPull(currentUserId);
  });
  window.addEventListener("offline", () => setState({ status: "offline" }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && currentUserId) void pushPull(currentUserId);
  });
}
