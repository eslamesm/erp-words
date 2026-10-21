import { notFound } from "next/navigation";
import { READY_JOB_PATHS, readyJobPathBySlug, jobLessonSlugs } from "@/data/jobPaths";
import { JobLessonPageClient } from "@/components/jobs/JobPageClients";

export function generateStaticParams() {
  const params: { jobSlug: string; lessonSlug: string }[] = [];
  for (const p of READY_JOB_PATHS) {
    const job = readyJobPathBySlug(p.slug);
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
  const path = readyJobPathBySlug(jobSlug);
  const lesson = path?.lessons.find((l) => l.slug === lessonSlug);
  if (!path || !lesson) {
    notFound();
  }
  return <JobLessonPageClient pathSlug={jobSlug} lessonSlug={lessonSlug} />;
}
