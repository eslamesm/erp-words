import { describe, expect, it, vi } from "vitest";

// Isolate the route from the client UI: this test targets the server-side
// readiness + lesson lookup gate only, not rendering.
vi.mock("@/components/jobs/JobPageClients", () => ({
  JobLessonPageClient: () => null,
}));

import JobLessonSlugPage from "@/app/job-based-learning/[jobSlug]/[lessonSlug]/page";
import {
  jobLessonSlugs,
  jobPathBySlug,
  readyJobPathBySlug,
} from "@/data/jobPaths";

// The exact digest Next.js attaches to notFound() (see next/dist/client/components/not-found).
const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404";

const READY_SLUG = "erp-functional-consultant";
const readyLessonSlug = jobLessonSlugs(readyJobPathBySlug(READY_SLUG)!)[0];

const PLANNED_SLUG = "warehouse-officer";
// A lesson slug that is genuinely valid for the planned path (not a typo).
const plannedLessonSlug = jobLessonSlugs(jobPathBySlug(PLANNED_SLUG)!)[0];

// Released in Phase 10.3: its lesson route must now resolve.
const PROCUREMENT_SLUG = "procurement-specialist";
const procurementLessonSlug = jobLessonSlugs(readyJobPathBySlug(PROCUREMENT_SLUG)!)[0];

function callPage(jobSlug: string, lessonSlug: string) {
  return JobLessonSlugPage({ params: Promise.resolve({ jobSlug, lessonSlug }) });
}

describe("Phase 10.2A — lesson route readiness gate", () => {
  it("serves a ready path with a valid lesson slug", async () => {
    const element = await callPage(READY_SLUG, readyLessonSlug);
    expect(element).toBeTruthy();
  });

  it("serves the released procurement path with a valid lesson slug", async () => {
    const element = await callPage(PROCUREMENT_SLUG, procurementLessonSlug);
    expect(element).toBeTruthy();
  });

  it("returns not-found for a ready path with an invalid lesson slug", async () => {
    await expect(callPage(READY_SLUG, "not-a-real-lesson")).rejects.toMatchObject({
      digest: NOT_FOUND_DIGEST,
    });
  });

  it("returns not-found for a planned path even with a valid lesson slug", async () => {
    await expect(callPage(PLANNED_SLUG, plannedLessonSlug)).rejects.toMatchObject({
      digest: NOT_FOUND_DIGEST,
    });
  });

  it("returns not-found for an unknown job path even with a valid lesson slug", async () => {
    await expect(callPage("does-not-exist", readyLessonSlug)).rejects.toMatchObject({
      digest: NOT_FOUND_DIGEST,
    });
  });
});
