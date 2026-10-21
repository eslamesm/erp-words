import { describe, expect, it, vi } from "vitest";

// Isolate the route from the client UI: this test targets the server-side
// readiness gate only, not rendering.
vi.mock("@/components/jobs/JobPageClients", () => ({
  JobAssessmentPageClient: () => null,
}));

import JobAssessmentSlugPage from "@/app/job-based-learning/[jobSlug]/assessment/page";
import { READY_JOB_PATHS } from "@/data/jobPaths";

// The exact digest Next.js attaches to notFound() (see next/dist/client/components/not-found).
const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404";

const PLANNED_SLUGS = ["procurement-specialist", "manufacturing-planner", "warehouse-officer"];

function callPage(jobSlug: string) {
  return JobAssessmentSlugPage({ params: Promise.resolve({ jobSlug }) });
}

describe("Phase 10.2A — assessment route readiness gate", () => {
  it("serves the assessment route for every ready path", async () => {
    for (const path of READY_JOB_PATHS) {
      const element = await callPage(path.slug);
      expect(element, path.slug).toBeTruthy();
    }
  });

  for (const slug of PLANNED_SLUGS) {
    it(`returns not-found for the planned path ${slug}`, async () => {
      await expect(callPage(slug)).rejects.toMatchObject({ digest: NOT_FOUND_DIGEST });
    });
  }

  it("returns not-found for an unknown job path", async () => {
    await expect(callPage("does-not-exist")).rejects.toMatchObject({
      digest: NOT_FOUND_DIGEST,
    });
  });
});
