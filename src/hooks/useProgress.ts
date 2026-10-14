"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Level, PlanDef, Profile, Rating, WordProgress } from "@/types";
import { applyRating, newProgress } from "@/lib/srs";
import { shiftDay, weekKey } from "@/lib/dates";
import { useTodayKey, useWeekKey } from "@/lib/today";
import {
  addXp,
  applyFreeze as applyFreezeStore,
  awardBadges,
  bookmarksStore,
  completeLesson as completeLessonStore,
  conversationsStore,
  dailyStore,
  defaultProfile,
  ensureLesson as ensureLessonStore,
  exportData,
  getProgressFor,
  importData,
  lessonsStore,
  markLessonViewed as markLessonViewedStore,
  notesStore,
  profileStore,
  progressStore,
  pronunciationStore,
  recordDaily,
  recordPronunciation as recordPronunciationStore,
  recordReview,
  resetAll,
  setNote as setNoteStore,
  setProfile,
  settingsStore,
  statsStore,
  streakAtRisk,
  toggleBookmark,
  toggleConversation as toggleConversationStore,
  type Settings,
} from "@/lib/storage";
import { PLANS } from "@/lib/plan";

function useStore<T>(store: { subscribe: (cb: () => void) => () => void; getSnapshot: () => T; getServerSnapshot: () => T }): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export function useProgress() {
  const progress = useStore(progressStore);
  const bookmarks = useStore(bookmarksStore);
  const stats = useStore(statsStore);
  const settings = useStore(settingsStore);
  const profile = useStore(profileStore);
  const notes = useStore(notesStore);
  const daily = useStore(dailyStore);
  const conversations = useStore(conversationsStore);
  const pronunciation = useStore(pronunciationStore);
  const lessons = useStore(lessonsStore);
  const today = useTodayKey();
  const week = useWeekKey();
  const yesterday = today ? shiftDay(today, -1) : "";

  const planBase = profile ? PLANS.find((p) => p.id === profile.planType) ?? null : null;

  // أيام مكتملة متتالية تمنح زيادة ذاتية في الهدف عند تفعيل التدرّج الذاتي
  const planAutoBonus = useMemo(() => {
    if (!planBase || !profile?.planAuto) return 0;
    const o = profile?.planOverrides ?? {};
    const baseForAuto = o.reviewsPerDay ?? planBase.reviewsPerDay;
    const map = new Map(stats?.history?.map((h) => [h.day, h.count]) ?? []);
    let bonus = 0;
    let cursor = (map.get(today) ?? 0) >= baseForAuto ? today : yesterday;
    while (cursor && (map.get(cursor) ?? 0) >= baseForAuto && bonus < 21) {
      bonus++;
      cursor = shiftDay(cursor, -1);
    }
    return bonus;
  }, [planBase, profile?.planAuto, profile?.planOverrides, stats?.history, today, yesterday]);

  // الخطة الفعّالة: القيم الافتراضية + تخصيص المستخدم + التدرّج الذاتي
  const plan: PlanDef | null = useMemo(() => {
    if (!planBase) return null;
    const o = profile?.planOverrides ?? {};
    let reviews = o.reviewsPerDay ?? planBase.reviewsPerDay;
    let newWords = o.newWordsPerDay ?? planBase.newWordsPerDay;

    if (profile?.planAuto && planAutoBonus > 0) {
      reviews += planAutoBonus;
      newWords += Math.min(5, Math.floor(planAutoBonus / 2));
    }

    return {
      ...planBase,
      days: o.days ?? planBase.days,
      reviewsPerDay: reviews,
      newWordsPerDay: newWords,
      conversationMinutes: o.conversationMinutes ?? planBase.conversationMinutes,
    };
  }, [planBase, profile?.planOverrides, profile?.planAuto, planAutoBonus]);

  const rate = useCallback((wordId: string, rating: Rating) => {
    const prev = getProgressFor(wordId);
    const next = applyRating(prev, rating);
    progressStore.set((p) => ({ ...p, [wordId]: next }));
    const wasFirst = statsStore.read().reviews === 0;
    recordReview(rating !== "again");
    addXp(10);
    if (wasFirst) awardBadges(["first-step"]);
  }, []);

  const progressFor = useCallback(
    (wordId: string): WordProgress => progress[wordId] ?? newProgress(wordId),
    [progress]
  );

  const toggleSave = useCallback((wordId: string) => {
    toggleBookmark(wordId);
  }, []);

  const updateSettings = useCallback((s: Settings) => {
    settingsStore.set(s);
  }, []);

  const recordQuiz = useCallback((correct: number, total: number) => {
    for (let i = 0; i < total; i++) recordReview(i < correct);
    addXp(correct * 5 + total * 2);
    if (correct === total && total > 0) awardBadges(["quiz-perfect"]);
  }, []);

  const recordDictation = useCallback((correct: number, total: number) => {
    for (let i = 0; i < total; i++) recordReview(i < correct);
    addXp(correct * 6 + total * 2);
    if (total >= 5 && correct >= total * 0.8) awardBadges(["dictation-10"]);
  }, []);

  const recordPronunciation = useCallback((id: string, score: number, passed: boolean) => {
    recordPronunciationStore(id, score);
    if (passed) {
      recordReview(true);
      addXp(4);
      awardBadges(["speak-clear"]);
    }
  }, []);

  const setNote = useCallback((wordId: string, text: string) => {
    setNoteStore(wordId, text);
  }, []);

  const toggleConversation = useCallback((id: string) => {
    toggleConversationStore(id);
  }, []);

  const recordDailyResult = useCallback((score: number, total: number) => {
    const before = Object.keys(dailyStore.read()).length;
    recordDaily({ score, total });
    const after = Object.keys(dailyStore.read()).length;
    addXp(score * 5 + total * 2);
    const badges = ["daily-first"];
    if (after >= 7 && after !== before) badges.push("daily-7");
    awardBadges(badges);
  }, []);

  const recordWeeklyResult = useCallback((score: number, total: number) => {
    const w = weekKey(0);
    profileStore.set((p) =>
      p ? { ...p, weeklyChallenge: { ...(p.weeklyChallenge ?? {}), [w]: { score, total } } } : p
    );
    addXp(score * 4 + total * 2);
    if (total > 0 && score === total) awardBadges(["quiz-perfect"]);
  }, []);

  const ensureLesson = useCallback((day: string, wordIds: string[]) => {
    ensureLessonStore(day, wordIds);
  }, []);

  const markLessonViewed = useCallback((day: string, wordId: string) => {
    markLessonViewedStore(day, wordId);
  }, []);

  const completeLesson = useCallback(
    (day: string, wordIds: string[], score: number, total: number) => {
      for (const id of wordIds) {
        const prev = getProgressFor(id);
        progressStore.set((p) => ({ ...p, [id]: applyRating(prev, "good") }));
      }
      recordReview(true);
      addXp(score * 5 + total * 3);
      completeLessonStore(day, score, total);
      if (total > 0 && score === total) awardBadges(["quiz-perfect"]);
    },
    []
  );

  const freeze = useCallback((): boolean => applyFreezeStore(), []);

  const backup = useCallback(() => exportData(), []);
  const restore = useCallback((json: string) => importData(json), []);

  const createProfile = useCallback(
    (name: string, level: Level, age?: number, nativeLanguage?: string) => {
      const matched = PLANS.find((p) => p.forLevels.includes(level)) ?? PLANS[0];
      setProfile({
        ...defaultProfile(name, level, age, nativeLanguage),
        planType: matched.id,
      });
    },
    []
  );

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    profileStore.set((p) => (p ? { ...p, ...patch } : p));
  }, []);

  const updatePlanOverrides = useCallback(
    (patch: Partial<NonNullable<Profile["planOverrides"]>>) => {
      profileStore.set((p) =>
        p ? { ...p, planOverrides: { ...(p.planOverrides ?? {}), ...patch } } : p
      );
    },
    []
  );

  const logout = useCallback(() => {
    setProfile(null);
  }, []);

  const reset = useCallback(() => {
    resetAll();
    setProfile(null);
  }, []);

  return {
    progress,
    bookmarks,
    stats,
    settings,
    profile: profile as Profile | null,
    plan,
    planAutoBonus: planAutoBonus,
    notes,
    daily,
    conversations,
    pronunciation,
    lessons,
    today,
    dailyToday: today ? daily[today] ?? null : null,
    weeklyToday: week && profile?.weeklyChallenge ? profile.weeklyChallenge[week] ?? null : null,
    freezeLeft: stats?.freezes ?? 0,
    atRisk: stats && today ? streakAtRisk(stats, today, yesterday) : false,
    rate,
    progressFor,
    toggleSave,
    updateSettings,
    recordQuiz,
    recordDictation,
    recordDailyResult,
    recordWeeklyResult,
    recordPronunciation,
    setNote,
    toggleConversation,
    ensureLesson,
    markLessonViewed,
    completeLesson,
    freeze,
    backup,
    restore,
    createProfile,
    updateProfile,
    updatePlanOverrides,
    logout,
    reset,
  };
}