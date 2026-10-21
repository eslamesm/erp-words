import { notFound } from "next/navigation";
import { READY_JOB_PATHS, readyJobPathBySlug } from "@/data/jobPaths";
import { JobAssessmentPageClient } from "@/components/jobs/JobPageClients";

export function generateStaticParams() {
  return READY_JOB_PATHS.map((p) => ({ jobSlug: p.slug }));
}

export default async function JobAssessmentSlugPage({
  params,
}: {
  params: Promise<{ jobSlug: string }>;
}) {
  const { jobSlug } = await params;
  if (!readyJobPathBySlug(jobSlug)) {
    notFound();
  }
  return <JobAssessmentPageClient pathSlug={jobSlug} />;
}
