import { describe, it, expect } from "vitest";
import { correctEnglish } from "@/lib/englishFix";

describe("correctEnglish", () => {
  it("returns empty for blank input", () => {
    expect(correctEnglish("   ")).toEqual({ corrected: "", fixes: [] });
  });

  it("fixes uncountable plurals", () => {
    const r = correctEnglish("I need more informations");
    expect(r.corrected).toBe("I need more information");
    expect(r.fixes.length).toBeGreaterThan(0);
  });

  it("fixes 'I am agree'", () => {
    expect(correctEnglish("I am agree with you").corrected).toBe("I agree with you");
  });

  it("fixes subject-verb agreement", () => {
    expect(correctEnglish("he don't know").corrected).toBe("He doesn't know");
    expect(correctEnglish("we was late").corrected).toBe("We were late");
  });

  it("fixes missing apostrophes", () => {
    expect(correctEnglish("I dont understand").corrected).toBe("I don't understand");
  });

  it("capitalizes the pronoun I", () => {
    expect(correctEnglish("then i will follow up").corrected).toBe("Then I will follow up");
  });

  it("capitalizes the first letter", () => {
    expect(correctEnglish("hello team").corrected).toBe("Hello team");
  });

  it("leaves correct sentences unchanged", () => {
    const r = correctEnglish("Please approve the purchase order.");
    expect(r.corrected).toBe("Please approve the purchase order.");
    expect(r.fixes).toHaveLength(0);
  });
});
