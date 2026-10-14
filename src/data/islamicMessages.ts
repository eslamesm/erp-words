export interface IslamicMessage {
  ar: string;
  en: string;
  sourceAr: string;
  sourceEn: string;
}

export const ISLAMIC_MESSAGES: IslamicMessage[] = [
  {
    ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    en: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    sourceAr: "رواه مسلم",
    sourceEn: "Sahih Muslim",
  },
  {
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    en: "The best of you are those who learn the Quran and teach it.",
    sourceAr: "متفق عليه",
    sourceEn: "Al-Bukhari & Muslim",
  },
  {
    ar: "الْكَيِّسُ مَنْ دَانَ نَفْسَهُ وَعَمِلَ لِمَا بَعْدَ الْمَوْتِ",
    en: "The wise is he who holds himself accountable and works for what comes after death.",
    sourceAr: "رواه الترمذي",
    sourceEn: "Jami' at-Tirmidhi",
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
    ar: "لَا يَزَالُ لِسَانُكَ رَطْبًا مِنْ ذِكْرِ اللَّهِ",
    en: "Let your tongue remain moist with the remembrance of Allah.",
    sourceAr: "رواه الترمذي",
    sourceEn: "Jami' at-Tirmidhi",
  },
  {
    ar: "الدُّعَاءُ مُخُّ الْعِبَادَةِ",
    en: "Supplication is the essence of worship.",
    sourceAr: "رواه الترمذي",
    sourceEn: "Jami' at-Tirmidhi",
  },
  {
    ar: "إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا فَلْيُتْقِنْهُ",
    en: "When one of you does a job, let him do it with mastery.",
    sourceAr: "أثر مأثور",
    sourceEn: "Reported saying (athar)",
  },
  {
    ar: "قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُ",
    en: "The worth of every person is in what he does well.",
    sourceAr: "علي بن أبي طالب",
    sourceEn: "Ali ibn Abi Talib",
  },
  {
    ar: "إِنِّي لَأَرَى الرَّجُلَ فَيُعْجِبُنِي فَأَقُولُ: هَلْ لَهُ صَنْعَةٌ؟ فَإِنْ قَالُوا: لَا، سَقَطَ مِنْ عَيْنِي",
    en: "I see a man and admire him, so I ask: does he have a craft? If they say no, he falls from my eyes.",
    sourceAr: "عمر بن الخطاب",
    sourceEn: "Umar ibn al-Khattab",
  },
  {
    ar: "مَنْ أَرَادَ الدُّنْيَا فَعَلَيْهِ بِالْعِلْمِ، وَمَنْ أَرَادَ الْآخِرَةَ فَعَلَيْهِ بِالْعِلْمِ، وَمَنْ أَرَادَهُمَا فَعَلَيْهِ بِالْعِلْمِ",
    en: "Whoever wants this world must seek knowledge, whoever wants the Hereafter must seek knowledge, and whoever wants both must seek knowledge.",
    sourceAr: "الإمام الشافعي",
    sourceEn: "Imam ash-Shafi'i",
  },
  {
    ar: "مَنْ لَمْ يَذُقْ ذُلَّ التَّعَلُّمِ سَاعَةً تَجَرَّعَ كَأْسَ الْجَهْلِ طُولَ حَيَاتِهِ",
    en: "Whoever has not tasted the bitterness of learning for an hour will swallow the cup of ignorance all his life.",
    sourceAr: "الإمام الشافعي",
    sourceEn: "Imam ash-Shafi'i",
  },
  {
    ar: "الْعِلْمُ يَحْرُسُكَ وَأَنْتَ تَحْرُسُ الْمَالَ",
    en: "Knowledge guards you, while you guard wealth.",
    sourceAr: "قول مأثور",
    sourceEn: "Arabic saying",
  },
  {
    ar: "مَنْ طَلَبَ الْعُلَى سَهِرَ اللَّيَالِي",
    en: "Whoever seeks the heights spends the nights awake.",
    sourceAr: "مثل عربي",
    sourceEn: "Arabic proverb",
  },
  {
    ar: "الْجِدُّ يُدْنِي كُلَّ بَعِيدٍ",
    en: "Diligence brings every distant goal near.",
    sourceAr: "قول مأثور",
    sourceEn: "Arabic saying",
  },
  {
    ar: "الصَّبْرُ مِفْتَاحُ الْفَرَجِ",
    en: "Patience is the key to relief.",
    sourceAr: "قول مأثور",
    sourceEn: "Arabic saying",
  },
];

export function pickIslamicMessage(): IslamicMessage {
  const index = Math.floor(Math.random() * ISLAMIC_MESSAGES.length);
  return ISLAMIC_MESSAGES[index];
}
