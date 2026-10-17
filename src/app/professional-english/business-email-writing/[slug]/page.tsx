import { EMAIL_SLUGS } from "@/data/professionalEnglish";
import { EmailPageClient } from "@/components/emails/EmailPageClient";

// جميع المسارات معروفة وقت البناء (generateStaticParams) ⇒ لا حاجة لـ Suspense.
export function generateStaticParams() {
  return EMAIL_SLUGS.map((slug) => ({ slug }));
}

export default async function EmailLessonSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EmailPageClient slug={slug} />;
}
