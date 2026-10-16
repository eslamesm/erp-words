import { beforeAll, describe, expect, it } from "vitest";
import { dayKey, shiftDay } from "@/lib/dates";

type StorageModule = typeof import("@/lib/storage");
let st: StorageModule;

const emptyStats = {
  reviews: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  history: [] as { day: string; count: number }[],
  freezes: 2,
  frozenDays: [] as string[],
};

function doc(stores: Record<string, unknown>, meta: Record<string, unknown>) {
  return {
    version: 2 as const,
    stores: {
      progress: {},
      bookmarks: [],
      stats: emptyStats,
      settings: {},
      profile: null,
      notes: {},
      daily: {},
      conversations: [],
      pronunciation: {},
      ...stores,
    },
    meta: { updatedAt: {}, ...meta },
  } as never;
}

beforeAll(async () => {
  const mem = new Map<string, string>();
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  st = await import("@/lib/storage");
});

describe("tombstones (deletes do not resurrect)", () => {
  it("removed bookmark stays removed after merge", () => {
    const r = st.mergeDocs(
      doc({ bookmarks: [] }, { marks: { "bookmarks:W": -2000 } }),
      doc({ bookmarks: ["W"] }, {})
    );
    expect(r.stores.bookmarks).toEqual([]);
  });

  it("re-added bookmark returns", () => {
    const r = st.mergeDocs(
      doc({ bookmarks: ["W"] }, { marks: { "bookmarks:W": 3000 } }),
      doc({ bookmarks: [] }, { marks: { "bookmarks:W": -2000 } })
    );
    expect(r.stores.bookmarks).toEqual(["W"]);
  });

  it("deleted note does not return", () => {
    const r = st.mergeDocs(
      doc({ notes: {} }, { marks: { "notes:n1": -5000 } }),
      doc({ notes: { n1: "old" } }, {})
    );
    expect(r.stores.notes).toEqual({});
  });

  it("progress reset is not undone by older remote progress", () => {
    const old = { wordId: "W", ease: 2.5, interval: 1, due: 0, reps: 5, lapses: 0, lastReviewed: 1000, correctCount: 5, wrongCount: 0 };
    const fresh = { ...old, wordId: "N", reps: 1, lastReviewed: 9000 };
    const r = st.mergeDocs(
      doc({ progress: {} }, { marks: { "progress:reset": 5000 } }),
      doc({ progress: { W: old, N: fresh } }, {})
    );
    expect(Object.keys(r.stores.progress)).toEqual(["N"]);
  });

  it("legacy union minus tombstone", () => {
    const r = st.mergeDocs(
      doc({ bookmarks: [] }, { marks: { "bookmarks:W": -1 } }),
      doc({ bookmarks: ["W", "X"] }, {})
    );
    expect(r.stores.bookmarks).toEqual(["X"]);
  });
});

describe("profile avatar set/remove", () => {
  const prof = (over: Record<string, unknown>) => ({
    name: "A",
    level: "A2",
    planType: "p",
    xp: 0,
    badges: [],
    joinedAt: 1,
    ...over,
  });

  it("a removed avatar does not come back from an older remote copy", () => {
    const r = st.mergeDocs(
      doc({ profile: prof({ avatarAt: 2000 }) }, { updatedAt: { profile: 2000 } }),
      doc({ profile: prof({ avatar: "data:old", avatarAt: 1000 }) }, { updatedAt: { profile: 3000 } })
    );
    expect((r.stores.profile as { avatar?: string }).avatar).toBeUndefined();
  });

  it("a newly set avatar wins over an older one even if remote was touched later", () => {
    const r = st.mergeDocs(
      doc({ profile: prof({ avatar: "data:new", avatarAt: 5000 }) }, { updatedAt: { profile: 5000 } }),
      doc({ profile: prof({ avatar: "data:old", avatarAt: 1000 }) }, { updatedAt: { profile: 9000 } })
    );
    expect((r.stores.profile as { avatar?: string }).avatar).toBe("data:new");
  });

  it("keeps an existing avatar when the other side has no avatar edits", () => {
    const r = st.mergeDocs(
      doc({ profile: prof({ avatar: "data:kept", avatarAt: 4000 }) }, { updatedAt: { profile: 4000 } }),
      doc({ profile: prof({}) }, { updatedAt: { profile: 9000 } })
    );
    expect((r.stores.profile as { avatar?: string }).avatar).toBe("data:kept");
  });
});

describe("stats aggregation across devices", () => {
  it("sums reviews of two devices", () => {
    const agg = st.aggregateStats(
      {
        d1: { reviews: 5, correct: 4, wrong: 1, history: [{ day: "2026-01-01", count: 5 }], frozenDays: [], freezes: 2 },
        d2: { reviews: 3, correct: 3, wrong: 0, history: [{ day: "2026-01-01", count: 3 }], frozenDays: [], freezes: 2 },
      } as never,
      emptyStats
    );
    expect(agg.reviews).toBe(8);
    expect(agg.history).toEqual([{ day: "2026-01-01", count: 8 }]);
  });

  it("mergeDocs sums deviceStats without double counting", () => {
    const r = st.mergeDocs(
      doc({}, { deviceStats: { d1: { reviews: 5, correct: 5, wrong: 0, history: [], frozenDays: [], freezes: 2 } } }),
      doc({}, { deviceStats: { d2: { reviews: 3, correct: 3, wrong: 0, history: [], frozenDays: [], freezes: 2 } } })
    );
    expect((r.stores.stats as { reviews: number }).reviews).toBe(8);
  });

  it("streak breaks on a gap and bridges on frozen days", () => {
    const today = dayKey(0);
    const y = shiftDay(today, -1);
    const gap = st.aggregateStats(
      { d1: { reviews: 4, correct: 4, wrong: 0, history: [{ day: shiftDay(today, -2), count: 2 }, { day: today, count: 2 }], frozenDays: [], freezes: 2 } } as never,
      emptyStats
    );
    expect(gap.streak).toBe(1);
    const bridged = st.aggregateStats(
      { d1: { reviews: 4, correct: 4, wrong: 0, history: [{ day: shiftDay(today, -2), count: 2 }, { day: today, count: 2 }], frozenDays: [y], freezes: 1 } } as never,
      emptyStats
    );
    expect(bridged.streak).toBe(3);
  });
});

describe("account switch isolation", () => {
  it("does not leak data between accounts", () => {
    st.resetAll();
    st.toggleBookmark("W1");
    st.ensureOwner("userA");
    st.ensureOwner("userA");
    expect(st.bookmarksStore.read().includes("W1")).toBe(true);

    st.ensureOwner("userB");
    expect(st.bookmarksStore.read().includes("W1")).toBe(false);
    st.toggleBookmark("B1");
    expect(st.bookmarksStore.read()).toEqual(["B1"]);

    st.ensureOwner("userA");
    expect(st.bookmarksStore.read()).toEqual(["W1"]);
    st.ensureOwner("userB");
    expect(st.bookmarksStore.read()).toEqual(["B1"]);
  });
});

describe("recordReview", () => {
  it("increments aggregated counters", () => {
    st.resetAll();
    st.recordReview(true);
    st.recordReview(true);
    st.recordReview(false);
    const s = st.statsStore.read();
    expect(s.reviews).toBe(3);
    expect(s.correct).toBe(2);
    expect(s.wrong).toBe(1);
    expect(s.streak).toBe(1);
  });
});
