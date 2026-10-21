import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { JOB_ROUTE_INDEX } from "@/data/jobPathRouteIndex.generated";
import { JOB_PATHS, READY_JOB_PATHS, jobLessonSlugs } from "@/data/jobPaths";

const FORMAT_VERSION = 1;
const SOURCE_FILES = [
  "jobPaths.ts",
  "jobPathsAccountant.ts",
  "jobPathsProcurement.ts",
  "jobPathsManufacturing.ts",
  "jobPathsWarehouse.ts",
];

function recomputeSourceHash(): string {
  const hash = createHash("sha256");
  hash.update(`format:${FORMAT_VERSION}\n`);
  for (const name of SOURCE_FILES) {
    hash.update(`file:${name}\n`);
    hash.update(readFileSync(join(process.cwd(), "src", "data", name)));
    hash.update("\n");
  }
  return hash.digest("hex");
}

describe("Phase 11.2C - generated job route index", () => {
  it("has the expected top-level shape", () => {
    expect(Object.keys(JOB_ROUTE_INDEX).sort()).toEqual(["ready", "sourceHash", "version"]);
    expect(JOB_ROUTE_INDEX.version).toBe(FORMAT_VERSION);
  });

  it("only includes ready job paths, sorted", () => {
    const expected = READY_JOB_PATHS.map((path) => path.slug).sort();
    expect(Object.keys(JOB_ROUTE_INDEX.ready)).toEqual(expected);
    for (const path of JOB_PATHS) {
      if (path.status !== "ready") {
        expect(JOB_ROUTE_INDEX.ready).not.toHaveProperty(path.slug);
      }
    }
  });

  it("keeps every ready lesson in source order", () => {
    const ready = JOB_ROUTE_INDEX.ready as Record<string, readonly string[]>;
    for (const path of READY_JOB_PATHS) {
      expect(ready[path.slug]).toEqual(jobLessonSlugs(path));
    }
  });

  it("contains only slug and lesson strings, with no duplicate lessons", () => {
    for (const [slug, lessons] of Object.entries(JOB_ROUTE_INDEX.ready)) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      for (const lesson of lessons) {
        expect(typeof lesson).toBe("string");
        expect(lesson).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
      expect(new Set(lessons).size).toBe(lessons.length);
    }
  });

  it("is not empty (fails closed rather than silently disabling gating)", () => {
    expect(Object.keys(JOB_ROUTE_INDEX.ready).length).toBeGreaterThan(0);
  });

  it("records the deterministic source hash of the authoritative data", () => {
    expect(JOB_ROUTE_INDEX.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JOB_ROUTE_INDEX.sourceHash).toBe(recomputeSourceHash());
  });
});
