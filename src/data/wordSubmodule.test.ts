import { describe, it, expect } from "vitest";
import { WORDS } from "@/data/words";
import { SUB_MODULE_MAP } from "@/data/subModules";
import { WORD_SUBMODULE } from "@/data/wordClassification";

const sub = (id: string) => WORDS.find((w) => w.id === id)?.subModuleId;

describe("curated submodule moves", () => {
  it("moves communication terms to email / meetings", () => {
    expect(sub("follow-up")).toBe("communication-email");
    expect(sub("regards")).toBe("communication-email");
    expect(sub("agenda")).toBe("communication-meetings");
    expect(sub("concall")).toBe("communication-meetings");
  });

  it("moves management terms to governance / delegation / alignment / escalation", () => {
    expect(sub("governance")).toBe("management-governance");
    expect(sub("delegate")).toBe("management-delegation");
    expect(sub("alignment")).toBe("management-alignment");
    expect(sub("escalate")).toBe("management-escalation");
  });

  it("moves it terms by topic, including the security terms and the new it-security submodule", () => {
    expect(sub("dev-commit")).toBe("it-git");
    expect(sub("dev-unit-test")).toBe("it-testing");
    expect(sub("dev-breakpoint")).toBe("it-debugging");
    expect(sub("dev-pipeline")).toBe("it-cicd");
    expect(sub("dev-endpoint")).toBe("it-apis");
    expect(sub("dev-ip-address")).toBe("it-networking");
    expect(sub("firewall")).toBe("it-security");
    expect(sub("dev-authentication")).toBe("it-security");
    expect(sub("dev-token")).toBe("it-security");
  });

  it("moves assets terms to depreciation / acquisition / transfer / disposal", () => {
    expect(sub("useful-life")).toBe("assets-depreciation");
    expect(sub("capacitation-booking")).toBe("assets-acquisition");
    expect(sub("asset-transfer")).toBe("assets-transfer");
    expect(sub("disposal")).toBe("assets-disposal");
  });

  it("moves services terms to calls / work-orders / sla / technicians / parts", () => {
    expect(sub("service-call")).toBe("services-calls");
    expect(sub("work-order-services")).toBe("services-work-orders");
    expect(sub("sla-services")).toBe("services-sla");
    expect(sub("technician")).toBe("services-technicians");
    expect(sub("spare-part")).toBe("services-parts");
  });

  it("keeps every assigned submodule valid and belonging to the word's module", () => {
    for (const word of WORDS) {
      if (!word.subModuleId) continue;
      const parent = SUB_MODULE_MAP[word.subModuleId];
      expect(parent, `missing submodule ${word.subModuleId} for ${word.id}`).toBeTruthy();
      expect(parent.moduleId, `mismatch for ${word.id}`).toBe(word.module);
    }
  });

  it("only references existing submodules in the move map", () => {
    for (const [id, subId] of Object.entries(WORD_SUBMODULE)) {
      expect(SUB_MODULE_MAP[subId], `${id} → ${subId}`).toBeTruthy();
    }
  });
});
