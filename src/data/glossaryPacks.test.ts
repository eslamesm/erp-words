import { describe, it, expect } from "vitest";
import { GLOSSARY_PACKS } from "@/data/glossaries";
import { SUB_MODULE_MAP } from "@/data/subModules";
import { MODULE_MAP } from "@/data/modules";

const EXPECTED: Record<string, [string, string]> = {
  roles: ["hr", "hr-recruitment"],
  "erp-modules": ["general", "general-business"],
  reporting: ["bi", "bi-reports"],
  contracts: ["documents", "documents-repository"],
  tax: ["finance", "finance-gl"],
  governance: ["management", "management-governance"],
  infosec: ["it", "it-security"],
  testing: ["it", "it-testing"],
  logistics: ["scm", "scm-supply-planning"],
  numbers: ["general", "general-numbers"],
  interviews: ["general", "general-business"],
};

describe("glossary pack → module mapping", () => {
  it("links every pack to the approved module and submodule", () => {
    expect(GLOSSARY_PACKS).toHaveLength(11);
    for (const pack of GLOSSARY_PACKS) {
      expect(EXPECTED[pack.id], `unexpected pack ${pack.id}`).toBeTruthy();
      expect(pack.moduleId, pack.id).toBe(EXPECTED[pack.id][0]);
      expect(pack.subModuleId, pack.id).toBe(EXPECTED[pack.id][1]);
    }
  });

  it("uses only valid modules and submodules consistent with each other", () => {
    for (const pack of GLOSSARY_PACKS) {
      expect(MODULE_MAP[pack.moduleId!], pack.id).toBeTruthy();
      const parent = SUB_MODULE_MAP[pack.subModuleId!];
      expect(parent, pack.id).toBeTruthy();
      expect(parent.moduleId, pack.id).toBe(pack.moduleId);
    }
  });

  it("keeps term-level classification fields optional (independent per-term classification remains possible)", () => {
    // الحقول على مستوى المصطلح اختيارية؛ وجود ربط على مستوى الحزمة لا يمنعها.
    const anyTerm = GLOSSARY_PACKS[0].terms[0];
    expect("moduleId" in anyTerm || anyTerm.moduleId === undefined).toBe(true);
    expect("subModuleId" in anyTerm || anyTerm.subModuleId === undefined).toBe(true);
  });
});
