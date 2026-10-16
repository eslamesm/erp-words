# ERP Words

تطبيق ويب (PWA) لتعلّم الإنجليزية المهنية ومصطلحات أنظمة ERP: مفردات بالتكرار المتباعد، درس يومي، محادثات، مسارات مهنية، ألعاب، تدريب نطق، ومساعد ذكي.
A bilingual (AR/EN) PWA for learning professional English and ERP terminology.

- **الواجهة:** Next.js 16 · React 19 · TypeScript · Tailwind 4
- **البيانات:** تُحفظ محليًا (localStorage)، ومزامنة اختيارية عبر Supabase
- **المساعد الذكي:** محرّك محلي بلا مفتاح، أو أي مزوّد متوافق مع OpenAI بمفتاحك (BYOK) — مثل Groq أو OpenRouter أو Ollama (مجانية/محلية)
- **النطق:** Web Speech API في المتصفح

## التشغيل

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint
npm test
npm run build
```

## إعداد المزامنة السحابية (اختياري)

1. أنشئ مشروعًا مجانيًا في [Supabase](https://supabase.com).
2. شغّل `supabase/schema.sql` في SQL Editor.
3. انسخ `.env.example` إلى `.env.local` وضع الرابط والمفتاح العام (anon).
4. في Supabase → Authentication → URL Configuration أضف رابط موقعك ورابط `/settings` لاستعادة كلمة المرور.

> ملاحظة: مشاريع Supabase المجانية تُوقَف مؤقتًا بعد أسبوع تقريبًا بلا نشاط.

## المساعد الذكي المجاني

الافتراضي في الإعدادات هو Groq (طبقة مجانية، يلزم مفتاح مجاني من console.groq.com بلا بطاقة). بدائل مجانية: OpenRouter (نماذج `:free`) أو Ollama محليًا. بدون مفتاح يعمل المساعد المحلي. أسماء النماذج المجانية تتغيّر من حين لآخر، فعدّلها من الإعدادات إن رفضها المزوّد.

## العمل دون اتصال والأمان

- `public/sw.js` يخزّن الصفحات الأساسية وملفاتها عند التثبيت؛ عدّل قائمة `ROUTES` فيه عند إضافة صفحات.
- CSP معرّفة في `next.config.ts`. تبقى `unsafe-inline` للسكربتات لأن Next يحقن سكربتات مضمّنة، و`connect-src` يسمح بـ https لأن المستخدم يختار مزوّده.

## النشر

مجانًا على Vercel (Hobby) أو Cloudflare Pages. أضف متغيرات البيئة نفسها في إعدادات المشروع.

## البنية

- `src/app` الصفحات · `src/components` المكوّنات · `src/data` المحتوى · `src/lib` المنطق (SRS، المزامنة، المساعد) · `src/hooks`
- `public/sw.js` خدمة العمل دون اتصال والتحديث الذاتي · `release-notes.json` ملاحظات الإصدار المعروضة داخل التطبيق
