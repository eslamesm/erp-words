import releaseNotes from "../../../../release-notes.json";

// مسار ديناميكي: يعمل وقت الطلب ولا يُخزَّن في الـ CDN، لتفادي تقديم إصدار قديم.
// (نقرأ request.url فقط لضمان أن الاستجابة وقت الطلب وليست مُولّدة مسبقًا.)
export function GET(request: Request) {
  void request.url;
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";
  const notes = {
    ar: Array.isArray(releaseNotes.ar) ? releaseNotes.ar : [],
    en: Array.isArray(releaseNotes.en) ? releaseNotes.en : [],
  };
  return Response.json(
    { version, buildTime, notes },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
