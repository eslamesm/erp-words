import type { AppStats, DailyResult, Level, Profile, PronunciationProgress, WordProgress } from "@/types";
import { newProgress } from "@/lib/srs";
import { dayKey, shiftDay } from "@/lib/dates";

const KEY_PROGRESS = "erp-vocab:progress";
const KEY_BOOKMARKS = "erp-vocab:bookmarks";
const KEY_STATS = "erp-vocab:stats";
const KEY_SETTINGS = "erp-vocab:settings";
const KEY_PROFILE = "erp-vocab:profile";
const KEY_NOTES = "erp-vocab:notes";
const KEY_DAILY = "erp-vocab:daily";
const KEY_CONVERSATIONS = "erp-vocab:conversations";
const KEY_PRONUNCIATION = "erp-vocab:pronunciation";
const KEY_META = "erp-vocab:meta";

export interface Settings {
  autoPlay: boolean;
  showTranslation: boolean;
  voiceRate: number;
  voiceName?: string;
  language?: "ar" | "en";
  scheduleEnabled?: boolean;
  scheduleTime?: string;
  scheduleDuration?: number;
  theme?: "system" | "light" | "dark";
  planDone?: Record<string, boolean>;
}

// ══ مساهمة جهاز واحد في الإحصائيات (تُجمع عبر الأجهزة بلا احتساب مزدوج) ══
export interface DeviceStats {
  reviews: number;
  correct: number;
  wrong: number;
  lastStudyDay?: string;
  history: { day: string; count: number }[];
  frozenDays: string[];
  freezes: number;
}

export interface SyncMeta {
  updatedAt: Record<string, number>;
  lastSyncedAt?: number;
  deviceId?: string;
  // آخر حساب قامت هذه النسخة المحلية بمزامنته (لحماية تبديل الحساب)
  ownerUserId?: string;
  // شواهد الحذف/الإضافة لكل عنصر: المفتاح "store:id"، القيمة (+ts) موجودة أو (-ts) محذوفة
  marks?: Record<string, number>;
  // مساهمات الإحصائيات لكل جهاز
  deviceStats?: Record<string, DeviceStats>;
}

export const STORE_NAMES = [
  "progress",
  "bookmarks",
  "stats",
  "settings",
  "profile",
  "notes",
  "daily",
  "conversations",
  "pronunciation",
] as const;
export type StoreName = (typeof STORE_NAMES)[number];

export interface Store<T> {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T | ((prev: T) => T)) => void;
  setRaw: (value: T) => void;
  read: () => T;
  reload: () => void;
}

// ══ بيانات التعريف (أوقات آخر تعديل لكل مخزن + آخر مزامنة) ══
export function readMeta(): SyncMeta {
  if (typeof window === "undefined") return { updatedAt: {} };
  try {
    const raw = window.localStorage.getItem(KEY_META);
    return raw ? (JSON.parse(raw) as SyncMeta) : { updatedAt: {} };
  } catch {
    return { updatedAt: {} };
  }
}

export function writeMeta(meta: SyncMeta) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_META, JSON.stringify(meta));
  } catch {
    // تجاهل
  }
}

export function touchMeta(name: StoreName, at?: number) {
  const meta = readMeta();
  meta.updatedAt = meta.updatedAt ?? {};
  meta.updatedAt[name] = at ?? Date.now();
  writeMeta(meta);
}

export function touchAllStores(at?: number) {
  const meta = readMeta();
  meta.updatedAt = meta.updatedAt ?? {};
  const stamp = at ?? Date.now();
  for (const name of STORE_NAMES) meta.updatedAt[name] = stamp;
  writeMeta(meta);
}

export function markSynced(at?: number) {
  const meta = readMeta();
  meta.lastSyncedAt = at ?? Date.now();
  writeMeta(meta);
}

export function getMetaUpdatedAt(name: StoreName): number {
  return readMeta().updatedAt?.[name] ?? 0;
}

export function getLastSyncedAt(): number {
  return readMeta().lastSyncedAt ?? 0;
}

// ══ معرّف الجهاز (يُستخدم لتقسيم مساهمات الإحصائيات) ══
function makeDeviceId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // سياق غير آمن (HTTP) — نستخدم بديلاً
  }
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDeviceId(): string {
  const meta = readMeta();
  if (!meta.deviceId) {
    meta.deviceId = makeDeviceId();
    writeMeta(meta);
  }
  return meta.deviceId;
}

// ══ شواهد العناصر (حذف/إضافة) لمنع عودة العناصر المحذوفة عند الدمج ══
function setMark(key: string, present: boolean) {
  const meta = readMeta();
  meta.marks = meta.marks ?? {};
  meta.marks[key] = (present ? 1 : -1) * Date.now();
  writeMeta(meta);
}

export function toggleBookmark(wordId: string) {
  const exists = bookmarksStore.read().includes(wordId);
  bookmarksStore.set((list) =>
    list.includes(wordId) ? list.filter((x) => x !== wordId) : [...list, wordId]
  );
  setMark(`bookmarks:${wordId}`, !exists);
}

export function toggleConversation(id: string) {
  const exists = conversationsStore.read().includes(id);
  conversationsStore.set((list) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  );
  setMark(`conversations:${id}`, !exists);
}

function createStore<T>(name: StoreName, key: string, fallback: T): Store<T> {
  const listeners = new Set<() => void>();
  let snapshot: T = fallback;
  let loaded = false;

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  function refreshSnapshot() {
    snapshot = read();
    loaded = true;
    return snapshot;
  }

  function getSnapshot(): T {
    if (!loaded) refreshSnapshot();
    return snapshot;
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function onStorage(e: StorageEvent) {
    if (e.key === key || e.key === null) {
      refreshSnapshot();
      emit();
    }
  }

  function persist(value: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // التخزين ممتلئ أو غير متاح
    }
  }

  return {
    subscribe(cb) {
      listeners.add(cb);
      if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => fallback,
    set(value) {
      const next = typeof value === "function" ? (value as (p: T) => T)(getSnapshot()) : value;
      snapshot = next;
      loaded = true;
      persist(next);
      touchMeta(name);
      emit();
    },
    // كتابة بدون تحديث وقت التعديل (تُستخدم عند تطبيق المزامنة)
    setRaw(value) {
      snapshot = value;
      loaded = true;
      persist(value);
      emit();
    },
    read: getSnapshot,
    reload() {
      refreshSnapshot();
      emit();
    },
  };
}

const EMPTY_STATS: AppStats = {
  reviews: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  history: [],
  freezes: 2,
  frozenDays: [],
};

const DEFAULT_SETTINGS: Settings = {
  autoPlay: true,
  showTranslation: true,
  voiceRate: 0.95,
  voiceName: "",
  language: "ar",
  scheduleEnabled: false,
  scheduleTime: "18:00",
  scheduleDuration: 15,
  theme: "system",
  planDone: {},
};

export const progressStore = createStore<Record<string, WordProgress>>("progress", KEY_PROGRESS, {});
export const bookmarksStore = createStore<string[]>("bookmarks", KEY_BOOKMARKS, []);
export const statsStore = createStore<AppStats>("stats", KEY_STATS, EMPTY_STATS);
export const settingsStore = createStore<Settings>("settings", KEY_SETTINGS, DEFAULT_SETTINGS);
export const profileStore = createStore<Profile | null>("profile", KEY_PROFILE, null);
export const notesStore = createStore<Record<string, string>>("notes", KEY_NOTES, {});
export const dailyStore = createStore<Record<string, DailyResult>>("daily", KEY_DAILY, {});
export const conversationsStore = createStore<string[]>("conversations", KEY_CONVERSATIONS, []);
export const pronunciationStore = createStore<Record<string, PronunciationProgress>>(
  "pronunciation",
  KEY_PRONUNCIATION,
  {}
);

const ALL_STORES = [
  progressStore,
  bookmarksStore,
  statsStore,
  settingsStore,
  profileStore,
  notesStore,
  dailyStore,
  conversationsStore,
  pronunciationStore,
];

export function setProfile(profile: Profile | null) {
  profileStore.set(profile);
}

export function addXp(amount: number) {
  profileStore.set((p) => (p ? { ...p, xp: p.xp + amount } : p));
}

export function awardBadges(badgeIds: string[]) {
  if (badgeIds.length === 0) return;
  profileStore.set((p) => {
    if (!p) return p;
    const merged = new Set([...(p.badges ?? []), ...badgeIds]);
    return { ...p, badges: Array.from(merged) };
  });
}

export function defaultProfile(
  name: string,
  level: Level,
  age?: number,
  nativeLanguage?: string
): Profile {
  return {
    name,
    level,
    planType: "",
    xp: 0,
    badges: [],
    joinedAt: Date.now(),
    age,
    nativeLanguage,
  };
}

export function setNote(wordId: string, text: string) {
  const clean = text.trim();
  notesStore.set((notes) => {
    const next = { ...notes };
    if (clean) next[wordId] = clean;
    else delete next[wordId];
    return next;
  });
  setMark(`notes:${wordId}`, !!clean);
}

export function getNote(wordId: string): string {
  return notesStore.read()[wordId] ?? "";
}

// ══ تجميع الإحصائيات من مساهمات الأجهزة (جمع المراجعات + إعادة حساب السلسلة) ══
function statsToDevice(s: AppStats): DeviceStats {
  return {
    reviews: s.reviews ?? 0,
    correct: s.correct ?? 0,
    wrong: s.wrong ?? 0,
    lastStudyDay: s.lastStudyDay,
    history: s.history ?? [],
    frozenDays: s.frozenDays ?? [],
    freezes: s.freezes ?? 0,
  };
}

function computeStreak(daySet: Set<string>, today: string): number {
  if (!today) return 0;
  const yesterday = shiftDay(today, -1);
  let cursor = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : "";
  let streak = 0;
  while (cursor && daySet.has(cursor) && streak < 400) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function aggregateStats(
  devices: Record<string, DeviceStats> | undefined,
  fallback: AppStats
): AppStats {
  const entries = Object.values(devices ?? {});
  if (entries.length === 0) {
    return {
      ...EMPTY_STATS,
      ...fallback,
      history: fallback.history ?? [],
      frozenDays: fallback.frozenDays ?? [],
    };
  }
  const today = dayKey(0);
  let reviews = 0;
  let correct = 0;
  let wrong = 0;
  let freezes = 0;
  let lastStudyDay: string | undefined;
  const histMap = new Map<string, number>();
  const frozen = new Set<string>();
  for (const d of entries) {
    reviews += d.reviews ?? 0;
    correct += d.correct ?? 0;
    wrong += d.wrong ?? 0;
    freezes = Math.max(freezes, d.freezes ?? 0);
    for (const h of d.history ?? []) histMap.set(h.day, (histMap.get(h.day) ?? 0) + h.count);
    for (const f of d.frozenDays ?? []) frozen.add(f);
    if (d.lastStudyDay && (!lastStudyDay || d.lastStudyDay > lastStudyDay)) lastStudyDay = d.lastStudyDay;
  }
  const history = Array.from(histMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((x, y) => (x.day < y.day ? -1 : 1))
    .slice(-60);
  const daySet = new Set<string>(history.filter((h) => h.count > 0).map((h) => h.day));
  frozen.forEach((f) => daySet.add(f));
  return {
    reviews,
    correct,
    wrong,
    streak: computeStreak(daySet, today),
    lastStudyDay,
    history,
    freezes,
    frozenDays: Array.from(frozen),
  };
}

function commitDeviceStats(id: string, mine: DeviceStats) {
  const meta = readMeta();
  meta.deviceStats = { ...(meta.deviceStats ?? {}), [id]: mine };
  writeMeta(meta);
  statsStore.setRaw(aggregateStats(meta.deviceStats, EMPTY_STATS));
}

// ══ تسجيل مراجعة (يحدّث مساهمة هذا الجهاز ويحترم أيام التجميد) ══
export function recordReview(correct: boolean) {
  const id = getDeviceId();
  const meta = readMeta();
  const mine = meta.deviceStats?.[id] ?? statsToDevice(statsStore.read());
  const todayKey = dayKey(0);
  const historyMap = new Map(mine.history?.map((h) => [h.day, h.count]) ?? []);
  historyMap.set(todayKey, (historyMap.get(todayKey) ?? 0) + 1);
  commitDeviceStats(id, {
    ...mine,
    reviews: (mine.reviews ?? 0) + 1,
    correct: (mine.correct ?? 0) + (correct ? 1 : 0),
    wrong: (mine.wrong ?? 0) + (correct ? 0 : 1),
    lastStudyDay: todayKey,
    history: Array.from(historyMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((x, y) => (x.day < y.day ? -1 : 1))
      .slice(-60),
  });
}

export function applyFreeze(): boolean {
  const id = getDeviceId();
  const meta = readMeta();
  const mine = meta.deviceStats?.[id] ?? statsToDevice(statsStore.read());
  if (!mine.lastStudyDay || (mine.freezes ?? 0) <= 0) return false;
  if (mine.lastStudyDay === dayKey(0)) return false;

  const frozenSet = new Set(mine.frozenDays ?? []);
  const missing: string[] = [];
  for (let i = 1; i <= 60; i++) {
    const d = dayKey(-i);
    if (d === mine.lastStudyDay) break;
    missing.push(d);
  }
  if (missing.length === 0) return false;
  if (missing.every((d) => frozenSet.has(d))) return false;

  commitDeviceStats(id, {
    ...mine,
    freezes: Math.max(0, (mine.freezes ?? 0) - 1),
    frozenDays: Array.from(new Set([...(mine.frozenDays ?? []), ...missing])),
  });
  return true;
}

export function streakAtRisk(s: AppStats, today: string, yesterday: string): boolean {
  if (!today || !s.lastStudyDay || s.streak <= 0) return false;
  if (s.lastStudyDay === today || s.lastStudyDay === yesterday) return false;
  return !(s.frozenDays ?? []).includes(yesterday);
}

export function recordDaily(result: DailyResult) {
  const today = dayKey(0);
  dailyStore.set((all) => {
    const prev = all[today];
    if (prev && prev.score >= result.score) return all;
    return { ...all, [today]: result };
  });
}

export function recordPronunciation(id: string, score: number): void {
  pronunciationStore.set((all) => {
    const prev = all[id];
    return {
      ...all,
      [id]: {
        id,
        best: Math.max(prev?.best ?? 0, score),
        attempts: (prev?.attempts ?? 0) + 1,
        lastScore: score,
        lastAttempt: Date.now(),
      },
    };
  });
}

export function getTodayResult(): DailyResult | null {
  return dailyStore.read()[dayKey(0)] ?? null;
}

// ══ نسخ احتياطي: تصدير/استيراد كل البيانات المحلية ══
const ALL_KEYS = [KEY_PROGRESS, KEY_BOOKMARKS, KEY_STATS, KEY_SETTINGS, KEY_PROFILE, KEY_NOTES, KEY_DAILY, KEY_CONVERSATIONS, KEY_PRONUNCIATION];

export function exportData(): string {
  if (typeof window === "undefined") return "{}";
  const data: Record<string, unknown> = {};
  for (const key of ALL_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        // تجاهل مفاتيح تالفة
      }
    }
  }
  return JSON.stringify(
    { app: "erp-vocab", version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2
  );
}

export function importData(json: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(json) as { data?: Record<string, unknown> } & Record<string, unknown>;
    const data = (parsed.data ?? parsed) as Record<string, unknown>;
    if (!data || typeof data !== "object") return false;
    for (const key of ALL_KEYS) {
      if (key in data) window.localStorage.setItem(key, JSON.stringify(data[key]));
    }
    ALL_STORES.forEach((s) => s.reload());
    touchAllStores();
    return true;
  } catch {
    return false;
  }
}

export function resetAll() {
  const meta = readMeta();
  meta.deviceStats = {};
  writeMeta(meta);
  progressStore.set({});
  statsStore.setRaw(EMPTY_STATS);
}

// ══ حماية تبديل الحساب: عزل بيانات كل مستخدم محليًا لتجنّب تسربها إلى حساب آخر ══
const OWNER_STORES = [
  KEY_PROGRESS,
  KEY_BOOKMARKS,
  KEY_STATS,
  KEY_PROFILE,
  KEY_NOTES,
  KEY_DAILY,
  KEY_CONVERSATIONS,
  KEY_PRONUNCIATION,
];
const OWNER_PREFIX = "erp-vocab:owner:";

function stashOwner(uid: string) {
  if (typeof window === "undefined") return;
  const stores: Record<string, unknown> = {};
  for (const key of OWNER_STORES) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        stores[key] = JSON.parse(raw);
      } catch {
        stores[key] = null;
      }
    } else {
      stores[key] = null;
    }
  }
  const meta = readMeta();
  try {
    window.localStorage.setItem(
      OWNER_PREFIX + uid,
      JSON.stringify({ stores, marks: meta.marks ?? {}, deviceStats: meta.deviceStats ?? {} })
    );
  } catch {
    // التخزين ممتلئ
  }
}

function applyOwnerSnapshot(uid: string) {
  if (typeof window === "undefined") return;
  let snap: { stores?: Record<string, unknown>; marks?: Record<string, number>; deviceStats?: Record<string, DeviceStats> } | null = null;
  const raw = window.localStorage.getItem(OWNER_PREFIX + uid);
  if (raw) {
    try {
      snap = JSON.parse(raw);
    } catch {
      snap = null;
    }
  }
  const stores = snap?.stores ?? {};
  for (const key of OWNER_STORES) {
    const value = stores[key];
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  }
  const meta = readMeta();
  meta.marks = snap?.marks ?? {};
  meta.deviceStats = snap?.deviceStats ?? {};
  writeMeta(meta);
  ALL_STORES.forEach((s) => s.reload());
}

// عند تغيّر حساب المزامنة: نُخزّن بيانات الحساب السابق ونستعيد بيانات الحساب الجديد (أو نبدأ نظيفًا)
export function ensureOwner(uid: string): boolean {
  if (typeof window === "undefined") return false;
  const meta = readMeta();
  if (!meta.ownerUserId) {
    meta.ownerUserId = uid;
    writeMeta(meta);
    return false;
  }
  if (meta.ownerUserId === uid) return false;
  stashOwner(meta.ownerUserId);
  meta.ownerUserId = uid;
  writeMeta(meta);
  applyOwnerSnapshot(uid);
  return true;
}

export function getProgressFor(wordId: string): WordProgress {
  return progressStore.read()[wordId] ?? newProgress(wordId);
}

// ═══════════════════════════════════════════════════════════════
// المزامنة السحابية: بناء المستند ودمجه لكل مخزن
// ═══════════════════════════════════════════════════════════════

export interface SyncStores {
  progress: Record<string, WordProgress>;
  bookmarks: string[];
  stats: AppStats;
  settings: Settings;
  profile: Profile | null;
  notes: Record<string, string>;
  daily: Record<string, DailyResult>;
  conversations: string[];
  pronunciation: Record<string, PronunciationProgress>;
}

export interface SyncDoc {
  version: 2;
  stores: SyncStores;
  meta: {
    updatedAt: Record<string, number>;
    marks?: Record<string, number>;
    deviceStats?: Record<string, DeviceStats>;
  };
}

export function buildSyncDoc(): SyncDoc {
  const meta = readMeta();
  return {
    version: 2,
    stores: {
      progress: progressStore.read(),
      bookmarks: bookmarksStore.read(),
      stats: statsStore.read(),
      settings: settingsStore.read(),
      profile: profileStore.read(),
      notes: notesStore.read(),
      daily: dailyStore.read(),
      conversations: conversationsStore.read(),
      pronunciation: pronunciationStore.read(),
    },
    meta: {
      updatedAt: meta.updatedAt ?? {},
      marks: meta.marks ?? {},
      deviceStats: meta.deviceStats ?? {},
    },
  };
}

export function applySyncDoc(doc: SyncDoc) {
  progressStore.setRaw(doc.stores.progress ?? {});
  bookmarksStore.setRaw(doc.stores.bookmarks ?? []);
  statsStore.setRaw(doc.stores.stats ?? EMPTY_STATS);
  settingsStore.setRaw(doc.stores.settings ?? DEFAULT_SETTINGS);
  profileStore.setRaw(doc.stores.profile ?? null);
  notesStore.setRaw(doc.stores.notes ?? {});
  dailyStore.setRaw(doc.stores.daily ?? {});
  conversationsStore.setRaw(doc.stores.conversations ?? []);
  pronunciationStore.setRaw(doc.stores.pronunciation ?? {});
  const meta = readMeta();
  meta.updatedAt = { ...(meta.updatedAt ?? {}), ...(doc.meta?.updatedAt ?? {}) };
  meta.marks = { ...(meta.marks ?? {}), ...(doc.meta?.marks ?? {}) };
  if (doc.meta?.deviceStats) meta.deviceStats = doc.meta.deviceStats;
  writeMeta(meta);
}

function progressScore(p: WordProgress): number {
  return p.reps * 1e15 + (p.lastReviewed ?? 0);
}

function mergeProgress(
  a: Record<string, WordProgress>,
  b: Record<string, WordProgress>
): Record<string, WordProgress> {
  const out: Record<string, WordProgress> = { ...a };
  for (const [id, rb] of Object.entries(b ?? {})) {
    const ra = out[id];
    out[id] = !ra || progressScore(rb) >= progressScore(ra) ? rb : ra;
  }
  return out;
}

// دمج شواهد العناصر: نأخذ العملية الأحدث (بالمطلق)، وعند التعادل يفوز الحذف
function mergeMarks(
  a?: Record<string, number>,
  b?: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = { ...(a ?? {}) };
  for (const [key, val] of Object.entries(b ?? {})) {
    const cur = out[key];
    if (cur === undefined) {
      out[key] = val;
      continue;
    }
    const cv = Math.abs(cur);
    const nv = Math.abs(val);
    if (nv > cv || (nv === cv && val < 0)) out[key] = val;
  }
  return out;
}

// دمج قوائم العضوية (المحفوظات/المحادثات) مع احترام شواهد الحذف
function mergeMembership(
  prefix: string,
  local: string[],
  remote: string[],
  marks: Record<string, number>
): string[] {
  const set = new Set<string>([...(local ?? []), ...(remote ?? [])]);
  for (const [key, val] of Object.entries(marks)) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (val > 0) set.add(id);
    else set.delete(id);
  }
  return Array.from(set);
}

function mergeNotes(
  local: Record<string, string>,
  remote: Record<string, string>,
  marks: Record<string, number>,
  remoteNewer: boolean
): Record<string, string> {
  const out: Record<string, string> = {};
  const ids = new Set<string>([...Object.keys(local ?? {}), ...Object.keys(remote ?? {})]);
  for (const key of Object.keys(marks)) {
    if (key.startsWith("notes:") && marks[key] > 0) ids.add(key.slice("notes:".length));
  }
  for (const id of ids) {
    const mark = marks[`notes:${id}`];
    if (mark !== undefined && mark < 0) continue; // محذوفة
    const val = remoteNewer ? remote?.[id] ?? local?.[id] : local?.[id] ?? remote?.[id];
    if (val !== undefined) out[id] = val;
  }
  return out;
}

function mergeDaily(
  a: Record<string, DailyResult>,
  b: Record<string, DailyResult>
): Record<string, DailyResult> {
  const out: Record<string, DailyResult> = { ...(a ?? {}) };
  for (const [day, rb] of Object.entries(b ?? {})) {
    const ra = out[day];
    if (!ra || rb.score > ra.score || (rb.score === ra.score && rb.total > ra.total)) {
      out[day] = rb;
    }
  }
  return out;
}

// دمج احتياطي للنسخ القديمة التي لا تحمل مساهمات أجهزة (يُستخدم مرة واحدة عند الترقية)
function mergeStatsFallback(
  a: AppStats | undefined,
  b: AppStats | undefined,
  remoteNewer: boolean
): AppStats {
  const sa = a ?? EMPTY_STATS;
  const sb = b ?? EMPTY_STATS;
  const base = remoteNewer ? sb : sa;
  const histMap = new Map<string, number>();
  for (const h of sa.history ?? []) histMap.set(h.day, Math.max(histMap.get(h.day) ?? 0, h.count));
  for (const h of sb.history ?? []) histMap.set(h.day, Math.max(histMap.get(h.day) ?? 0, h.count));
  const history = Array.from(histMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((x, y) => (x.day < y.day ? -1 : 1))
    .slice(-60);
  const lastStudyDay = [sa.lastStudyDay, sb.lastStudyDay].filter(Boolean).sort().pop();
  const frozenDays = Array.from(new Set([...(sa.frozenDays ?? []), ...(sb.frozenDays ?? [])]));
  const daySet = new Set<string>(history.filter((h) => h.count > 0).map((h) => h.day));
  frozenDays.forEach((f) => daySet.add(f));
  return {
    reviews: Math.max(sa.reviews, sb.reviews),
    correct: Math.max(sa.correct, sb.correct),
    wrong: Math.max(sa.wrong, sb.wrong),
    streak: computeStreak(daySet, dayKey(0)),
    lastStudyDay,
    history,
    freezes: base.freezes ?? 0,
    frozenDays,
  };
}

function mergeHistoryMax(
  a: { day: string; count: number }[],
  b: { day: string; count: number }[]
): { day: string; count: number }[] {
  const m = new Map<string, number>();
  for (const h of a ?? []) m.set(h.day, Math.max(m.get(h.day) ?? 0, h.count));
  for (const h of b ?? []) m.set(h.day, Math.max(m.get(h.day) ?? 0, h.count));
  return Array.from(m.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((x, y) => (x.day < y.day ? -1 : 1))
    .slice(-60);
}

// دمج مساهمات الأجهزة: كل جهاز يملك مفتاحه الخاص، لذا الدمج اتحادي بلا احتساب مزدوج
function mergeDeviceStats(
  a?: Record<string, DeviceStats>,
  b?: Record<string, DeviceStats>
): Record<string, DeviceStats> {
  const out: Record<string, DeviceStats> = { ...(a ?? {}) };
  for (const [id, db] of Object.entries(b ?? {})) {
    const da = out[id];
    if (!da) {
      out[id] = db;
      continue;
    }
    out[id] = {
      reviews: Math.max(da.reviews ?? 0, db.reviews ?? 0),
      correct: Math.max(da.correct ?? 0, db.correct ?? 0),
      wrong: Math.max(da.wrong ?? 0, db.wrong ?? 0),
      lastStudyDay: [da.lastStudyDay, db.lastStudyDay].filter(Boolean).sort().pop(),
      history: mergeHistoryMax(da.history, db.history),
      frozenDays: Array.from(new Set([...(da.frozenDays ?? []), ...(db.frozenDays ?? [])])),
      freezes: Math.min(da.freezes ?? 0, db.freezes ?? 0),
    };
  }
  return out;
}

function mergePronunciation(
  a: Record<string, PronunciationProgress>,
  b: Record<string, PronunciationProgress>
): Record<string, PronunciationProgress> {
  const out: Record<string, PronunciationProgress> = { ...(a ?? {}) };
  for (const [id, rb] of Object.entries(b ?? {})) {
    const ra = out[id];
    if (!ra) {
      out[id] = rb;
      continue;
    }
    out[id] = {
      id,
      best: Math.max(ra.best, rb.best),
      attempts: Math.max(ra.attempts, rb.attempts),
      lastScore: (rb.lastAttempt ?? 0) >= (ra.lastAttempt ?? 0) ? rb.lastScore : ra.lastScore,
      lastAttempt: Math.max(ra.lastAttempt ?? 0, rb.lastAttempt ?? 0),
    };
  }
  return out;
}

function mergeProfile(
  a: Profile | null,
  b: Profile | null,
  remoteNewer: boolean
): Profile | null {
  if (!a) return b;
  if (!b) return a;
  const base = remoteNewer ? b : a;
  return {
    name: base.name,
    level: base.level,
    planType: base.planType,
    xp: Math.max(a.xp, b.xp),
    badges: Array.from(new Set([...(a.badges ?? []), ...(b.badges ?? [])])),
    joinedAt: Math.min(a.joinedAt, b.joinedAt),
    motivational: base.motivational,
    age: base.age ?? a.age ?? b.age,
    nativeLanguage: base.nativeLanguage ?? a.nativeLanguage ?? b.nativeLanguage,
    planOverrides: remoteNewer
      ? { ...(a.planOverrides ?? {}), ...(b.planOverrides ?? {}) }
      : { ...(b.planOverrides ?? {}), ...(a.planOverrides ?? {}) },
    planAuto: base.planAuto ?? a.planAuto ?? b.planAuto,
    weeklyChallenge: remoteNewer
      ? { ...(a.weeklyChallenge ?? {}), ...(b.weeklyChallenge ?? {}) }
      : { ...(b.weeklyChallenge ?? {}), ...(a.weeklyChallenge ?? {}) },
  };
}

export function mergeDocs(local: SyncDoc, remote: SyncDoc): SyncDoc {
  const la = local.meta?.updatedAt ?? {};
  const ra = remote.meta?.updatedAt ?? {};
  const updatedAt: Record<string, number> = {};
  for (const name of STORE_NAMES) updatedAt[name] = Math.max(la[name] ?? 0, ra[name] ?? 0);
  const newer = (name: StoreName) => (ra[name] ?? 0) > (la[name] ?? 0);
  const ls = local.stores;
  const rs = remote.stores;
  const marks = mergeMarks(local.meta?.marks, remote.meta?.marks);

  // دمج الإحصائيات عبر مساهمات الأجهزة (مع مسار احتياطي للنسخ القديمة)
  const devLocal = local.meta?.deviceStats ?? {};
  const devRemote = remote.meta?.deviceStats ?? {};
  const hasLocal = Object.keys(devLocal).length > 0;
  const hasRemote = Object.keys(devRemote).length > 0;
  let deviceStats: Record<string, DeviceStats>;
  let stats: AppStats;
  const fallback = () => mergeStatsFallback(ls.stats, rs.stats, newer("stats"));
  if (!hasLocal && !hasRemote) {
    deviceStats = {};
    stats = fallback();
  } else if (!hasLocal) {
    deviceStats = devRemote;
    stats = aggregateStats(devRemote, fallback());
  } else if (!hasRemote) {
    deviceStats = devLocal;
    stats = aggregateStats(devLocal, fallback());
  } else {
    deviceStats = mergeDeviceStats(devLocal, devRemote);
    stats = aggregateStats(deviceStats, fallback());
  }

  return {
    version: 2,
    stores: {
      progress: mergeProgress(ls.progress ?? {}, rs.progress ?? {}),
      bookmarks: mergeMembership("bookmarks:", ls.bookmarks ?? [], rs.bookmarks ?? [], marks),
      stats,
      settings: newer("settings") ? rs.settings : ls.settings,
      profile: mergeProfile(ls.profile ?? null, rs.profile ?? null, newer("profile")),
      notes: mergeNotes(ls.notes ?? {}, rs.notes ?? {}, marks, newer("notes")),
      daily: mergeDaily(ls.daily ?? {}, rs.daily ?? {}),
      conversations: mergeMembership(
        "conversations:",
        ls.conversations ?? [],
        rs.conversations ?? [],
        marks
      ),
      pronunciation: mergePronunciation(ls.pronunciation ?? {}, rs.pronunciation ?? {}),
    },
    meta: { updatedAt, marks, deviceStats },
  };
}
