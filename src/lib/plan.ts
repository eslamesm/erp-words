import type { BadgeDef, Level, PlanDef } from "@/types";

const GAMA_LEVELS: { title: string; titleEn: string; icon: string; minXp: number }[] = [
  { title: "باحث جديد", titleEn: "Newcomer", icon: "🐣", minXp: 0 },
  { title: "متعلم نشط", titleEn: "Active learner", icon: "🚀", minXp: 200 },
  { title: "متخصص متحمس", titleEn: "Enthusiastic specialist", icon: "🎯", minXp: 600 },
  { title: "خبير ERP", titleEn: "ERP expert", icon: "📚", minXp: 1200 },
  { title: "أسطورة ERP Words", titleEn: "ERP Words legend", icon: "🏆", minXp: 2000 },
];

export function gamificationLevel(xp: number) {
  const cur = GAMA_LEVELS.reduce((acc, l) => (xp >= l.minXp ? l : acc), GAMA_LEVELS[0]);
  const next = GAMA_LEVELS.find((l) => l.minXp > xp) ?? null;
  return {
    title: cur.title,
    titleEn: cur.titleEn,
    icon: cur.icon,
    current: cur,
    next,
    progressTowardsNext: next
      ? Math.min(100, Math.round(((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100))
      : 100,
  };
}

export const BADGES: BadgeDef[] = [
  { id: "first-step", icon: "🎓", title: "أول خطوة", titleEn: "First step", desc: "أكمل أول جلسة تعلم", descEn: "Complete your first study session" },
  { id: "streak-3", icon: "🔥", title: "اشتهاء التعلم", titleEn: "Learning streak", desc: "3 أيام متتالية", descEn: "3 days in a row" },
  { id: "streak-7", icon: "⚡", title: "أسبوع واصل", titleEn: "A full week", desc: "7 أيام متتالية", descEn: "7 days in a row" },
  { id: "master-5", icon: "🏅", title: "متقن للمبتدئ", titleEn: "Beginner master", desc: "أتقنت 5 كلمات", descEn: "Mastered 5 words" },
  { id: "master-20", icon: "🥈", title: "بنّاء المفردات", titleEn: "Vocabulary builder", desc: "أتقنت 20 كلمة", descEn: "Mastered 20 words" },
  { id: "master-50", icon: "🥇", title: "موسوعة ERP", titleEn: "ERP encyclopedia", desc: "أتقنت 50 كلمة", descEn: "Mastered 50 words" },
  { id: "quiz-perfect", icon: "💯", title: "علامة كاملة", titleEn: "Perfect score", desc: "أتممت اختبارًا بلا أخطاء", descEn: "Finished a quiz without mistakes" },
  { id: "daily-first", icon: "🎯", title: "أول تحدٍّ يومي", titleEn: "First daily challenge", desc: "أكملت تحديًا يوميًا", descEn: "Completed a daily challenge" },
  { id: "daily-7", icon: "📅", title: "أسبوع تحديات", titleEn: "Challenge week", desc: "7 تحديات يومية", descEn: "7 daily challenges" },
  { id: "dictation-10", icon: "🎧", title: "أذن موسيقية", titleEn: "Musical ear", desc: "جلسة تفقيط بدقة 80% أو أكثر", descEn: "Dictation session at 80%+ accuracy" },
  { id: "speak-clear", icon: "🗣️", title: "نطق واضح", titleEn: "Clear speech", desc: "أتممت تدريب نطق بنجاح", descEn: "Completed a pronunciation drill" },
  { id: "plan-done", icon: "🎖️", title: "مكمل الخطة", titleEn: "Plan finisher", desc: "أتممت خطة التعلم", descEn: "Completed a learning plan" },
];

export class BadgeRules {
  static check(stats: { streak: number }, mastered: number, perfectQuiz: boolean): string[] {
    const earned: string[] = [];
    if (stats.streak >= 3) earned.push("streak-3");
    if (stats.streak >= 7) earned.push("streak-7");
    if (mastered >= 5) earned.push("master-5");
    if (mastered >= 20) earned.push("master-20");
    if (mastered >= 50) earned.push("master-50");
    if (perfectQuiz) earned.push("quiz-perfect");
    return earned;
  }
  static firstStepEarned(reviews: number): boolean {
    return reviews > 0;
  }
  static planDone(daysActive: number, planDays: number): boolean {
    return daysActive >= planDays;
  }
}

export const PLAN_META: Record<Level, { title: string; titleEn: string; icon: string; color: string }> = {
  A1: { title: "المستوى المبتدئ تمامًا", titleEn: "Absolute beginner level", icon: "🌱", color: "text-sky-600 dark:text-sky-300" },
  A2: { title: "المستوى الأساسي", titleEn: "Elementary level", icon: "🌿", color: "text-emerald-600 dark:text-emerald-300" },
  B1: { title: "المستوى المتوسط", titleEn: "Intermediate level", icon: "🌳", color: "text-teal-600 dark:text-teal-300" },
  B2: { title: "المستوى فوق المتوسط", titleEn: "Upper-intermediate level", icon: "🚀", color: "text-indigo-600 dark:text-indigo-300" },
  C1: { title: "المستوى المتقدم", titleEn: "Advanced level", icon: "🏔️", color: "text-rose-600 dark:text-rose-300" },
};

export const PLANS: PlanDef[] = [
  {
    id: "plan-a1",
    level: "A1",
    forLevels: ["A1"],
    title: "خطة الانطلاق الأول",
    titleEn: "The First Launch Plan",
    subtitle: "بناء الأساس الصلب",
    subtitleEn: "Building a solid foundation",
    days: 30,
    newWordsPerDay: 3,
    reviewsPerDay: 10,
    weeklyGoal: 4,
    conversationMinutes: 5,
    intro: "ابدأ بالخطوات الصغيرة الثابتة. ثلاث كلمات يوميًا تصنع بعد شهر مدى مفردات كاملًا.",
    introEn: "Start with small, steady steps. Three words a day builds a full vocabulary range in a month.",
    milestones: [
      { day: 7, title: "أسبوعك الأول 🎉", titleEn: "Your first week 🎉", message: "أنشأت عادة يومية — هذا نصف النجاح!", messageEn: "You built a daily habit — that is half the battle!" },
      { day: 15, title: "نصف الطريق ⛰️", titleEn: "Halfway ⛰️", message: "45 كلمة تحت سيطرتك. واصل بنفس الوتيرة.", messageEn: "45 words under your belt. Keep the same pace." },
      { day: 30, title: "الانطلاقة الكبرى 🚀", titleEn: "The big launch 🚀", message: "أتممت الخطة! راجع كل كلماتك وابدأ المرحلة التالية.", messageEn: "Plan complete! Review all your words and start the next stage." },
    ],
  },
  {
    id: "plan-a2",
    level: "A2",
    forLevels: ["A2"],
    title: "خطة التأسيس",
    titleEn: "Foundation Plan",
    subtitle: "تثبيت الأساسيات",
    subtitleEn: "Locking in the basics",
    days: 30,
    newWordsPerDay: 5,
    reviewsPerDay: 15,
    weeklyGoal: 5,
    conversationMinutes: 5,
    intro: "الآن نرفع الوتيرة قليلًا. خمس كلمات يوميًا مع مراجعة مستمرة تبني ذاكرة قوية.",
    introEn: "Now we raise the pace a little. Five words a day with steady review builds strong memory.",
    milestones: [
      { day: 7, title: "أسبوعك الأول 🎉", titleEn: "Your first week 🎉", message: "الاستمرارية تتفوق على الكمية. عظيم!", messageEn: "Consistency beats quantity. Great work!" },
      { day: 15, title: "نصف الطريق ⛰️", titleEn: "Halfway ⛰️", message: "75 كلمة. أنت تتقدم بثبات مذهل.", messageEn: "75 words. You are progressing remarkably steadily." },
      { day: 30, title: "الأساس مكتمل 🏗️", titleEn: "Foundation complete 🏗️", message: "أساسك جاهز. انتقل للمستوى التالي بثقة.", messageEn: "Your foundation is ready. Move to the next level with confidence." },
    ],
  },
  {
    id: "plan-b1",
    level: "B1",
    forLevels: ["B1"],
    title: "خطة التوسع",
    titleEn: "Expansion Plan",
    subtitle: "توسيع دائرتك العملية",
    subtitleEn: "Widening your work circle",
    days: 45,
    newWordsPerDay: 7,
    reviewsPerDay: 20,
    weeklyGoal: 6,
    conversationMinutes: 7,
    intro: "كل كلمة جديدة هنا أداة في عملك اليومي على الـ ERP. سبع كلمات يوميًا = تقدم سريع.",
    introEn: "Every new word here is a tool in your daily ERP work. Seven words a day means fast progress.",
    milestones: [
      { day: 10, title: "عشرة أيام 💪", titleEn: "Ten days 💪", message: "لاحظ كم جملة أصبحت تفهمها في اجتماعاتك الآن!", messageEn: "Notice how many sentences you now understand in your meetings!" },
      { day: 25, title: "منتصف الخطة ⭐", titleEn: "Mid-plan ⭐", message: "كثر من 150 كلمة. أنت الآن تتحدث لغة النظام.", messageEn: "Over 150 words. You now speak the language of the system." },
      { day: 45, title: "التوسع اكتمل 🌳", titleEn: "Expansion complete 🌳", message: "ممتاز! حان وقت مراجعة شاملة والانتقال للأعلى.", messageEn: "Excellent! Time for a full review and moving up." },
    ],
  },
  {
    id: "plan-b2",
    level: "B2",
    forLevels: ["B2"],
    title: "خطة الاحتراف",
    titleEn: "Professional Plan",
    subtitle: "من الفهم إلى الاستخدام",
    subtitleEn: "From understanding to using",
    days: 60,
    newWordsPerDay: 10,
    reviewsPerDay: 22,
    weeklyGoal: 6,
    conversationMinutes: 10,
    intro: "أنت في مرحلة التحول إلى مدير يتحدث لغة النظام بطلاقة. 10 كلمات يوميًا والتزام ثابت.",
    introEn: "You are turning into a manager who speaks the language of the system fluently. 10 words a day, steady commitment.",
    milestones: [
      { day: 15, title: "خمسة عشر يومًا 🧭", titleEn: "Fifteen days 🧭", message: "بعد 150 كلمة: تقاريرك ورسائلك تغيّرت بالفعل.", messageEn: "After 150 words, your reports and emails have already changed." },
      { day: 30, title: "نصف الرحلة 🎡", titleEn: "Half the journey 🎡", message: "300 كلمة. هذا مستوى خبير ERP حقيقي.", messageEn: "300 words. That is a real ERP expert level." },
      { day: 60, title: "الاحتراف اكتمل 🏆", titleEn: "Professional complete 🏆", message: "أنت تتحدث لغة الـ ERP اليومي بثقة تامة.", messageEn: "You speak the language of daily ERP with full confidence." },
    ],
  },
  {
    id: "plan-c1",
    level: "C1",
    forLevels: ["C1"],
    title: "خطة الإتقان",
    titleEn: "Mastery Plan",
    subtitle: "إتقان المفردات المتقدمة",
    subtitleEn: "Mastering advanced vocabulary",
    days: 90,
    newWordsPerDay: 12,
    reviewsPerDay: 25,
    weeklyGoal: 7,
    conversationMinutes: 10,
    intro: "مصطلحات الخبراء: التقارير، الحوكمة، المفاوضات. هذا مستوى القيادة التقنية.",
    introEn: "Expert terms: reporting, governance, negotiation. This is the technical leadership level.",
    milestones: [
      { day: 20, title: "عشرون يومًا 🚩", titleEn: "Twenty days 🚩", message: "مصطلحات الحوكمة والمطابقة أصبحت مألوفة.", messageEn: "Governance and reconciliation terms have become familiar." },
      { day: 50, title: "نصف الإتقان 🌟", titleEn: "Half mastery 🌟", message: "رصيدك يتجاوز 500 كلمة متقدمة!", messageEn: "Your total exceeds 500 advanced words!" },
      { day: 90, title: "الإتقان التام 👑", titleEn: "Full mastery 👑", message: "أتممت أصعب خطة. أنت مرجع لغة ERP في مؤسستك.", messageEn: "You completed the hardest plan. You are your organization's ERP language reference." },
    ],
  },
];

export const MOTIVATIONAL = [
  "الكلمة الواحدة اليوم = جملة مفهومة غدًا في اجتماعك",
  "الاستمرارية تتفوق على الموهبة — أنت تثبت ذلك كل يوم",
  "كل مراجعة تزيد من ثقتك أمام فريقك",
  "المشاريع تحتاج قادة يفهمون لغة النظام — أنت منهم",
  "خطوة صغيرة كل يوم = تقدم عملاق في شهر",
  "المعرفة التقنية بلغة أجنبية ترفع قيمتك في سوق العمل",
];

export const MOTIVATIONAL_EN = [
  "One word today = a sentence understood in tomorrow's meeting",
  "Consistency beats talent — you prove it every day",
  "Every review boosts your confidence in front of your team",
  "Projects need leaders who speak the language of the system — you are one",
  "A small step every day = giant progress in a month",
  "Technical knowledge in a foreign language raises your market value",
];

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function reviewsToday(history?: { day: string; count: number }[]): number {
  return history?.find((h) => h.day === todayKey())?.count ?? 0;
}
