// أصوات الحروف والمركّبات (Phonics) — بيانات ثابتة للعرض والتدريب على النطق.
// ملاحظة: النطق عبر محرّك الكلام في المتصفح (TTS) يعتمد على نطق الكلمة المثال
// لأن نطق الرموز الصوتية (IPA) المجرّدة غير موثوق في محركات TTS.

export interface LetterSound {
  letter: string;
  lower: string;
  name: string; // نطق اسم الحرف بالإنجليزية
  ipa: string; // صوت الحرف الشائع
  example: string;
  exampleAr: string;
}

export interface SoundGroup {
  sound: string;
  ipa: string;
  example: string;
  exampleAr: string;
}

export const ALPHABET: LetterSound[] = [
  { letter: "A", lower: "a", name: "ay", ipa: "/eɪ/", example: "apple", exampleAr: "تفاحة" },
  { letter: "B", lower: "b", name: "bee", ipa: "/b/", example: "book", exampleAr: "كتاب" },
  { letter: "C", lower: "c", name: "see", ipa: "/k/", example: "cat", exampleAr: "قطة" },
  { letter: "D", lower: "d", name: "dee", ipa: "/d/", example: "dog", exampleAr: "كلب" },
  { letter: "E", lower: "e", name: "ee", ipa: "/e/", example: "egg", exampleAr: "بيضة" },
  { letter: "F", lower: "f", name: "eff", ipa: "/f/", example: "fish", exampleAr: "سمكة" },
  { letter: "G", lower: "g", name: "jee", ipa: "/g/", example: "go", exampleAr: "يذهب" },
  { letter: "H", lower: "h", name: "aitch", ipa: "/h/", example: "hat", exampleAr: "قبعة" },
  { letter: "I", lower: "i", name: "eye", ipa: "/ɪ/", example: "ink", exampleAr: "حبر" },
  { letter: "J", lower: "j", name: "jay", ipa: "/dʒ/", example: "jump", exampleAr: "يقفز" },
  { letter: "K", lower: "k", name: "kay", ipa: "/k/", example: "key", exampleAr: "مفتاح" },
  { letter: "L", lower: "l", name: "ell", ipa: "/l/", example: "leg", exampleAr: "ساق" },
  { letter: "M", lower: "m", name: "em", ipa: "/m/", example: "man", exampleAr: "رجل" },
  { letter: "N", lower: "n", name: "en", ipa: "/n/", example: "net", exampleAr: "شبكة" },
  { letter: "O", lower: "o", name: "oh", ipa: "/ɒ/", example: "orange", exampleAr: "برتقال" },
  { letter: "P", lower: "p", name: "pee", ipa: "/p/", example: "pen", exampleAr: "قلم" },
  { letter: "Q", lower: "q", name: "cue", ipa: "/kw/", example: "queen", exampleAr: "ملكة" },
  { letter: "R", lower: "r", name: "ar", ipa: "/r/", example: "red", exampleAr: "أحمر" },
  { letter: "S", lower: "s", name: "ess", ipa: "/s/", example: "sun", exampleAr: "شمس" },
  { letter: "T", lower: "t", name: "tee", ipa: "/t/", example: "top", exampleAr: "قمة" },
  { letter: "U", lower: "u", name: "you", ipa: "/ʌ/", example: "up", exampleAr: "أعلى" },
  { letter: "V", lower: "v", name: "vee", ipa: "/v/", example: "van", exampleAr: "شاحنة صغيرة" },
  { letter: "W", lower: "w", name: "double-u", ipa: "/w/", example: "wet", exampleAr: "مبلل" },
  { letter: "X", lower: "x", name: "ex", ipa: "/ks/", example: "box", exampleAr: "صندوق" },
  { letter: "Y", lower: "y", name: "why", ipa: "/j/", example: "yes", exampleAr: "نعم" },
  { letter: "Z", lower: "z", name: "zee", ipa: "/z/", example: "zoo", exampleAr: "حديقة حيوان" },
];

export const DIGRAPHS: SoundGroup[] = [
  { sound: "sh", ipa: "/ʃ/", example: "ship", exampleAr: "سفينة" },
  { sound: "ch", ipa: "/tʃ/", example: "chair", exampleAr: "كرسي" },
  { sound: "th", ipa: "/θ/", example: "think", exampleAr: "يفكّر" },
  { sound: "th", ipa: "/ð/", example: "this", exampleAr: "هذا" },
  { sound: "ph", ipa: "/f/", example: "phone", exampleAr: "هاتف" },
  { sound: "wh", ipa: "/w/", example: "white", exampleAr: "أبيض" },
  { sound: "ck", ipa: "/k/", example: "back", exampleAr: "خلف" },
  { sound: "ng", ipa: "/ŋ/", example: "sing", exampleAr: "يغني" },
  { sound: "qu", ipa: "/kw/", example: "queen", exampleAr: "ملكة" },
];

export const VOWEL_TEAMS: SoundGroup[] = [
  { sound: "ee", ipa: "/iː/", example: "see", exampleAr: "يرى" },
  { sound: "ea", ipa: "/iː/", example: "eat", exampleAr: "يأكل" },
  { sound: "ai", ipa: "/eɪ/", example: "rain", exampleAr: "مطر" },
  { sound: "ay", ipa: "/eɪ/", example: "day", exampleAr: "يوم" },
  { sound: "oa", ipa: "/oʊ/", example: "boat", exampleAr: "قارب" },
  { sound: "oo", ipa: "/uː/", example: "moon", exampleAr: "قمر" },
  { sound: "oo", ipa: "/ʊ/", example: "book", exampleAr: "كتاب" },
  { sound: "ou", ipa: "/aʊ/", example: "out", exampleAr: "خارج" },
  { sound: "ow", ipa: "/aʊ/", example: "cow", exampleAr: "بقرة" },
  { sound: "oi", ipa: "/ɔɪ/", example: "coin", exampleAr: "عملة" },
  { sound: "oy", ipa: "/ɔɪ/", example: "boy", exampleAr: "ولد" },
  { sound: "au", ipa: "/ɔː/", example: "haul", exampleAr: "يسحب" },
];

export const BLENDS: SoundGroup[] = [
  { sound: "bl", ipa: "/bl/", example: "blue", exampleAr: "أزرق" },
  { sound: "br", ipa: "/br/", example: "bread", exampleAr: "خبز" },
  { sound: "cl", ipa: "/kl/", example: "clock", exampleAr: "ساعة" },
  { sound: "cr", ipa: "/kr/", example: "crab", exampleAr: "سلطعون" },
  { sound: "dr", ipa: "/dr/", example: "drum", exampleAr: "طبل" },
  { sound: "fl", ipa: "/fl/", example: "flag", exampleAr: "علم" },
  { sound: "fr", ipa: "/fr/", example: "frog", exampleAr: "ضفدع" },
  { sound: "gl", ipa: "/gl/", example: "glass", exampleAr: "زجاج" },
  { sound: "gr", ipa: "/gr/", example: "green", exampleAr: "أخضر" },
  { sound: "pl", ipa: "/pl/", example: "plane", exampleAr: "طائرة" },
  { sound: "pr", ipa: "/pr/", example: "prize", exampleAr: "جائزة" },
  { sound: "sk", ipa: "/sk/", example: "sky", exampleAr: "سماء" },
  { sound: "sl", ipa: "/sl/", example: "sleep", exampleAr: "ينام" },
  { sound: "sn", ipa: "/sn/", example: "snake", exampleAr: "ثعبان" },
  { sound: "sp", ipa: "/sp/", example: "spoon", exampleAr: "ملعقة" },
  { sound: "st", ipa: "/st/", example: "star", exampleAr: "نجمة" },
  { sound: "sw", ipa: "/sw/", example: "swim", exampleAr: "يسبح" },
  { sound: "tr", ipa: "/tr/", example: "tree", exampleAr: "شجرة" },
  { sound: "tw", ipa: "/tw/", example: "twelve", exampleAr: "اثنا عشر" },
  { sound: "str", ipa: "/str/", example: "street", exampleAr: "شارع" },
  { sound: "spr", ipa: "/spr/", example: "spring", exampleAr: "ربيع" },
  { sound: "spl", ipa: "/spl/", example: "splash", exampleAr: "رشّ" },
];
