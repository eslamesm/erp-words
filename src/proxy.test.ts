import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  JOB_ROUTE_PREFIX,
  RESERVED_404_PATH,
  buildReadyRoutes,
  config,
  isAllowedInRoutes,
  isAllowedJobRoute,
  proxy,
} from "@/proxy";
import { JOB_PATHS, READY_JOB_PATHS, jobLessonSlugs } from "@/data/jobPaths";

const PLANNED = JOB_PATHS.filter((path) => path.status !== "ready");
const READY = READY_JOB_PATHS;

function requestFor(pathname: string): NextRequest {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("Phase 11.2C - proxy matcher", () => {
  it("targets only the Job-Based Learning prefix", () => {
    expect(config.matcher).toEqual(["/job-based-learning/:path*"]);
  });
});

describe("Phase 11.2C - proxy allowlist", () => {
  it("preserves the bare index route", () => {
    expect(isAllowedJobRoute(JOB_ROUTE_PREFIX)).toBe(true);
  });

  it("allows every ready job path index", () => {
    for (const path of READY) {
      expect(isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}`), path.slug).toBe(true);
    }
  });

  it("allows every valid lesson on every ready path", () => {
    for (const path of READY) {
      for (const lesson of jobLessonSlugs(path)) {
        expect(
          isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}/${lesson}`),
          `${path.slug}/${lesson}`
        ).toBe(true);
      }
    }
  });

  it("allows the assessment route for every ready path", () => {
    for (const path of READY) {
      expect(
        isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}/assessment`),
        path.slug
      ).toBe(true);
    }
  });

  it("rejects every planned job path index", () => {
    expect(PLANNED.length).toBeGreaterThan(0);
    for (const path of PLANNED) {
      expect(isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}`), path.slug).toBe(false);
    }
  });

  it("rejects planned lessons even when the lesson slug is valid", () => {
    for (const path of PLANNED) {
      for (const lesson of jobLessonSlugs(path)) {
        expect(
          isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}/${lesson}`),
          `${path.slug}/${lesson}`
        ).toBe(false);
      }
    }
  });

  it("rejects planned assessment routes", () => {
    for (const path of PLANNED) {
      expect(
        isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/${path.slug}/assessment`),
        path.slug
      ).toBe(false);
    }
  });

  it("rejects unknown job paths, unknown lessons and malformed shapes", () => {
    const rejected = [
      `${JOB_ROUTE_PREFIX}/does-not-exist`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/not-a-real-lesson`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/assessment/extra`,
      `${JOB_ROUTE_PREFIX}/erp-accountant//gathering-requirements`,
      `${JOB_ROUTE_PREFIX}/`,
      `${JOB_ROUTE_PREFIX}//`,
      `${JOB_ROUTE_PREFIX}/Erp-Accountant`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/Assessment`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/gathering-requirements/`,
      `${JOB_ROUTE_PREFIX}/%2e%2e/erp-accountant`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/${"a".repeat(200)}`,
      "job-based-learning",
      "/job-based-learning-other/erp-accountant",
      "/processes/procure-to-pay",
      "/",
      "",
    ];
    for (const pathname of rejected) {
      expect(isAllowedJobRoute(pathname), JSON.stringify(pathname)).toBe(false);
    }
  });

  it("rejects percent-encoded variants that are not exact known slugs", () => {
    expect(isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/manufacturing%2Dplanner`)).toBe(false);
    expect(isAllowedJobRoute(`${JOB_ROUTE_PREFIX}/erp-accountant%2Fgathering-requirements`)).toBe(
      false
    );
  });
});

describe("Phase 11.2C - fail-closed route index handling", () => {
  it("fails closed when the ready index is empty", () => {
    const routes = buildReadyRoutes({});
    expect(routes.size).toBe(0);
    expect(isAllowedInRoutes(JOB_ROUTE_PREFIX, routes)).toBe(true);
    for (const pathname of [
      `${JOB_ROUTE_PREFIX}/erp-accountant`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/gathering-requirements`,
      `${JOB_ROUTE_PREFIX}/erp-accountant/assessment`,
      `${JOB_ROUTE_PREFIX}/manufacturing-planner`,
    ]) {
      expect(isAllowedInRoutes(pathname, routes), pathname).toBe(false);
    }
  });

  it("drops empty or non-array entries, including planned slugs", () => {
    const routes = buildReadyRoutes({
      "manufacturing-planner": [],
      "warehouse-officer": "receiving-goods",
    } as object);
    expect(routes.size).toBe(0);
    expect(isAllowedInRoutes(`${JOB_ROUTE_PREFIX}/manufacturing-planner`, routes)).toBe(false);
    expect(isAllowedInRoutes(`${JOB_ROUTE_PREFIX}/warehouse-officer`, routes)).toBe(false);
  });

  it("ignores malformed entries instead of enabling them", () => {
    const routes = buildReadyRoutes({
      "erp-accountant": [],
      "not-an-array": "gathering-requirements",
      "mixed-values": ["gathering-requirements", 42, null, ""],
    } as object);
    expect(routes.has("erp-accountant")).toBe(false);
    expect(routes.has("not-an-array")).toBe(false);
    expect([...(routes.get("mixed-values") ?? [])]).toEqual(["gathering-requirements"]);
  });

  it("allows only listed lessons for a valid entry", () => {
    const routes = buildReadyRoutes({ "erp-accountant": ["gathering-requirements"] });
    expect([...(routes.get("erp-accountant") ?? [])]).toEqual(["gathering-requirements"]);
  });
});

describe("Phase 11.2C - reserved unmatched route", () => {
  it("does not live under the Job-Based Learning prefix", () => {
    expect(RESERVED_404_PATH).toBe("/__job-route-not-found__");
    expect(RESERVED_404_PATH.startsWith(`${JOB_ROUTE_PREFIX}/`)).toBe(false);
    expect(RESERVED_404_PATH).not.toBe(JOB_ROUTE_PREFIX);
  });

  it("cannot expose an app page or a public asset", () => {
    const appRoute = join(process.cwd(), "src", "app", RESERVED_404_PATH, "page.tsx");
    const appDirectory = join(process.cwd(), "src", "app", RESERVED_404_PATH);
    const publicAsset = join(process.cwd(), "public", RESERVED_404_PATH);
    expect(existsSync(appRoute)).toBe(false);
    expect(existsSync(appDirectory)).toBe(false);
    expect(existsSync(publicAsset)).toBe(false);
  });
});

describe("Phase 11.2C - proxy responses", () => {
  it("passes allowed requests through without added cache headers", () => {
    const response = proxy(requestFor(`${JOB_ROUTE_PREFIX}/erp-accountant`));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toBeNull();
  });

  it("rewrites rejected requests to the reserved route with no-store", () => {
    for (const pathname of [
      `${JOB_ROUTE_PREFIX}/manufacturing-planner`,
      `${JOB_ROUTE_PREFIX}/warehouse-officer/receiving-goods`,
      `${JOB_ROUTE_PREFIX}/does-not-exist`,
    ]) {
      const response = proxy(requestFor(pathname));
      const rewrite = response.headers.get("x-middleware-rewrite");
      expect(rewrite, pathname).toBeTruthy();
      expect(rewrite?.endsWith(RESERVED_404_PATH), pathname).toBe(true);
      expect(response.headers.get("cache-control"), pathname).toContain("no-store");
      expect(response.headers.get("x-middleware-next"), pathname).toBeNull();
    }
  });

  it("does not branch on request method or RSC headers", () => {
    const headResponse = proxy(
      new NextRequest(`http://localhost${JOB_ROUTE_PREFIX}/warehouse-officer`, { method: "HEAD" })
    );
    const rscResponse = proxy(
      new NextRequest(`http://localhost${JOB_ROUTE_PREFIX}/warehouse-officer`, {
        headers: { RSC: "1" },
      })
    );
    expect(headResponse.headers.get("x-middleware-rewrite")).toBeTruthy();
    expect(rscResponse.headers.get("x-middleware-rewrite")).toBeTruthy();
    expect(headResponse.headers.get("cache-control")).toContain("no-store");
    expect(rscResponse.headers.get("cache-control")).toContain("no-store");
  });
});

describe("Phase 11.2C - proxy import hygiene", () => {
  it("imports only next/server and the generated index", () => {
    const source = readFileSync(join(process.cwd(), "src", "proxy.ts"), "utf8");
    expect(source).toContain('from "next/server"');
    expect(source).toContain('from "./data/jobPathRouteIndex.generated"');
    expect(source).not.toMatch(/from\s+["'][^"']*(?:jobPaths|JOB_PATHS)[^"']*["']/);
    expect(source).not.toMatch(/supabase|useSync|@\/auth|@\/data/);
  });
});
