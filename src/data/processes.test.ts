import { describe, it, expect } from "vitest";
import { BUSINESS_PROCESSES, PROCESS_SLUGS, processBySlug, READY_PROCESSES } from "@/data/processes";
import { MODULE_IDS } from "@/data/modules";
import { SUB_MODULE_ID_SET } from "@/data/subModules";
import { BUSINESS_FUNCTION_ID_SET } from "@/data/businessFunctions";
import { wordById } from "@/data/words";

const MODULE_ID_SET = new Set<string>(MODULE_IDS);

describe("business processes (Phase 02)", () => {
  it("has unique ids and slugs", () => {
    const ids = BUSINESS_PROCESSES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(PROCESS_SLUGS).size).toBe(PROCESS_SLUGS.length);
    for (const slug of PROCESS_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("uses a valid status and valid module ids", () => {
    for (const p of BUSINESS_PROCESSES) {
      expect(["ready", "planned"], p.id).toContain(p.status);
      expect(p.moduleIds.length, p.id).toBeGreaterThan(0);
      for (const m of p.moduleIds) {
        expect(MODULE_ID_SET.has(m), `${p.id}:${m}`).toBe(true);
      }
    }
  });

  it("keeps the ready processes wired as templates", () => {
    expect(READY_PROCESSES.map((p) => p.id).sort()).toEqual([
      "h2r",
      "o2c",
      "p2p",
      "p2produce",
      "r2r",
    ]);
    expect(processBySlug("procure-to-pay")?.id).toBe("p2p");
    expect(processBySlug("order-to-cash")?.id).toBe("o2c");
    expect(processBySlug("record-to-report")?.id).toBe("r2r");
    expect(processBySlug("plan-to-produce")?.id).toBe("p2produce");
    expect(processBySlug("hire-to-retire")?.id).toBe("h2r");
    expect(BUSINESS_PROCESSES.filter((p) => p.status === "planned")).toHaveLength(0);
  });

  it("gives every ready process the eight lesson sections", () => {
    for (const p of READY_PROCESSES) {
      expect(p.scenarioAr, p.id).toBeTruthy();
      expect(p.scenarioEn, p.id).toBeTruthy();
      expect(p.steps?.length, p.id).toBeGreaterThan(0);
      expect(p.conversations?.length, p.id).toBeGreaterThan(0);
      expect(p.documents?.length, p.id).toBeGreaterThan(0);
      expect(p.exercise, p.id).toBeTruthy();
      expect(p.quiz?.length, p.id).toBeGreaterThanOrEqual(5);
    }
  });

  it("orders steps sequentially with unique ids and valid references", () => {
    for (const p of READY_PROCESSES) {
      const steps = p.steps ?? [];
      const stepIds = steps.map((s) => s.id);
      expect(new Set(stepIds).size, p.id).toBe(stepIds.length);

      steps.forEach((s, i) => {
        expect(s.order, s.id).toBe(i + 1);
        expect(MODULE_ID_SET.has(s.moduleId), `${s.id}:${s.moduleId}`).toBe(true);
        if (s.subModuleId) {
          expect(SUB_MODULE_ID_SET.has(s.subModuleId), `${s.id}:${s.subModuleId}`).toBe(true);
        }
        for (const bf of s.businessFunctionIds ?? []) {
          expect(BUSINESS_FUNCTION_ID_SET.has(bf), `${s.id}:${bf}`).toBe(true);
        }
        for (const id of [...(s.wordIds ?? []), ...(s.screenIds ?? [])]) {
          expect(wordById(id), `${s.id}:${id}`).toBeTruthy();
        }
      });
    }
  });

  it("gives every ready step bilingual flow fields (role/input/output/decision)", () => {
    for (const p of READY_PROCESSES) {
      for (const s of p.steps ?? []) {
        for (const [ar, en] of [
          [s.roleAr, s.roleEn],
          [s.inputAr, s.inputEn],
          [s.outputAr, s.outputEn],
          [s.decisionAr, s.decisionEn],
        ]) {
          expect(ar && en, `${s.id}: flow field`).toBeTruthy();
        }
      }
    }
  });

  it("validates step paths (outcome enum + bilingual text)", () => {
    const OUTCOMES = new Set(["normal", "approved", "rejected", "partial", "exception"]);
    for (const p of READY_PROCESSES) {
      for (const s of p.steps ?? []) {
        for (const path of s.paths ?? []) {
          expect(OUTCOMES.has(path.outcome), `${s.id}:${path.outcome}`).toBe(true);
          expect(path.labelAr && path.labelEn, `${s.id}: path label`).toBeTruthy();
          expect(path.descAr && path.descEn, `${s.id}: path desc`).toBeTruthy();
        }
      }
    }
  });

  it("resolves every document wordId", () => {
    for (const p of READY_PROCESSES) {
      for (const d of p.documents ?? []) {
        if (d.wordId) {
          expect(wordById(d.wordId), `${d.id}:${d.wordId}`).toBeTruthy();
        }
      }
    }
  });

  it("keeps quiz questions well-formed and bilingual", () => {
    for (const p of READY_PROCESSES) {
      const ids = (p.quiz ?? []).map((q) => q.id);
      expect(new Set(ids).size, p.id).toBe(ids.length);
      for (const q of p.quiz ?? []) {
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThanOrEqual(2);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        if (q.wordId) {
          expect(wordById(q.wordId), `${q.id}:${q.wordId}`).toBeTruthy();
        }
      }
    }
  });

  it("keeps documents bilingual and with an abbreviation", () => {
    for (const p of READY_PROCESSES) {
      for (const d of p.documents ?? []) {
        expect(d.nameAr && d.nameEn, `${d.id}: name`).toBeTruthy();
        expect(d.descAr && d.descEn, `${d.id}: desc`).toBeTruthy();
        expect(d.abbr, `${d.id}: abbr`).toBeTruthy();
      }
    }
  });

  it("keeps exercise tasks and conversation lines bilingual", () => {
    for (const p of READY_PROCESSES) {
      if (p.exercise) {
        expect(p.exercise.titleAr && p.exercise.titleEn, p.id).toBeTruthy();
        expect(p.exercise.briefAr && p.exercise.briefEn, p.id).toBeTruthy();
        expect(p.exercise.tasksAr.length, p.id).toBe(p.exercise.tasksEn.length);
        expect(p.exercise.tasksAr.length, p.id).toBeGreaterThan(0);
        expect(p.exercise.solutionAr && p.exercise.solutionEn, p.id).toBeTruthy();
      }
      for (const c of p.conversations ?? []) {
        expect(c.titleAr && c.titleEn, `${c.id}: title`).toBeTruthy();
        expect(c.participantsAr && c.participantsEn, `${c.id}: participants`).toBeTruthy();
        expect(c.lines.length, c.id).toBeGreaterThan(0);
        for (const line of c.lines) {
          expect(line.en && line.ar, c.id).toBeTruthy();
        }
        for (const id of c.wordIds ?? []) {
          expect(wordById(id), `${c.id}:${id}`).toBeTruthy();
        }
      }
    }
  });

  it("gives P2P the two parity conversations with linked terms", () => {
    const p2p = processBySlug("procure-to-pay");
    expect(p2p?.conversations?.length).toBe(4);
    const byId = new Map((p2p?.conversations ?? []).map((c) => [c.id, c]));
    for (const id of ["p2p-conv-3", "p2p-conv-4"]) {
      const c = byId.get(id);
      expect(c, id).toBeTruthy();
      expect(c!.titleAr && c!.titleEn, `${id}: title`).toBeTruthy();
      expect(c!.participantsAr && c!.participantsEn, `${id}: participants`).toBeTruthy();
      expect(c!.lines.length, id).toBeGreaterThanOrEqual(3);
      for (const line of c!.lines) {
        expect(line.en && line.ar, `${id}: line`).toBeTruthy();
      }
      expect((c!.wordIds ?? []).length, `${id}: wordIds`).toBeGreaterThan(0);
      for (const wid of c!.wordIds ?? []) {
        expect(wordById(wid), `${id}:${wid}`).toBeTruthy();
      }
    }
  });
});
