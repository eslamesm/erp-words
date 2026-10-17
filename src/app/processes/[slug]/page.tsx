import { BUSINESS_PROCESSES } from "@/data/processes";
import { ProcessPageClient } from "@/components/processes/ProcessPageClient";

// جميع المسارات معروفة وقت البناء (generateStaticParams) ⇒ لا حاجة لـ Suspense.
export function generateStaticParams() {
  return BUSINESS_PROCESSES.map((p) => ({ slug: p.slug }));
}

export default async function ProcessSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProcessPageClient slug={slug} />;
}
