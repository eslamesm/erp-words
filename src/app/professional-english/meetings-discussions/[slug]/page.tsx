import { MEETING_SLUGS } from "@/data/meetings";
import { MeetingPageClient } from "@/components/meetings/MeetingPageClient";

// جميع المسارات معروفة وقت البناء (generateStaticParams) ⇒ لا حاجة لـ Suspense.
export function generateStaticParams() {
  return MEETING_SLUGS.map((slug) => ({ slug }));
}

export default async function MeetingLessonSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MeetingPageClient slug={slug} />;
}
