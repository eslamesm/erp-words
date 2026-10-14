export interface EnglishFix {
  from: string;
  to: string;
  note: string;
}

export interface CorrectionResult {
  corrected: string;
  fixes: EnglishFix[];
}

interface Rule {
  from: RegExp;
  to: string;
  note: string;
}

// أخطاء شائعة في إنجليزية العمل (ERP) يقع فيها الناطقون بالعربية عادةً.
const RULES: Rule[] = [
  { from: /\binformations\b/gi, to: "information", note: "information اسم غير معدود (uncountable) — بلا جمع." },
  { from: /\badvices\b/gi, to: "advice", note: "advice اسم غير معدود — بلا جمع." },
  { from: /\bequipments\b/gi, to: "equipment", note: "equipment غير معدود." },
  { from: /\bfeedbacks\b/gi, to: "feedback", note: "feedback غير معدود." },
  { from: /\bsoftwares\b/gi, to: "software", note: "software غير معدود." },
  { from: /\bstaffs\b/gi, to: "staff", note: "staff اسم جمع أصلاً." },
  { from: /\bI am agree\b/g, to: "I agree", note: "agree فعل، لا يأتي بعد am." },
  { from: /\b(we|they|you) was\b/gi, to: "$1 were", note: "were مع we/they/you." },
  { from: /\b(he|she|it) don't\b/gi, to: "$1 doesn't", note: "doesn't مع he/she/it." },
  { from: /\bdid not went\b/gi, to: "did not go", note: "بعد did/did not يأتي الفعل في المصدر." },
  { from: /\bdidn't went\b/gi, to: "didn't go", note: "بعد didn't يأتي الفعل في المصدر." },
  { from: /\bmore better\b/gi, to: "better", note: "لا تجمع بين more والصفة المقارنة." },
  { from: /\bmost best\b/gi, to: "best", note: "best تفضيل أصلاً." },
  { from: /\bdiscuss about\b/gi, to: "discuss", note: "discuss لا تأخذ about." },
  { from: /\breply back\b/gi, to: "reply", note: "reply تكفي دون back." },
  { from: /\breturn back\b/gi, to: "return", note: "return تكفي دون back." },
  { from: /\brevert back\b/gi, to: "revert", note: "revert تكفي دون back." },
  { from: /\bPlease kindly\b/g, to: "Please", note: "لا حاجة لـ kindly مع Please." },
  { from: /\balot\b/gi, to: "a lot", note: "تُكتب كلمتين: a lot." },
  { from: /\bshould of\b/gi, to: "should have", note: "الصواب have لا of." },
  { from: /\bwould of\b/gi, to: "would have", note: "الصواب have لا of." },
  { from: /\bcould of\b/gi, to: "could have", note: "الصواب have لا of." },
  { from: /\byour welcome\b/gi, to: "you're welcome", note: "you're = you are." },
  { from: /\bdont\b/gi, to: "don't", note: "تحتاج علامة اختصار." },
  { from: /\bdoesnt\b/gi, to: "doesn't", note: "تحتاج علامة اختصار." },
  { from: /\bisnt\b/gi, to: "isn't", note: "تحتاج علامة اختصار." },
  { from: /\bcant\b/gi, to: "can't", note: "تحتاج علامة اختصار." },
  { from: /\bwont\b/gi, to: "won't", note: "تحتاج علامة اختصار." },
  { from: /\bdidnt\b/gi, to: "didn't", note: "تحتاج علامة اختصار." },
  { from: /\bcouldnt\b/gi, to: "couldn't", note: "تحتاج علامة اختصار." },
  { from: /\bshouldnt\b/gi, to: "shouldn't", note: "تحتاج علامة اختصار." },
  { from: /\bwouldnt\b/gi, to: "wouldn't", note: "تحتاج علامة اختصار." },
  { from: /\bteh\b/gi, to: "the", note: "تصحيح إملائي: the." },
  { from: /\brecieve\b/gi, to: "receive", note: "قاعدة i قبل e إلا بعد c." },
  { from: /\bseperate\b/gi, to: "separate", note: "تصحيح إملائي: separate." },
  { from: /\bdefinately\b/gi, to: "definitely", note: "تصحيح إملائي: definitely." },
  { from: /\boccured\b/gi, to: "occurred", note: "تصحيح إملائي: occurred." },
  { from: /\bbegining\b/gi, to: "beginning", note: "تصحيح إملائي: beginning." },
  { from: /\bneccessary\b/gi, to: "necessary", note: "تصحيح إملائي: necessary." },
  { from: /\badress\b/gi, to: "address", note: "تصحيح إملائي: address." },
];

export function correctEnglish(input: string): CorrectionResult {
  let text = input;
  const fixes: EnglishFix[] = [];
  if (!text.trim()) return { corrected: "", fixes: [] };

  for (const rule of RULES) {
    const before = text;
    text = text.replace(rule.from, rule.to);
    if (text !== before) {
      const from = before.match(rule.from)?.[0] ?? "";
      fixes.push({ from, to: from.replace(rule.from, rule.to), note: rule.note });
    }
  }

  // ضمير المتكلم المفرد يُكتب بحرف كبير دائمًا.
  const iBefore = text;
  text = text.replace(/\bi\b/g, "I");
  if (text !== iBefore) fixes.push({ from: "i", to: "I", note: "الضمير I يُكتب دائمًا بحرف كبير." });

  // حرف كبير في بداية الجملة.
  const capBefore = text;
  text = text.replace(/^(\s*)([a-z])/, (_m, sp: string, ch: string) => sp + ch.toUpperCase());
  if (text !== capBefore) fixes.push({ from: capBefore.trim().charAt(0), to: text.trim().charAt(0), note: "ابدأ الجملة بحرف كبير." });

  // إزالة المسافات المزدوجة الناتجة عن الاستبدال.
  const spaced = text.replace(/\s{2,}/g, " ");
  if (spaced !== text) text = spaced;

  return { corrected: text.trim(), fixes };
}
