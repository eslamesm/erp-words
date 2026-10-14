export interface IslamicMessage {
  ar: string;
  en: string;
  sourceAr: string;
  sourceEn: string;
}

export const ISLAMIC_MESSAGES: IslamicMessage[] = [
  {
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    en: "And say: My Lord, increase me in knowledge.",
    sourceAr: "سورة طه — آية ١١٤",
    sourceEn: "Taha 114",
  },
  {
    ar: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
    en: "Allah does not change the condition of a people until they change what is within themselves.",
    sourceAr: "سورة الرعد — آية ١١",
    sourceEn: "Ar-Ra'd 11",
  },
  {
    ar: "لَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    en: "We have made the Quran easy to remember — so is there any who will remember?",
    sourceAr: "سورة القمر — آية ١٧",
    sourceEn: "Al-Qamar 17",
  },
  {
    ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    en: "Indeed, with hardship comes ease.",
    sourceAr: "سورة الشرح — آية ٦",
    sourceEn: "Ash-Sharh 6",
  },
  {
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    en: "Remember Me and I will remember you; be thankful to Me and do not deny Me.",
    sourceAr: "سورة البقرة — آية ١٥٢",
    sourceEn: "Al-Baqarah 152",
  },
  {
    ar: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
    en: "Cooperate with one another in righteousness and piety.",
    sourceAr: "سورة المائدة — آية ٢",
    sourceEn: "Al-Ma'idah 2",
  },
  {
    ar: "إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ",
    en: "Only those among His servants who have knowledge fear Allah.",
    sourceAr: "سورة فاطر — آية ٢٨",
    sourceEn: "Fatir 28",
  },
  {
    ar: "وَاللَّهُ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ",
    en: "And Allah does not allow the reward of those who do good to be lost.",
    sourceAr: "سورة التوبة — آية ١٢٠",
    sourceEn: "At-Tawbah 120",
  },
  {
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    en: "The best of you are those who learn the Quran and teach it.",
    sourceAr: "متفق عليه",
    sourceEn: "Al-Bukhari & Muslim",
  },
  {
    ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    en: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    sourceAr: "رواه مسلم",
    sourceEn: "Sahih Muslim",
  },
  {
    ar: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي",
    en: "O Allah, benefit me through what You have taught me, and teach me what will benefit me.",
    sourceAr: "رواه ابن ماجه",
    sourceEn: "Sunan Ibn Majah",
  },
  {
    ar: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    en: "O Allah, help me to remember You, to thank You, and to worship You well.",
    sourceAr: "رواه النسائي",
    sourceEn: "Sunan an-Nasa'i",
  },
  {
    ar: "اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قُلُوبِنَا",
    en: "O Allah, make the Quran the spring of our hearts.",
    sourceAr: "رواه أبو داود والترمذي",
    sourceEn: "Abu Dawud & At-Tirmidhi",
  },
  {
    ar: "إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا فَلْيُتْقِنْهُ",
    en: "When one of you does a job, let him do it well.",
    sourceAr: "متفق عليه",
    sourceEn: "Al-Bukhari & Muslim",
  },
  {
    ar: "الدُّعَاءُ مُخُّ الْعِبَادَةِ",
    en: "Supplication is the essence of worship.",
    sourceAr: "رواه الترمذي",
    sourceEn: "Jami' at-Tirmidhi",
  },
];

export function pickIslamicMessage(): IslamicMessage {
  const index = Math.floor(Math.random() * ISLAMIC_MESSAGES.length);
  return ISLAMIC_MESSAGES[index];
}
