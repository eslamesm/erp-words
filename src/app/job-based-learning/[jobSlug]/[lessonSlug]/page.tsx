import { jobPathBySlug, jobLessonSlugs, READY_JOB_PATHS } from "@/data/jobPaths";
import { JobLessonPageClient } from "@/components/jobs/JobPageClients";

export function generateStaticParams() {
  const params: { jobSlug: string; lessonSlug: string }[] = [];
  for (const p of READY_JOB_PATHS) {
    const job = jobPathBySlug(p.slug);
    if (!job) continue;
    for (const s of jobLessonSlugs(job)) {
      params.push({ jobSlug: p.slug, lessonSlug: s });
    }
  }
  return params;
}

export default async function JobLessonSlugPage({
  params,
}: {
  params: Promise<{ jobSlug: string; lessonSlug: string }>;
}) {
  const { jobSlug, lessonSlug } = await params;
  return <JobLessonPageClient pathSlug={jobSlug} lessonSlug={lessonSlug} />;
}
