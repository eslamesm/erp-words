#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync, statSync } from "node:fs";
import net from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_ID = join(ROOT, ".next", "BUILD_ID");
const NEXT_BIN = join(ROOT, "node_modules", "next", "dist", "bin", "next");
const PORT = Number(process.env.SMOKE_PORT || 3310);
const BASE = `http://127.0.0.1:${PORT}`;
const BUDGET_BYTES = 350 * 1024;
const LEAK_MARKERS = [
  "ERP Warehouse Officer",
  "Twelve lessons covering warehouse operations",
  "understanding-manufacturing-planner-role",
];

const failures = [];
let checks = 0;
let server;

function check(label, condition, detail = "") {
  checks += 1;
  if (condition) {
    console.log(`PASS ${label}`);
  } else {
    console.log(`FAIL ${label}${detail ? ` :: ${detail}` : ""}`);
    failures.push(label);
  }
}

function delay(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

function readReservedPath() {
  const source = readFileSync(join(ROOT, "src", "proxy.ts"), "utf8");
  const reserved = source.match(/RESERVED_404_PATH\s*=\s*"([^"]+)"/)?.[1];
  if (!reserved) throw new Error("could not read RESERVED_404_PATH from src/proxy.ts");
  return reserved;
}

function readReadyCase() {
  const source = readFileSync(join(ROOT, "src", "data", "jobPathRouteIndex.generated.ts"), "utf8");
  const block = source.slice(source.indexOf("ready: {"));
  const slug = block.match(/"([a-z0-9-]+)":\s*\[/)?.[1];
  if (!slug) throw new Error("could not read a ready slug from the generated index");
  const afterSlug = block.slice(block.indexOf(`"${slug}": [`) + slug.length);
  const lesson = afterSlug.match(/"([a-z0-9-]+)"/)?.[1];
  if (!lesson) throw new Error("could not read a ready lesson from the generated index");
  return { slug, lesson };
}

async function assertPortFree() {
  await new Promise((done, reject) => {
    const probe = net.createServer();
    probe.once("error", () => reject(new Error(`port ${PORT} is already in use`)));
    probe.listen(PORT, "127.0.0.1", () => probe.close(done));
  });
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(`${BASE}/api/version`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      // not ready yet
    }
    await delay(250);
  }
  throw new Error("next start did not become ready within 60s");
}

async function request(path, { method = "GET", headers = {} } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  const body = method === "HEAD" ? "" : await response.text();
  return { status: response.status, headers: response.headers, body };
}

async function requestAbsolute(url) {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.text(),
  };
}

function assertReject(label, response, { rsc = false } = {}) {
  check(`${label} status=${response.status}`, response.status === 404, "expected 404");
  const cacheControl = response.headers.get("cache-control") ?? "";
  check(`${label} no-store`, cacheControl.includes("no-store"), `cache-control=${cacheControl}`);
  check(
    `${label} no s-maxage`,
    !cacheControl.includes("s-maxage"),
    `cache-control=${cacheControl}`
  );
  if (rsc) {
    const contentType = response.headers.get("content-type") ?? "";
    check(`${label} rsc content-type`, contentType.startsWith("text/x-component"), contentType);
  }
  for (const marker of LEAK_MARKERS) {
    check(`${label} no leak "${marker}"`, !response.body.includes(marker));
  }
}

function measureProxyBundle() {
  const middlewarePath = join(ROOT, ".next", "server", "middleware.js");
  const files = new Set([middlewarePath]);
  const source = readFileSync(middlewarePath, "utf8");
  const add = (reference) => {
    let relative = reference.replace(/^\.\//, "");
    if (!relative.startsWith("server/")) relative = `server/${relative}`;
    files.add(join(ROOT, ".next", relative));
  };
  for (const match of source.matchAll(/R\.c\("([^"]+)"\)/g)) add(match[1]);
  for (const match of source.matchAll(/require\("(\.\/chunks\/[^"]+)"\)/g)) add(match[1]);
  let total = 0;
  for (const file of files) {
    if (existsSync(file)) total += statSync(file).size;
  }
  return total;
}

async function main() {
  if (!existsSync(BUILD_ID)) {
    throw new Error("production build is missing; run npm run build first");
  }
  await assertPortFree();

  server = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.once("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`next start exited with ${code}\n${output.slice(-2_000)}`);
    }
  });

  await waitForServer();

  const ready = readReadyCase();
  const reservedPath = readReservedPath();
  const rejects = [
    ["planned index", "/job-based-learning/manufacturing-planner"],
    ["planned lesson", "/job-based-learning/warehouse-officer/receiving-goods"],
    ["planned assessment", "/job-based-learning/manufacturing-planner/assessment"],
    ["unknown job", "/job-based-learning/does-not-exist"],
    ["invalid lesson ready", "/job-based-learning/erp-accountant/not-a-real-lesson"],
    ["invalid lesson planned", "/job-based-learning/warehouse-officer/not-a-real-lesson"],
  ];

  console.log("=== COLD (fresh production server) ===");
  for (const [label, path] of rejects) {
    assertReject(label, await request(path));
  }

  const rscPlanned = await request("/job-based-learning/manufacturing-planner", {
    headers: { RSC: "1" },
  });
  assertReject("planned index RSC", rscPlanned, { rsc: true });

  const headPlanned = await request("/job-based-learning/warehouse-officer/receiving-goods", {
    method: "HEAD",
  });
  assertReject("planned lesson HEAD", headPlanned);

  for (const [label, path] of [
    ["encoded hyphen", "/job-based-learning/manufacturing%2Dplanner"],
    ["uppercase", "/job-based-learning/Manufacturing-Planner"],
    ["encoded slash", "/job-based-learning/manufacturing-planner%2Fassessment"],
    ["query", "/job-based-learning/manufacturing-planner?x=1"],
    ["long slug", `/job-based-learning/${"a".repeat(200)}`],
  ]) {
    assertReject(label, await request(path));
  }

  const trailing = await request("/job-based-learning/manufacturing-planner/");
  check(
    `trailing slash redirect status=${trailing.status}`,
    trailing.status === 308,
    "expected 308"
  );
  const location = trailing.headers.get("location");
  check(
    "trailing slash location",
    Boolean(location) && location.endsWith("/job-based-learning/manufacturing-planner"),
    String(location)
  );
  if (location) {
    const followed = await requestAbsolute(new URL(location, BASE).toString());
    assertReject("trailing slash destination", followed);
  }

  console.log("=== READY ROUTES ===");
  const readyIndex = await request("/job-based-learning");
  check(`ready index status=${readyIndex.status}`, readyIndex.status === 200, "expected 200");
  check(
    "ready index cacheable",
    (readyIndex.headers.get("cache-control") ?? "").includes("s-maxage"),
    readyIndex.headers.get("cache-control") ?? ""
  );
  check("ready index content", readyIndex.body.length > 20_000, `${readyIndex.body.length} bytes`);

  const readyLessonPath = `/job-based-learning/${ready.slug}/${ready.lesson}`;
  const readyLesson = await request(readyLessonPath);
  check(`ready lesson status=${readyLesson.status}`, readyLesson.status === 200, "expected 200");
  check(
    "ready lesson cacheable",
    (readyLesson.headers.get("cache-control") ?? "").includes("s-maxage"),
    readyLesson.headers.get("cache-control") ?? ""
  );
  check("ready lesson content", readyLesson.body.length > 20_000, `${readyLesson.body.length} bytes`);
  check(
    "ready lesson payload",
    readyLesson.body.includes(ready.lesson),
    `missing ${ready.lesson}`
  );

  const readyAssessment = await request(`/job-based-learning/${ready.slug}/assessment`);
  check(
    `ready assessment status=${readyAssessment.status}`,
    readyAssessment.status === 200,
    "expected 200"
  );
  check(
    "ready assessment cacheable",
    (readyAssessment.headers.get("cache-control") ?? "").includes("s-maxage"),
    readyAssessment.headers.get("cache-control") ?? ""
  );

  console.log("=== UNRELATED ROUTES ===");
  for (const [label, path] of [
    ["root", "/"],
    ["api version", "/api/version"],
    ["service worker", "/sw.js"],
    ["manifest", "/manifest.webmanifest"],
  ]) {
    const response = await request(path);
    check(`${label} status=${response.status}`, response.status === 200, "expected 200");
  }
  const unrelated404 = await request("/does-not-exist");
  check(
    `unrelated unknown status=${unrelated404.status}`,
    unrelated404.status === 404,
    "expected 404"
  );

  const reserved = await request(reservedPath);
  check(`reserved path status=${reserved.status}`, reserved.status === 404, "expected 404");
  for (const marker of LEAK_MARKERS) {
    check(`reserved path no leak "${marker}"`, !reserved.body.includes(marker));
  }

  console.log("=== WARM (repeated requests) ===");
  for (const [label, path] of rejects) {
    assertReject(`warm ${label}`, await request(path));
  }
  const warmReady = await request(readyLessonPath);
  check(`warm ready lesson status=${warmReady.status}`, warmReady.status === 200, "expected 200");

  const bundleBytes = measureProxyBundle();
  const bundleKb = bundleBytes / 1024;
  check(
    "proxy bundle budget",
    bundleBytes <= BUDGET_BYTES,
    `${bundleKb.toFixed(1)} KB exceeds ${(BUDGET_BYTES / 1024).toFixed(0)} KB`
  );
  console.log(`INFO proxy bundle: ${bundleKb.toFixed(1)} KB`);

  console.log(`INFO ready case: ${ready.slug}/${ready.lesson}`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill();
  const exited = await Promise.race([
    once(server, "exit").then(() => true),
    delay(3_000).then(() => false),
  ]);
  if (!exited) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

try {
  await main();
} catch (error) {
  console.error(`[smoke] ${error instanceof Error ? error.message : String(error)}`);
  failures.push("fatal");
} finally {
  await stopServer();
}

console.log(`INFO checks: ${checks}, failures: ${failures.length}`);
if (failures.length > 0) {
  console.error(`SMOKE FAIL (${failures.length}): ${failures.join("; ")}`);
  process.exitCode = 1;
} else {
  console.log("SMOKE PASS");
}
